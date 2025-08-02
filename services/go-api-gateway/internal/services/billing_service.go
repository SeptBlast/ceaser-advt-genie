package services

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// BillingService handles subscription management, usage tracking, and billing
// Following the polyglot architecture: Go for transactional billing operations,
// Python AI service for usage analytics and billing insights
type BillingService struct {
	tenantDB     *mongo.Database
	redisService *RedisService
}

// Subscription represents a tenant's subscription plan
type Subscription struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID           primitive.ObjectID `bson:"tenant_id" json:"tenant_id"`
	PlanID             string             `bson:"plan_id" json:"plan_id"`
	Status             string             `bson:"status" json:"status"` // active, inactive, cancelled, past_due
	CurrentPeriodStart time.Time          `bson:"current_period_start" json:"current_period_start"`
	CurrentPeriodEnd   time.Time          `bson:"current_period_end" json:"current_period_end"`
	CancelAt           *time.Time         `bson:"cancel_at,omitempty" json:"cancel_at,omitempty"`
	CancelledAt        *time.Time         `bson:"cancelled_at,omitempty" json:"cancelled_at,omitempty"`
	CreatedAt          time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt          time.Time          `bson:"updated_at" json:"updated_at"`

	// Subscription details
	Plan        SubscriptionPlan   `bson:"plan" json:"plan"`
	Usage       UsageMetrics       `bson:"usage" json:"usage"`
	BillingInfo BillingInformation `bson:"billing_info" json:"billing_info"`
}

// SubscriptionPlan defines the features and limits of a subscription tier
type SubscriptionPlan struct {
	ID          string  `bson:"id" json:"id"`
	Name        string  `bson:"name" json:"name"`
	Description string  `bson:"description" json:"description"`
	Price       float64 `bson:"price" json:"price"`
	Currency    string  `bson:"currency" json:"currency"`
	Interval    string  `bson:"interval" json:"interval"` // monthly, yearly

	// Feature limits
	Limits   PlanLimits `bson:"limits" json:"limits"`
	Features []string   `bson:"features" json:"features"`
}

// PlanLimits defines usage limits for each plan tier
type PlanLimits struct {
	Campaigns             int     `bson:"campaigns" json:"campaigns"`
	CreativesPerMonth     int     `bson:"creatives_per_month" json:"creatives_per_month"`
	AIGenerationsPerMonth int     `bson:"ai_generations_per_month" json:"ai_generations_per_month"`
	StorageGB             float64 `bson:"storage_gb" json:"storage_gb"`
	APICallsPerMonth      int     `bson:"api_calls_per_month" json:"api_calls_per_month"`
	Users                 int     `bson:"users" json:"users"`
	AdvancedAnalytics     bool    `bson:"advanced_analytics" json:"advanced_analytics"`
	PrioritySupport       bool    `bson:"priority_support" json:"priority_support"`
	WhiteLabel            bool    `bson:"white_label" json:"white_label"`
}

// UsageMetrics tracks current usage against plan limits
type UsageMetrics struct {
	CurrentPeriodStart time.Time `bson:"current_period_start" json:"current_period_start"`
	CurrentPeriodEnd   time.Time `bson:"current_period_end" json:"current_period_end"`

	// Current usage counters
	CampaignsUsed     int     `bson:"campaigns_used" json:"campaigns_used"`
	CreativesUsed     int     `bson:"creatives_used" json:"creatives_used"`
	AIGenerationsUsed int     `bson:"ai_generations_used" json:"ai_generations_used"`
	StorageUsedGB     float64 `bson:"storage_used_gb" json:"storage_used_gb"`
	APICallsUsed      int     `bson:"api_calls_used" json:"api_calls_used"`
	UsersCount        int     `bson:"users_count" json:"users_count"`

	LastUpdated time.Time `bson:"last_updated" json:"last_updated"`
}

// BillingInformation contains payment and billing details
type BillingInformation struct {
	CustomerID      string `bson:"customer_id" json:"customer_id"` // Stripe customer ID
	PaymentMethodID string `bson:"payment_method_id" json:"payment_method_id"`
	BillingEmail    string `bson:"billing_email" json:"billing_email"`
	TaxID           string `bson:"tax_id,omitempty" json:"tax_id,omitempty"`

	// Billing address
	Address BillingAddress `bson:"address" json:"address"`

	// Invoice settings
	InvoiceSettings InvoiceSettings `bson:"invoice_settings" json:"invoice_settings"`
}

