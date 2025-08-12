package services_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/services"
	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/tests/fixtures"
)

func TestAdGenerationService(t *testing.T) {
	// Setup test database and dependencies
	mockDB := fixtures.NewTestDatabase()
	mockRedis := fixtures.NewMockRedisClient()
	mockAIClient := &fixtures.MockAIEngineClient{}
	helpers := &fixtures.TestHelpers{}

	// Create service instance
	service := &services.AdGenerationService{
		// Initialize with mock dependencies
	}

	t.Run("CreateCampaign", func(t *testing.T) {
		testCases := []struct {
			name        string
			userID      primitive.ObjectID
			request     map[string]interface{}
			mockSetup   func()
			expectError bool
			expected    string
		}{
			{
				name:   "successful campaign creation",
				userID: helpers.GenerateObjectID(),
				request: map[string]interface{}{
					"name":        "Test Campaign",
					"description": "Test campaign description",
					"budget": map[string]interface{}{
						"total_amount": 1000.0,
						"currency":     "USD",
					},
				},
				mockSetup: func() {
					// Setup mock expectations
				},
				expectError: false,
				expected:    "Test Campaign",
			},
			{
				name:   "missing required fields",
				userID: helpers.GenerateObjectID(),
				request: map[string]interface{}{
					"description": "Missing name field",
				},
				mockSetup:   func() {},
				expectError: true,
			},
			{
				name:   "invalid budget amount",
				userID: helpers.GenerateObjectID(),
				request: map[string]interface{}{
					"name": "Test Campaign",
					"budget": map[string]interface{}{
						"total_amount": -100.0,
					},
				},
				mockSetup:   func() {},
				expectError: true,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				tc.mockSetup()

				campaign, err := service.CreateCampaign(context.Background(), tc.userID, tc.request)

				if tc.expectError {
					assert.Error(t, err)
					assert.Nil(t, campaign)
				} else {
					assert.NoError(t, err)
					assert.NotNil(t, campaign)
					assert.Equal(t, tc.expected, campaign.Name)
				}
			})
		}
	})

	t.Run("ListCampaigns", func(t *testing.T) {
		userID := helpers.GenerateObjectID()
		ctx := context.Background()

		// Insert test data
		testCampaigns := []map[string]interface{}{
			fixtures.SampleCampaign(),
			fixtures.SampleCampaign(),
		}
		mockDB.InsertTestData("campaigns", []interface{}{testCampaigns[0], testCampaigns[1]})

		campaigns, err := service.ListCampaigns(ctx, userID, 10, 0)

		assert.NoError(t, err)
		assert.Len(t, campaigns, 2)
	})

	t.Run("GetCampaign", func(t *testing.T) {
		campaignID := helpers.GenerateObjectID()
		userID := helpers.GenerateObjectID()
		ctx := context.Background()

		testCases := []struct {
			name        string
			campaignID  primitive.ObjectID
			mockSetup   func()
			expectError bool
		}{
			{
				name:       "existing campaign",
				campaignID: campaignID,
				mockSetup: func() {
					campaign := fixtures.SampleCampaign()
					campaign["_id"] = campaignID
					campaign["user_id"] = userID
					mockDB.InsertTestData("campaigns", []interface{}{campaign})
				},
				expectError: false,
			},
			{
				name:        "non-existent campaign",
				campaignID:  helpers.GenerateObjectID(),
				mockSetup:   func() {},
				expectError: true,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				tc.mockSetup()

				campaign, err := service.GetCampaign(ctx, tc.campaignID, userID)

				if tc.expectError {
					assert.Error(t, err)
					assert.Nil(t, campaign)
				} else {
					assert.NoError(t, err)
					assert.NotNil(t, campaign)
					assert.Equal(t, tc.campaignID, campaign.ID)
				}
			})
		}
	})

	t.Run("GenerateCreative", func(t *testing.T) {
		campaignID := helpers.GenerateObjectID()
		userID := helpers.GenerateObjectID()
		ctx := context.Background()

		testCases := []struct {
			name         string
			request      map[string]interface{}
			mockSetup    func()
			expectError  bool
			expectedType string
		}{
			{
				name: "successful video creative generation",
				request: map[string]interface{}{
					"type":     "video",
					"prompt":   "Create engaging video ad",
					"duration": 30,
				},
				mockSetup: func() {
					// Mock AI client response
					mockAIClient.On("GenerateCreative", mock.Anything, mock.Anything).Return(
						map[string]interface{}{
							"video_url": "https://example.com/video.mp4",
							"status":    "completed",
						}, nil)
				},
				expectError:  false,
				expectedType: "video",
			},
			{
				name: "AI service failure",
				request: map[string]interface{}{
					"type":   "video",
					"prompt": "Create video ad",
				},
				mockSetup: func() {
					mockAIClient.On("GenerateCreative", mock.Anything, mock.Anything).Return(
						nil, assert.AnError)
				},
				expectError: true,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				tc.mockSetup()

				creative, err := service.GenerateCreative(ctx, campaignID, userID, tc.request)

				if tc.expectError {
					assert.Error(t, err)
					assert.Nil(t, creative)
				} else {
					assert.NoError(t, err)
					assert.NotNil(t, creative)
					assert.Equal(t, tc.expectedType, creative.Type)
				}

				// Reset mock expectations
				mockAIClient.ExpectedCalls = nil
			})
		}
	})

	t.Run("UpdateCampaignStatus", func(t *testing.T) {
		campaignID := helpers.GenerateObjectID()
		userID := helpers.GenerateObjectID()
		ctx := context.Background()

		testCases := []struct {
			name        string
			status      string
			mockSetup   func()
			expectError bool
		}{
			{
				name:   "valid status update",
				status: "paused",
				mockSetup: func() {
					campaign := fixtures.SampleCampaign()
					campaign["_id"] = campaignID
					campaign["user_id"] = userID
					mockDB.InsertTestData("campaigns", []interface{}{campaign})
				},
				expectError: false,
			},
			{
				name:        "invalid status",
				status:      "invalid_status",
				mockSetup:   func() {},
				expectError: true,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				tc.mockSetup()

				err := service.UpdateCampaignStatus(ctx, campaignID, userID, tc.status)

				if tc.expectError {
					assert.Error(t, err)
				} else {
					assert.NoError(t, err)
				}
			})
		}
	})

	t.Run("DeleteCampaign", func(t *testing.T) {
		campaignID := helpers.GenerateObjectID()
		userID := helpers.GenerateObjectID()
		ctx := context.Background()

		testCases := []struct {
			name        string
			mockSetup   func()
			expectError bool
		}{
			{
				name: "successful deletion",
				mockSetup: func() {
					campaign := fixtures.SampleCampaign()
					campaign["_id"] = campaignID
					campaign["user_id"] = userID
					mockDB.InsertTestData("campaigns", []interface{}{campaign})
				},
				expectError: false,
			},
			{
				name:        "campaign not found",
				mockSetup:   func() {},
				expectError: true,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				tc.mockSetup()

				err := service.DeleteCampaign(ctx, campaignID, userID)

				if tc.expectError {
					assert.Error(t, err)
				} else {
					assert.NoError(t, err)
				}
			})
		}
	})

	t.Run("ValidateCampaignRequest", func(t *testing.T) {
		testCases := []struct {
			name        string
			request     map[string]interface{}
			expectError bool
			errorField  string
		}{
			{
				name: "valid request",
				request: map[string]interface{}{
					"name":        "Valid Campaign",
					"description": "Valid description",
					"budget": map[string]interface{}{
						"total_amount": 1000.0,
						"currency":     "USD",
					},
				},
				expectError: false,
			},
			{
				name: "missing name",
				request: map[string]interface{}{
					"description": "Missing name",
				},
				expectError: true,
				errorField:  "name",
			},
			{
				name: "invalid budget",
				request: map[string]interface{}{
					"name": "Test Campaign",
					"budget": map[string]interface{}{
						"total_amount": -100.0,
					},
				},
				expectError: true,
				errorField:  "budget",
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				err := service.ValidateCampaignRequest(tc.request)

				if tc.expectError {
					assert.Error(t, err)
					if tc.errorField != "" {
						assert.Contains(t, err.Error(), tc.errorField)
					}
				} else {
					assert.NoError(t, err)
				}
			})
		}
	})

	t.Run("CalculateCampaignMetrics", func(t *testing.T) {
		campaignID := helpers.GenerateObjectID()
		ctx := context.Background()

		// Setup test analytics data
		events := []map[string]interface{}{
			{
				"campaign_id": campaignID.Hex(),
				"event_type":  "impression",
				"timestamp":   time.Now(),
			},
			{
				"campaign_id": campaignID.Hex(),
				"event_type":  "click",
				"timestamp":   time.Now(),
			},
		}
		mockDB.InsertTestData("analytics_events", []interface{}{events[0], events[1]})

		metrics, err := service.CalculateCampaignMetrics(ctx, campaignID)

		assert.NoError(t, err)
		assert.NotNil(t, metrics)
		assert.Greater(t, metrics.Impressions, int64(0))
	})

	t.Run("GetCampaignPerformance", func(t *testing.T) {
		campaignID := helpers.GenerateObjectID()
		userID := helpers.GenerateObjectID()
		ctx := context.Background()

		startDate := time.Now().AddDate(0, 0, -7)
		endDate := time.Now()

		performance, err := service.GetCampaignPerformance(ctx, campaignID, userID, startDate, endDate)

		assert.NoError(t, err)
		assert.NotNil(t, performance)
	})
}
