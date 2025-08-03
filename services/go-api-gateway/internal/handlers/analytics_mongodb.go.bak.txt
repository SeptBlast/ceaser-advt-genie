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

type AnalyticsHandler struct {
	db       *database.MongoClient
	aiEngine *grpc.AIEngineClient
}

func NewAnalyticsHandler(db *database.MongoClient, aiEngine *grpc.AIEngineClient) *AnalyticsHandler {
	return &AnalyticsHandler{
		db:       db,
		aiEngine: aiEngine,
	}
}

func (h *AnalyticsHandler) GetCampaignAnalytics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

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
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   "Campaign not found",
		})
		return
	}

	// Fetch associated creatives for metrics aggregation
	cursor, err := h.db.CreativesCollection().Find(ctx, bson.M{"campaign_id": campaignID})
	if err != nil {
		logrus.WithError(err).Error("Failed to fetch campaign creatives")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to fetch campaign analytics",
		})
		return
	}
	defer cursor.Close(ctx)

	var creatives []models.Creative
	if err = cursor.All(ctx, &creatives); err != nil {
		logrus.WithError(err).Error("Failed to decode creatives")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to process campaign analytics",
		})
		return
	}

	// Aggregate metrics
	analytics := map[string]interface{}{
		"campaign_id":            campaign.ID.Hex(),
		"campaign_name":          campaign.Name,
		"total_creatives":        len(creatives),
		"performance_summary":    campaign.PerformanceSummary,
		"created_at":             campaign.CreatedAt,
		"last_updated":           campaign.UpdatedAt,
		"analytics_generated_at": time.Now().UTC(),
	}

	c.JSON(http.StatusOK, analytics)
}

func (h *AnalyticsHandler) GenerateInsights(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var req models.InsightRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Invalid request format: " + err.Error(),
		})
		return
	}

	logrus.WithFields(logrus.Fields{
		"campaign_id":  req.CampaignID,
		"insight_type": req.InsightType,
	}).Info("Generating insights via AI Engine")

	// Call AI Engine service for insights generation
	response, err := h.aiEngine.GenerateInsights(ctx, map[string]interface{}{
		"campaign_id":  req.CampaignID,
		"insight_type": req.InsightType,
		"time_range":   req.TimeRange,
		"parameters":   req.Parameters,
	})
	if err != nil {
		logrus.WithError(err).Error("Failed to generate insights via AI Engine")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to generate insights",
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (h *AnalyticsHandler) GetPerformanceMetrics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Parse query parameters
	campaignID := c.Query("campaign_id")
	timeRange := c.DefaultQuery("time_range", "7d")

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

	// Add time range filter
	// Note: This is a simplified implementation
	// In production, you'd want more sophisticated time range parsing
	var timeFilter time.Time
	switch timeRange {
	case "24h":
		timeFilter = time.Now().Add(-24 * time.Hour)
	case "7d":
		timeFilter = time.Now().Add(-7 * 24 * time.Hour)
	case "30d":
		timeFilter = time.Now().Add(-30 * 24 * time.Hour)
	default:
		timeFilter = time.Now().Add(-7 * 24 * time.Hour)
	}

	filter["created_at"] = bson.M{"$gte": timeFilter}

	// Fetch performance data from creatives
	cursor, err := h.db.CreativesCollection().Find(ctx, filter)
	if err != nil {
		logrus.WithError(err).Error("Failed to fetch performance metrics")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to fetch performance metrics",
		})
		return
	}
	defer cursor.Close(ctx)

	var creatives []models.Creative
	if err = cursor.All(ctx, &creatives); err != nil {
		logrus.WithError(err).Error("Failed to decode performance metrics")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to process performance metrics",
		})
		return
	}

	// Aggregate performance metrics
	metrics := map[string]interface{}{
		"total_creatives": len(creatives),
		"time_range":      timeRange,
		"generated_at":    time.Now().UTC(),
		"metrics": map[string]interface{}{
			"total_impressions": 0,
			"total_clicks":      0,
			"average_ctr":       0.0,
			"total_spend":       0.0,
		},
	}

	c.JSON(http.StatusOK, metrics)
}

// Agent workflow handlers
func ExecuteAgentWorkflow(aiEngine *grpc.AIEngineClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()

		var req models.AgentWorkflowRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Error:   "Invalid request format: " + err.Error(),
			})
			return
		}

		logrus.WithFields(logrus.Fields{
			"workflow_type": req.WorkflowType,
			"user_query":    req.UserQuery,
			"campaign_id":   req.CampaignID,
		}).Info("Executing agent workflow")

		// Call AI Engine service for agent workflow execution
		response, err := aiEngine.ExecuteAgentWorkflow(ctx, map[string]interface{}{
			"workflow_type":   req.WorkflowType,
			"user_query":      req.UserQuery,
			"context":         req.Context,
			"available_tools": req.AvailableTools,
			"campaign_id":     req.CampaignID,
		})
		if err != nil {
			logrus.WithError(err).Error("Failed to execute agent workflow")
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   "Failed to execute agent workflow",
			})
			return
		}

		c.JSON(http.StatusOK, response)
	}
}

func AnalyzeCampaignWithAgent(aiEngine *grpc.AIEngineClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		var req models.AnalyzeRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, models.APIResponse{
				Success: false,
				Error:   "Invalid request format: " + err.Error(),
			})
			return
		}

		logrus.WithFields(logrus.Fields{
			"campaign_id":   req.CampaignID,
			"analysis_type": req.AnalysisType,
		}).Info("Analyzing campaign with AI agent")

		// Call AI Engine service for campaign analysis
		response, err := aiEngine.AnalyzeCampaign(ctx, map[string]interface{}{
			"campaign_id":   req.CampaignID,
			"analysis_type": req.AnalysisType,
			"metrics":       req.Metrics,
			"filters":       req.Filters,
		})
		if err != nil {
			logrus.WithError(err).Error("Failed to analyze campaign with agent")
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   "Failed to analyze campaign",
			})
			return
		}

		c.JSON(http.StatusOK, response)
	}
}
