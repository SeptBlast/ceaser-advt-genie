# Comprehensive Test Suite Documentation

This repository contains complete unit and integration test suites for both the Python AI Engine and Go API Gateway services, following best practices for microservices testing.

## Test Structure Overview

### Python AI Engine Tests (`services/python-ai-engine/tests/`)

```
tests/
├── conftest.py                     # Pytest configuration and shared fixtures
├── fixtures/
│   ├── __init__.py
│   ├── mock_data.py               # Sample data and mock responses
│   └── test_utils.py              # Testing utilities and helpers
├── unit/
│   ├── test_creative_service.py   # Creative generation service tests
│   ├── test_video_generation.py   # Video generation service tests
│   ├── test_firebase_storage.py   # Firebase storage service tests
│   ├── test_prompt_service.py     # Prompt enhancement service tests
│   └── test_agent_service.py      # AI agent workflow tests
├── integration/
│   ├── test_grpc_server.py        # gRPC server integration tests
│   └── test_grpc_integration.py   # Complete gRPC API tests
└── README.md                      # Test documentation
```

### Go API Gateway Tests (`services/go-api-gateway/tests/`)

```
tests/
├── fixtures/
│   ├── mock_clients.go            # Mock gRPC and database clients
│   ├── test_data.go               # Sample test data structures
│   └── test_helpers.go            # Testing utility functions
├── unit/
│   ├── handlers/
│   │   ├── ad_generation_handler_test.go
│   │   ├── analytics_handler_test.go
│   │   └── billing_handler_test.go
│   ├── services/
│   │   ├── ad_generation_service_test.go
│   │   ├── analytics_service_test.go
│   │   └── billing_service_test.go
│   └── middleware/
│       ├── auth_middleware_test.go
│       └── rate_limit_middleware_test.go
├── integration/
│   ├── api_integration_test.go
│   └── grpc_client_test.go
└── README.md                      # Test documentation
```

## Test Coverage Areas

### Python AI Engine Coverage

#### 1. Creative Service Tests (`test_creative_service.py`)

- **Text Generation**: OpenAI GPT-4 integration, prompt processing, response formatting
- **Image Generation**: DALL-E integration, image URL handling, error scenarios
- **Brand Guidelines**: Brand asset integration, color scheme validation
- **Target Audience**: Audience-specific content adaptation
- **Error Handling**: API rate limits, invalid prompts, service timeouts
- **Performance**: Response time benchmarks, token usage tracking

#### 2. Video Generation Tests (`test_video_generation.py`)

- **Multi-Provider Support**: Runway, Pika, Stability AI integrations
- **Video Parameters**: Duration, aspect ratio, quality settings
- **Status Tracking**: Generation progress monitoring, completion callbacks
- **Storage Integration**: Firebase upload, URL generation
- **Fallback Logic**: Provider switching on failures
- **Performance**: Generation time tracking, queue management

#### 3. Firebase Storage Tests (`test_firebase_storage.py`)

- **File Operations**: Upload, download, deletion, URL generation
- **Security**: Signed URL generation, access control
- **Metadata**: File information, content type detection
- **Error Handling**: Network failures, permission errors
- **Performance**: Upload/download speed benchmarks

#### 4. Prompt Enhancement Tests (`test_prompt_service.py`)

- **Prompt Analysis**: Quality scoring, improvement identification
- **Enhancement Logic**: Creative type optimization, brand context integration
- **Validation**: Enhanced prompt verification, quality thresholds
- **Performance**: Enhancement speed, quality improvement metrics

#### 5. Agent Service Tests (`test_agent_service.py`)

- **Workflow Execution**: Campaign optimization, audience analysis
- **Multi-Step Processes**: Data analysis, recommendation generation
- **Tool Integration**: External API usage, data processing
- **Error Recovery**: Workflow failure handling, partial completion
- **Performance**: Execution time tracking, resource usage

#### 6. gRPC Integration Tests (`test_grpc_server.py`, `test_grpc_integration.py`)

- **API Endpoints**: All gRPC service methods, request/response validation
- **Concurrent Requests**: Load testing, race condition handling
- **Streaming**: Real-time response streaming, connection management
- **Error Handling**: gRPC status codes, error message formatting
- **Authentication**: Request validation, tenant isolation
- **Performance**: Response times, throughput benchmarks

### Go API Gateway Coverage

#### 1. Service Layer Tests

- **Ad Generation Service**: Campaign creation, creative management, AI integration
- **Analytics Service**: Performance tracking, metrics aggregation, reporting
- **Billing Service**: Subscription management, usage tracking, payment processing
- **Tenant Service**: Multi-tenancy, data isolation, resource management

#### 2. Handler Tests

- **HTTP Endpoints**: REST API validation, request/response handling
- **Authentication**: JWT validation, permission checking
- **Input Validation**: Request data validation, error responses
- **Response Formatting**: JSON serialization, error handling

#### 3. Middleware Tests

- **Authentication**: Firebase Auth integration, token validation
- **Rate Limiting**: Request throttling, quota management
- **Logging**: Request tracking, audit trails
- **CORS**: Cross-origin request handling

#### 4. Integration Tests

- **Database Operations**: MongoDB/Firestore integration, transaction handling
- **Cache Operations**: Redis integration, cache invalidation
- **gRPC Client**: Python AI Engine communication, connection management
- **External APIs**: Third-party service integrations

## Test Data and Fixtures

### Python Test Fixtures

#### Mock Data (`mock_data.py`)

