package models

import (
	"time"
)

// Campaign represents an advertising campaign
type Campaign struct {
	ID                 string                 `firestore:"-" json:"id"` // Document ID is handled separately in Firestore
	Name               string                 `firestore:"name" json:"name" binding:"required"`
	Description        string                 `firestore:"description" json:"description"`
	TenantID           string                 `firestore:"tenant_id" json:"tenant_id"`
	UserID             string                 `firestore:"user_id" json:"user_id"` // Add user ID for Firebase Auth integration
	TargetPlatforms    []string               `firestore:"target_platforms" json:"target_platforms"`
	Budget             float64                `firestore:"budget" json:"budget"`
	TargetAudience     map[string]interface{} `firestore:"target_audience" json:"target_audience"`
	CampaignObjectives []string               `firestore:"campaign_objectives" json:"campaign_objectives"`
	BrandGuidelines    map[string]interface{} `firestore:"brand_guidelines" json:"brand_guidelines"`
	BrandAssets        []string               `firestore:"brand_assets" json:"brand_assets"`
	IsActive           bool                   `firestore:"is_active" json:"is_active"`
	CreatedAt          time.Time              `firestore:"created_at" json:"created_at"`
	UpdatedAt          time.Time              `firestore:"updated_at" json:"updated_at"`
	CreatedBy          string                 `firestore:"created_by" json:"created_by"`
	CreativesCount     int                    `firestore:"creatives_count" json:"creatives_count"`
	PerformanceSummary PerformanceSummary     `firestore:"performance_summary" json:"performance_summary"`
}

// Creative represents generated creative content
type Creative struct {
	ID                   string                 `firestore:"-" json:"id"`
	CampaignID           string                 `firestore:"campaign_id" json:"campaign_id" binding:"required"`
	UserID               string                 `firestore:"user_id" json:"user_id"`
	Name                 string                 `firestore:"name" json:"name" binding:"required"`
	Description          string                 `firestore:"description" json:"description"`
	CreativeType         string                 `firestore:"creative_type" json:"creative_type" binding:"required"`
	Platform             string                 `firestore:"platform" json:"platform" binding:"required"`
	Status               string                 `firestore:"status" json:"status"`
	GenerationParameters map[string]interface{} `firestore:"generation_parameters" json:"generation_parameters"`
	Variations           []CreativeVariation    `firestore:"variations" json:"variations"`
	SelectedVariationID  string                 `firestore:"selected_variation_id" json:"selected_variation_id"`
	PerformanceMetrics   PerformanceMetrics     `firestore:"performance_metrics" json:"performance_metrics"`
	IsActive             bool                   `firestore:"is_active" json:"is_active"`
	CreatedAt            time.Time              `firestore:"created_at" json:"created_at"`
	UpdatedAt            time.Time              `firestore:"updated_at" json:"updated_at"`
	CreatedBy            string                 `firestore:"created_by" json:"created_by"`
}

// CreativeVariation represents a variation of creative content
type CreativeVariation struct {
	VariationID          string                 `firestore:"variation_id" json:"variation_id"`
	VariationName        string                 `firestore:"variation_name" json:"variation_name"`
	ContentURL           string                 `firestore:"content_url" json:"content_url"`
	ContentType          string                 `firestore:"content_type" json:"content_type"`
	GenerationParameters map[string]interface{} `firestore:"generation_parameters" json:"generation_parameters"`
	PerformanceScore     float64                `firestore:"performance_score" json:"performance_score"`
	IsApproved           bool                   `firestore:"is_approved" json:"is_approved"`
	CreatedAt            time.Time              `firestore:"created_at" json:"created_at"`
}

// CreativeTemplate represents a template for generating content
type CreativeTemplate struct {
	ID           string                 `firestore:"-" json:"id"`
	Name         string                 `firestore:"name" json:"name" binding:"required"`
	Description  string                 `firestore:"description" json:"description"`
	TenantID     string                 `firestore:"tenant_id" json:"tenant_id"`
	UserID       string                 `firestore:"user_id" json:"user_id"`
	TemplateType string                 `firestore:"template_type" json:"template_type"`
	Platform     string                 `firestore:"platform" json:"platform"`
	Prompts      map[string]interface{} `firestore:"prompts" json:"prompts"`
	Parameters   map[string]interface{} `firestore:"parameters" json:"parameters"`
	IsActive     bool                   `firestore:"is_active" json:"is_active"`
	CreatedAt    time.Time              `firestore:"created_at" json:"created_at"`
	UpdatedAt    time.Time              `firestore:"updated_at" json:"updated_at"`
	CreatedBy    string                 `firestore:"created_by" json:"created_by"`
}

