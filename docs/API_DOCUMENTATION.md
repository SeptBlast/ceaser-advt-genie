# AdGenius API Documentation for Postman Testing

## Overview

This document provides comprehensive API documentation for testing the AdGenius multi-tenant SaaS platform with Postman. The API follows REST principles and supports multi-tenant operations through various tenant identification methods.

## Base Configuration

### Base URL

```
http://localhost:8080/api/v1
```

### Authentication

Currently using placeholder authentication. In production, this will be JWT-based.

**Headers:**

```
Authorization: Bearer placeholder-token
Content-Type: application/json
X-Tenant-ID: your-tenant-id
```

## Multi-Tenancy

The API supports tenant identification through multiple methods:

1. **Header-based** (Recommended for testing):

   ```
   X-Tenant-ID: acme-corp
   ```

2. **Subdomain-based**:

   ```
   Host: acme-corp.localhost:8080
   ```

3. **Query parameter**:
   ```
   ?tenant_id=acme-corp
   ```

## API Endpoints

### 1. Health Check

#### GET /health

Check service health and connectivity status.

**Request:**

```http
GET http://localhost:8080/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-08-02T17:20:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai_engine": "connected"
  }
}
```

---

## 2. Ad Generation & Campaign Management

### Campaigns

#### GET /api/v1/ad-generation/campaigns

List all campaigns with pagination.

**Request:**

