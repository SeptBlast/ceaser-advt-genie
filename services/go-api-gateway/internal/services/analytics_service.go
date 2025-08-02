package services

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AnalyticsService provides campaign performance analytics and insights
// Following the polyglot architecture: Go for operational data aggregation,
// Python AI service for advanced analytics and predictions
type AnalyticsService struct {
	tenantDB     *mongo.Database
	redisService *RedisService
}

// PerformanceMetrics tracks creative performance (shared type)
type PerformanceMetrics struct {
	Impressions    int64     `bson:"impressions" json:"impressions"`
	Clicks         int64     `bson:"clicks" json:"clicks"`
	Conversions    int64     `bson:"conversions" json:"conversions"`
	CTR            float64   `bson:"ctr" json:"ctr"`
	ConversionRate float64   `bson:"conversion_rate" json:"conversion_rate"`
	Spend          float64   `bson:"spend" json:"spend"`
	LastUpdated    time.Time `bson:"last_updated" json:"last_updated"`
}

// CampaignAnalytics represents aggregated campaign performance data
type CampaignAnalytics struct {
	CampaignID      primitive.ObjectID `bson:"campaign_id" json:"campaign_id"`
	CampaignName    string             `bson:"campaign_name" json:"campaign_name"`
	TimeRange       TimeRange          `bson:"time_range" json:"time_range"`
	Metrics         CampaignMetrics    `bson:"metrics" json:"metrics"`
	CreativeStats   []CreativeStats    `bson:"creative_stats" json:"creative_stats"`
	Trends          TrendAnalysis      `bson:"trends" json:"trends"`
	Recommendations []Recommendation   `bson:"recommendations" json:"recommendations"`
	GeneratedAt     time.Time          `bson:"generated_at" json:"generated_at"`
}

// CampaignMetrics contains key performance indicators
type CampaignMetrics struct {
	// Reach and Engagement
	Impressions int64   `bson:"impressions" json:"impressions"`
	UniqueReach int64   `bson:"unique_reach" json:"unique_reach"`
	Clicks      int64   `bson:"clicks" json:"clicks"`
	CTR         float64 `bson:"ctr" json:"ctr"`

	// Conversion Metrics
	Conversions     int64   `bson:"conversions" json:"conversions"`
	ConversionRate  float64 `bson:"conversion_rate" json:"conversion_rate"`
	ConversionValue float64 `bson:"conversion_value" json:"conversion_value"`

	// Financial Metrics
	TotalSpend float64 `bson:"total_spend" json:"total_spend"`
	CPM        float64 `bson:"cpm" json:"cpm"`   // Cost per thousand impressions
	CPC        float64 `bson:"cpc" json:"cpc"`   // Cost per click
	CPA        float64 `bson:"cpa" json:"cpa"`   // Cost per acquisition
	ROAS       float64 `bson:"roas" json:"roas"` // Return on ad spend

	// Audience Metrics
	AudienceData AudienceBreakdown `bson:"audience_data" json:"audience_data"`

	// Quality Metrics
	QualityScore   float64 `bson:"quality_score" json:"quality_score"`
	RelevanceScore float64 `bson:"relevance_score" json:"relevance_score"`
}

// CreativeStats represents performance data for individual creatives
type CreativeStats struct {
	CreativeID     primitive.ObjectID `bson:"creative_id" json:"creative_id"`
	Type           string             `bson:"type" json:"type"`
	Impressions    int64              `bson:"impressions" json:"impressions"`
	Clicks         int64              `bson:"clicks" json:"clicks"`
	CTR            float64            `bson:"ctr" json:"ctr"`
	Conversions    int64              `bson:"conversions" json:"conversions"`
	ConversionRate float64            `bson:"conversion_rate" json:"conversion_rate"`
	Spend          float64            `bson:"spend" json:"spend"`
	Performance    string             `bson:"performance" json:"performance"` // high, medium, low
}

// TrendAnalysis contains trend data over time
type TrendAnalysis struct {
	DailyMetrics  []DailyMetric   `bson:"daily_metrics" json:"daily_metrics"`
	WeeklyMetrics []WeeklyMetric  `bson:"weekly_metrics" json:"weekly_metrics"`
	GrowthRates   GrowthRates     `bson:"growth_rates" json:"growth_rates"`
	Seasonality   SeasonalityData `bson:"seasonality" json:"seasonality"`
}

