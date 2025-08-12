# Go API Gateway Test Suite

This directory contains comprehensive unit and integration tests for the Go API Gateway service.

## Structure

```text
tests/
├── unit/                    # Unit tests for individual components
│   ├── services/           # Service layer tests
│   │   ├── ad_generation_service_test.go
│   │   ├── analytics_service_test.go
│   │   ├── billing_service_test.go
│   │   ├── tenant_service_test.go
│   │   └── redis_service_test.go
│   ├── handlers/          # HTTP handler tests
│   │   ├── ad_generation_handler_test.go
│   │   ├── analytics_handler_test.go
│   │   └── billing_handler_test.go
│   ├── middleware/        # Middleware tests
│   │   └── middleware_test.go
│   └── models/           # Model validation tests
│       └── models_test.go
├── integration/           # Integration tests
│   ├── api_test.go       # Full API integration tests
│   ├── database_test.go  # Database integration tests
│   └── grpc_test.go      # gRPC client tests
├── fixtures/             # Test data and utilities
│   ├── test_data.go     # Sample data structures
│   ├── mock_clients.go  # Mock implementations
│   └── test_helpers.go  # Test utility functions
└── README.md           # This file
```

## Running Tests

### All Tests

```bash
cd services/go-api-gateway
go test ./...
```

### Unit Tests Only

```bash
go test ./tests/unit/...
```

### Integration Tests Only

```bash
go test ./tests/integration/...
```

### With Coverage

```bash
go test -cover ./...
```

### Specific Package

```bash
go test ./tests/unit/services/...
```

### Verbose Output

```bash
go test -v ./...
```

### Run Tests with Race Detection

```bash
go test -race ./...
```

## Test Categories

### Unit Tests

#### Services

- **Ad Generation Service**: Test campaign CRUD, creative generation, AI client integration
- **Analytics Service**: Test event recording, metrics calculation, report generation
- **Billing Service**: Test subscription management, usage tracking, payment processing
- **Tenant Service**: Test multi-tenancy, domain management, provisioning
- **Redis Service**: Test caching, session management, rate limiting

#### Handlers

- **Ad Generation Handler**: Test HTTP endpoints, request validation, response formatting
- **Analytics Handler**: Test event collection, dashboard data, performance metrics
- **Billing Handler**: Test subscription endpoints, payment flows, invoice generation

#### Middleware

- **Authentication**: Test JWT validation, user context setting
- **CORS**: Test cross-origin request handling
- **Tenant**: Test tenant extraction and validation
- **Rate Limiting**: Test request throttling and limits

#### Models

- **Data Validation**: Test struct validation, JSON marshaling/unmarshaling
- **Database Models**: Test BSON tags, field mappings, relationships

### Integration Tests

- **API Integration**: Test complete request/response flows
- **Database Integration**: Test Firestore operations with real connections
- **gRPC Integration**: Test communication with Python AI Engine

## Environment Variables for Testing

Create a `.env.test` file:

```bash
# Test environment settings
GIN_MODE=test
LOG_LEVEL=debug
PORT=8081

# Database settings (use test databases)
FIRESTORE_PROJECT_ID=test-project
FIREBASE_CONFIG_PATH=./firebase/test-config.json

# Redis settings
REDIS_URL=redis://localhost:6379/1

# AI Engine settings
AI_ENGINE_HOST=localhost
AI_ENGINE_PORT=50052

# Authentication
JWT_SECRET=test_secret_key_for_testing_only
```

## Testing Best Practices

### Unit Tests

1. **Isolation**: Use dependency injection and mocking
2. **Fast Execution**: Tests should complete in milliseconds
3. **Table-Driven Tests**: Use Go's table-driven test pattern
4. **Error Cases**: Test both success and failure scenarios
5. **Mocking**: Mock external dependencies (database, AI client, etc.)

### Integration Tests

1. **Test Database**: Use separate test database instances
2. **Cleanup**: Clean up test data after each test
3. **Real Dependencies**: Test with actual database connections
4. **End-to-End**: Test complete workflows

### Mock Strategy

- **Database**: Mock Firestore operations for unit tests
- **gRPC Client**: Mock AI Engine client responses
- **HTTP Clients**: Mock external API calls
- **Redis**: Use Redis mock or test instance

## Test Data Management

### Fixtures

- **Sample Campaigns**: Predefined campaign structures
- **Mock Users**: Test user accounts and authentication
- **Test Creatives**: Sample creative content and metadata
- **Analytics Data**: Mock performance metrics and events

### Test Helpers

- **Database Setup**: Functions to prepare test databases
- **Mock Factories**: Generate test data on demand
- **Assertion Helpers**: Custom assertions for complex structures
- **HTTP Test Utilities**: Helper functions for API testing

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```bash
# Install dependencies
go mod download

# Run linting
golangci-lint run

# Run tests with coverage
go test -race -coverprofile=coverage.out ./...

# Generate coverage report
go tool cover -html=coverage.out -o coverage.html
```

## Coverage Goals

- **Overall Coverage**: >85%
- **Service Layer**: >90%
- **Handler Layer**: >80%
- **Critical Paths**: 100% (authentication, billing)

## Common Test Patterns

### Table-Driven Tests

```go
func TestSomething(t *testing.T) {
    tests := []struct {
        name     string
        input    string
        expected string
        wantErr  bool
    }{
        {"valid input", "test", "TEST", false},
        {"empty input", "", "", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Test implementation
        })
    }
}
```

### HTTP Handler Testing

```go
func TestHandler(t *testing.T) {
    gin.SetMode(gin.TestMode)
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)

    // Set up request
    // Call handler
    // Assert response
}
```

### Mock Database

```go
type MockFirestore struct{}

func (m *MockFirestore) Collection(name string) *firestore.CollectionRef {
    // Return mock collection
}
```