```http
GET http://localhost:8080/api/v1/ad-generation/campaigns?page=1&limit=10&status=active
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (active, paused, completed)
- `search` (optional): Search in campaign names and descriptions

**Response:**

```json
{
  "campaigns": [
    {
      "id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "name": "Summer Sale 2025",
      "description": "Promotional campaign for summer products",
      "status": "active",
      "budget": 5000.0,
      "start_date": "2025-08-01T00:00:00Z",
      "end_date": "2025-08-31T23:59:59Z",
      "target_audience": {
        "age_range": "25-45",
        "interests": ["fashion", "lifestyle"],
        "demographics": "urban professionals"
      },
      "created_at": "2025-08-01T10:00:00Z",
      "updated_at": "2025-08-02T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

#### POST /api/v1/ad-generation/campaigns

Create a new campaign.

**Request:**

```http
POST http://localhost:8080/api/v1/ad-generation/campaigns
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
  Content-Type: application/json

Body:
{
  "name": "Black Friday Campaign",
  "description": "Special deals for Black Friday weekend",
  "budget": 10000.00,
  "start_date": "2025-11-24T00:00:00Z",
  "end_date": "2025-11-30T23:59:59Z",
  "target_audience": {
    "age_range": "18-65",
    "interests": ["shopping", "deals", "electronics"],
    "demographics": "deal-seekers"
  }
}
```

**Response:**

```json
{
  "campaign": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "name": "Black Friday Campaign",
    "description": "Special deals for Black Friday weekend",
    "status": "draft",
    "budget": 10000.0,
    "start_date": "2025-11-24T00:00:00Z",
    "end_date": "2025-11-30T23:59:59Z",
    "target_audience": {
      "age_range": "18-65",
      "interests": ["shopping", "deals", "electronics"],
      "demographics": "deal-seekers"
    },
    "created_at": "2025-08-02T17:20:00Z",
    "updated_at": "2025-08-02T17:20:00Z"
  },
  "message": "Campaign created successfully"
}
```

#### GET /api/v1/ad-generation/campaigns/:id

Get a specific campaign by ID.

**Request:**

```http
GET http://localhost:8080/api/v1/ad-generation/campaigns/64f5a1b2c3d4e5f6a7b8c9d0
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

#### PUT /api/v1/ad-generation/campaigns/:id

Update an existing campaign.

**Request:**

```http
PUT http://localhost:8080/api/v1/ad-generation/campaigns/64f5a1b2c3d4e5f6a7b8c9d0
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
  Content-Type: application/json

Body:
{
  "name": "Summer Sale 2025 - Extended",
  "budget": 7500.00,
  "status": "active"
}
```

#### DELETE /api/v1/ad-generation/campaigns/:id

Delete a campaign.

**Request:**

```http
DELETE http://localhost:8080/api/v1/ad-generation/campaigns/64f5a1b2c3d4e5f6a7b8c9d0
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

### Creatives

#### GET /api/v1/ad-generation/creatives

List all creatives with pagination.

**Request:**

```http
GET http://localhost:8080/api/v1/ad-generation/creatives?page=1&limit=10&campaign_id=64f5a1b2c3d4e5f6a7b8c9d0
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `campaign_id` (optional): Filter by campaign
- `type` (optional): Filter by type (text, image, video)
- `status` (optional): Filter by status

#### POST /api/v1/ad-generation/creatives

Create a new creative with AI generation.

**Request:**

```http
POST http://localhost:8080/api/v1/ad-generation/creatives
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
  Content-Type: application/json

Body:
{
  "campaign_id": "64f5a1b2c3d4e5f6a7b8c9d0",
  "name": "Summer Sale Hero Banner",
  "type": "text",
  "prompt": "Create an engaging ad copy for summer fashion sale targeting young professionals",
  "ai_settings": {
    "max_tokens": 150,
    "temperature": 0.7,
    "style": "persuasive"
  }
}
```

**Response:**

```json
{
  "creative": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d2",
    "campaign_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "Summer Sale Hero Banner",
    "type": "text",
    "status": "generated",
    "content": {
      "text": "Transform your summer style with our exclusive collection! Get up to 50% off premium fashion pieces perfect for the modern professional. Limited time offer - shop now and elevate your wardrobe this season!",
      "metadata": {
        "word_count": 32,
        "sentiment": "positive",
        "readability_score": 8.5
      }
    },
    "ai_settings": {
      "max_tokens": 150,
      "temperature": 0.7,
      "style": "persuasive"
    },
    "performance": {
      "predicted_ctr": 2.3,
      "predicted_engagement": 4.2
    },
    "created_at": "2025-08-02T17:25:00Z"
  },
  "message": "Creative generated successfully"
}
```

---

## 3. Analytics & Performance

### Campaign Analytics

#### GET /api/v1/analytics/campaigns/:id

Get detailed analytics for a specific campaign.

**Request:**

```http
GET http://localhost:8080/api/v1/analytics/campaigns/64f5a1b2c3d4e5f6a7b8c9d0?start_date=2025-08-01&end_date=2025-08-02&period=daily
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

**Query Parameters:**

- `start_date` (optional): Start date (YYYY-MM-DD, default: 30 days ago)
- `end_date` (optional): End date (YYYY-MM-DD, default: today)
- `period` (optional): Aggregation period (daily, weekly, monthly)

**Response:**

```json
{
  "analytics": {
    "campaign_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "metrics": {
      "impressions": 125000,
      "clicks": 3250,
      "conversions": 87,
      "spend": 1250.5,
      "ctr": 2.6,
      "conversion_rate": 2.68,
      "cost_per_click": 0.38,
      "cost_per_conversion": 14.37
    },
    "time_series": [
      {
        "date": "2025-08-01",
        "impressions": 62500,
        "clicks": 1625,
        "conversions": 43,
        "spend": 625.25
      },
      {
        "date": "2025-08-02",
        "impressions": 62500,
        "clicks": 1625,
        "conversions": 44,
        "spend": 625.25
      }
    ],
    "top_creatives": [
      {
        "id": "64f5a1b2c3d4e5f6a7b8c9d2",
        "name": "Summer Sale Hero Banner",
        "ctr": 3.2,
        "conversions": 25
      }
    ]
  }
}
```

#### POST /api/v1/analytics/campaigns/batch

Get analytics for multiple campaigns.

**Request:**

```http
POST http://localhost:8080/api/v1/analytics/campaigns/batch
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
  Content-Type: application/json

Body:
{
  "campaign_ids": [
    "64f5a1b2c3d4e5f6a7b8c9d0",
    "64f5a1b2c3d4e5f6a7b8c9d1"
  ],
  "start_date": "2025-08-01",
  "end_date": "2025-08-02",
  "period": "daily",
  "metrics": ["impressions", "clicks", "conversions", "spend"],
  "group_by": ["campaign", "date"]
}
```

### Top Performing Creatives

#### GET /api/v1/analytics/top-creatives

Get the best performing creatives.

**Request:**

```http
GET http://localhost:8080/api/v1/analytics/top-creatives?limit=5
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

**Response:**

```json
{
  "top_creatives": [
    {
      "id": "64f5a1b2c3d4e5f6a7b8c9d2",
      "name": "Summer Sale Hero Banner",
      "campaign_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "type": "text",
      "impressions": 45000,
      "clicks": 1440,
      "conversions": 38,
      "ctr": 3.2,
      "conversion_rate": 2.64,
      "spend": 547.2
    }
  ],
  "count": 5
}
```

### Performance Summary

#### GET /api/v1/analytics/summary

Get overall performance dashboard.

**Request:**

```http
GET http://localhost:8080/api/v1/analytics/summary
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

**Response:**

```json
{
  "overview": {
    "total_impressions": 275000,
    "total_clicks": 7150,
    "total_conversions": 192,
    "total_spend": 2735.75,
    "average_ctr": 2.6,
    "average_conversion_rate": 2.68
  },
  "top_creatives": [
    {
      "id": "64f5a1b2c3d4e5f6a7b8c9d2",
      "name": "Summer Sale Hero Banner",
      "ctr": 3.2,
      "conversions": 38
    }
  ],
  "generated_at": "2025-08-02T17:30:00Z"
}
```

---

## 4. Billing & Subscriptions

### Subscription Management

#### GET /api/v1/billing/subscription

Get current subscription details.

**Request:**

```http
GET http://localhost:8080/api/v1/billing/subscription
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

**Response:**

```json
{
  "subscription": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d3",
    "tenant_id": "64f5a1b2c3d4e5f6a7b8c9d4",
    "plan_id": "pro",
    "status": "active",
    "current_period_start": "2025-08-01T00:00:00Z",
    "current_period_end": "2025-09-01T00:00:00Z",
    "plan": {
      "id": "pro",
      "name": "Professional",
      "description": "Advanced features for growing businesses",
      "price": 99.0,
      "currency": "USD",
      "interval": "monthly",
      "limits": {
        "campaigns": 50,
        "creatives_per_month": 500,
        "ai_generations_per_month": 2000,
        "storage_gb": 10.0,
        "api_calls_per_month": 50000,
        "users": 10,
        "advanced_analytics": true,
        "priority_support": true,
        "white_label": false
      }
    },
    "usage": {
      "campaigns_used": 12,
      "creatives_used": 87,
      "ai_generations_used": 234,
      "storage_used_gb": 3.2,
      "api_calls_used": 12500,
      "users_count": 3
    }
  }
}
```

#### PUT /api/v1/billing/subscription

Update subscription plan.

**Request:**

```http
PUT http://localhost:8080/api/v1/billing/subscription
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
  Content-Type: application/json

Body:
{
  "plan_id": "enterprise"
}
```

### Usage Statistics

#### GET /api/v1/billing/usage

Get usage statistics for billing period.

**Request:**

```http
GET http://localhost:8080/api/v1/billing/usage?start_date=2025-08-01&end_date=2025-08-02
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

**Response:**

```json
{
  "usage": {
    "campaigns": 12,
    "creatives": 87,
    "ai_generations": 234,
    "storage_gb": 3.2,
    "api_calls": 12500,
    "users": 3
  },
  "time_range": {
    "start_date": "2025-08-01",
    "end_date": "2025-08-02"
  }
}
```

### Invoice Management

#### GET /api/v1/billing/invoices

Get invoice history.

**Request:**

```http
GET http://localhost:8080/api/v1/billing/invoices?page=1&limit=10
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

**Response:**

```json
{
  "invoices": [
    {
      "id": "64f5a1b2c3d4e5f6a7b8c9d5",
      "amount": 99.0,
      "currency": "USD",
      "status": "paid",
      "created_at": "2025-08-01T00:00:00Z",
      "due_date": "2025-09-01T00:00:00Z",
      "description": "Professional plan subscription"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

#### GET /api/v1/billing/invoices/:id

Get specific invoice details.

**Request:**

```http
GET http://localhost:8080/api/v1/billing/invoices/64f5a1b2c3d4e5f6a7b8c9d5
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

### Payment Processing

#### POST /api/v1/billing/payment

Process a payment.

**Request:**

```http
POST http://localhost:8080/api/v1/billing/payment
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
  Content-Type: application/json

Body:
{
  "invoice_id": "64f5a1b2c3d4e5f6a7b8c9d5",
  "payment_method": "credit_card",
  "amount": 99.00,
  "currency": "USD",
  "metadata": {
    "card_last_four": "4242",
    "payment_processor": "stripe"
  }
}
```

### Plan Limits

#### GET /api/v1/billing/plan-limits

Get current plan limits and usage.

**Request:**

```http
GET http://localhost:8080/api/v1/billing/plan-limits
Headers:
  Authorization: Bearer placeholder-token
  X-Tenant-ID: acme-corp
```

**Response:**

```json
{
  "plan": "pro",
  "limits": {
    "campaigns": 50,
    "creatives_per_month": 500,
    "ai_generations_per_month": 2000,
    "storage_gb": 10.0,
    "api_calls_per_month": 50000,
    "users": 10,
    "advanced_analytics": true,
    "priority_support": true,
    "white_label": false
  }
}
```

---

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request

```json
{
  "error": "Invalid request parameters",
  "code": "INVALID_PARAMETERS",
  "details": {
    "field": "campaign_id",
    "message": "Invalid ObjectID format"
  }
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found",
  "code": "NOT_FOUND"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## Testing with Postman

### Environment Setup

Create a Postman environment with these variables:

```json
{
  "baseUrl": "http://localhost:8080/api/v1",
  "authToken": "placeholder-token",
  "tenantId": "acme-corp",
  "campaignId": "64f5a1b2c3d4e5f6a7b8c9d0",
  "creativeId": "64f5a1b2c3d4e5f6a7b8c9d2"
}
```

### Pre-request Scripts

Add this to collection pre-request script for automatic tenant header:

```javascript
pm.request.headers.add({
  key: "X-Tenant-ID",
  value: pm.environment.get("tenantId"),
});

pm.request.headers.add({
  key: "Authorization",
  value: "Bearer " + pm.environment.get("authToken"),
});
```

### Test Scripts

Example test script for campaign creation:

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has campaign", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("campaign");
  pm.expect(jsonData.campaign).to.have.property("id");

  // Store campaign ID for future requests
  pm.environment.set("campaignId", jsonData.campaign.id);
});

pm.test("Campaign has required fields", function () {
  const jsonData = pm.response.json();
  const campaign = jsonData.campaign;

  pm.expect(campaign).to.have.property("name");
  pm.expect(campaign).to.have.property("status");
  pm.expect(campaign).to.have.property("budget");
  pm.expect(campaign.budget).to.be.a("number");
});
```

---

## Sample Test Flow

1. **Health Check** - Verify service is running
2. **Create Campaign** - Create a new advertising campaign
3. **Get Campaign** - Retrieve the created campaign
4. **Create Creative** - Generate AI-powered creative content
5. **Get Analytics** - View campaign performance metrics
6. **Get Subscription** - Check current billing plan
7. **Get Usage** - Review current usage statistics

This flow will test the core functionality of the AdGenius platform and validate the multi-tenant SaaS features.
