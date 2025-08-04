# Ceaser Ad Business - Polyglot Microservices Architecture

## 🏗️ Architecture Overview

This project implements a **polyglot microservices architecture** that leverages cloud services for scalability and reliability:

- **Go Service (API Gateway)**: High-performance operational plane handling API requests, MongoDB operations, and request orchestration
- **Python Service (AI Engine)**: Advanced AI reasoning plane using LangChain for complex agentic workflows and creative generation
- **gRPC Communication**: High-performance inter-service communication with Protocol Buffers
- **MongoDB Atlas**: Cloud-native document database for data persistence
- **Redis Cloud**: Managed Redis for caching and session management

## 🏛️ System Architecture

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   Frontend      │    │   Go API         │    │   Python AI     │
│   (React)       │◄──►│   Gateway        │◄──►│   Engine        │
│   Port: 3000    │    │   Port: 8080     │    │   Port: 50051   │
│                 │    │                  │    │   (gRPC)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                          │
                              ▼                          ▼
                    ┌─────────────────┐      ┌─────────────────┐
                    │                 │      │                 │
                    │ MongoDB Atlas   │      │  Redis Cloud    │
                    │ (Cloud Database)│      │  (Cloud Cache)  │
                    │                 │      │                 │
                    └─────────────────┘      └─────────────────┘
```

## 📁 Project Structure

```
ceaser-ad-business/
├── frontend/                   # React frontend (existing)
├── services/
│   ├── go-api-gateway/         # Go API Gateway Service
│   │   ├── cmd/
│   │   │   └── main.go         # Application entry point
│   │   ├── internal/
│   │   │   ├── handlers/       # HTTP handlers
│   │   │   ├── models/         # Data models
│   │   │   ├── database/       # MongoDB client
│   │   │   └── grpc/           # gRPC client
│   │   ├── go.mod
│   │   ├── Dockerfile
│   │   └── .env
│   └── python-ai-engine/       # Python AI Engine Service
│       ├── app/
│       │   └── services/       # AI service implementations
│       ├── proto/              # Generated protobuf files
│       ├── main.py             # gRPC server entry point
│       ├── requirements.txt
│       ├── Dockerfile
│       └── .env
├── proto/
│   └── ai_engine.proto         # gRPC service definitions
├── docker-compose.polyglot.yml # Multi-service orchestration
├── setup.sh                    # Automated setup script
├── Makefile                    # Development commands
└── docs/
    └── Go for RAG Backend__.md # Architecture analysis
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Go 1.24+ (for local development)
- Python 3.12+ (for local development)
- Protocol Buffers compiler (`protoc`)

### 1. Automated Setup

```bash
# Run the setup script
./setup.sh

# This will:
# - Check prerequisites
# - Create environment files
# - Generate protocol buffers
# - Set up dependencies
# - Create a Makefile
```

### 2. Configure Cloud Services

**IMPORTANT**: This architecture uses cloud services. You need to configure:

#### Redis Cloud Configuration

