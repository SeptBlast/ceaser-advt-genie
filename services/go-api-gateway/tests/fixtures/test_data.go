package fixtures

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TestUser represents a test user for authentication
type TestUser struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email    string             `bson:"email" json:"email"`
	Name     string             `bson:"name" json:"name"`
	TenantID primitive.ObjectID `bson:"tenant_id" json:"tenant_id"`
}

// TestCampaign represents a test campaign
type TestCampaign struct {
	ID          primitive.ObjectID `json:"id"`
	UserID      primitive.ObjectID `json:"user_id"`
	Name        string             `json:"name"`
	Description string             `json:"description"`
	Status      string             `json:"status"`
	CreatedAt   time.Time          `json:"created_at"`
}

// TestCreative represents a test creative
type TestCreative struct {
	ID         primitive.ObjectID     `json:"id"`
	CampaignID primitive.ObjectID     `json:"campaign_id"`
	Type       string                 `json:"type"`
	Status     string                 `json:"status"`
	Content    map[string]interface{} `json:"content"`
	CreatedAt  time.Time              `json:"created_at"`
}

// SampleUsers returns sample test users
func SampleUsers() []TestUser {
	return []TestUser{
		{
			ID:       primitive.NewObjectID(),
			Email:    "test@example.com",
			Name:     "Test User",
			TenantID: primitive.NewObjectID(),
		},
		{
			ID:       primitive.NewObjectID(),
			Email:    "admin@example.com",
			Name:     "Admin User",
			TenantID: primitive.NewObjectID(),
		},
	}
}

// SampleCampaigns returns sample test campaigns
func SampleCampaigns(userID primitive.ObjectID) []TestCampaign {
	return []TestCampaign{
		{
			ID:          primitive.NewObjectID(),
			UserID:      userID,
			Name:        "Summer Sale Campaign",
			Description: "Promote summer products with special discounts",
			Status:      "active",
			CreatedAt:   time.Now().AddDate(0, 0, -7),
		},
		{
			ID:          primitive.NewObjectID(),
			UserID:      userID,
			Name:        "Brand Awareness Campaign",
			Description: "Increase brand visibility among target audience",
			Status:      "draft",
			CreatedAt:   time.Now().AddDate(0, 0, -3),
		},
	}
}

// SampleCreatives returns sample test creatives
func SampleCreatives(campaignID primitive.ObjectID) []TestCreative {
	return []TestCreative{
		{
			ID:         primitive.NewObjectID(),
			CampaignID: campaignID,
			Type:       "text",
			Status:     "completed",
			Content: map[string]interface{}{
				"text":     "Amazing summer deals await! Shop now and save 50%",
				"headline": "Summer Sale Spectacular",
			},
			CreatedAt: time.Now().AddDate(0, 0, -5),
		},
		{
			ID:         primitive.NewObjectID(),
			CampaignID: campaignID,
			Type:       "video",
			Status:     "generating",
			Content: map[string]interface{}{
				"video_url": "https://example.com/video.mp4",
				"duration":  30,
			},
			CreatedAt: time.Now().AddDate(0, 0, -2),
		},
	}
}

// ValidCampaignRequest returns a valid campaign creation request
func ValidCampaignRequest() map[string]interface{} {
	return map[string]interface{}{
		"name":        "Test Campaign",
		"description": "A test campaign for unit testing",
		"target_audience": map[string]interface{}{
			"age_range":    "25-45",
			"gender":       "all",
			"interests":    []string{"technology", "business"},
			"location":     "United States",
			"platforms":    []string{"facebook", "instagram"},
			"demographics": "urban professionals",
		},
		"budget": map[string]interface{}{
			"total_amount": 5000.0,
			"daily_amount": 200.0,
			"currency":     "USD",
			"spent_amount": 0.0,
		},
		"brand_assets": []map[string]interface{}{
			{
				"name": "Company Logo",
				"type": "logo",
				"url":  "https://example.com/logo.png",
			},
		},
	}
}

