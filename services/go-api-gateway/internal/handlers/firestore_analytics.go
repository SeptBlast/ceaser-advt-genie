package handlers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/database"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/models"
)

type FirestoreAnalyticsHandler struct {
	firestoreClient *database.FirestoreClient
}

func NewFirestoreAnalyticsHandler(firestoreClient *database.FirestoreClient) *FirestoreAnalyticsHandler {
	return &FirestoreAnalyticsHandler{
		firestoreClient: firestoreClient,
	}
}

// RecordEvent records an analytics event
func (h *FirestoreAnalyticsHandler) RecordEvent(c *gin.Context) {
	var event models.Analytics
	if err := c.ShouldBindJSON(&event); err != nil {
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
	event.UserID = userID.(string)
	event.Timestamp = time.Now()

	ctx := context.Background()
	docRef := h.firestoreClient.Collection.Analytics.NewDoc()
	event.ID = docRef.ID

	_, err := docRef.Set(ctx, event)
	if err != nil {
		logrus.WithError(err).Error("Error recording analytics event")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to record event",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Data:    event,
	})
}

// GetCampaignAnalytics retrieves analytics for a specific campaign
func (h *FirestoreAnalyticsHandler) GetCampaignAnalytics(c *gin.Context) {
	campaignID := c.Param("campaign_id")
	if campaignID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "Campaign ID is required",
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
	campaignRef := h.firestoreClient.Collection.Campaigns.Doc(campaignID)
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

	// Query analytics for this campaign
	query := h.firestoreClient.Collection.Analytics.Where("user_id", "==", userID.(string)).Where("campaign_id", "==", campaignID)

	// Add date filters if provided
	if startDate := c.Query("start_date"); startDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", startDate); err == nil {
			query = query.Where("timestamp", ">=", parsedDate)
		}
	}

	if endDate := c.Query("end_date"); endDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", endDate); err == nil {
			// Add one day to include the end date
			query = query.Where("timestamp", "<=", parsedDate.Add(24*time.Hour))
		}
	}

	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		logrus.WithError(err).Error("Error retrieving campaign analytics")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to retrieve analytics",
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

	// Calculate summary metrics
	summary := calculateAnalyticsSummary(analytics)

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"campaign":  campaign,
			"analytics": analytics,
			"summary":   summary,
		},
	})
}

// GetCreativeAnalytics retrieves analytics for a specific creative
func (h *FirestoreAnalyticsHandler) GetCreativeAnalytics(c *gin.Context) {
	creativeID := c.Param("creative_id")
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
	query := h.firestoreClient.Collection.Analytics.Where("user_id", "==", userID.(string)).Where("creative_id", "==", creativeID)

	// Add date filters if provided
	if startDate := c.Query("start_date"); startDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", startDate); err == nil {
			query = query.Where("timestamp", ">=", parsedDate)
		}
	}

	if endDate := c.Query("end_date"); endDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", endDate); err == nil {
			query = query.Where("timestamp", "<=", parsedDate.Add(24*time.Hour))
		}
	}

	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		logrus.WithError(err).Error("Error retrieving creative analytics")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to retrieve analytics",
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

	// Calculate summary metrics
	summary := calculateAnalyticsSummary(analytics)

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"creative":  creative,
			"analytics": analytics,
			"summary":   summary,
		},
	})
}

