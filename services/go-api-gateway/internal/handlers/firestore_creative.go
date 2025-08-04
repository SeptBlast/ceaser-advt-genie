package handlers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/database"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/models"
)

type FirestoreCreativeHandler struct {
	firestoreClient *database.FirestoreClient
}

func NewFirestoreCreativeHandler(firestoreClient *database.FirestoreClient) *FirestoreCreativeHandler {
	return &FirestoreCreativeHandler{
		firestoreClient: firestoreClient,
	}
}

// CreateCreative creates a new creative
func (h *FirestoreCreativeHandler) CreateCreative(c *gin.Context) {
	var creative models.Creative
	if err := c.ShouldBindJSON(&creative); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request body: " + err.Error(),
		})
		return
	}

	// Get user ID from Firebase Auth middleware
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	// Add user ID and timestamp
	creative.UserID = userID.(string)
	creative.CreatedAt = time.Now()
	creative.UpdatedAt = time.Now()

	ctx := context.Background()
	docRef := h.firestoreClient.Collection.Creatives.NewDoc()
	creative.ID = docRef.ID

	_, err := docRef.Set(ctx, creative)
	if err != nil {
		logrus.WithError(err).Error("Error creating creative")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to create creative",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Data:    creative,
	})
}

// GetCreatives retrieves creatives for the authenticated user
func (h *FirestoreCreativeHandler) GetCreatives(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	ctx := context.Background()
	query := h.firestoreClient.Collection.Creatives.Where("user_id", "==", userID.(string))

	// Add campaign filter if provided
	campaignID := c.Query("campaign_id")
	if campaignID != "" {
		query = query.Where("campaign_id", "==", campaignID)
	}

	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		logrus.WithError(err).Error("Error retrieving creatives")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to retrieve creatives",
		})
		return
	}

	var creatives []models.Creative
	for _, doc := range docs {
		var creative models.Creative
		if err := doc.DataTo(&creative); err != nil {
			logrus.WithError(err).WithField("doc_id", doc.Ref.ID).Error("Error parsing creative document")
			continue
		}
		creative.ID = doc.Ref.ID
		creatives = append(creatives, creative)
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    creatives,
	})
}

// GetCreative retrieves a specific creative by ID
func (h *FirestoreCreativeHandler) GetCreative(c *gin.Context) {
	creativeID := c.Param("id")
	if creativeID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Creative ID is required",
		})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	ctx := context.Background()
	docRef := h.firestoreClient.Collection.Creatives.Doc(creativeID)
	doc, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "Creative not found",
			})
		} else {
			logrus.WithError(err).Error("Error retrieving creative")
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   "Failed to retrieve creative",
			})
		}
		return
	}

	var creative models.Creative
	if err := doc.DataTo(&creative); err != nil {
		logrus.WithError(err).Error("Error parsing creative document")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to parse creative data",
		})
		return
	}

	// Verify ownership
	if creative.UserID != userID.(string) {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Access denied",
		})
		return
	}

	creative.ID = doc.Ref.ID
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    creative,
	})
}

// UpdateCreative updates an existing creative
func (h *FirestoreCreativeHandler) UpdateCreative(c *gin.Context) {
	creativeID := c.Param("id")
	if creativeID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Creative ID is required",
		})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	ctx := context.Background()
	docRef := h.firestoreClient.Collection.Creatives.Doc(creativeID)

	// Check if creative exists and user owns it
	doc, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "Creative not found",
			})
		} else {
			logrus.WithError(err).Error("Error retrieving creative for update")
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   "Failed to retrieve creative",
			})
		}
		return
	}

	var existingCreative models.Creative
	if err := doc.DataTo(&existingCreative); err != nil {
		logrus.WithError(err).Error("Error parsing existing creative")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to parse creative data",
		})
		return
	}

	// Verify ownership
	if existingCreative.UserID != userID.(string) {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Access denied",
		})
		return
	}

	var updateData models.Creative
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request body: " + err.Error(),
		})
		return
	}

	// Preserve important fields
	updateData.ID = creativeID
	updateData.UserID = existingCreative.UserID
	updateData.CreatedAt = existingCreative.CreatedAt
	updateData.UpdatedAt = time.Now()

	_, err = docRef.Set(ctx, updateData)
	if err != nil {
		logrus.WithError(err).Error("Error updating creative")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to update creative",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    updateData,
	})
}