// BillingAddress represents billing address information
type BillingAddress struct {
	Line1      string `bson:"line1" json:"line1"`
	Line2      string `bson:"line2,omitempty" json:"line2,omitempty"`
	City       string `bson:"city" json:"city"`
	State      string `bson:"state" json:"state"`
	PostalCode string `bson:"postal_code" json:"postal_code"`
	Country    string `bson:"country" json:"country"`
}

// InvoiceSettings contains invoice preferences
type InvoiceSettings struct {
	AutoAdvanceEnabled bool   `bson:"auto_advance_enabled" json:"auto_advance_enabled"`
	CollectionMethod   string `bson:"collection_method" json:"collection_method"` // charge_automatically, send_invoice
	DaysUntilDue       int    `bson:"days_until_due" json:"days_until_due"`
}

// Invoice represents a billing invoice
type Invoice struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID       primitive.ObjectID `bson:"tenant_id" json:"tenant_id"`
	SubscriptionID primitive.ObjectID `bson:"subscription_id" json:"subscription_id"`
	InvoiceNumber  string             `bson:"invoice_number" json:"invoice_number"`
	Status         string             `bson:"status" json:"status"` // draft, open, paid, void, uncollectible

	// Amount details
	Subtotal   float64 `bson:"subtotal" json:"subtotal"`
	Tax        float64 `bson:"tax" json:"tax"`
	Total      float64 `bson:"total" json:"total"`
	AmountPaid float64 `bson:"amount_paid" json:"amount_paid"`
	AmountDue  float64 `bson:"amount_due" json:"amount_due"`
	Currency   string  `bson:"currency" json:"currency"`

	// Line items
	LineItems []InvoiceLineItem `bson:"line_items" json:"line_items"`

	// Dates
	PeriodStart time.Time  `bson:"period_start" json:"period_start"`
	PeriodEnd   time.Time  `bson:"period_end" json:"period_end"`
	IssuedAt    time.Time  `bson:"issued_at" json:"issued_at"`
	DueDate     time.Time  `bson:"due_date" json:"due_date"`
	PaidAt      *time.Time `bson:"paid_at,omitempty" json:"paid_at,omitempty"`
	CreatedAt   time.Time  `bson:"created_at" json:"created_at"`
}

// InvoiceLineItem represents a single item on an invoice
type InvoiceLineItem struct {
	Description string  `bson:"description" json:"description"`
	Quantity    int     `bson:"quantity" json:"quantity"`
	UnitPrice   float64 `bson:"unit_price" json:"unit_price"`
	Amount      float64 `bson:"amount" json:"amount"`
	Type        string  `bson:"type" json:"type"` // subscription, overage, one_time
}

// Usage represents detailed usage tracking for billing
type Usage struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID     primitive.ObjectID `bson:"tenant_id" json:"tenant_id"`
	ResourceType string             `bson:"resource_type" json:"resource_type"` // campaign, creative, ai_generation, api_call, storage
	ResourceID   primitive.ObjectID `bson:"resource_id,omitempty" json:"resource_id,omitempty"`
	Quantity     int                `bson:"quantity" json:"quantity"`
	Timestamp    time.Time          `bson:"timestamp" json:"timestamp"`
	BilledAt     *time.Time         `bson:"billed_at,omitempty" json:"billed_at,omitempty"`

	// Additional metadata
	Metadata map[string]string `bson:"metadata,omitempty" json:"metadata,omitempty"`
}

// BillingEvent represents events in the billing lifecycle
type BillingEvent struct {
	ID          primitive.ObjectID     `bson:"_id,omitempty" json:"id"`
	TenantID    primitive.ObjectID     `bson:"tenant_id" json:"tenant_id"`
	Type        string                 `bson:"type" json:"type"` // subscription_created, invoice_paid, payment_failed, etc.
	Data        map[string]interface{} `bson:"data" json:"data"`
	ProcessedAt *time.Time             `bson:"processed_at,omitempty" json:"processed_at,omitempty"`
	CreatedAt   time.Time              `bson:"created_at" json:"created_at"`
}