// DailyMetric represents daily performance data
type DailyMetric struct {
	Date        time.Time `bson:"date" json:"date"`
	Impressions int64     `bson:"impressions" json:"impressions"`
	Clicks      int64     `bson:"clicks" json:"clicks"`
	Conversions int64     `bson:"conversions" json:"conversions"`
	Spend       float64   `bson:"spend" json:"spend"`
	CTR         float64   `bson:"ctr" json:"ctr"`
}

// WeeklyMetric represents weekly aggregated performance
type WeeklyMetric struct {
	WeekStart   time.Time `bson:"week_start" json:"week_start"`
	WeekEnd     time.Time `bson:"week_end" json:"week_end"`
	Impressions int64     `bson:"impressions" json:"impressions"`
	Clicks      int64     `bson:"clicks" json:"clicks"`
	Conversions int64     `bson:"conversions" json:"conversions"`
	Spend       float64   `bson:"spend" json:"spend"`
	CTR         float64   `bson:"ctr" json:"ctr"`
}

// GrowthRates contains percentage growth metrics
type GrowthRates struct {
	ImpressionsGrowth float64 `bson:"impressions_growth" json:"impressions_growth"`
	ClicksGrowth      float64 `bson:"clicks_growth" json:"clicks_growth"`
	ConversionsGrowth float64 `bson:"conversions_growth" json:"conversions_growth"`
	SpendGrowth       float64 `bson:"spend_growth" json:"spend_growth"`
	ROASGrowth        float64 `bson:"roas_growth" json:"roas_growth"`
}

// SeasonalityData contains seasonal performance insights
type SeasonalityData struct {
	BestPerformingDays  []string           `bson:"best_performing_days" json:"best_performing_days"`
	BestPerformingHours []int              `bson:"best_performing_hours" json:"best_performing_hours"`
	SeasonalFactors     map[string]float64 `bson:"seasonal_factors" json:"seasonal_factors"`
}

// AudienceBreakdown contains demographic and behavioral data
type AudienceBreakdown struct {
	AgeDistribution      map[string]float64 `bson:"age_distribution" json:"age_distribution"`
	GenderDistribution   map[string]float64 `bson:"gender_distribution" json:"gender_distribution"`
	LocationDistribution map[string]float64 `bson:"location_distribution" json:"location_distribution"`
	DeviceDistribution   map[string]float64 `bson:"device_distribution" json:"device_distribution"`
	InterestCategories   map[string]float64 `bson:"interest_categories" json:"interest_categories"`
}

