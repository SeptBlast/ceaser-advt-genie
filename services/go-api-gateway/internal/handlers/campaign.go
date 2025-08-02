package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/database"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/grpc"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CampaignHandler struct {
	db       *database.MongoClient
	aiEngine *grpc.AIEngineClient
}

func NewCampaignHandler(db *database.MongoClient, aiEngine *grpc.AIEngineClient) *CampaignHandler {
	return &CampaignHandler{
		db:       db,
		aiEngine: aiEngine,
	}
}

func (h *CampaignHandler) ListCampaigns(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	tenantID := c.DefaultQuery("tenant_id", "default")
	limit := int64(50) // Default limit
	skip := int64(0)   // Default skip

	// Build filter
	filter := bson.M{"tenant_id": tenantID}
	if isActive := c.Query("is_active"); isActive != "" {
		if isActive == "true" {
			filter["is_active"] = true
		} else if isActive == "false" {
			filter["is_active"] = false
		}
	}

	// Set options
	opts := options.Find().SetLimit(limit).SetSkip(skip).SetSort(bson.D{{"created_at", -1}})

	// Execute query
	cursor, err := h.db.CampaignsCollection().Find(ctx, filter, opts)
	if err != nil {
		logrus.WithError(err).Error("Failed to fetch campaigns")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to fetch campaigns",
		})
		return
	}
	defer cursor.Close(ctx)

	// Decode results
	var campaigns []models.Campaign
	if err = cursor.All(ctx, &campaigns); err != nil {
		logrus.WithError(err).Error("Failed to decode campaigns")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to decode campaigns",
		})
		return
	}

	c.JSON(http.StatusOK, campaigns)
}

func (h *CampaignHandler) CreateCampaign(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var req models.CreateCampaignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request format: " + err.Error(),
		})
		return
	}

	// Set default values
	if req.TenantID == "" {
		req.TenantID = "default"
	}

	// Create campaign document
	campaign := models.Campaign{
		ID:                 primitive.NewObjectID(),
		Name:               req.Name,
		Description:        req.Description,
		TenantID:           req.TenantID,
		TargetPlatforms:    req.TargetPlatforms,
		Budget:             req.Budget,
		TargetAudience:     req.TargetAudience,
		CampaignObjectives: req.CampaignObjectives,
		BrandGuidelines:    req.BrandGuidelines,
		BrandAssets:        req.BrandAssets,
		IsActive:           true,
		CreatedAt:          time.Now().UTC(),
		UpdatedAt:          time.Now().UTC(),
		CreatedBy:          "anonymous", // TODO: Get from authentication context
		CreativesCount:     0,
		PerformanceSummary: models.PerformanceSummary{},
	}

	// Insert into database
	result, err := h.db.CampaignsCollection().InsertOne(ctx, campaign)
	if err != nil {
		logrus.WithError(err).Error("Failed to create campaign")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to create campaign",
		})
		return
	}

	campaign.ID = result.InsertedID.(primitive.ObjectID)

	logrus.WithField("campaign_id", campaign.ID.Hex()).Info("Campaign created successfully")

	c.JSON(http.StatusCreated, campaign)
}

func (h *CampaignHandler) GetCampaign(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Parse campaign ID
	campaignID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid campaign ID format",
		})
		return
	}

	// Fetch campaign
	var campaign models.Campaign
	err = h.db.CampaignsCollection().FindOne(ctx, bson.M{"_id": campaignID}).Decode(&campaign)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "Campaign not found",
			})
			return
		}
		logrus.WithError(err).Error("Failed to fetch campaign")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to fetch campaign",
		})
		return
	}

	c.JSON(http.StatusOK, campaign)
}

func (h *CampaignHandler) UpdateCampaign(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Parse campaign ID
	campaignID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid campaign ID format",
		})
		return
	}

	var req models.CreateCampaignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request format: " + err.Error(),
		})
		return
	}

	// Build update document
	update := bson.M{
		"$set": bson.M{
			"name":                req.Name,
			"description":         req.Description,
			"target_platforms":    req.TargetPlatforms,
			"budget":              req.Budget,
			"target_audience":     req.TargetAudience,
			"campaign_objectives": req.CampaignObjectives,
			"brand_guidelines":    req.BrandGuidelines,
			"brand_assets":        req.BrandAssets,
			"updated_at":          time.Now().UTC(),
		},
	}

	// Update campaign
	result, err := h.db.CampaignsCollection().UpdateOne(ctx, bson.M{"_id": campaignID}, update)
	if err != nil {
		logrus.WithError(err).Error("Failed to update campaign")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to update campaign",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   "Campaign not found",
		})
		return
	}

	// Fetch updated campaign
	var campaign models.Campaign
	err = h.db.CampaignsCollection().FindOne(ctx, bson.M{"_id": campaignID}).Decode(&campaign)
	if err != nil {
		logrus.WithError(err).Error("Failed to fetch updated campaign")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Campaign updated but failed to fetch result",
		})
		return
	}

	logrus.WithField("campaign_id", campaignID.Hex()).Info("Campaign updated successfully")

	c.JSON(http.StatusOK, campaign)
}

func (h *CampaignHandler) DeleteCampaign(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Parse campaign ID
	campaignID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid campaign ID format",
		})
		return
	}

	// Soft delete - set is_active to false
	update := bson.M{
		"$set": bson.M{
			"is_active":  false,
			"updated_at": time.Now().UTC(),
		},
	}

	result, err := h.db.CampaignsCollection().UpdateOne(ctx, bson.M{"_id": campaignID}, update)
	if err != nil {
		logrus.WithError(err).Error("Failed to delete campaign")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to delete campaign",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   "Campaign not found",
		})
		return
	}

	logrus.WithField("campaign_id", campaignID.Hex()).Info("Campaign deleted successfully")

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Campaign deleted successfully",
	})
}