// NewBillingService creates a new billing service
func NewBillingService(tenantDB *mongo.Database, redisService *RedisService) *BillingService {
	return &BillingService{
		tenantDB:     tenantDB,
		redisService: redisService,
	}
}

// CreateSubscription creates a new subscription for a tenant
func (bs *BillingService) CreateSubscription(ctx context.Context, tenantID primitive.ObjectID, planID string) (*Subscription, error) {
	// Get plan details
	plan, err := bs.GetSubscriptionPlan(ctx, planID)
	if err != nil {
		return nil, fmt.Errorf("error getting plan: %w", err)
	}

	now := time.Now()
	var periodEnd time.Time

	switch plan.Interval {
	case "monthly":
		periodEnd = now.AddDate(0, 1, 0)
	case "yearly":
		periodEnd = now.AddDate(1, 0, 0)
	default:
		return nil, fmt.Errorf("invalid plan interval: %s", plan.Interval)
	}

	subscription := &Subscription{
		TenantID:           tenantID,
		PlanID:             planID,
		Status:             "active",
		CurrentPeriodStart: now,
		CurrentPeriodEnd:   periodEnd,
		CreatedAt:          now,
		UpdatedAt:          now,
		Plan:               *plan,
		Usage: UsageMetrics{
			CurrentPeriodStart: now,
			CurrentPeriodEnd:   periodEnd,
			LastUpdated:        now,
		},
	}

	collection := bs.tenantDB.Collection("subscriptions")
	result, err := collection.InsertOne(ctx, subscription)
	if err != nil {
		return nil, fmt.Errorf("error creating subscription: %w", err)
	}

	subscription.ID = result.InsertedID.(primitive.ObjectID)

	// Record billing event
	bs.recordBillingEvent(ctx, tenantID, "subscription_created", map[string]interface{}{
		"subscription_id": subscription.ID,
		"plan_id":         planID,
	})

	return subscription, nil
}

// GetSubscription retrieves a subscription by tenant ID
func (bs *BillingService) GetSubscription(ctx context.Context, tenantID primitive.ObjectID) (*Subscription, error) {
	collection := bs.tenantDB.Collection("subscriptions")

	var subscription Subscription
	err := collection.FindOne(ctx, bson.M{
		"tenant_id": tenantID,
		"status":    bson.M{"$ne": "cancelled"},
	}).Decode(&subscription)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("no active subscription found for tenant")
		}
		return nil, fmt.Errorf("error finding subscription: %w", err)
	}

	return &subscription, nil
}

// TrackUsage records usage for billing purposes
func (bs *BillingService) TrackUsage(ctx context.Context, tenantID primitive.ObjectID, resourceType string, quantity int, resourceID *primitive.ObjectID) error {
	usage := &Usage{
		TenantID:     tenantID,
		ResourceType: resourceType,
		Quantity:     quantity,
		Timestamp:    time.Now(),
	}

	if resourceID != nil {
		usage.ResourceID = *resourceID
	}

	collection := bs.tenantDB.Collection("usage")
	_, err := collection.InsertOne(ctx, usage)
	if err != nil {
		return fmt.Errorf("error tracking usage: %w", err)
	}

	// Update subscription usage counters
	return bs.updateUsageCounters(ctx, tenantID, resourceType, quantity)
}

// updateUsageCounters updates the current usage metrics for a subscription
func (bs *BillingService) updateUsageCounters(ctx context.Context, tenantID primitive.ObjectID, resourceType string, quantity int) error {
	collection := bs.tenantDB.Collection("subscriptions")

	updateField := fmt.Sprintf("usage.%s_used", getUsageFieldName(resourceType))

	update := bson.M{
		"$inc": bson.M{updateField: quantity},
		"$set": bson.M{"usage.last_updated": time.Now()},
	}

	_, err := collection.UpdateOne(ctx,
		bson.M{"tenant_id": tenantID, "status": "active"},
		update,
	)

	return err
}