// Recommendation represents AI-generated optimization suggestions
type Recommendation struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Type        string             `bson:"type" json:"type"`         // budget, targeting, creative, timing
	Priority    string             `bson:"priority" json:"priority"` // high, medium, low
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	ImpactScore float64            `bson:"impact_score" json:"impact_score"` // 0-100
	Confidence  float64            `bson:"confidence" json:"confidence"`     // 0-100
	ActionItems []string           `bson:"action_items" json:"action_items"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
}

// TimeRange represents a date range for analytics
type TimeRange struct {
	StartDate time.Time `bson:"start_date" json:"start_date"`
	EndDate   time.Time `bson:"end_date" json:"end_date"`
	Period    string    `bson:"period" json:"period"` // daily, weekly, monthly
}

// AnalyticsRequest represents a request for campaign analytics
type AnalyticsRequest struct {
	CampaignIDs []primitive.ObjectID `json:"campaign_ids"`
	TimeRange   TimeRange            `json:"time_range"`
	Metrics     []string             `json:"metrics"`
	GroupBy     []string             `json:"group_by"`
	Filters     map[string]string    `json:"filters"`
}

// NewAnalyticsService creates a new analytics service
func NewAnalyticsService(tenantDB *mongo.Database, redisService *RedisService) *AnalyticsService {
	return &AnalyticsService{
		tenantDB:     tenantDB,
		redisService: redisService,
	}
}

// GetCampaignAnalytics retrieves comprehensive analytics for a campaign
func (as *AnalyticsService) GetCampaignAnalytics(ctx context.Context, campaignID primitive.ObjectID, timeRange TimeRange) (*CampaignAnalytics, error) {
	// Check cache first
	cacheKey := fmt.Sprintf("analytics:campaign:%s:%s:%s",
		campaignID.Hex(), timeRange.StartDate.Format("2006-01-02"), timeRange.EndDate.Format("2006-01-02"))

	var cached CampaignAnalytics
	if err := as.redisService.Get(ctx, cacheKey, &cached); err == nil {
		return &cached, nil
	}

	// Aggregate performance data from creatives
	metrics, err := as.aggregateCampaignMetrics(ctx, campaignID, timeRange)
	if err != nil {
		return nil, fmt.Errorf("error aggregating metrics: %w", err)
	}

	// Get creative performance breakdown
	creativeStats, err := as.getCreativeStats(ctx, campaignID, timeRange)
	if err != nil {
		return nil, fmt.Errorf("error getting creative stats: %w", err)
	}

	// Calculate trends
	trends, err := as.calculateTrends(ctx, campaignID, timeRange)
	if err != nil {
		return nil, fmt.Errorf("error calculating trends: %w", err)
	}

	// Generate recommendations (this would typically call AI service for advanced insights)
	recommendations := as.generateBasicRecommendations(metrics, creativeStats)

	analytics := &CampaignAnalytics{
		CampaignID:      campaignID,
		TimeRange:       timeRange,
		Metrics:         *metrics,
		CreativeStats:   creativeStats,
		Trends:          *trends,
		Recommendations: recommendations,
		GeneratedAt:     time.Now(),
	}

	// Cache for 1 hour
	as.redisService.Set(ctx, cacheKey, analytics, time.Hour)

	return analytics, nil
}

// aggregateCampaignMetrics aggregates performance metrics from all creatives in a campaign
func (as *AnalyticsService) aggregateCampaignMetrics(ctx context.Context, campaignID primitive.ObjectID, timeRange TimeRange) (*CampaignMetrics, error) {
	collection := as.tenantDB.Collection("creatives")

	// MongoDB aggregation pipeline to calculate campaign metrics
	pipeline := []bson.M{
		{
			"$match": bson.M{
				"campaign_id": campaignID,
				"created_at": bson.M{
					"$gte": timeRange.StartDate,
					"$lte": timeRange.EndDate,
				},
			},
		},
		{
			"$group": bson.M{
				"_id":               nil,
				"total_impressions": bson.M{"$sum": "$performance.impressions"},
				"total_clicks":      bson.M{"$sum": "$performance.clicks"},
				"total_conversions": bson.M{"$sum": "$performance.conversions"},
				"total_spend":       bson.M{"$sum": "$performance.spend"},
				"creative_count":    bson.M{"$sum": 1},
			},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("error executing aggregation: %w", err)
	}
	defer cursor.Close(ctx)

	var result struct {
		TotalImpressions int64   `bson:"total_impressions"`
		TotalClicks      int64   `bson:"total_clicks"`
		TotalConversions int64   `bson:"total_conversions"`
		TotalSpend       float64 `bson:"total_spend"`
		CreativeCount    int     `bson:"creative_count"`
	}

	if cursor.Next(ctx) {
		if err := cursor.Decode(&result); err != nil {
			return nil, fmt.Errorf("error decoding result: %w", err)
		}
	}

	// Calculate derived metrics
	metrics := &CampaignMetrics{
		Impressions:    result.TotalImpressions,
		Clicks:         result.TotalClicks,
		Conversions:    result.TotalConversions,
		TotalSpend:     result.TotalSpend,
		CTR:            calculateCTR(result.TotalClicks, result.TotalImpressions),
		ConversionRate: calculateConversionRate(result.TotalConversions, result.TotalClicks),
		CPC:            calculateCPC(result.TotalSpend, result.TotalClicks),
		CPA:            calculateCPA(result.TotalSpend, result.TotalConversions),
		CPM:            calculateCPM(result.TotalSpend, result.TotalImpressions),
	}

	return metrics, nil
}

// getCreativeStats gets performance breakdown by individual creatives
func (as *AnalyticsService) getCreativeStats(ctx context.Context, campaignID primitive.ObjectID, timeRange TimeRange) ([]CreativeStats, error) {
	collection := as.tenantDB.Collection("creatives")

	cursor, err := collection.Find(ctx, bson.M{
		"campaign_id": campaignID,
		"created_at": bson.M{
			"$gte": timeRange.StartDate,
			"$lte": timeRange.EndDate,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("error querying creatives: %w", err)
	}
	defer cursor.Close(ctx)

	var stats []CreativeStats
	for cursor.Next(ctx) {
		var creative struct {
			ID          primitive.ObjectID `bson:"_id"`
			Type        string             `bson:"type"`
			Performance PerformanceMetrics `bson:"performance"`
		}

		if err := cursor.Decode(&creative); err != nil {
			continue
		}

		perf := determinePerformanceLevel(creative.Performance)

		stat := CreativeStats{
			CreativeID:     creative.ID,
			Type:           creative.Type,
			Impressions:    creative.Performance.Impressions,
			Clicks:         creative.Performance.Clicks,
			CTR:            creative.Performance.CTR,
			Conversions:    creative.Performance.Conversions,
			ConversionRate: creative.Performance.ConversionRate,
			Spend:          creative.Performance.Spend,
			Performance:    perf,
		}

		stats = append(stats, stat)
	}

	return stats, nil
}

// calculateTrends calculates trend analysis over the time period
func (as *AnalyticsService) calculateTrends(ctx context.Context, campaignID primitive.ObjectID, timeRange TimeRange) (*TrendAnalysis, error) {
	// Get daily metrics
	dailyMetrics, err := as.getDailyMetrics(ctx, campaignID, timeRange)
	if err != nil {
		return nil, err
	}

	// Calculate growth rates
	growthRates := as.calculateGrowthRates(dailyMetrics)

	trends := &TrendAnalysis{
		DailyMetrics: dailyMetrics,
		GrowthRates:  growthRates,
	}

	return trends, nil
}

// getDailyMetrics gets performance metrics broken down by day
func (as *AnalyticsService) getDailyMetrics(ctx context.Context, campaignID primitive.ObjectID, timeRange TimeRange) ([]DailyMetric, error) {
	collection := as.tenantDB.Collection("creative_daily_metrics") // Assumes a collection for daily metrics

	cursor, err := collection.Find(ctx, bson.M{
		"campaign_id": campaignID,
		"date": bson.M{
			"$gte": timeRange.StartDate,
			"$lte": timeRange.EndDate,
		},
	}, options.Find().SetSort(bson.M{"date": 1}))

	if err != nil {
		return nil, fmt.Errorf("error querying daily metrics: %w", err)
	}
	defer cursor.Close(ctx)

	var metrics []DailyMetric
	for cursor.Next(ctx) {
		var metric DailyMetric
		if err := cursor.Decode(&metric); err != nil {
			continue
		}
		metrics = append(metrics, metric)
	}

	return metrics, nil
}

// generateBasicRecommendations generates optimization recommendations based on performance data
func (as *AnalyticsService) generateBasicRecommendations(metrics *CampaignMetrics, creativeStats []CreativeStats) []Recommendation {
	var recommendations []Recommendation

	// Low CTR recommendation
	if metrics.CTR < 0.01 { // Less than 1% CTR
		recommendations = append(recommendations, Recommendation{
			Type:        "creative",
			Priority:    "high",
			Title:       "Improve Creative Performance",
			Description: "Your CTR is below industry average. Consider testing new creative variations with more engaging visuals or compelling copy.",
			ImpactScore: 85,
			Confidence:  92,
			ActionItems: []string{
				"A/B test new headlines",
				"Try different visual styles",
				"Update call-to-action buttons",
			},
			CreatedAt: time.Now(),
		})
	}

	// High CPA recommendation
	if metrics.CPA > 50 { // Assuming $50+ CPA is high
		recommendations = append(recommendations, Recommendation{
			Type:        "targeting",
			Priority:    "high",
			Title:       "Optimize Targeting to Reduce Costs",
			Description: "Your cost per acquisition is high. Consider refining your audience targeting to reach more qualified prospects.",
			ImpactScore: 78,
			Confidence:  88,
			ActionItems: []string{
				"Narrow audience demographics",
				"Add interest-based targeting",
				"Exclude low-performing locations",
			},
			CreatedAt: time.Now(),
		})
	}

	// Budget optimization
	if metrics.ROAS < 2.0 { // Less than 2:1 return on ad spend
		recommendations = append(recommendations, Recommendation{
			Type:        "budget",
			Priority:    "medium",
			Title:       "Improve Return on Ad Spend",
			Description: "Your ROAS indicates room for improvement. Focus budget on highest performing creatives and time periods.",
			ImpactScore: 65,
			Confidence:  81,
			ActionItems: []string{
				"Pause underperforming creatives",
				"Increase budget for top performers",
				"Optimize bidding strategy",
			},
			CreatedAt: time.Now(),
		})
	}

	return recommendations
}

// calculateGrowthRates calculates percentage growth over the time period
func (as *AnalyticsService) calculateGrowthRates(dailyMetrics []DailyMetric) GrowthRates {
	if len(dailyMetrics) < 2 {
		return GrowthRates{}
	}

	first := dailyMetrics[0]
	last := dailyMetrics[len(dailyMetrics)-1]

	return GrowthRates{
		ImpressionsGrowth: calculatePercentageGrowth(float64(first.Impressions), float64(last.Impressions)),
		ClicksGrowth:      calculatePercentageGrowth(float64(first.Clicks), float64(last.Clicks)),
		ConversionsGrowth: calculatePercentageGrowth(float64(first.Conversions), float64(last.Conversions)),
		SpendGrowth:       calculatePercentageGrowth(first.Spend, last.Spend),
	}
}

// Helper calculation functions

func calculateCTR(clicks, impressions int64) float64 {
	if impressions == 0 {
		return 0
	}
	return float64(clicks) / float64(impressions) * 100
}

func calculateConversionRate(conversions, clicks int64) float64 {
	if clicks == 0 {
		return 0
	}
	return float64(conversions) / float64(clicks) * 100
}

func calculateCPC(spend float64, clicks int64) float64 {
	if clicks == 0 {
		return 0
	}
	return spend / float64(clicks)
}

func calculateCPA(spend float64, conversions int64) float64 {
	if conversions == 0 {
		return 0
	}
	return spend / float64(conversions)
}

func calculateCPM(spend float64, impressions int64) float64 {
	if impressions == 0 {
		return 0
	}
	return (spend / float64(impressions)) * 1000
}

func calculatePercentageGrowth(initial, final float64) float64 {
	if initial == 0 {
		return 0
	}
	return ((final - initial) / initial) * 100
}

func determinePerformanceLevel(metrics PerformanceMetrics) string {
	// Simple heuristic based on CTR
	if metrics.CTR >= 2.0 {
		return "high"
	} else if metrics.CTR >= 1.0 {
		return "medium"
	}
	return "low"
}

// GetMultiCampaignAnalytics gets analytics for multiple campaigns
func (as *AnalyticsService) GetMultiCampaignAnalytics(ctx context.Context, req *AnalyticsRequest) ([]CampaignAnalytics, error) {
	var results []CampaignAnalytics

	for _, campaignID := range req.CampaignIDs {
		analytics, err := as.GetCampaignAnalytics(ctx, campaignID, req.TimeRange)
		if err != nil {
			// Log error but continue with other campaigns
			continue
		}
		results = append(results, *analytics)
	}

	return results, nil
}

// GetTopPerformingCreatives returns the best performing creatives across campaigns
func (as *AnalyticsService) GetTopPerformingCreatives(ctx context.Context, userID primitive.ObjectID, limit int) ([]CreativeStats, error) {
	collection := as.tenantDB.Collection("creatives")

	// First get campaigns for this user
	campaignCollection := as.tenantDB.Collection("campaigns")
	campaignCursor, err := campaignCollection.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, fmt.Errorf("error finding user campaigns: %w", err)
	}
	defer campaignCursor.Close(ctx)

	var campaignIDs []primitive.ObjectID
	for campaignCursor.Next(ctx) {
		var campaign struct {
			ID primitive.ObjectID `bson:"_id"`
		}
		if err := campaignCursor.Decode(&campaign); err != nil {
			continue
		}
		campaignIDs = append(campaignIDs, campaign.ID)
	}

	// Get top performing creatives
	pipeline := []bson.M{
		{
			"$match": bson.M{
				"campaign_id": bson.M{"$in": campaignIDs},
			},
		},
		{
			"$sort": bson.M{"performance.ctr": -1},
		},
		{
			"$limit": limit,
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("error executing aggregation: %w", err)
	}
	defer cursor.Close(ctx)

	var stats []CreativeStats
	for cursor.Next(ctx) {
		var creative struct {
			ID          primitive.ObjectID `bson:"_id"`
			Type        string             `bson:"type"`
			Performance PerformanceMetrics `bson:"performance"`
		}

		if err := cursor.Decode(&creative); err != nil {
			continue
		}

		stat := CreativeStats{
			CreativeID:     creative.ID,
			Type:           creative.Type,
			Impressions:    creative.Performance.Impressions,
			Clicks:         creative.Performance.Clicks,
			CTR:            creative.Performance.CTR,
			Conversions:    creative.Performance.Conversions,
			ConversionRate: creative.Performance.ConversionRate,
			Spend:          creative.Performance.Spend,
			Performance:    determinePerformanceLevel(creative.Performance),
		}

		stats = append(stats, stat)
	}

	return stats, nil
}