1. Create a [Redis Cloud](https://redis.com/redis-enterprise-cloud/) account
2. Create a new database
3. Get your connection details (endpoint, port, password)
4. Update both `.env` files:

```bash
# In both services/go-api-gateway/.env and services/python-ai-engine/.env
REDIS_URL=redis://default:your-password@your-endpoint:your-port
```

#### MongoDB Atlas Configuration

MongoDB Atlas is already configured, but verify:

- Cluster: `ceaser-ad-gini.jokuuab.mongodb.net`
- Database: `ceaser-advt-genie`
- User: `developer`

**📚 Detailed Setup**: See `docs/CLOUD_CONFIGURATION.md` for complete cloud setup instructions.

### 3. Configure API Keys

Edit the environment files with your API keys:

```bash
# Configure Python service (add your API keys)
nano services/python-ai-engine/.env
```

Required environment variables for AI features:

```bash
# In services/python-ai-engine/.env
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_API_KEY=your-google-api-key-here  # Optional
```

### 4. Start Services

```bash
# Build and start all services
make start

# Or manually with docker-compose:
docker-compose -f docker-compose.polyglot.yml up -d
```

### 4. Verify Setup

```bash
# Check service health
make health

# View logs
make logs

# Test API endpoint
curl http://localhost:8080/health

# Verify cloud connections
./status-check.sh
```

## 🔧 Development

### Using the Makefile

The project includes a comprehensive Makefile with all common tasks:

```bash
# View all available commands
make help

# Main commands
make start          # Start all services
make stop           # Stop all services
make restart        # Restart all services
make logs           # View logs from all services
make health         # Check service health

# Development
make dev-go         # Run Go service locally
make dev-python     # Run Python service locally
make dev-frontend   # Run frontend locally
make setup          # Run initial setup

# Testing
make test           # Run all tests
make test-redis     # Test Redis Cloud connection
make quick-check    # Quick health check

# Utilities
make urls           # Show service URLs
make clean          # Clean up containers
make proto          # Generate protocol buffers
```

### Local Development

```bash
# Run Go service locally (requires MongoDB and AI Engine running)
make dev-go

# Run Python service locally (requires MongoDB and Redis)
make dev-python
```

### Testing

```bash
# Test Go service
make test-go

# Test Python service
make test-python
```

### Protocol Buffers

When you modify `proto/ai_engine.proto`:

```bash
# Regenerate protobuf files
make proto
```

## 🌐 API Endpoints

### Go API Gateway (Port 8080)

#### Campaign Management

- `GET /api/v1/campaigns` - List campaigns
- `POST /api/v1/campaigns` - Create campaign
- `GET /api/v1/campaigns/:id` - Get campaign
- `PUT /api/v1/campaigns/:id` - Update campaign
- `DELETE /api/v1/campaigns/:id` - Delete campaign

#### Creative Management

- `GET /api/v1/creatives` - List creatives
- `POST /api/v1/creatives` - Create creative
- `GET /api/v1/creatives/:id` - Get creative
- `PUT /api/v1/creatives/:id` - Update creative
- `DELETE /api/v1/creatives/:id` - Delete creative
- `POST /api/v1/creatives/:id/generate` - Generate creative (calls AI Engine)

#### Analytics

- `GET /api/v1/analytics/campaigns/:id` - Campaign analytics
- `POST /api/v1/analytics/insights` - Generate insights (calls AI Engine)
- `GET /api/v1/analytics/performance` - Performance metrics

#### Agent Workflows

- `POST /api/v1/agent/workflow` - Execute agent workflow (calls AI Engine)
- `POST /api/v1/agent/analyze` - Campaign analysis with AI agent

## 🤖 Python AI Engine Features

### Creative Generation Service

- **Multi-modal creative generation**: Images, videos, text, carousels
- **LangChain integration**: Advanced prompt templates and chains
- **Multiple LLM support**: OpenAI GPT-4, Google Gemini
- **Brand-aware generation**: Considers brand guidelines and audience

### Analysis Service

- **Performance analysis**: Deep dive into campaign metrics
- **Audience analysis**: Behavioral insights and segmentation
- **Creative analysis**: A/B testing insights and optimization
- **Competitive analysis**: Market intelligence and positioning

### Agent Service (LangChain Agents)

- **Web search integration**: DuckDuckGo for market research
- **Wikipedia integration**: Background research capabilities
- **Custom tools ecosystem**: Campaign analysis, budget optimization
- **Multi-step workflows**: Complex reasoning with tool usage

### Insights Service

- **Predictive insights**: Performance forecasting
- **Strategic recommendations**: Long-term planning guidance
- **Seasonal analysis**: Holiday and event-driven opportunities
- **Budget optimization**: Allocation and efficiency insights

## 🔄 Inter-Service Communication

### gRPC Service Definitions

The services communicate via gRPC using the following service definitions:

```protobuf
service AIEngineService {
  rpc GenerateCreative(GenerateCreativeRequest) returns (GenerateCreativeResponse);
  rpc AnalyzeCampaign(AnalyzeCampaignRequest) returns (AnalyzeCampaignResponse);
  rpc ExecuteAgentWorkflow(AgentWorkflowRequest) returns (AgentWorkflowResponse);
  rpc GenerateInsights(InsightsRequest) returns (InsightsResponse);
}
```

### Example Request Flow

1. **Frontend** sends HTTP request to **Go API Gateway**
2. **Go Service** validates request and fetches data from **MongoDB**
3. For AI operations, **Go Service** calls **Python AI Engine** via **gRPC**
4. **Python Service** processes using **LangChain** and **LLMs**
5. **Python Service** returns results via **gRPC**
6. **Go Service** formats response and returns to **Frontend**

## 📊 Monitoring & Observability

### Health Checks

All services include health check endpoints:

```bash
# API Gateway health
curl http://localhost:8080/health

# Check all services
make health
```

### Logging

Structured logging with different levels:

```bash
# View all logs
make logs

# View specific service logs
docker-compose -f docker-compose.polyglot.yml logs -f ai-engine
docker-compose -f docker-compose.polyglot.yml logs -f api-gateway
```

### Distributed Tracing (Optional)

Jaeger is included for distributed tracing:

- **Jaeger UI**: http://localhost:16686
- **OpenTelemetry**: Configured for both Go and Python services

## 🗄️ Data Persistence

### MongoDB Collections

- **campaigns**: Campaign metadata and configuration
- **creatives**: Creative content and variations
- **generation_jobs**: AI generation job tracking
- **templates**: Creative templates
- **analytics**: Performance metrics and insights

### Redis Usage

- **Caching**: Frequently accessed data
- **Session storage**: User sessions
- **Background jobs**: Async processing with Celery

## 🔐 Security Considerations

### Environment Variables

- API keys stored in `.env` files (not committed)
- Database credentials configurable
- Service-to-service authentication via gRPC

### Network Security

- Services communicate within Docker network
- Only necessary ports exposed externally
- Health checks for service availability

## 📈 Performance Benefits

### Go API Gateway Advantages

- **High concurrency**: Goroutines handle thousands of concurrent requests
- **Low latency**: Compiled binary with minimal overhead
- **Efficient I/O**: Optimized for database and network operations
- **Small memory footprint**: Ideal for containerized deployments

### Python AI Engine Advantages

- **Rich AI ecosystem**: Full access to LangChain, OpenAI, etc.
- **Rapid development**: Quick iteration on AI features
- **Advanced tooling**: Extensive library ecosystem
- **Complex reasoning**: Sophisticated agentic workflows

### gRPC Communication Benefits

- **Binary protocol**: More efficient than JSON/REST
- **Type safety**: Strongly typed service contracts
- **Multiplexing**: Multiple requests over single connection
- **Backward compatibility**: Schema evolution support

## 🚦 Deployment Options

### Development

```bash
# Local development with hot reload
make dev-go    # Terminal 1
make dev-python # Terminal 2
```

### Production

```bash
# Docker Compose deployment
make start

# Or with explicit compose file
docker-compose -f docker-compose.polyglot.yml up -d
```

### Kubernetes (Future)

The containerized services are ready for Kubernetes deployment with:

- Service meshes (Istio/Linkerd)
- Horizontal pod autoscaling
- Load balancing
- Secret management

## 🔧 Troubleshooting

### Common Issues

1. **Services not starting**

   ```bash
   # Check Docker status
   docker ps

   # View service logs
   make logs
   ```

2. **gRPC connection failures**

   ```bash
   # Verify AI Engine is running
   docker ps | grep ai-engine

   # Check gRPC port
   netstat -an | grep 50051
   ```

3. **Database connection issues**

   ```bash
   # Check MongoDB status
   docker exec ceaser-mongodb mongosh --eval "db.adminCommand('ping')"
   ```

4. **Missing environment variables**
   ```bash
   # Verify .env files exist
   ls -la services/*/.*env
   ```

### Performance Tuning

1. **Go Service Optimization**

   - Adjust MongoDB connection pool size
   - Configure goroutine limits
   - Enable HTTP/2 for better multiplexing

2. **Python Service Optimization**

   - Increase gRPC worker threads
   - Configure LangChain caching
   - Optimize LLM token usage

3. **Database Optimization**
   - Add appropriate indexes
   - Configure connection pooling
   - Enable query optimization

## 🛣️ Migration from Django Backend

If migrating from the existing Django backend:

1. **Data Migration**

   ```bash
   # Export existing data
   python manage.py dumpdata > django_data.json

   # Import to new MongoDB structure
   # (custom migration script needed)
   ```

2. **API Compatibility**

   - Go service maintains similar API endpoints
   - Response formats preserved for frontend compatibility
   - Gradual migration possible

3. **Feature Parity**
   - All Django features reimplemented in Go/Python
   - Enhanced with AI capabilities
   - Better performance and scalability

## 📚 Additional Resources

- [Go for RAG Backend Analysis](docs/Go%20for%20RAG%20Backend__.md)
- [LangChain Documentation](https://python.langchain.com/)
- [gRPC Documentation](https://grpc.io/docs/)
- [MongoDB Go Driver](https://pkg.go.dev/go.mongodb.org/mongo-driver/mongo)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)

## 🤝 Contributing

1. **Development Setup**

   ```bash
   ./setup.sh
   make dev-go    # Terminal 1
   make dev-python # Terminal 2
   ```

2. **Code Style**

   - Go: `gofmt` and `golint`
   - Python: `black` and `flake8`
   - Protocol Buffers: consistent naming

3. **Testing**

   ```bash
   make test-go
   make test-python
   ```

4. **Pull Requests**
   - Include tests for new features
   - Update documentation
   - Follow commit message conventions

---

This polyglot architecture represents a strategic approach to building scalable, high-performance AI applications by leveraging the unique strengths of both Go and Python in a microservices architecture. 🚀
