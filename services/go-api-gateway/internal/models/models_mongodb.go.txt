package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Campaign represents an advertising campaign
type Campaign struct {
	ID                 primitive.ObjectID     `bson:"_id,omitempty" json:"id"`
	Name               string                 `bson:"name" json:"name" binding:"required"`
	Description        string                 `bson:"description" json:"description"`
	TenantID           string                 `bson:"tenant_id" json:"tenant_id"`
	TargetPlatforms    []string               `bson:"target_platforms" json:"target_platforms"`
	Budget             float64                `bson:"budget" json:"budget"`
	TargetAudience     map[string]interface{} `bson:"target_audience" json:"target_audience"`
	CampaignObjectives []string               `bson:"campaign_objectives" json:"campaign_objectives"`
	BrandGuidelines    map[string]interface{} `bson:"brand_guidelines" json:"brand_guidelines"`
	BrandAssets        []string               `bson:"brand_assets" json:"brand_assets"`
	IsActive           bool                   `bson:"is_active" json:"is_active"`
	CreatedAt          time.Time              `bson:"created_at" json:"created_at"`
	UpdatedAt          time.Time              `bson:"updated_at" json:"updated_at"`
	CreatedBy          string                 `bson:"created_by" json:"created_by"`
	CreativesCount     int                    `bson:"creatives_count" json:"creatives_count"`
	PerformanceSummary PerformanceSummary     `bson:"performance_summary" json:"performance_summary"`
}

// Creative represents generated creative content
type Creative struct {
	ID                   primitive.ObjectID     `bson:"_id,omitempty" json:"id"`
	CampaignID           primitive.ObjectID     `bson:"campaign_id" json:"campaign_id" binding:"required"`
	Name                 string                 `bson:"name" json:"name" binding:"required"`
	Description          string                 `bson:"description" json:"description"`
	CreativeType         string                 `bson:"creative_type" json:"creative_type" binding:"required"`
	Platform             string                 `bson:"platform" json:"platform" binding:"required"`
	Status               string                 `bson:"status" json:"status"`
	GenerationParameters map[string]interface{} `bson:"generation_parameters" json:"generation_parameters"`
	Variations           []CreativeVariation    `bson:"variations" json:"variations"`
	SelectedVariationID  string                 `bson:"selected_variation_id" json:"selected_variation_id"`
	PerformanceMetrics   PerformanceMetrics     `bson:"performance_metrics" json:"performance_metrics"`
	IsActive             bool                   `bson:"is_active" json:"is_active"`
	CreatedAt            time.Time              `bson:"created_at" json:"created_at"`
	UpdatedAt            time.Time              `bson:"updated_at" json:"updated_at"`
	CreatedBy            string                 `bson:"created_by" json:"created_by"`
}

// CreativeVariation represents a variation of creative content
type CreativeVariation struct {
	VariationID          string                 `bson:"variation_id" json:"variation_id"`
	VariationName        string                 `bson:"variation_name" json:"variation_name"`
	ContentURL           string                 `bson:"content_url" json:"content_url"`
	ContentType          string                 `bson:"content_type" json:"content_type"`
	GenerationParameters map[string]interface{} `bson:"generation_parameters" json:"generation_parameters"`
	PerformanceScore     float64                `bson:"performance_score" json:"performance_score"`
	IsApproved           bool                   `bson:"is_approved" json:"is_approved"`
	CreatedAt            time.Time              `bson:"created_at" json:"created_at"`
}