// ValidCreativeRequest returns a valid creative generation request
func ValidCreativeRequest() map[string]interface{} {
	return map[string]interface{}{
		"prompt": "Create an engaging advertisement for our tech startup",
		"type":   "text",
		"brand_guidelines": map[string]interface{}{
			"primary_color":   "#FF6B35",
			"secondary_color": "#004E89",
			"brand_voice":     "friendly and innovative",
		},
		"metadata": map[string]interface{}{
			"urgency": "high",
			"style":   "modern",
		},
	}
}

// ValidAnalyticsEvent returns a valid analytics event
func ValidAnalyticsEvent() map[string]interface{} {
	return map[string]interface{}{
		"event_type": "impression",
		"platform":   "facebook",
		"source":     "campaign_123",
		"metrics": map[string]interface{}{
			"impressions": 1000,
			"clicks":      50,
			"ctr":         0.05,
		},
		"properties": map[string]interface{}{
			"ad_format":   "video",
			"placement":   "feed",
			"audience_id": "audience_456",
		},
		"session_id": "session_789",
		"device_info": map[string]interface{}{
			"device_type": "mobile",
			"os":          "iOS",
			"browser":     "Safari",
		},
		"location": map[string]interface{}{
			"country": "US",
			"state":   "CA",
			"city":    "San Francisco",
		},
	}
}

// ValidSubscriptionRequest returns a valid subscription request
func ValidSubscriptionRequest() map[string]interface{} {
	return map[string]interface{}{
		"plan":          "pro",
		"billing_cycle": "monthly",
		"payment_method": map[string]interface{}{
			"type":   "card",
			"token":  "card_token_123",
			"last4":  "4242",
			"brand":  "visa",
			"expiry": "12/25",
		},
	}
}

// ErrorResponses returns common error response structures
func ErrorResponses() map[string]map[string]interface{} {
	return map[string]map[string]interface{}{
		"validation_error": {
			"error":   "Validation failed",
			"details": []string{"Name is required", "Invalid email format"},
		},
		"unauthorized": {
			"error": "Unauthorized access",
			"code":  "UNAUTHORIZED",
		},
		"not_found": {
			"error": "Resource not found",
			"code":  "NOT_FOUND",
		},
		"rate_limit": {
			"error": "Rate limit exceeded",
			"code":  "RATE_LIMIT_EXCEEDED",
		},
		"internal_error": {
			"error": "Internal server error",
			"code":  "INTERNAL_ERROR",
		},
	}
}

// JWTClaims represents JWT token claims for testing
type JWTClaims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	TenantID string `json:"tenant_id"`
	Role     string `json:"role"`
}

// SampleJWTClaims returns sample JWT claims
func SampleJWTClaims() JWTClaims {
	return JWTClaims{
		UserID:   primitive.NewObjectID().Hex(),
		Email:    "test@example.com",
		TenantID: primitive.NewObjectID().Hex(),
		Role:     "user",
	}
}

// DatabaseCollections returns the names of database collections used in tests
func DatabaseCollections() []string {
	return []string{
		"campaigns",
		"creatives",
		"analytics_events",
		"users",
		"tenants",
		"subscriptions",
		"invoices",
	}
}

// MockResponses returns mock responses for various services
func MockResponses() map[string]interface{} {
	return map[string]interface{}{
		"ai_engine_creative": map[string]interface{}{
			"success": true,
			"content": map[string]interface{}{
				"text":       "Amazing product that will transform your business!",
				"type":       "text",
				"model_used": "gpt-4",
			},
		},
		"ai_engine_video": map[string]interface{}{
			"success":   true,
			"video_url": "https://example.com/generated-video.mp4",
			"status":    "completed",
			"provider":  "runway",
		},
		"firebase_auth_token": map[string]interface{}{
			"uid":            "firebase_user_123",
			"email":          "test@example.com",
			"email_verified": true,
			"custom_claims": map[string]interface{}{
				"tenant_id": "tenant_456",
				"role":      "user",
			},
		},
	}
}
