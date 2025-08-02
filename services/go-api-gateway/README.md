# AdGenius Multi-Tenant SaaS Platform - Go API Gateway

## Overview

This is the **Go API Gateway** service of the AdGenius multi-tenant advertising platform, implementing a polyglot microservices architecture that combines Go's operational performance with Python's AI capabilities.

## Architecture

### Polyglot Design

- **Go API Gateway** (Operational Plane): High-performance request handling, multi-tenancy, billing, analytics
- **Python AI Engine** (Reasoning Plane): Complex AI workflows, creative generation, performance analysis
- **gRPC Communication**: Type-safe service communication with protocol buffers

### Multi-Tenancy Model

- **Database-per-tenant**: Complete data isolation using MongoDB Atlas
- **Tenant Context**: Automatic tenant resolution from headers, subdomains, or parameters
- **Redis Caching**: Per-tenant caching strategies for optimal performance

## Features Implemented

### ✅ Core Services

- [x] **TenantService**: Multi-tenant database management and tenant lifecycle
- [x] **RedisService**: Comprehensive caching with multiple strategies
- [x] **AdGenerationService**: Campaign and creative management with AI delegation
- [x] **AnalyticsService**: Performance tracking, trend analysis, and insights
- [x] **BillingService**: Subscription management, usage tracking, and invoicing

### ✅ HTTP Handlers

- [x] **AdGenerationHandler**: Full REST API for campaigns and creatives
- [x] **BillingHandler**: Subscription and billing management endpoints
- [x] **AnalyticsHandler**: Performance metrics and reporting endpoints

### ✅ Multi-Tenant Infrastructure

- [x] **Tenant Middleware**: Automatic tenant context extraction
- [x] **Database Isolation**: Database-per-tenant implementation
- [x] **Cache Isolation**: Tenant-specific Redis caching
- [x] **Service Integration**: gRPC delegation to Python AI services

### ✅ Development Tooling

- [x] **Comprehensive Makefile**: Build, test, development workflow automation
- [x] **Docker Support**: Complete containerization with multi-stage builds
- [x] **gRPC Protocol Buffers**: Type-safe AI service communication
- [x] **Environment Configuration**: Production-ready configuration management

## Project Structure

```
services/go-api-gateway/
├── cmd/
│   └── main.go                 # Application entry point
├── internal/
│   ├── handlers/              # HTTP request handlers
│   │   ├── ad_generation_handler.go
│   │   ├── billing_handler.go
│   │   └── analytics.go       # Existing analytics handler
│   ├── services/              # Business logic services
│   │   ├── tenant_service.go
│   │   ├── redis_service.go
│   │   ├── ad_generation_service.go
│   │   ├── analytics_service.go
│   │   └── billing_service.go
│   ├── middleware/            # Request middleware
│   │   └── middleware.go      # CORS, Auth, Tenant, Rate limiting
│   ├── models/               # Data models and types
│   ├── database/             # Database connection and utilities
│   └── grpc/                 # gRPC client for AI Engine
├── proto/                    # Protocol buffer definitions
│   ├── ai_engine.proto
│   └── ai_engine/           # Generated Go bindings
├── .env.example             # Environment configuration template
├── Makefile                 # Development and deployment automation
├── Dockerfile               # Multi-stage container build
├── go.mod                   # Go module dependencies
└── README.md               # This file
```

## API Endpoints

### Ad Generation & Campaign Management

```
GET    /api/v1/ad-generation/campaigns      # List campaigns with pagination
POST   /api/v1/ad-generation/campaigns      # Create new campaign
GET    /api/v1/ad-generation/campaigns/:id  # Get campaign details
PUT    /api/v1/ad-generation/campaigns/:id  # Update campaign
DELETE /api/v1/ad-generation/campaigns/:id  # Delete campaign

GET    /api/v1/ad-generation/creatives      # List creatives with pagination
POST   /api/v1/ad-generation/creatives      # Create new creative
GET    /api/v1/ad-generation/creatives/:id  # Get creative details
PUT    /api/v1/ad-generation/creatives/:id  # Update creative
DELETE /api/v1/ad-generation/creatives/:id  # Delete creative
```

### Analytics & Performance

```
GET    /api/v1/analytics/campaigns/:id      # Campaign analytics with time range
POST   /api/v1/analytics/campaigns/batch    # Multi-campaign analytics
GET    /api/v1/analytics/top-creatives      # Top performing creatives
GET    /api/v1/analytics/summary           # Performance dashboard
```

### Billing & Subscriptions

```
GET    /api/v1/billing/subscription         # Current subscription details
PUT    /api/v1/billing/subscription         # Update subscription plan
GET    /api/v1/billing/usage               # Usage statistics with time range
GET    /api/v1/billing/invoices            # Invoice history with pagination
GET    /api/v1/billing/invoices/:id        # Specific invoice details
POST   /api/v1/billing/payment             # Process payment
GET    /api/v1/billing/plan-limits         # Current plan limits and usage
```

## Quick Start

### Prerequisites