// GenerationJob represents an AI generation job
type GenerationJob struct {
	ID             string                 `firestore:"-" json:"id"`
	CampaignID     string                 `firestore:"campaign_id" json:"campaign_id"`
	CreativeID     string                 `firestore:"creative_id" json:"creative_id"`
	UserID         string                 `firestore:"user_id" json:"user_id"`
	JobType        string                 `firestore:"job_type" json:"job_type"`
	Status         string                 `firestore:"status" json:"status"`
	Parameters     map[string]interface{} `firestore:"parameters" json:"parameters"`
	Results        map[string]interface{} `firestore:"results" json:"results"`
	ErrorMessage   string                 `firestore:"error_message" json:"error_message"`
	StartedAt      time.Time              `firestore:"started_at" json:"started_at"`
	CompletedAt    *time.Time             `firestore:"completed_at" json:"completed_at"`
	ProcessingTime float64                `firestore:"processing_time" json:"processing_time"`
	ModelUsed      string                 `firestore:"model_used" json:"model_used"`
	CreatedAt      time.Time              `firestore:"created_at" json:"created_at"`
	UpdatedAt      time.Time              `firestore:"updated_at" json:"updated_at"`
}

// UserProfile represents a user profile stored in Firestore (synced with Firebase Auth)
type UserProfile struct {
	UID           string    `firestore:"-" json:"uid"` // Document ID
	Email         string    `firestore:"email" json:"email"`
	DisplayName   string    `firestore:"display_name" json:"display_name"`
	PhotoURL      string    `firestore:"photo_url" json:"photo_url,omitempty"`
	EmailVerified bool      `firestore:"email_verified" json:"email_verified"`
	CreatedAt     time.Time `firestore:"created_at" json:"created_at"`
	LastLoginAt   time.Time `firestore:"last_login_at" json:"last_login_at"`
	// AI Model Configurations
	AIModels map[string]interface{} `firestore:"ai_models" json:"ai_models"`
	// Image/Video Generation Models
	MediaModels map[string]interface{} `firestore:"media_models" json:"media_models"`
	// Security Settings
	Security map[string]interface{} `firestore:"security" json:"security"`
	// Preferences
	Preferences map[string]interface{} `firestore:"preferences" json:"preferences"`
	// Tenant/Organization Information
	TenantID    string   `firestore:"tenant_id" json:"tenant_id"`
	TenantRole  string   `firestore:"tenant_role" json:"tenant_role"`
	Permissions []string `firestore:"permissions" json:"permissions"`
}

// Performance metrics structures
type PerformanceSummary struct {
	TotalImpressions int     `firestore:"total_impressions" json:"total_impressions"`
	TotalClicks      int     `firestore:"total_clicks" json:"total_clicks"`
	AverageCTR       float64 `firestore:"average_ctr" json:"average_ctr"`
	TotalConversions int     `firestore:"total_conversions" json:"total_conversions"`
	TotalSpend       float64 `firestore:"total_spend" json:"total_spend"`
}

type PerformanceMetrics struct {
	Impressions   int                    `firestore:"impressions" json:"impressions"`
	Clicks        int                    `firestore:"clicks" json:"clicks"`
	CTR           float64                `firestore:"ctr" json:"ctr"`
	Conversions   int                    `firestore:"conversions" json:"conversions"`
	CostPerClick  float64                `firestore:"cost_per_click" json:"cost_per_click"`
	ROAS          float64                `firestore:"roas" json:"roas"`
	Spend         float64                `firestore:"spend" json:"spend"`
	CustomMetrics map[string]interface{} `firestore:"custom_metrics" json:"custom_metrics"`
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

// Analytics represents an analytics event
type Analytics struct {
	ID         string                 `firestore:"-" json:"id"`
	UserID     string                 `firestore:"user_id" json:"user_id"`
	TenantID   string                 `firestore:"tenant_id" json:"tenant_id"`
	CampaignID string                 `firestore:"campaign_id" json:"campaign_id"`
	CreativeID string                 `firestore:"creative_id" json:"creative_id,omitempty"`
	EventType  string                 `firestore:"event_type" json:"event_type" binding:"required"` // impression, click, conversion, etc.
	Platform   string                 `firestore:"platform" json:"platform"`
	Source     string                 `firestore:"source" json:"source"`
	Metrics    map[string]interface{} `firestore:"metrics" json:"metrics"`
	Properties map[string]interface{} `firestore:"properties" json:"properties"`
	Timestamp  time.Time              `firestore:"timestamp" json:"timestamp"`
	SessionID  string                 `firestore:"session_id" json:"session_id,omitempty"`
	DeviceInfo map[string]interface{} `firestore:"device_info" json:"device_info,omitempty"`
	Location   map[string]interface{} `firestore:"location" json:"location,omitempty"`
}

// Response wrapper
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}
