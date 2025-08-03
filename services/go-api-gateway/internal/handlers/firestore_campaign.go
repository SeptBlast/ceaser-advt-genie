package handlers

import (
	"context"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/database"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/grpc"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/models"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type FirestoreCampaignHandler struct {
	db       *database.FirestoreClient
	aiEngine *grpc.AIEngineClient
}

func NewFirestoreCampaignHandler(db *database.FirestoreClient, aiEngine *grpc.AIEngineClient) *FirestoreCampaignHandler {
	return &FirestoreCampaignHandler{
		db:       db,
		aiEngine: aiEngine,
	}
}

func (h *FirestoreCampaignHandler) ListCampaigns(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user ID from Firebase Auth token (should be set by middleware)
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User authentication required",
		})
		return
	}

	// Parse query parameters
	tenantID := c.DefaultQuery("tenant_id", "default")
	limit := 50 // Default limit

	// Build query
	query := h.db.CampaignsCollection().Where("user_id", "==", userID).Where("tenant_id", "==", tenantID)

	if isActive := c.Query("is_active"); isActive != "" {
		if isActive == "true" {
			query = query.Where("is_active", "==", true)
		} else if isActive == "false" {
			query = query.Where("is_active", "==", false)
		}
	}

	// Set limit and order
	query = query.OrderBy("created_at", firestore.Desc).Limit(limit)

	// Execute query
	iter := query.Documents(ctx)
	defer iter.Stop()

	var campaigns []models.Campaign
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			logrus.WithError(err).Error("Error iterating campaigns")
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   "Failed to retrieve campaigns",
			})
			return
		}

		var campaign models.Campaign
		if err := doc.DataTo(&campaign); err != nil {
			logrus.WithError(err).Error("Error converting campaign data")
			continue
		}

		// Set the document ID
		campaign.ID = doc.Ref.ID
		campaigns = append(campaigns, campaign)
	}

	logrus.WithFields(logrus.Fields{
		"user_id":   userID,
		"tenant_id": tenantID,
		"count":     len(campaigns),
	}).Info("Retrieved campaigns")

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    campaigns,
	})
}

func (h *FirestoreCampaignHandler) GetCampaign(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user ID from Firebase Auth token
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User authentication required",
		})
		return
	}

	campaignID := c.Param("id")
	if campaignID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Campaign ID is required",
		})
		return
	}

	// Get campaign document
	doc, err := h.db.CampaignsCollection().Doc(campaignID).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "Campaign not found",
			})
		} else {
			logrus.WithError(err).Error("Error retrieving campaign")
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   "Failed to retrieve campaign",
			})
		}
		return
	}

	var campaign models.Campaign
	if err := doc.DataTo(&campaign); err != nil {
		logrus.WithError(err).Error("Error converting campaign data")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to process campaign data",
		})
		return
	}

	// Verify user ownership
	if campaign.UserID != userID {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Access denied to this campaign",
		})
		return
	}

	campaign.ID = doc.Ref.ID

	logrus.WithFields(logrus.Fields{
		"user_id":     userID,
		"campaign_id": campaignID,
	}).Info("Retrieved campaign")

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    campaign,
	})
}

func (h *FirestoreCampaignHandler) CreateCampaign(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user ID from Firebase Auth token
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User authentication required",
		})
		return
	}

	var req models.CreateCampaignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request data: " + err.Error(),
		})
		return
	}

	// Create new campaign
	campaign := models.Campaign{
		Name:               req.Name,
		Description:        req.Description,
		TenantID:           req.TenantID,
		UserID:             userID,
		TargetPlatforms:    req.TargetPlatforms,
		Budget:             req.Budget,
		TargetAudience:     req.TargetAudience,
		CampaignObjectives: req.CampaignObjectives,
		BrandGuidelines:    req.BrandGuidelines,
		BrandAssets:        req.BrandAssets,
		IsActive:           true,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
		CreatedBy:          userID,
		CreativesCount:     0,
		PerformanceSummary: models.PerformanceSummary{},
	}

	// Add to Firestore
	docRef, _, err := h.db.CampaignsCollection().Add(ctx, campaign)
	if err != nil {
		logrus.WithError(err).Error("Error creating campaign")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to create campaign",
		})
		return
	}

	campaign.ID = docRef.ID

	logrus.WithFields(logrus.Fields{
		"user_id":     userID,
		"campaign_id": campaign.ID,
		"name":        campaign.Name,
	}).Info("Created new campaign")

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Campaign created successfully",
		Data:    campaign,
	})
}