// DeleteCreative deletes a creative
func (h *FirestoreCreativeHandler) DeleteCreative(c *gin.Context) {
	creativeID := c.Param("id")
	if creativeID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Creative ID is required",
		})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	ctx := context.Background()
	docRef := h.firestoreClient.Collection.Creatives.Doc(creativeID)

	// Check if creative exists and user owns it
	doc, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "Creative not found",
			})
		} else {
			logrus.WithError(err).Error("Error retrieving creative for deletion")
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   "Failed to retrieve creative",
			})
		}
		return
	}

	var creative models.Creative
	if err := doc.DataTo(&creative); err != nil {
		logrus.WithError(err).Error("Error parsing creative for deletion")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to parse creative data",
		})
		return
	}

	// Verify ownership
	if creative.UserID != userID.(string) {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Access denied",
		})
		return
	}

	_, err = docRef.Delete(ctx)
	if err != nil {
		logrus.WithError(err).Error("Error deleting creative")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to delete creative",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Creative deleted successfully",
	})
}

// GenerateCreative handles AI-powered creative generation
func (h *FirestoreCreativeHandler) GenerateCreative(c *gin.Context) {
	var req struct {
		CampaignID   string                 `json:"campaign_id" binding:"required"`
		CreativeType string                 `json:"creative_type" binding:"required"` // "text", "image", "video"
		Prompt       string                 `json:"prompt" binding:"required"`
		Parameters   map[string]interface{} `json:"parameters,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request body: " + err.Error(),
		})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	ctx := context.Background()

	// Verify campaign ownership
	campaignRef := h.firestoreClient.Collection.Campaigns.Doc(req.CampaignID)
	campaignDoc, err := campaignRef.Get(ctx)
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
	if err := campaignDoc.DataTo(&campaign); err != nil {
		logrus.WithError(err).Error("Error parsing campaign")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to parse campaign data",
		})
		return
	}

	if campaign.UserID != userID.(string) {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Access denied",
		})
		return
	}

	// TODO: Call AI service to generate creative content
	// For now, return a placeholder response
	creative := models.Creative{
		UserID:       userID.(string),
		CampaignID:   req.CampaignID,
		Name:         "Generated " + strings.Title(req.CreativeType) + " Creative",
		CreativeType: req.CreativeType,
		GenerationParameters: map[string]interface{}{
			"prompt":    req.Prompt,
			"generated": true,
			"status":    "pending_generation",
		},
		Status:    "pending",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	docRef := h.firestoreClient.Collection.Creatives.NewDoc()
	creative.ID = docRef.ID

	_, err = docRef.Set(ctx, creative)
	if err != nil {
		logrus.WithError(err).Error("Error creating generated creative")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to create creative",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Data:    creative,
		Message: "Creative generation initiated",
	})
}

// GetCreativePerformance retrieves performance metrics for a creative
func (h *FirestoreCreativeHandler) GetCreativePerformance(c *gin.Context) {
	creativeID := c.Param("id")
	if creativeID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Creative ID is required",
		})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	ctx := context.Background()

	// Verify creative ownership
	creativeRef := h.firestoreClient.Collection.Creatives.Doc(creativeID)
	creativeDoc, err := creativeRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "Creative not found",
			})
		} else {
			logrus.WithError(err).Error("Error retrieving creative")
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   "Failed to retrieve creative",
			})
		}
		return
	}

	var creative models.Creative
	if err := creativeDoc.DataTo(&creative); err != nil {
		logrus.WithError(err).Error("Error parsing creative")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to parse creative data",
		})
		return
	}

	if creative.UserID != userID.(string) {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Error:   "Access denied",
		})
		return
	}

	// Query analytics for this creative
	analyticsQuery := h.firestoreClient.Collection.Analytics.Where("user_id", "==", userID.(string)).Where("creative_id", "==", creativeID)

	docs, err := analyticsQuery.Documents(ctx).GetAll()
	if err != nil {
		logrus.WithError(err).Error("Error retrieving creative analytics")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to retrieve performance data",
		})
		return
	}

	var analytics []models.Analytics
	for _, doc := range docs {
		var analytic models.Analytics
		if err := doc.DataTo(&analytic); err != nil {
			logrus.WithError(err).WithField("doc_id", doc.Ref.ID).Error("Error parsing analytics document")
			continue
		}
		analytic.ID = doc.Ref.ID
		analytics = append(analytics, analytic)
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"creative":  creative,
			"analytics": analytics,
		},
	})
}
