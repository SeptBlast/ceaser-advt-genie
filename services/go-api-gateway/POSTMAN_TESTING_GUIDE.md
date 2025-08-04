# AdGenius API Testing with Postman - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Import Collection & Environment

1. **Open Postman**
2. **Import Collection:**
   - Click "Import" → "Upload Files"
   - Select `AdGenius_API_Collection.postman_collection.json`
3. **Import Environment:**
   - Click "Import" → "Upload Files"
   - Select `AdGenius_Local_Environment.postman_environment.json`
4. **Select Environment:**
   - Click the environment dropdown (top right)
   - Select "AdGenius Local Development"

### Step 2: Start the Services

```bash
# Terminal 1: Start Go API Gateway
cd services/go-api-gateway
cp .env.example .env
# Update FIREBASE_SERVICE_ACCOUNT_PATH=../../firebase/service-account.json in .env
go run cmd/main.go

# Terminal 2: Start Python AI Engine (if available)
cd services/python-ai-engine
python -m grpc_server

# Terminal 3: Frontend (if testing full stack)
cd frontend
npm run dev
```

### Step 3: Test Basic Connectivity

1. **Run Health Check:**
   - Go to "Health Check" → "Check Service Health"
   - Click "Send"
   - Should return `200 OK` with service status

## 🧪 Test Scenarios

### Scenario 1: Basic Campaign Management

**Order of execution:**

1. `Health Check` → `Check Service Health`
2. `Campaign Management` → `Create Campaign`
3. `Campaign Management` → `Get Campaign by ID`
4. `Campaign Management` → `List Campaigns`
5. `Campaign Management` → `Update Campaign`

**Expected Results:**

- All requests return `200/201` status codes
- Campaign ID is automatically captured and used in subsequent requests
- Campaign data is consistent across operations

### Scenario 2: AI-Powered Creative Generation

**Order of execution:**

1. Create a campaign (from Scenario 1)
2. `Creative Management` → `Create Creative with AI`
3. `Creative Management` → `Get Creative by ID`
4. `Creative Management` → `List Creatives`

**Expected Results:**

- Creative is generated with AI-powered content
- Creative status shows as "generated"
- Content includes text, metadata, and performance predictions

### Scenario 3: Analytics & Performance

**Order of execution:**

1. Create campaign and creatives (from previous scenarios)
2. `Analytics` → `Get Campaign Analytics`
3. `Analytics` → `Get Multi-Campaign Analytics`
4. `Analytics` → `Get Top Performing Creatives`
5. `Analytics` → `Get Performance Summary`

**Expected Results:**

- Analytics data includes metrics like impressions, clicks, CTR
- Time-series data is properly formatted
- Performance summaries aggregate correctly

### Scenario 4: Billing & Subscriptions

**Order of execution:**

1. `Billing & Subscriptions` → `Get Current Subscription`
2. `Billing & Subscriptions` → `Update Subscription Plan`
3. `Billing & Subscriptions` → `Get Usage Statistics`
4. `Billing & Subscriptions` → `Get Plan Limits`
5. `Billing & Subscriptions` → `Get Invoice History`

**Expected Results:**

- Subscription data shows plan details and limits
- Usage statistics track resource consumption
- Plan limits define tenant boundaries

### Scenario 5: End-to-End Workflow

**Use the "End-to-End Test Flow" folder:**

- Runs a complete workflow from health check to cleanup
- Tests all major API endpoints in sequence
- Automatically manages test data lifecycle

## 🔧 Configuration

### Environment Variables

The Postman environment includes these key variables:

| Variable     | Default Value           | Description             |
| ------------ | ----------------------- | ----------------------- |
| `baseUrl`    | `http://localhost:8080` | API base URL            |
| `authToken`  | `placeholder-token`     | Authentication token    |
| `tenantId`   | `acme-corp`             | Multi-tenant identifier |
| `campaignId` | Auto-captured           | Created campaign ID     |
| `creativeId` | Auto-captured           | Created creative ID     |

### Multi-Tenant Testing

To test multi-tenancy, change the `tenantId` variable:

```javascript
// In Postman environment
tenantId: "tenant-a"; // Test with tenant A
tenantId: "tenant-b"; // Test with tenant B
```