// CheckUsageLimits verifies if a tenant can perform an action based on their plan limits
func (bs *BillingService) CheckUsageLimits(ctx context.Context, tenantID primitive.ObjectID, resourceType string, requestedQuantity int) (bool, error) {
	subscription, err := bs.GetSubscription(ctx, tenantID)
	if err != nil {
		return false, err
	}

	switch resourceType {
	case "campaign":
		return subscription.Usage.CampaignsUsed+requestedQuantity <= subscription.Plan.Limits.Campaigns, nil
	case "creative":
		return subscription.Usage.CreativesUsed+requestedQuantity <= subscription.Plan.Limits.CreativesPerMonth, nil
	case "ai_generation":
		return subscription.Usage.AIGenerationsUsed+requestedQuantity <= subscription.Plan.Limits.AIGenerationsPerMonth, nil
	case "api_call":
		return subscription.Usage.APICallsUsed+requestedQuantity <= subscription.Plan.Limits.APICallsPerMonth, nil
	case "user":
		return subscription.Usage.UsersCount+requestedQuantity <= subscription.Plan.Limits.Users, nil
	default:
		return true, nil // Allow unknown resource types
	}
}

// GenerateInvoice creates a new invoice for a subscription period
func (bs *BillingService) GenerateInvoice(ctx context.Context, subscriptionID primitive.ObjectID) (*Invoice, error) {
	subscription, err := bs.getSubscriptionByID(ctx, subscriptionID)
	if err != nil {
		return nil, err
	}

	// Calculate invoice amount
	subtotal := subscription.Plan.Price

	// Add overage charges if applicable
	overages := bs.calculateOverages(subscription)
	for _, overage := range overages {
		subtotal += overage.Amount
	}

	// Calculate tax (simplified - would integrate with tax service)
	tax := subtotal * 0.1 // 10% tax rate
	total := subtotal + tax

	invoice := &Invoice{
		TenantID:       subscription.TenantID,
		SubscriptionID: subscriptionID,
		InvoiceNumber:  bs.generateInvoiceNumber(),
		Status:         "open",
		Subtotal:       subtotal,
		Tax:            tax,
		Total:          total,
		AmountDue:      total,
		Currency:       subscription.Plan.Currency,
		LineItems: append([]InvoiceLineItem{
			{
				Description: fmt.Sprintf("%s Plan - %s", subscription.Plan.Name, subscription.Plan.Interval),
				Quantity:    1,
				UnitPrice:   subscription.Plan.Price,
				Amount:      subscription.Plan.Price,
				Type:        "subscription",
			},
		}, overages...),
		PeriodStart: subscription.CurrentPeriodStart,
		PeriodEnd:   subscription.CurrentPeriodEnd,
		IssuedAt:    time.Now(),
		DueDate:     time.Now().AddDate(0, 0, subscription.BillingInfo.InvoiceSettings.DaysUntilDue),
		CreatedAt:   time.Now(),
	}

	collection := bs.tenantDB.Collection("invoices")
	result, err := collection.InsertOne(ctx, invoice)
	if err != nil {
		return nil, fmt.Errorf("error creating invoice: %w", err)
	}

	invoice.ID = result.InsertedID.(primitive.ObjectID)

	// Record billing event
	bs.recordBillingEvent(ctx, subscription.TenantID, "invoice_created", map[string]interface{}{
		"invoice_id": invoice.ID,
		"amount":     total,
	})

	return invoice, nil
}