- Go 1.21+
- MongoDB Atlas account
- Redis Cloud account (or local Redis)
- Python AI Engine service running

### Environment Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Configure your services in `.env`:

   ```bash
   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

   # Redis Cloud
   REDIS_HOST=your-redis-host
   REDIS_PASSWORD=your-redis-password

   # AI Engine
   AI_ENGINE_ADDR=localhost:50051
   ```

### Development

1. **Install dependencies:**

   ```bash
   go mod download
   ```

2. **Generate gRPC bindings:**

   ```bash
   make proto
   ```

3. **Run the service:**

   ```bash
   make run
   ```

4. **Build for production:**

   ```bash
   make build
   ```

5. **Run tests:**
   ```bash
   make test
   ```

### API Testing with Postman

For comprehensive API testing, see our detailed documentation:

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with request/response examples
- **[Postman Testing Guide](./POSTMAN_TESTING_GUIDE.md)** - Step-by-step testing instructions
- **[Postman Collection](./AdGenius_API_Collection.postman_collection.json)** - Import this into Postman
- **[Postman Environment](./AdGenius_Local_Environment.postman_environment.json)** - Environment variables for testing

**Quick Postman Setup:**

1. Import `AdGenius_API_Collection.postman_collection.json`
2. Import `AdGenius_Local_Environment.postman_environment.json`
3. Select "AdGenius Local Development" environment
4. Start with "Health Check" to verify connectivity
5. Run "End-to-End Test Flow" for complete validation

### Docker Deployment

1. **Build container:**

   ```bash
   make docker-build
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

## Multi-Tenancy Implementation

### Tenant Resolution

The system automatically extracts tenant context from:

1. `X-Tenant-ID` header
2. Subdomain (e.g., `acme.adgenius.com` → `acme`)
3. `tenant_id` query parameter

### Database Isolation

Each tenant gets a dedicated MongoDB database:

```
adgenius_tenant_acme
adgenius_tenant_globex
adgenius_tenant_initech
```

### Caching Strategy

Redis caching is tenant-aware with automatic key prefixing:

```
tenant:acme:campaign:123
tenant:globex:analytics:summary
```

## Service Communication

### gRPC Integration

The Go API Gateway delegates AI-intensive operations to the Python AI Engine:

```go
// Generate creative content via gRPC
response, err := s.aiEngineClient.GenerateText(ctx, &aiengine.TextGenerationRequest{
    Prompt:      creative.Prompt,
    Type:        creative.Type,
    MaxTokens:   int32(creative.MaxTokens),
    Temperature: creative.Temperature,
})
```

### Protocol Buffers

Type-safe communication with comprehensive message definitions:

- `TextGenerationRequest/Response`
- `ImageGenerationRequest/Response`
- `VideoGenerationRequest/Response`
- `PerformanceAnalysisRequest/Response`

## Production Considerations

### Performance

- **Horizontal Scaling**: Stateless design enables easy horizontal scaling
- **Connection Pooling**: MongoDB and Redis connection pooling for optimal resource usage
- **Caching**: Multi-level caching strategy (Redis, application-level)
- **gRPC**: Efficient binary protocol for service communication

### Security

- **JWT Authentication**: Token-based authentication (to be implemented)
- **Multi-Tenancy**: Complete data isolation between tenants
- **Input Validation**: Comprehensive request validation and sanitization
- **Rate Limiting**: Configurable rate limiting per tenant

### Monitoring

- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Health Checks**: Comprehensive health check endpoints
- **Metrics**: Application and business metrics collection
- **Tracing**: Distributed tracing with OpenTelemetry

### Configuration

- **Environment-based**: 12-factor app configuration
- **Cloud-ready**: Ready for MongoDB Atlas and Redis Cloud
- **Secrets Management**: Secure handling of sensitive configuration

## Next Steps

### Immediate Integration Tasks

1. **Service Integration**: Wire up new services in main application
2. **Authentication**: Implement JWT authentication middleware
3. **Testing**: Add comprehensive unit and integration tests
4. **Documentation**: API documentation with Swagger/OpenAPI

### Advanced Features

1. **WebSocket Support**: Real-time notifications and updates
2. **Event Sourcing**: Campaign and creative lifecycle events
3. **Advanced Analytics**: Machine learning insights and recommendations
4. **Workflow Engine**: Complex multi-step campaign creation workflows

## Development Commands

```bash
# Development
make dev          # Run in development mode with hot reload
make test         # Run all tests
make test-cover   # Run tests with coverage
make lint         # Run linter
make format       # Format code

# Build
make build        # Build binary
make docker-build # Build Docker image

# gRPC
make proto        # Generate protocol buffer bindings
make proto-clean  # Clean generated files

# Database
make migrate      # Run database migrations
make seed         # Seed development data

# Deployment
make deploy-dev   # Deploy to development environment
make deploy-prod  # Deploy to production environment
```

## Contributing

1. Follow Go best practices and project conventions
2. Add tests for new functionality
3. Update documentation for API changes
4. Use conventional commit messages
5. Ensure all services compile and tests pass

## License

This project is part of the AdGenius multi-tenant advertising platform.