Each tenant should have isolated data and cannot access other tenants' resources.

### Authentication Testing

Currently using placeholder authentication. For production testing:

1. Update `authToken` with valid JWT
2. Test with expired tokens (should return 401)
3. Test with missing tokens (should return 401)

## 📊 Expected API Behavior

### Success Responses

**Campaign Creation (201 Created):**

```json
{
  "campaign": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "Test Campaign",
    "status": "draft",
    "budget": 5000.0,
    "created_at": "2025-08-02T17:30:00Z"
  },
  "message": "Campaign created successfully"
}
```

**Analytics Response (200 OK):**

```json
{
  "analytics": {
    "campaign_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "metrics": {
      "impressions": 125000,
      "clicks": 3250,
      "ctr": 2.6,
      "spend": 1250.5
    }
  }
}
```

### Error Responses

**Bad Request (400):**

```json
{
  "error": "Invalid request parameters",
  "code": "INVALID_PARAMETERS"
}
```

**Unauthorized (401):**

```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**Not Found (404):**

```json
{
  "error": "Resource not found",
  "code": "NOT_FOUND"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Health Check Fails:**

   - Check if Go API Gateway is running on port 8080
   - Verify MongoDB and Redis connections
   - Check logs for specific error messages

2. **Authentication Errors:**

   - Verify `authToken` in environment
   - Check `X-Tenant-ID` header is being sent
   - Ensure bearer token format is correct

3. **MongoDB Errors:**

   - Check MongoDB connection string in `.env`
   - Verify database permissions
   - Ensure tenant database exists

4. **gRPC AI Engine Errors:**
   - Check if Python AI Engine is running on port 50051
   - Verify gRPC service connectivity
   - Check AI Engine logs for errors

### Debug Mode

Enable debug logging by setting in `.env`:

```
GIN_MODE=debug
LOG_LEVEL=debug
```

### Collection Runner

Use Postman's Collection Runner for automated testing:

1. Click "Runner" in Postman
2. Select "AdGenius Multi-Tenant SaaS API" collection
3. Select "AdGenius Local Development" environment
4. Choose test scenario folder or run entire collection
5. Click "Run AdGenius Multi-Tenant SaaS API"

## 📈 Performance Testing

### Load Testing with Postman

1. Use Collection Runner with multiple iterations
2. Set delay between requests (e.g., 100ms)
3. Monitor response times and error rates
4. Test concurrent tenant operations

### Metrics to Monitor

- **Response Time:** < 1000ms for most endpoints
- **Throughput:** Requests per second
- **Error Rate:** < 1% under normal load
- **Memory Usage:** Monitor Go service memory
- **Database Connections:** MongoDB connection pool usage

## 🔐 Security Testing

### Test Cases

1. **Authorization:**

   - Test without `Authorization` header
   - Test with invalid tokens
   - Test with expired tokens

2. **Multi-Tenancy:**

   - Try to access other tenant's resources
   - Test tenant isolation in database
   - Verify tenant context in all endpoints

3. **Input Validation:**

   - Send malformed JSON
   - Test SQL injection attempts (should fail)
   - Test XSS payloads in text fields

4. **Rate Limiting:**
   - Send rapid requests to test rate limits
   - Verify proper error responses

## 📝 Test Documentation

### Test Scripts

Each request includes validation tests:

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("campaign");
  pm.expect(jsonData.campaign).to.have.property("id");
});
```

### Automated Variable Capture

Test scripts automatically capture IDs:

```javascript
// Store campaign ID for future requests
if (pm.response.code === 201) {
  const jsonData = pm.response.json();
  pm.environment.set("campaignId", jsonData.campaign.id);
}
```

This enables seamless testing workflows where subsequent requests use the created resource IDs.

---

## 🎯 Next Steps

1. **Test Core Functionality:** Run basic CRUD operations for campaigns and creatives
2. **Validate Multi-Tenancy:** Test with multiple tenant IDs
3. **Test AI Integration:** Verify creative generation works with Python AI Engine
4. **Load Testing:** Use Collection Runner for performance testing
5. **Security Testing:** Validate authentication and authorization
6. **Integration Testing:** Test end-to-end workflows

The Postman collection provides comprehensive testing coverage for all AdGenius API endpoints with automatic variable management and detailed test validation.