// GetSubscriptionPlan retrieves plan details by ID
func (bs *BillingService) GetSubscriptionPlan(ctx context.Context, planID string) (*SubscriptionPlan, error) {
	// In a real implementation, this would come from a plans collection or external service
	plans := map[string]SubscriptionPlan{
		"starter": {
			ID:          "starter",
			Name:        "Starter",
			Description: "Perfect for small businesses getting started with AI advertising",
			Price:       29.99,
			Currency:    "USD",
			Interval:    "monthly",
			Limits: PlanLimits{
				Campaigns:             5,
				CreativesPerMonth:     50,
				AIGenerationsPerMonth: 100,
				StorageGB:             1.0,
				APICallsPerMonth:      1000,
				Users:                 2,
				AdvancedAnalytics:     false,
				PrioritySupport:       false,
				WhiteLabel:            false,
			},
			Features: []string{"Basic Analytics", "Email Support", "5 Campaigns"},
		},
		"professional": {
			ID:          "professional",
			Name:        "Professional",
			Description: "For growing teams that need more advanced features",
			Price:       99.99,
			Currency:    "USD",
			Interval:    "monthly",
			Limits: PlanLimits{
				Campaigns:             25,
				CreativesPerMonth:     500,
				AIGenerationsPerMonth: 1000,
				StorageGB:             10.0,
				APICallsPerMonth:      10000,
				Users:                 10,
				AdvancedAnalytics:     true,
				PrioritySupport:       true,
				WhiteLabel:            false,
			},
			Features: []string{"Advanced Analytics", "Priority Support", "25 Campaigns", "API Access"},
		},
		"enterprise": {
			ID:          "enterprise",
			Name:        "Enterprise",
			Description: "For large organizations with custom needs",
			Price:       299.99,
			Currency:    "USD",
			Interval:    "monthly",
			Limits: PlanLimits{
				Campaigns:             -1, // Unlimited
				CreativesPerMonth:     -1, // Unlimited
				AIGenerationsPerMonth: -1, // Unlimited
				StorageGB:             100.0,
				APICallsPerMonth:      100000,
				Users:                 -1, // Unlimited
				AdvancedAnalytics:     true,
				PrioritySupport:       true,
				WhiteLabel:            true,
			},
			Features: []string{"Everything Included", "White Label", "Dedicated Support", "Custom Integrations"},
		},
	}

	plan, exists := plans[planID]
	if !exists {
		return nil, fmt.Errorf("plan not found: %s", planID)
	}

	return &plan, nil
}

// Helper functions

func (bs *BillingService) getSubscriptionByID(ctx context.Context, subscriptionID primitive.ObjectID) (*Subscription, error) {
	collection := bs.tenantDB.Collection("subscriptions")

	var subscription Subscription
	err := collection.FindOne(ctx, bson.M{"_id": subscriptionID}).Decode(&subscription)
	if err != nil {
		return nil, fmt.Errorf("error finding subscription: %w", err)
	}

	return &subscription, nil
}

func (bs *BillingService) calculateOverages(subscription *Subscription) []InvoiceLineItem {
	var overages []InvoiceLineItem

	// Example overage calculation for creatives
	if subscription.Plan.Limits.CreativesPerMonth > 0 && subscription.Usage.CreativesUsed > subscription.Plan.Limits.CreativesPerMonth {
		overage := subscription.Usage.CreativesUsed - subscription.Plan.Limits.CreativesPerMonth
		overageRate := 0.50 // $0.50 per extra creative
		overages = append(overages, InvoiceLineItem{
			Description: "Additional Creatives",
			Quantity:    overage,
			UnitPrice:   overageRate,
			Amount:      float64(overage) * overageRate,
			Type:        "overage",
		})
	}

	return overages
}

func (bs *BillingService) generateInvoiceNumber() string {
	return fmt.Sprintf("INV-%d", time.Now().Unix())
}

func (bs *BillingService) recordBillingEvent(ctx context.Context, tenantID primitive.ObjectID, eventType string, data map[string]interface{}) {
	event := &BillingEvent{
		TenantID:  tenantID,
		Type:      eventType,
		Data:      data,
		CreatedAt: time.Now(),
	}

	collection := bs.tenantDB.Collection("billing_events")
	collection.InsertOne(ctx, event)
}

func getUsageFieldName(resourceType string) string {
	switch resourceType {
	case "campaign":
		return "campaigns"
	case "creative":
		return "creatives"
	case "ai_generation":
		return "ai_generations"
	case "api_call":
		return "api_calls"
	case "user":
		return "users_count"
	default:
		return resourceType
	}
}

// GetUsageReport generates a usage report for a tenant
func (bs *BillingService) GetUsageReport(ctx context.Context, tenantID primitive.ObjectID, startDate, endDate time.Time) (map[string]int, error) {
	collection := bs.tenantDB.Collection("usage")

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"tenant_id": tenantID,
				"timestamp": bson.M{
					"$gte": startDate,
					"$lte": endDate,
				},
			},
		},
		{
			"$group": bson.M{
				"_id":   "$resource_type",
				"total": bson.M{"$sum": "$quantity"},
			},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("error aggregating usage: %w", err)
	}
	defer cursor.Close(ctx)

	report := make(map[string]int)
	for cursor.Next(ctx) {
		var result struct {
			ID    string `bson:"_id"`
			Total int    `bson:"total"`
		}
		if err := cursor.Decode(&result); err != nil {
			continue
		}
		report[result.ID] = result.Total
	}

	return report, nil
}