func (h *FirestoreCampaignHandler) UpdateCampaign(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user ID from Firebase Auth token
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User authentication required",
		})
		return
	}

	campaignID := c.Param("id")
	if campaignID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Campaign ID is required",
		})
		return
	}

	var req models.CreateCampaignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request data: " + err.Error(),
		})
		return
	}

	// Get existing campaign to verify ownership
	docRef := h.db.CampaignsCollection().Doc(campaignID)
	doc, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "Campaign not found",
			})
		} else {
			logrus.WithError(err).Error("Error retrieving campaign for update")
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   "Failed to retrieve campaign",
			})
		}
		return
	}

	var existingCampaign models.Campaign
	if err := doc.DataTo(&existingCampaign); err != nil {
		logrus.WithError(err).Error("Error converting existing campaign data")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to process campaign data",
		})
		return
	}

	// Verify user ownership
	if existingCampaign.UserID != userID {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Access denied to this campaign",
		})
		return
	}

	// Update campaign data
	updates := map[string]interface{}{
		"name":                req.Name,
		"description":         req.Description,
		"target_platforms":    req.TargetPlatforms,
		"budget":              req.Budget,
		"target_audience":     req.TargetAudience,
		"campaign_objectives": req.CampaignObjectives,
		"brand_guidelines":    req.BrandGuidelines,
		"brand_assets":        req.BrandAssets,
		"updated_at":          time.Now(),
	}

	// Update in Firestore
	_, err = docRef.Update(ctx, []firestore.Update{
		{Path: "name", Value: updates["name"]},
		{Path: "description", Value: updates["description"]},
		{Path: "target_platforms", Value: updates["target_platforms"]},
		{Path: "budget", Value: updates["budget"]},
		{Path: "target_audience", Value: updates["target_audience"]},
		{Path: "campaign_objectives", Value: updates["campaign_objectives"]},
		{Path: "brand_guidelines", Value: updates["brand_guidelines"]},
		{Path: "brand_assets", Value: updates["brand_assets"]},
		{Path: "updated_at", Value: updates["updated_at"]},
	})

	if err != nil {
		logrus.WithError(err).Error("Error updating campaign")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to update campaign",
		})
		return
	}

	// Get updated campaign
	updatedDoc, err := docRef.Get(ctx)
	if err != nil {
		logrus.WithError(err).Error("Error retrieving updated campaign")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Campaign updated but failed to retrieve latest data",
		})
		return
	}

	var updatedCampaign models.Campaign
	if err := updatedDoc.DataTo(&updatedCampaign); err != nil {
		logrus.WithError(err).Error("Error converting updated campaign data")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Campaign updated but failed to process latest data",
		})
		return
	}

	updatedCampaign.ID = docRef.ID

	logrus.WithFields(logrus.Fields{
		"user_id":     userID,
		"campaign_id": campaignID,
	}).Info("Updated campaign")

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Campaign updated successfully",
		Data:    updatedCampaign,
	})
}

func (h *FirestoreCampaignHandler) DeleteCampaign(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get user ID from Firebase Auth token
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User authentication required",
		})
		return
	}

	campaignID := c.Param("id")
	if campaignID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Campaign ID is required",
		})
		return
	}

	// Get existing campaign to verify ownership
	docRef := h.db.CampaignsCollection().Doc(campaignID)
	doc, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "Campaign not found",
			})
		} else {
			logrus.WithError(err).Error("Error retrieving campaign for deletion")
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   "Failed to retrieve campaign",
			})
		}
		return
	}

	var campaign models.Campaign
	if err := doc.DataTo(&campaign); err != nil {
		logrus.WithError(err).Error("Error converting campaign data")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to process campaign data",
		})
		return
	}

	// Verify user ownership
	if campaign.UserID != userID {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Access denied to this campaign",
		})
		return
	}

	// Delete from Firestore
	_, err = docRef.Delete(ctx)
	if err != nil {
		logrus.WithError(err).Error("Error deleting campaign")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to delete campaign",
		})
		return
	}

	logrus.WithFields(logrus.Fields{
		"user_id":     userID,
		"campaign_id": campaignID,
	}).Info("Deleted campaign")

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Campaign deleted successfully",
	})
}
