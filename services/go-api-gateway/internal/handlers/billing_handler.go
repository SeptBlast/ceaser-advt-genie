package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/startupmanch/ceaser-ad-business/go-api-gateway/internal/services"
)

// BillingHandler handles billing and subscription endpoints
type BillingHandler struct {
	billingService *services.BillingService
}

// NewBillingHandler creates a new billing handler
func NewBillingHandler(billingService *services.BillingService) *BillingHandler {
	return &BillingHandler{
		billingService: billingService,
	}
}

// GetSubscription retrieves the current subscription details
// GET /api/v1/billing/subscription
func (h *BillingHandler) GetSubscription(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tenant not authenticated"})
		return
	}

	tenantObjectID, err := primitive.ObjectIDFromHex(tenantID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	subscription, err := h.billingService.GetSubscription(c.Request.Context(), tenantObjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve subscription"})
		return
	}

	if subscription == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No active subscription found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"subscription": subscription})
}

// UpdateSubscription creates or updates the subscription plan
// PUT /api/v1/billing/subscription
func (h *BillingHandler) UpdateSubscription(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tenant not authenticated"})
		return
	}

	tenantObjectID, err := primitive.ObjectIDFromHex(tenantID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	var req struct {
		PlanID string `json:"plan_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate plan ID
	validPlans := map[string]bool{
		"free":       true,
		"basic":      true,
		"pro":        true,
		"enterprise": true,
	}

	if !validPlans[req.PlanID] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plan ID"})
		return
	}

	subscription, err := h.billingService.CreateSubscription(c.Request.Context(), tenantObjectID, req.PlanID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create/update subscription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"subscription": subscription,
		"message":      "Subscription updated successfully",
	})
}

// GetUsage retrieves current usage statistics
// GET /api/v1/billing/usage
func (h *BillingHandler) GetUsage(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tenant not authenticated"})
		return
	}

	tenantObjectID, err := primitive.ObjectIDFromHex(tenantID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	// Parse optional time range
	startDate := time.Now().AddDate(0, -1, 0) // Default to last month
	endDate := time.Now()

	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if parsed, err := time.Parse("2006-01-02", startDateStr); err == nil {
			startDate = parsed
		}
	}

	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if parsed, err := time.Parse("2006-01-02", endDateStr); err == nil {
			endDate = parsed
		}
	}

	usage, err := h.billingService.GetUsageReport(c.Request.Context(), tenantObjectID, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve usage"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"usage": usage,
		"time_range": gin.H{
			"start_date": startDate.Format("2006-01-02"),
			"end_date":   endDate.Format("2006-01-02"),
		},
	})
}

// GetInvoices retrieves billing history (simplified implementation)
// GET /api/v1/billing/invoices
func (h *BillingHandler) GetInvoices(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tenant not authenticated"})
		return
	}

	tenantObjectID, err := primitive.ObjectIDFromHex(tenantID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	// Parse pagination parameters
	page := 1
	limit := 20

	if pageStr := c.Query("page"); pageStr != "" {
		if parsed, err := strconv.Atoi(pageStr); err == nil && parsed > 0 {
			page = parsed
		}
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	// For now, return mock data - in production, implement actual invoice retrieval
	subscription, err := h.billingService.GetSubscription(c.Request.Context(), tenantObjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve subscription"})
		return
	}

	mockInvoices := []gin.H{}
	if subscription != nil {
		mockInvoices = append(mockInvoices, gin.H{
			"id":          primitive.NewObjectID().Hex(),
			"amount":      subscription.Plan.Price,
			"currency":    subscription.Plan.Currency,
			"status":      "paid",
			"created_at":  subscription.CurrentPeriodStart,
			"due_date":    subscription.CurrentPeriodEnd,
			"description": fmt.Sprintf("%s plan subscription", subscription.Plan.Name),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"invoices": mockInvoices,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       int64(len(mockInvoices)),
			"total_pages": 1,
		},
	})
}

// GetInvoice retrieves a specific invoice (simplified implementation)
// GET /api/v1/billing/invoices/:id
func (h *BillingHandler) GetInvoice(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tenant not authenticated"})
		return
	}

	tenantObjectID, err := primitive.ObjectIDFromHex(tenantID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	invoiceID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
		return
	}

	// For now, return mock invoice data based on subscription
	subscription, err := h.billingService.GetSubscription(c.Request.Context(), tenantObjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve subscription"})
		return
	}

	if subscription == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
		return
	}

	mockInvoice := gin.H{
		"id":          invoiceID.Hex(),
		"amount":      subscription.Plan.Price,
		"currency":    subscription.Plan.Currency,
		"status":      "paid",
		"created_at":  subscription.CurrentPeriodStart,
		"due_date":    subscription.CurrentPeriodEnd,
		"description": fmt.Sprintf("%s plan subscription", subscription.Plan.Name),
		"tenant_id":   tenantObjectID.Hex(),
	}

	c.JSON(http.StatusOK, gin.H{"invoice": mockInvoice})
}

// ProcessPayment handles payment processing (simplified implementation)
// POST /api/v1/billing/payment
func (h *BillingHandler) ProcessPayment(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tenant not authenticated"})
		return
	}

	tenantObjectID, err := primitive.ObjectIDFromHex(tenantID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	var req struct {
		InvoiceID     string                 `json:"invoice_id" binding:"required"`
		PaymentMethod string                 `json:"payment_method" binding:"required"`
		Amount        float64                `json:"amount" binding:"required"`
		Currency      string                 `json:"currency"`
		Metadata      map[string]interface{} `json:"metadata"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	invoiceID, err := primitive.ObjectIDFromHex(req.InvoiceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
		return
	}

	if req.Currency == "" {
		req.Currency = "USD"
	}

	// Mock payment processing - in production, integrate with payment processor
	mockPayment := gin.H{
		"id":             primitive.NewObjectID().Hex(),
		"tenant_id":      tenantObjectID.Hex(),
		"invoice_id":     invoiceID.Hex(),
		"amount":         req.Amount,
		"currency":       req.Currency,
		"payment_method": req.PaymentMethod,
		"status":         "completed",
		"processed_at":   time.Now(),
		"metadata":       req.Metadata,
	}

	c.JSON(http.StatusOK, gin.H{
		"payment": mockPayment,
		"message": "Payment processed successfully",
	})
}

// GetPlanLimits retrieves the limits for the current subscription plan
// GET /api/v1/billing/plan-limits
func (h *BillingHandler) GetPlanLimits(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tenant not authenticated"})
		return
	}

	tenantObjectID, err := primitive.ObjectIDFromHex(tenantID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	subscription, err := h.billingService.GetSubscription(c.Request.Context(), tenantObjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve subscription"})
		return
	}

	if subscription == nil {
		// Return free plan limits
		c.JSON(http.StatusOK, gin.H{
			"plan": "free",
			"limits": gin.H{
				"campaigns":                5,
				"creatives_per_month":      20,
				"ai_generations_per_month": 100,
				"storage_gb":               1.0,
				"api_calls_per_month":      1000,
				"users":                    1,
				"advanced_analytics":       false,
				"priority_support":         false,
				"white_label":              false,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"plan":   subscription.Plan.ID,
		"limits": subscription.Plan.Limits,
	})
}

// RegisterRoutes registers all billing routes
func (h *BillingHandler) RegisterRoutes(router *gin.RouterGroup) {
	billing := router.Group("/billing")
	{
		billing.GET("/subscription", h.GetSubscription)
		billing.PUT("/subscription", h.UpdateSubscription)
		billing.GET("/usage", h.GetUsage)
		billing.GET("/invoices", h.GetInvoices)
		billing.GET("/invoices/:id", h.GetInvoice)
		billing.POST("/payment", h.ProcessPayment)
		billing.GET("/plan-limits", h.GetPlanLimits)
	}
}