// GetDashboardAnalytics retrieves overall analytics for user's dashboard
func (h *FirestoreAnalyticsHandler) GetDashboardAnalytics(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	ctx := context.Background()
	query := h.firestoreClient.Collection.Analytics.Where("user_id", "==", userID.(string))

	// Add date filters if provided
	if startDate := c.Query("start_date"); startDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", startDate); err == nil {
			query = query.Where("timestamp", ">=", parsedDate)
		}
	}

	if endDate := c.Query("end_date"); endDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", endDate); err == nil {
			query = query.Where("timestamp", "<=", parsedDate.Add(24*time.Hour))
		}
	}

	// Limit results for dashboard
	limitStr := c.DefaultQuery("limit", "1000")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 1000
	}
	query = query.Limit(limit)

	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		logrus.WithError(err).Error("Error retrieving dashboard analytics")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to retrieve analytics",
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

	// Calculate summary metrics
	summary := calculateAnalyticsSummary(analytics)

	// Get campaign and creative breakdowns
	campaignMetrics := calculateCampaignBreakdown(analytics)
	creativeMetrics := calculateCreativeBreakdown(analytics)

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"summary":          summary,
			"campaign_metrics": campaignMetrics,
			"creative_metrics": creativeMetrics,
			"total_events":     len(analytics),
		},
	})
}

// GetAnalyticsReport generates a detailed analytics report
func (h *FirestoreAnalyticsHandler) GetAnalyticsReport(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.APIResponse{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	reportType := c.DefaultQuery("type", "summary") // summary, detailed, performance
	period := c.DefaultQuery("period", "7d")        // 7d, 30d, 90d, custom

	var startDate, endDate time.Time
	var err error

	switch period {
	case "7d":
		startDate = time.Now().AddDate(0, 0, -7)
		endDate = time.Now()
	case "30d":
		startDate = time.Now().AddDate(0, 0, -30)
		endDate = time.Now()
	case "90d":
		startDate = time.Now().AddDate(0, 0, -90)
		endDate = time.Now()
	case "custom":
		if startDateStr := c.Query("start_date"); startDateStr != "" {
			startDate, err = time.Parse("2006-01-02", startDateStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, models.APIResponse{
					Success: false,
					Error:   "Invalid start_date format (use YYYY-MM-DD)",
				})
				return
			}
		} else {
			startDate = time.Now().AddDate(0, 0, -30)
		}

		if endDateStr := c.Query("end_date"); endDateStr != "" {
			endDate, err = time.Parse("2006-01-02", endDateStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, models.APIResponse{
					Success: false,
					Error:   "Invalid end_date format (use YYYY-MM-DD)",
				})
				return
			}
		} else {
			endDate = time.Now()
		}
	default:
		startDate = time.Now().AddDate(0, 0, -7)
		endDate = time.Now()
	}

	ctx := context.Background()
	query := h.firestoreClient.Collection.Analytics.
		Where("user_id", "==", userID.(string)).
		Where("timestamp", ">=", startDate).
		Where("timestamp", "<=", endDate)

	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		logrus.WithError(err).Error("Error retrieving analytics report data")
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "Failed to retrieve report data",
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

	report := generateAnalyticsReport(analytics, reportType, startDate, endDate)

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    report,
	})
}

// Helper functions for analytics calculations

func calculateAnalyticsSummary(analytics []models.Analytics) map[string]interface{} {
	summary := map[string]interface{}{
		"total_impressions": 0,
		"total_clicks":      0,
		"total_conversions": 0,
		"total_spend":       0.0,
		"ctr":               0.0,
		"conversion_rate":   0.0,
		"cpc":               0.0,
		"cpa":               0.0,
	}

	var totalImpressions, totalClicks, totalConversions int
	var totalSpend float64

	for _, event := range analytics {
		switch event.EventType {
		case "impression":
			totalImpressions++
		case "click":
			totalClicks++
		case "conversion":
			totalConversions++
		}

		if spend, ok := event.Metrics["spend"].(float64); ok {
			totalSpend += spend
		}
	}

	summary["total_impressions"] = totalImpressions
	summary["total_clicks"] = totalClicks
	summary["total_conversions"] = totalConversions
	summary["total_spend"] = totalSpend

	if totalImpressions > 0 {
		summary["ctr"] = float64(totalClicks) / float64(totalImpressions) * 100
	}

	if totalClicks > 0 {
		summary["conversion_rate"] = float64(totalConversions) / float64(totalClicks) * 100
		if totalSpend > 0 {
			summary["cpc"] = totalSpend / float64(totalClicks)
		}
	}

	if totalConversions > 0 && totalSpend > 0 {
		summary["cpa"] = totalSpend / float64(totalConversions)
	}

	return summary
}

