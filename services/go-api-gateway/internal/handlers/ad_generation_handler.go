package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/services"
)

// AdGenerationHandler handles advertising creative generation endpoints
type AdGenerationHandler struct {
	adGenService *services.AdGenerationService
}

// NewAdGenerationHandler creates a new ad generation handler
func NewAdGenerationHandler(adGenService *services.AdGenerationService) *AdGenerationHandler {
	return &AdGenerationHandler{
		adGenService: adGenService,
	}
}

// CreateCampaign creates a new advertising campaign
// POST /api/v1/campaigns
func (h *AdGenerationHandler) CreateCampaign(c *gin.Context) {
	var req struct {
		Name           string                  `json:"name" binding:"required"`
		Description    string                  `json:"description"`
		BrandAssets    []services.BrandAsset   `json:"brand_assets"`
		TargetAudience services.TargetAudience `json:"target_audience"`
		Budget         services.Budget         `json:"budget"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	campaign := &services.Campaign{
		UserID:         userObjectID,
		Name:           req.Name,
		Description:    req.Description,
		BrandAssets:    req.BrandAssets,
		TargetAudience: req.TargetAudience,
		Budget:         req.Budget,
	}

	if err := h.adGenService.CreateCampaign(c.Request.Context(), campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create campaign"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Campaign created successfully",
		"campaign": campaign,
	})
}

// GetCampaign retrieves a specific campaign
// GET /api/v1/campaigns/:id
func (h *AdGenerationHandler) GetCampaign(c *gin.Context) {
	campaignID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid campaign ID"})
		return
	}

	campaign, err := h.adGenService.GetCampaign(c.Request.Context(), campaignID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"campaign": campaign})
}

// ListCampaigns retrieves campaigns for the authenticated user
// GET /api/v1/campaigns
func (h *AdGenerationHandler) ListCampaigns(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Parse pagination parameters
	limit := int64(10)
	offset := int64(0)

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.ParseInt(l, 10, 64); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.ParseInt(o, 10, 64); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	campaigns, err := h.adGenService.ListCampaigns(c.Request.Context(), userObjectID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve campaigns"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"campaigns": campaigns,
		"pagination": gin.H{
			"limit":  limit,
			"offset": offset,
			"count":  len(campaigns),
		},
	})
}

// GenerateCreative generates new advertising creative content
// POST /api/v1/campaigns/:id/creatives
func (h *AdGenerationHandler) GenerateCreative(c *gin.Context) {
	campaignID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid campaign ID"})
		return
	}

	var req struct {
		Type            string `json:"type" binding:"required,oneof=text image video"`
		Prompt          string `json:"prompt" binding:"required"`
		Style           string `json:"style"`
		AspectRatio     string `json:"aspect_ratio"`
		Duration        int    `json:"duration"`
		IncludeBranding bool   `json:"include_branding"`
		Variations      int    `json:"variations"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default variations if not specified
	if req.Variations == 0 {
		req.Variations = 1
	}

	creativeReq := &services.CreativeRequest{
		CampaignID:      campaignID,
		Type:            req.Type,
		Prompt:          req.Prompt,
		Style:           req.Style,
		AspectRatio:     req.AspectRatio,
		Duration:        req.Duration,
		IncludeBranding: req.IncludeBranding,
		Variations:      req.Variations,
	}

	creative, err := h.adGenService.GenerateCreative(c.Request.Context(), creativeReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate creative"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Creative generation started",
		"creative": creative,
	})
}

// GetCreative retrieves a specific creative
// GET /api/v1/creatives/:id
func (h *AdGenerationHandler) GetCreative(c *gin.Context) {
	creativeID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid creative ID"})
		return
	}

	creative, err := h.adGenService.GetCreative(c.Request.Context(), creativeID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Creative not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"creative": creative})
}

// ListCreatives retrieves creatives for a campaign
// GET /api/v1/campaigns/:id/creatives
func (h *AdGenerationHandler) ListCreatives(c *gin.Context) {
	campaignID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid campaign ID"})
		return
	}

	// Parse pagination parameters
	limit := int64(10)
	offset := int64(0)

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.ParseInt(l, 10, 64); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.ParseInt(o, 10, 64); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	creatives, err := h.adGenService.ListCreatives(c.Request.Context(), campaignID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve creatives"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"creatives": creatives,
		"pagination": gin.H{
			"limit":  limit,
			"offset": offset,
			"count":  len(creatives),
		},
	})
}

// UpdateCreativePerformance updates performance metrics for a creative
// PUT /api/v1/creatives/:id/performance
func (h *AdGenerationHandler) UpdateCreativePerformance(c *gin.Context) {
	creativeID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid creative ID"})
		return
	}

	var req struct {
		Impressions    int64   `json:"impressions"`
		Clicks         int64   `json:"clicks"`
		Conversions    int64   `json:"conversions"`
		CTR            float64 `json:"ctr"`
		ConversionRate float64 `json:"conversion_rate"`
		Spend          float64 `json:"spend"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	metrics := services.PerformanceMetrics{
		Impressions:    req.Impressions,
		Clicks:         req.Clicks,
		Conversions:    req.Conversions,
		CTR:            req.CTR,
		ConversionRate: req.ConversionRate,
		Spend:          req.Spend,
	}

	if err := h.adGenService.UpdateCreativePerformance(c.Request.Context(), creativeID, metrics); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update performance metrics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Performance metrics updated successfully"})
}

// RegisterRoutes registers all ad generation routes
func (h *AdGenerationHandler) RegisterRoutes(router *gin.RouterGroup) {
	// Campaign routes
	campaigns := router.Group("/campaigns")
	{
		campaigns.POST("", h.CreateCampaign)
		campaigns.GET("", h.ListCampaigns)
		campaigns.GET("/:id", h.GetCampaign)
		campaigns.POST("/:id/creatives", h.GenerateCreative)
		campaigns.GET("/:id/creatives", h.ListCreatives)
	}

	// Creative routes
	creatives := router.Group("/creatives")
	{
		creatives.GET("/:id", h.GetCreative)
		creatives.PUT("/:id/performance", h.UpdateCreativePerformance)
	}
}
