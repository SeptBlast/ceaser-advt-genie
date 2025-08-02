package services

import (
	"context"
	"fmt"
	"time"

	pb "github.com/startupmanch/ceaser-ad-business/go-api-gateway/proto/ai_engine"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AdGenerationService handles ad creation and management in the operational plane
// Complex AI tasks are delegated to the Python AI service via gRPC
type AdGenerationService struct {
	tenantDB     *mongo.Database
	redisService *RedisService
	aiClient     AIEngineClient // gRPC client to Python AI service
}

// Campaign represents a marketing campaign in tenant database
type Campaign struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID         primitive.ObjectID `bson:"user_id" json:"user_id"`
	Name           string             `bson:"name" json:"name"`
	Description    string             `bson:"description" json:"description"`
	BrandAssets    []BrandAsset       `bson:"brand_assets" json:"brand_assets"`
	TargetAudience TargetAudience     `bson:"target_audience" json:"target_audience"`
	Budget         Budget             `bson:"budget" json:"budget"`
	Status         string             `bson:"status" json:"status"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
	LaunchedAt     *time.Time         `bson:"launched_at,omitempty" json:"launched_at,omitempty"`
}

// Creative represents generated advertising content
type Creative struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	CampaignID   primitive.ObjectID `bson:"campaign_id" json:"campaign_id"`
	Type         string             `bson:"type" json:"type"` // text, image, video
	SourcePrompt string             `bson:"source_prompt" json:"source_prompt"`
	Status       string             `bson:"status" json:"status"` // generating, completed, failed
	CreatedAt    time.Time          `bson:"created_at" json:"created_at"`
	ContentData  ContentData        `bson:"content_data" json:"content_data"`
	Performance  PerformanceMetrics `bson:"performance,omitempty" json:"performance,omitempty"`
}

// BrandAsset represents uploaded brand materials
type BrandAsset struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name     string             `bson:"name" json:"name"`
	Type     string             `bson:"type" json:"type"` // logo, color_palette, font, image
	URL      string             `bson:"url" json:"url"`
	Metadata map[string]string  `bson:"metadata" json:"metadata"`
}

// TargetAudience defines campaign targeting parameters
type TargetAudience struct {
	AgeRange     string   `bson:"age_range" json:"age_range"`
	Gender       string   `bson:"gender" json:"gender"`
	Interests    []string `bson:"interests" json:"interests"`
	Location     string   `bson:"location" json:"location"`
	Platforms    []string `bson:"platforms" json:"platforms"`
	Demographics string   `bson:"demographics" json:"demographics"`
}

// Budget defines campaign spending limits
type Budget struct {
	TotalAmount float64 `bson:"total_amount" json:"total_amount"`
	DailyAmount float64 `bson:"daily_amount" json:"daily_amount"`
	Currency    string  `bson:"currency" json:"currency"`
	SpentAmount float64 `bson:"spent_amount" json:"spent_amount"`
}

// ContentData holds the actual generated content
type ContentData struct {
	// For text creatives
	Text     string `bson:"text,omitempty" json:"text,omitempty"`
	Headline string `bson:"headline,omitempty" json:"headline,omitempty"`

	// For image creatives
	ImageURL    string `bson:"image_url,omitempty" json:"image_url,omitempty"`
	AspectRatio string `bson:"aspect_ratio,omitempty" json:"aspect_ratio,omitempty"`
	ImagePrompt string `bson:"image_prompt,omitempty" json:"image_prompt,omitempty"`

	// For video creatives
	VideoURL        string `bson:"video_url,omitempty" json:"video_url,omitempty"`
	DurationSeconds int    `bson:"duration_seconds,omitempty" json:"duration_seconds,omitempty"`
	VideoPrompt     string `bson:"video_prompt,omitempty" json:"video_prompt,omitempty"`

	// Common fields
	ModelUsed   string            `bson:"model_used" json:"model_used"`
	GeneratedAt time.Time         `bson:"generated_at" json:"generated_at"`
	Metadata    map[string]string `bson:"metadata,omitempty" json:"metadata,omitempty"`
}

// CreativeRequest represents a request to generate new advertising content
type CreativeRequest struct {
	CampaignID      primitive.ObjectID `json:"campaign_id"`
	Type            string             `json:"type"` // text, image, video
	Prompt          string             `json:"prompt"`
	Style           string             `json:"style,omitempty"`
	AspectRatio     string             `json:"aspect_ratio,omitempty"`
	Duration        int                `json:"duration,omitempty"`
	IncludeBranding bool               `json:"include_branding"`
	Variations      int                `json:"variations"` // Number of variations to generate
}

// AIEngineClient interface for gRPC communication with Python AI service
type AIEngineClient interface {
	GenerateTextCreative(ctx context.Context, req *pb.TextGenerationRequest) (*pb.TextGenerationResponse, error)
	GenerateImageCreative(ctx context.Context, req *pb.ImageGenerationRequest) (*pb.ImageGenerationResponse, error)
	GenerateVideoCreative(ctx context.Context, req *pb.VideoGenerationRequest) (*pb.VideoGenerationResponse, error)
	AnalyzeCreativePerformance(ctx context.Context, req *pb.AnalysisRequest) (*pb.AnalysisResponse, error)
}

// NewAdGenerationService creates a new ad generation service
func NewAdGenerationService(tenantDB *mongo.Database, redisService *RedisService, aiClient AIEngineClient) *AdGenerationService {
	return &AdGenerationService{
		tenantDB:     tenantDB,
		redisService: redisService,
		aiClient:     aiClient,
	}
}

// CreateCampaign creates a new advertising campaign
func (ags *AdGenerationService) CreateCampaign(ctx context.Context, campaign *Campaign) error {
	campaign.CreatedAt = time.Now()
	campaign.UpdatedAt = time.Now()
	campaign.Status = "draft"

	collection := ags.tenantDB.Collection("campaigns")
	result, err := collection.InsertOne(ctx, campaign)
	if err != nil {
		return fmt.Errorf("error creating campaign: %w", err)
	}

	campaign.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

// GetCampaign retrieves a campaign by ID
func (ags *AdGenerationService) GetCampaign(ctx context.Context, campaignID primitive.ObjectID) (*Campaign, error) {
	// Try cache first
	cacheKey := fmt.Sprintf("campaign:%s", campaignID.Hex())
	var campaign Campaign
	if err := ags.redisService.Get(ctx, cacheKey, &campaign); err == nil {
		return &campaign, nil
	}

	// Fetch from database
	collection := ags.tenantDB.Collection("campaigns")
	err := collection.FindOne(ctx, bson.M{"_id": campaignID}).Decode(&campaign)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("campaign not found: %s", campaignID.Hex())
		}
		return nil, fmt.Errorf("error finding campaign: %w", err)
	}

	// Cache for 5 minutes
	ags.redisService.Set(ctx, cacheKey, &campaign, 5*time.Minute)
	return &campaign, nil
}

// ListCampaigns returns paginated campaigns for a user
func (ags *AdGenerationService) ListCampaigns(ctx context.Context, userID primitive.ObjectID, limit, offset int64) ([]Campaign, error) {
	collection := ags.tenantDB.Collection("campaigns")

	cursor, err := collection.Find(ctx,
		bson.M{"user_id": userID},
		options.Find().SetLimit(limit).SetSkip(offset).SetSort(bson.D{{Key: "created_at", Value: -1}}),
	)
	if err != nil {
		return nil, fmt.Errorf("error listing campaigns: %w", err)
	}
	defer cursor.Close(ctx)

	var campaigns []Campaign
	if err = cursor.All(ctx, &campaigns); err != nil {
		return nil, fmt.Errorf("error decoding campaigns: %w", err)
	}

	return campaigns, nil
}

// GenerateCreative orchestrates the creative generation process
// This delegates to the Python AI service for actual generation
func (ags *AdGenerationService) GenerateCreative(ctx context.Context, req *CreativeRequest) (*Creative, error) {
	// Validate campaign exists
	campaign, err := ags.GetCampaign(ctx, req.CampaignID)
	if err != nil {
		return nil, err
	}

	// Create creative record with "generating" status
	creative := &Creative{
		CampaignID:   req.CampaignID,
		Type:         req.Type,
		SourcePrompt: req.Prompt,
		Status:       "generating",
		CreatedAt:    time.Now(),
	}

	collection := ags.tenantDB.Collection("creatives")
	result, err := collection.InsertOne(ctx, creative)
	if err != nil {
		return nil, fmt.Errorf("error creating creative record: %w", err)
	}
	creative.ID = result.InsertedID.(primitive.ObjectID)

	// Delegate to Python AI service based on type
	switch req.Type {
	case "text":
		err = ags.generateTextCreative(ctx, creative, req, campaign)
	case "image":
		err = ags.generateImageCreative(ctx, creative, req, campaign)
	case "video":
		err = ags.generateVideoCreative(ctx, creative, req, campaign)
	default:
		err = fmt.Errorf("unsupported creative type: %s", req.Type)
	}

	if err != nil {
		// Update status to failed
		ags.updateCreativeStatus(ctx, creative.ID, "failed")
		return nil, fmt.Errorf("error generating creative: %w", err)
	}

	// Update status to completed and return
	creative.Status = "completed"
	ags.updateCreativeStatus(ctx, creative.ID, "completed")

	return creative, nil
}

// generateTextCreative handles text creative generation via gRPC
func (ags *AdGenerationService) generateTextCreative(ctx context.Context, creative *Creative, req *CreativeRequest, campaign *Campaign) error {
	// Prepare request for Python AI service
	aiReq := &pb.TextGenerationRequest{
		Prompt:          req.Prompt,
		BrandGuidelines: extractBrandGuidelines(campaign.BrandAssets),
		TargetAudience:  mapTargetAudience(campaign.TargetAudience),
		Style:           req.Style,
		MaxLength:       280, // Default for social media
		IncludeBranding: req.IncludeBranding,
		Variations:      int32(req.Variations),
	}

	// Call Python AI service
	response, err := ags.aiClient.GenerateTextCreative(ctx, aiReq)
	if err != nil {
		return fmt.Errorf("AI service error: %w", err)
	}

	// Update creative with generated content
	creative.ContentData = ContentData{
		Text:        response.GeneratedText,
		Headline:    response.Headline,
		ModelUsed:   response.ModelUsed,
		GeneratedAt: time.Now(),
	}

	return ags.updateCreativeContent(ctx, creative.ID, creative.ContentData)
}

// generateImageCreative handles image creative generation via gRPC
func (ags *AdGenerationService) generateImageCreative(ctx context.Context, creative *Creative, req *CreativeRequest, campaign *Campaign) error {
	// Prepare request for Python AI service
	aiReq := &pb.ImageGenerationRequest{
		Prompt:          req.Prompt,
		Style:           req.Style,
		AspectRatio:     req.AspectRatio,
		BrandAssets:     extractBrandAssetURLs(campaign.BrandAssets),
		IncludeBranding: req.IncludeBranding,
		Quality:         "high",
	}

	// Call Python AI service
	response, err := ags.aiClient.GenerateImageCreative(ctx, aiReq)
	if err != nil {
		return fmt.Errorf("AI service error: %w", err)
	}

	// Update creative with generated content
	creative.ContentData = ContentData{
		ImageURL:    response.ImageUrl,
		AspectRatio: response.AspectRatio,
		ImagePrompt: response.EnhancedPrompt,
		ModelUsed:   response.ModelUsed,
		GeneratedAt: time.Now(),
	}

	return ags.updateCreativeContent(ctx, creative.ID, creative.ContentData)
}

// generateVideoCreative handles video creative generation via gRPC
func (ags *AdGenerationService) generateVideoCreative(ctx context.Context, creative *Creative, req *CreativeRequest, campaign *Campaign) error {
	// Prepare request for Python AI service
	aiReq := &pb.VideoGenerationRequest{
		Prompt:          req.Prompt,
		Style:           req.Style,
		DurationSeconds: int32(req.Duration),
		AspectRatio:     req.AspectRatio,
		Quality:         "high",
		IncludeBranding: req.IncludeBranding,
	}

	// Call Python AI service
	response, err := ags.aiClient.GenerateVideoCreative(ctx, aiReq)
	if err != nil {
		return fmt.Errorf("AI service error: %w", err)
	}

	// Update creative with generated content
	creative.ContentData = ContentData{
		VideoURL:        response.VideoUrl,
		DurationSeconds: int(response.DurationSeconds),
		VideoPrompt:     response.EnhancedPrompt,
		ModelUsed:       response.ModelUsed,
		GeneratedAt:     time.Now(),
	}

	return ags.updateCreativeContent(ctx, creative.ID, creative.ContentData)
}

// GetCreative retrieves a creative by ID
func (ags *AdGenerationService) GetCreative(ctx context.Context, creativeID primitive.ObjectID) (*Creative, error) {
	collection := ags.tenantDB.Collection("creatives")

	var creative Creative
	err := collection.FindOne(ctx, bson.M{"_id": creativeID}).Decode(&creative)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("creative not found: %s", creativeID.Hex())
		}
		return nil, fmt.Errorf("error finding creative: %w", err)
	}

	return &creative, nil
}

// ListCreatives returns paginated creatives for a campaign
func (ags *AdGenerationService) ListCreatives(ctx context.Context, campaignID primitive.ObjectID, limit, offset int64) ([]Creative, error) {
	collection := ags.tenantDB.Collection("creatives")

	cursor, err := collection.Find(ctx,
		bson.M{"campaign_id": campaignID},
		options.Find().SetLimit(limit).SetSkip(offset).SetSort(bson.D{{Key: "created_at", Value: -1}}),
	)
	if err != nil {
		return nil, fmt.Errorf("error listing creatives: %w", err)
	}
	defer cursor.Close(ctx)

	var creatives []Creative
	if err = cursor.All(ctx, &creatives); err != nil {
		return nil, fmt.Errorf("error decoding creatives: %w", err)
	}

	return creatives, nil
}

// UpdateCreativePerformance updates performance metrics for a creative
func (ags *AdGenerationService) UpdateCreativePerformance(ctx context.Context, creativeID primitive.ObjectID, metrics PerformanceMetrics) error {
	collection := ags.tenantDB.Collection("creatives")

	metrics.LastUpdated = time.Now()

	update := bson.M{
		"$set": bson.M{
			"performance": metrics,
		},
	}

	_, err := collection.UpdateOne(ctx, bson.M{"_id": creativeID}, update)
	if err != nil {
		return fmt.Errorf("error updating creative performance: %w", err)
	}

	return nil
}

// Helper functions

func (ags *AdGenerationService) updateCreativeStatus(ctx context.Context, creativeID primitive.ObjectID, status string) error {
	collection := ags.tenantDB.Collection("creatives")

	update := bson.M{
		"$set": bson.M{
			"status": status,
		},
	}

	_, err := collection.UpdateOne(ctx, bson.M{"_id": creativeID}, update)
	return err
}

func (ags *AdGenerationService) updateCreativeContent(ctx context.Context, creativeID primitive.ObjectID, content ContentData) error {
	collection := ags.tenantDB.Collection("creatives")

	update := bson.M{
		"$set": bson.M{
			"content_data": content,
		},
	}

	_, err := collection.UpdateOne(ctx, bson.M{"_id": creativeID}, update)
	return err
}

// extractBrandGuidelines converts brand assets to guidelines string
func extractBrandGuidelines(assets []BrandAsset) string {
	guidelines := "Brand Guidelines:\n"
	for _, asset := range assets {
		guidelines += fmt.Sprintf("- %s: %s\n", asset.Type, asset.Name)
		for key, value := range asset.Metadata {
			guidelines += fmt.Sprintf("  %s: %s\n", key, value)
		}
	}
	return guidelines
}

// extractBrandAssetURLs gets URLs from brand assets
func extractBrandAssetURLs(assets []BrandAsset) []string {
	urls := make([]string, 0, len(assets))
	for _, asset := range assets {
		if asset.URL != "" {
			urls = append(urls, asset.URL)
		}
	}
	return urls
}

// mapTargetAudience converts internal target audience to gRPC format
func mapTargetAudience(ta TargetAudience) string {
	return fmt.Sprintf("Target: %s, %s, interests: %v, location: %s",
		ta.AgeRange, ta.Gender, ta.Interests, ta.Location)
}