- **Creative Requests**: Sample text, image, and video generation requests
- **Video Prompts**: Various video generation scenarios with different parameters
- **Provider Responses**: Mock responses from AI/video generation services
- **Analytics Data**: Sample campaign performance and metrics
- **Workflow Configs**: Different workflow execution scenarios
- **Error Scenarios**: Common error conditions and edge cases

#### Test Utilities (`test_utils.py`)

- **Mock Clients**: OpenAI, Gemini, video provider clients
- **Storage Mocks**: Firebase storage operations
- **Performance Timers**: Execution time measurement
- **Validation Helpers**: Response structure validation
- **Async Utilities**: Async testing support, context managers

### Go Test Fixtures

#### Mock Clients (`mock_clients.go`)

- **AI Engine Client**: gRPC client mocks for Python service communication
- **Redis Service**: Cache operation mocks
- **MongoDB/Firestore**: Database operation mocks
- **HTTP Clients**: External API mocks

#### Test Data (`test_data.go`)

- **User Data**: Sample test users and authentication
- **Campaign Data**: Test campaigns with various configurations
- **Creative Data**: Sample generated content
- **Analytics Data**: Performance metrics and events
- **Billing Data**: Subscription and usage information

## Running Tests

### Python Tests

```bash
# Install test dependencies
cd services/python-ai-engine
pip install -r requirements.txt
pip install pytest pytest-asyncio pytest-cov

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# Run specific test categories
pytest tests/unit/ -v                    # Unit tests only
pytest tests/integration/ -v             # Integration tests only
pytest tests/unit/test_creative_service.py -v  # Specific service

# Run performance tests
pytest tests/ -k "performance" -v

# Run with async support
pytest tests/ --asyncio-mode=auto -v
```

### Go Tests

```bash
# Run all tests
cd services/go-api-gateway
go test ./tests/... -v

# Run with coverage
go test ./tests/... -coverprofile=coverage.out
go tool cover -html=coverage.out

# Run specific test packages
go test ./tests/unit/services -v        # Service tests only
go test ./tests/unit/handlers -v        # Handler tests only
go test ./tests/integration -v          # Integration tests only

# Run benchmarks
go test ./tests/... -bench=. -benchmem

# Run race condition detection
go test ./tests/... -race -v

# Run with verbose output and no cache
go test ./tests/... -v -count=1
```

## Test Environment Setup

### Environment Variables

#### Python Tests

```bash
export TESTING=true
export LOG_LEVEL=debug
export OPENAI_API_KEY=test_key
export GOOGLE_API_KEY=test_key
export FIREBASE_SERVICE_ACCOUNT=./firebase/test-service-account.json
export GRPC_PORT=50052
```

#### Go Tests

```bash
export GO_ENV=testing
export MONGO_URI=mongodb://localhost:27017/test
export REDIS_URL=redis://localhost:6379/1
export FIREBASE_PROJECT_ID=test-project
export GRPC_AI_ENGINE_URL=localhost:50052
```

### Docker Test Environment

```bash
# Start test infrastructure
docker-compose -f docker-compose.test.yml up -d

# Run tests in containers
docker-compose -f docker-compose.test.yml run python-tests
docker-compose -f docker-compose.test.yml run go-tests

# Cleanup
docker-compose -f docker-compose.test.yml down -v
```

## Test Metrics and Quality Gates

### Coverage Requirements

- **Python Services**: Minimum 85% line coverage, 90% for critical paths
- **Go Services**: Minimum 80% line coverage, 85% for business logic

### Performance Benchmarks

- **Text Generation**: < 5 seconds response time
- **Image Generation**: < 15 seconds response time
- **Video Generation**: < 60 seconds initial response
- **gRPC Requests**: < 1 second for simple operations
- **Database Operations**: < 100ms for single queries

### Quality Checks

- **Code Style**: Automated linting with pylint/flake8 (Python), golint (Go)
- **Security**: Dependency vulnerability scanning
- **Documentation**: All public APIs documented
- **Error Handling**: All error paths tested

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  python-tests:
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:6
      mongodb:
        image: mongo:5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.12"
      - run: |
          cd services/python-ai-engine
          pip install -r requirements.txt
          pytest tests/ --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v3

  go-tests:
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:6
      mongodb:
        image: mongo:5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: "1.21"
      - run: |
          cd services/go-api-gateway
          go test ./tests/... -coverprofile=coverage.out
          go tool cover -func=coverage.out
```

## Best Practices

### Test Organization

1. **Separation of Concerns**: Unit tests focus on individual components, integration tests verify interactions
2. **Test Isolation**: Each test is independent and can run in any order
3. **Clear Naming**: Test names describe the scenario and expected outcome
4. **Comprehensive Coverage**: Happy paths, error cases, edge conditions

### Mock Strategy

1. **External Dependencies**: Always mock external APIs and services
2. **Database Operations**: Use in-memory databases or mocks for unit tests
3. **Time-Dependent Code**: Mock time/date functions for deterministic tests
4. **Network Operations**: Mock HTTP clients and network calls

### Data Management

1. **Test Data**: Use factories and fixtures for consistent test data
2. **Cleanup**: Ensure tests clean up resources and don't affect other tests
3. **Isolation**: Each test uses fresh data and doesn't depend on previous test state

### Performance Testing

1. **Benchmarks**: Regular performance regression testing
2. **Load Testing**: Verify system behavior under realistic load
3. **Resource Monitoring**: Track memory usage, connection pools, etc.

This comprehensive test suite ensures reliable, maintainable, and performant microservices with confidence in deployments and feature changes.
