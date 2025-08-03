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
)

type CreativeHandler struct {
	db       *database.MongoClient
	aiEngine *grpc.AIEngineClient
}

func NewCreativeHandler(db *database.MongoClient, aiEngine *grpc.AIEngineClient) *CreativeHandler {
	return &CreativeHandler{
		db:       db,
		aiEngine: aiEngine,
	}
}

func (h *CreativeHandler) ListCreatives(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	campaignID := c.Query("campaign_id")
	filter := bson.M{}

	if campaignID != "" {
		objID, err := primitive.ObjectIDFromHex(campaignID)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Error:   "Invalid campaign ID format",
			})
			return
		}
		filter["campaign_id"] = objID
	}

	cursor, err := h.db.CreativesCollection().Find(ctx, filter)
	if err != nil {
		logrus.WithError(err).Error("Failed to fetch creatives")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to fetch creatives",
		})
		return
	}
	defer cursor.Close(ctx)

	var creatives []models.Creative
	if err = cursor.All(ctx, &creatives); err != nil {
		logrus.WithError(err).Error("Failed to decode creatives")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to decode creatives",
		})
		return
	}

	c.JSON(http.StatusOK, creatives)
}

func (h *CreativeHandler) CreateCreative(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var req models.CreateCreativeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request format: " + err.Error(),
		})
		return
	}

	campaignID, err := primitive.ObjectIDFromHex(req.CampaignID)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid campaign ID format",
		})
		return
	}

	creative := models.Creative{
		ID:                   primitive.NewObjectID(),
		CampaignID:           campaignID,
		Name:                 req.Name,
		Description:          req.Description,
		CreativeType:         req.CreativeType,
		Platform:             req.Platform,
		Status:               "draft",
		GenerationParameters: req.GenerationParameters,
		Variations:           []models.CreativeVariation{},
		IsActive:             true,
		CreatedAt:            time.Now().UTC(),
		UpdatedAt:            time.Now().UTC(),
		CreatedBy:            "anonymous",
	}

	result, err := h.db.CreativesCollection().InsertOne(ctx, creative)
	if err != nil {
		logrus.WithError(err).Error("Failed to create creative")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to create creative",
		})
		return
	}

	creative.ID = result.InsertedID.(primitive.ObjectID)

	logrus.WithField("creative_id", creative.ID.Hex()).Info("Creative created successfully")

	c.JSON(http.StatusCreated, creative)
}

func (h *CreativeHandler) GetCreative(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	creativeID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid creative ID format",
		})
		return
	}

	var creative models.Creative
	err = h.db.CreativesCollection().FindOne(ctx, bson.M{"_id": creativeID}).Decode(&creative)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "Creative not found",
			})
			return
		}
		logrus.WithError(err).Error("Failed to fetch creative")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to fetch creative",
		})
		return
	}

	c.JSON(http.StatusOK, creative)
}

func (h *CreativeHandler) UpdateCreative(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	creativeID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid creative ID format",
		})
		return
	}

	var req models.CreateCreativeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request format: " + err.Error(),
		})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"name":                  req.Name,
			"description":           req.Description,
			"creative_type":         req.CreativeType,
			"platform":              req.Platform,
			"generation_parameters": req.GenerationParameters,
			"updated_at":            time.Now().UTC(),
		},
	}

	result, err := h.db.CreativesCollection().UpdateOne(ctx, bson.M{"_id": creativeID}, update)
	if err != nil {
		logrus.WithError(err).Error("Failed to update creative")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to update creative",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   "Creative not found",
		})
		return
	}

	var creative models.Creative
	err = h.db.CreativesCollection().FindOne(ctx, bson.M{"_id": creativeID}).Decode(&creative)
	if err != nil {
		logrus.WithError(err).Error("Failed to fetch updated creative")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Creative updated but failed to fetch result",
		})
		return
	}

	c.JSON(http.StatusOK, creative)
}

func (h *CreativeHandler) DeleteCreative(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	creativeID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid creative ID format",
		})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"is_active":  false,
			"updated_at": time.Now().UTC(),
		},
	}

	result, err := h.db.CreativesCollection().UpdateOne(ctx, bson.M{"_id": creativeID}, update)
	if err != nil {
		logrus.WithError(err).Error("Failed to delete creative")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to delete creative",
		})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   "Creative not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Creative deleted successfully",
	})
}

func (h *CreativeHandler) GenerateCreative(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	creativeID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid creative ID format",
		})
		return
	}

	var req models.GenerateCreativeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request format: " + err.Error(),
		})
		return
	}

	// Fetch creative to get campaign context
	var creative models.Creative
	err = h.db.CreativesCollection().FindOne(ctx, bson.M{"_id": creativeID}).Decode(&creative)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   "Creative not found",
		})
		return
	}

	// Call AI Engine service for generation
	logrus.WithField("creative_id", creativeID.Hex()).Info("Calling AI Engine for creative generation")

	response, err := h.aiEngine.GenerateCreative(ctx, map[string]interface{}{
		"campaign_id":   creative.CampaignID.Hex(),
		"creative_type": req.CreativeType,
		"platform":      req.Platform,
		"parameters":    req.Parameters,
	})
	if err != nil {
		logrus.WithError(err).Error("Failed to generate creative via AI Engine")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to generate creative",
		})
		return
	}

	c.JSON(http.StatusOK, response)
}