// CreativeTemplate represents a template for generating content
type CreativeTemplate struct {
	ID           primitive.ObjectID     `bson:"_id,omitempty" json:"id"`
	Name         string                 `bson:"name" json:"name" binding:"required"`
	Description  string                 `bson:"description" json:"description"`
	TenantID     string                 `bson:"tenant_id" json:"tenant_id"`
	TemplateType string                 `bson:"template_type" json:"template_type"`
	Platform     string                 `bson:"platform" json:"platform"`
	Prompts      map[string]interface{} `bson:"prompts" json:"prompts"`
	Parameters   map[string]interface{} `bson:"parameters" json:"parameters"`
	IsActive     bool                   `bson:"is_active" json:"is_active"`
	CreatedAt    time.Time              `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time              `bson:"updated_at" json:"updated_at"`
	CreatedBy    string                 `bson:"created_by" json:"created_by"`
}

// GenerationJob represents an AI generation job
type GenerationJob struct {
	ID             primitive.ObjectID     `bson:"_id,omitempty" json:"id"`
	CampaignID     primitive.ObjectID     `bson:"campaign_id" json:"campaign_id"`
	CreativeID     primitive.ObjectID     `bson:"creative_id" json:"creative_id"`
	JobType        string                 `bson:"job_type" json:"job_type"`
	Status         string                 `bson:"status" json:"status"`
	Parameters     map[string]interface{} `bson:"parameters" json:"parameters"`
	Results        map[string]interface{} `bson:"results" json:"results"`
	ErrorMessage   string                 `bson:"error_message" json:"error_message"`
	StartedAt      time.Time              `bson:"started_at" json:"started_at"`
	CompletedAt    *time.Time             `bson:"completed_at" json:"completed_at"`
	ProcessingTime float64                `bson:"processing_time" json:"processing_time"`
	ModelUsed      string                 `bson:"model_used" json:"model_used"`
	CreatedAt      time.Time              `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time              `bson:"updated_at" json:"updated_at"`
}

// Performance metrics structures
type PerformanceSummary struct {
	TotalImpressions int     `bson:"total_impressions" json:"total_impressions"`
	TotalClicks      int     `bson:"total_clicks" json:"total_clicks"`
	AverageCTR       float64 `bson:"average_ctr" json:"average_ctr"`
	TotalConversions int     `bson:"total_conversions" json:"total_conversions"`
	TotalSpend       float64 `bson:"total_spend" json:"total_spend"`
}

type PerformanceMetrics struct {
	Impressions   int                    `bson:"impressions" json:"impressions"`
	Clicks        int                    `bson:"clicks" json:"clicks"`
	CTR           float64                `bson:"ctr" json:"ctr"`
	Conversions   int                    `bson:"conversions" json:"conversions"`
	CostPerClick  float64                `bson:"cost_per_click" json:"cost_per_click"`
	ROAS          float64                `bson:"roas" json:"roas"`
	Spend         float64                `bson:"spend" json:"spend"`
	CustomMetrics map[string]interface{} `bson:"custom_metrics" json:"custom_metrics"`
}

// API request/response models
type CreateCampaignRequest struct {
	Name               string                 `json:"name" binding:"required"`
	Description        string                 `json:"description"`
	TargetPlatforms    []string               `json:"target_platforms"`
	Budget             float64                `json:"budget"`
	TargetAudience     map[string]interface{} `json:"target_audience"`
	CampaignObjectives []string               `json:"campaign_objectives"`
	BrandGuidelines    map[string]interface{} `json:"brand_guidelines"`
	BrandAssets        []string               `json:"brand_assets"`
	TenantID           string                 `json:"tenant_id"`
}

type CreateCreativeRequest struct {
	CampaignID           string                 `json:"campaign_id" binding:"required"`
	Name                 string                 `json:"name" binding:"required"`
	Description          string                 `json:"description"`
	CreativeType         string                 `json:"creative_type" binding:"required"`
	Platform             string                 `json:"platform" binding:"required"`
	GenerationParameters map[string]interface{} `json:"generation_parameters"`
}

type GenerateCreativeRequest struct {
	CreativeType   string                 `json:"creative_type" binding:"required"`
	Platform       string                 `json:"platform" binding:"required"`
	Parameters     map[string]interface{} `json:"parameters"`
	VariationCount int                    `json:"variation_count"`
	UseAIEngine    bool                   `json:"use_ai_engine"`
}

type AgentWorkflowRequest struct {
	WorkflowType   string                 `json:"workflow_type" binding:"required"`
	UserQuery      string                 `json:"user_query" binding:"required"`
	Context        map[string]interface{} `json:"context"`
	AvailableTools []string               `json:"available_tools"`
	CampaignID     string                 `json:"campaign_id"`
}

type AnalyzeRequest struct {
	CampaignID   string                 `json:"campaign_id" binding:"required"`
	AnalysisType string                 `json:"analysis_type" binding:"required"`
	Metrics      []string               `json:"metrics"`
	Filters      map[string]interface{} `json:"filters"`
}

type InsightRequest struct {
	CampaignID  string                 `json:"campaign_id"`
	InsightType string                 `json:"insight_type" binding:"required"`
	TimeRange   string                 `json:"time_range"`
	Parameters  map[string]interface{} `json:"parameters"`
}

// Response wrapper
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}