func calculateCampaignBreakdown(analytics []models.Analytics) map[string]interface{} {
	campaigns := make(map[string]map[string]interface{})

	for _, event := range analytics {
		if event.CampaignID == "" {
			continue
		}

		if _, exists := campaigns[event.CampaignID]; !exists {
			campaigns[event.CampaignID] = map[string]interface{}{
				"impressions": 0,
				"clicks":      0,
				"conversions": 0,
				"spend":       0.0,
			}
		}

		campaign := campaigns[event.CampaignID]
		switch event.EventType {
		case "impression":
			campaign["impressions"] = campaign["impressions"].(int) + 1
		case "click":
			campaign["clicks"] = campaign["clicks"].(int) + 1
		case "conversion":
			campaign["conversions"] = campaign["conversions"].(int) + 1
		}

		if spend, ok := event.Metrics["spend"].(float64); ok {
			campaign["spend"] = campaign["spend"].(float64) + spend
		}
	}

	return map[string]interface{}{
		"campaigns": campaigns,
	}
}

func calculateCreativeBreakdown(analytics []models.Analytics) map[string]interface{} {
	creatives := make(map[string]map[string]interface{})

	for _, event := range analytics {
		if event.CreativeID == "" {
			continue
		}

		if _, exists := creatives[event.CreativeID]; !exists {
			creatives[event.CreativeID] = map[string]interface{}{
				"impressions": 0,
				"clicks":      0,
				"conversions": 0,
				"spend":       0.0,
			}
		}

		creative := creatives[event.CreativeID]
		switch event.EventType {
		case "impression":
			creative["impressions"] = creative["impressions"].(int) + 1
		case "click":
			creative["clicks"] = creative["clicks"].(int) + 1
		case "conversion":
			creative["conversions"] = creative["conversions"].(int) + 1
		}

		if spend, ok := event.Metrics["spend"].(float64); ok {
			creative["spend"] = creative["spend"].(float64) + spend
		}
	}

	return map[string]interface{}{
		"creatives": creatives,
	}
}

func generateAnalyticsReport(analytics []models.Analytics, reportType string, startDate, endDate time.Time) map[string]interface{} {
	report := map[string]interface{}{
		"report_type": reportType,
		"period": map[string]interface{}{
			"start_date": startDate.Format("2006-01-02"),
			"end_date":   endDate.Format("2006-01-02"),
		},
		"summary":          calculateAnalyticsSummary(analytics),
		"campaign_metrics": calculateCampaignBreakdown(analytics),
		"creative_metrics": calculateCreativeBreakdown(analytics),
		"total_events":     len(analytics),
		"generated_at":     time.Now(),
	}

	if reportType == "detailed" {
		// Add daily breakdown
		dailyMetrics := make(map[string]map[string]interface{})
		for _, event := range analytics {
			day := event.Timestamp.Format("2006-01-02")
			if _, exists := dailyMetrics[day]; !exists {
				dailyMetrics[day] = map[string]interface{}{
					"impressions": 0,
					"clicks":      0,
					"conversions": 0,
					"spend":       0.0,
				}
			}

			dayMetrics := dailyMetrics[day]
			switch event.EventType {
			case "impression":
				dayMetrics["impressions"] = dayMetrics["impressions"].(int) + 1
			case "click":
				dayMetrics["clicks"] = dayMetrics["clicks"].(int) + 1
			case "conversion":
				dayMetrics["conversions"] = dayMetrics["conversions"].(int) + 1
			}

			if spend, ok := event.Metrics["spend"].(float64); ok {
				dayMetrics["spend"] = dayMetrics["spend"].(float64) + spend
			}
		}
		report["daily_metrics"] = dailyMetrics
	}

	return report
}
