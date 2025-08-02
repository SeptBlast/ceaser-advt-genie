# Ceaser Ad Business - Polyglot Microservices Makefile
# This Makefile provides commands for development, testing, and deployment

.PHONY: help start stop restart build logs health test clean dev setup proto install-deps

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

# Docker Compose file
COMPOSE_FILE = docker-compose.polyglot.yml

## Display help information
help:
	@echo "$(BLUE)Ceaser Ad Business - Polyglot Architecture$(NC)"
	@echo "$(BLUE)===========================================$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@echo ""
	@echo "$(YELLOW)🚀 Main Commands:$(NC)"
	@echo "  make start          - Start all services"
	@echo "  make stop           - Stop all services"  
	@echo "  make restart        - Restart all services"
	@echo "  make logs           - View logs from all services"
	@echo "  make health         - Check service health"
	@echo ""
	@echo "$(YELLOW)🛠️  Development:$(NC)"
	@echo "  make dev-go         - Run Go service locally"
	@echo "  make dev-python     - Run Python service locally"
	@echo "  make dev-frontend   - Run frontend locally"
	@echo "  make setup          - Run initial setup"
	@echo ""
	@echo "$(YELLOW)🧪 Testing:$(NC)"
	@echo "  make test           - Run all tests"
	@echo "  make test-go        - Test Go service"
	@echo "  make test-python    - Test Python service"
	@echo "  make test-redis     - Test Redis Cloud connection"
	@echo ""
	@echo "$(YELLOW)🔧 Build & Deploy:$(NC)"
	@echo "  make build          - Build all services"
	@echo "  make clean          - Clean up containers and volumes"
	@echo "  make proto          - Generate protocol buffers"
	@echo ""
	@echo "$(YELLOW)📦 Dependencies:$(NC)"
	@echo "  make install-deps   - Install all dependencies"
	@echo "  make go-deps        - Install Go dependencies"
	@echo "  make python-deps    - Install Python dependencies"
	@echo "  make frontend-deps  - Install frontend dependencies"
	@echo ""
	@echo "$(YELLOW)🎨 Frontend Specific:$(NC)"
	@echo "  make dev-all        - Start all services in development mode"
	@echo "  make build-frontend - Build frontend for production"
	@echo "  make test-frontend  - Test frontend application"

## Start all services
start:
	@echo "$(GREEN)🚀 Starting Ceaser Ad Business services...$(NC)"
	docker compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ Services started!$(NC)"
	@echo "$(BLUE)📊 Service URLs:$(NC)"
	@echo "  • Go API Gateway: http://localhost:8000"
	@echo "  • Frontend: http://localhost:3000"
	@echo "  • Python AI Engine: gRPC on port 50051"
	@echo "  • Qdrant Vector DB: http://localhost:6333"
	@echo "  • Jaeger Tracing: http://localhost:16686"
	@echo ""
	@echo "$(YELLOW)Run 'make health' to check service status$(NC)"

## Stop all services
stop:
	@echo "$(YELLOW)⏹️  Stopping all services...$(NC)"
	docker compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ Services stopped!$(NC)"

## Restart all services
restart: stop start

## Build all services
build:
	@echo "$(BLUE)🔨 Building all services...$(NC)"
	docker compose -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✅ Build completed!$(NC)"

## View logs from all services
logs:
	@echo "$(BLUE)📋 Viewing logs from all services...$(NC)"
	docker compose -f $(COMPOSE_FILE) logs -f

## View logs from specific service
logs-api:
	@echo "$(BLUE)📋 Viewing Go API Gateway logs...$(NC)"
	docker compose -f $(COMPOSE_FILE) logs -f api-gateway

logs-ai:
	@echo "$(BLUE)📋 Viewing Python AI Engine logs...$(NC)"
	docker compose -f $(COMPOSE_FILE) logs -f ai-engine

logs-frontend:
	@echo "$(BLUE)📋 Viewing Frontend logs...$(NC)"
	docker compose -f $(COMPOSE_FILE) logs -f frontend

## Check service health
health:
	@echo "$(BLUE)🏥 Checking service health...$(NC)"
	@./status-check.sh

## Run all tests
test: test-go test-python
	@echo "$(GREEN)✅ All tests completed!$(NC)"

## Test Go service
test-go:
	@echo "$(BLUE)🧪 Testing Go API Gateway...$(NC)"
	@if [ -d "services/go-api-gateway" ]; then \
		cd services/go-api-gateway && go test ./... -v; \
	else \
		echo "$(RED)❌ Go service directory not found$(NC)"; \
	fi

## Test Python service
test-python:
	@echo "$(BLUE)🧪 Testing Python AI Engine...$(NC)"
	@if [ -d "services/python-ai-engine" ]; then \
		cd services/python-ai-engine && \
		if [ -d "venv" ]; then \
			. venv/bin/activate && python -m pytest tests/ -v; \
		else \
			python3 -m pytest tests/ -v; \
		fi; \
	else \
		echo "$(RED)❌ Python service directory not found$(NC)"; \
	fi

## Test Redis Cloud connection
test-redis:
	@echo "$(BLUE)🔴 Testing Redis Cloud connection...$(NC)"
	@./test-redis.sh

## Run Go service locally for development
dev-go:
	@echo "$(BLUE)🛠️  Starting Go service in development mode...$(NC)"
	@if [ -d "services/go-api-gateway" ]; then \
		cd services/go-api-gateway && \
		if [ -f ".env" ]; then \
			export $$(cat .env | xargs) && go run cmd/main.go; \
		else \
			echo "$(RED)❌ .env file not found. Run 'make setup' first.$(NC)"; \
		fi; \
	else \
		echo "$(RED)❌ Go service directory not found$(NC)"; \
	fi

## Run Python service locally for development
dev-python:
	@echo "$(BLUE)🛠️  Starting Python service in development mode...$(NC)"
	@if [ -d "services/python-ai-engine" ]; then \
		cd services/python-ai-engine && \
		if [ -d "venv" ]; then \
			. venv/bin/activate && python main.py; \
		else \
			python3 main.py; \
		fi; \
	else \
		echo "$(RED)❌ Python service directory not found$(NC)"; \
	fi

## Run frontend locally for development
dev-frontend:
	@echo "$(BLUE)🛠️  Starting Frontend in development mode...$(NC)"
	@if [ -d "frontend" ]; then \
		cd frontend && npm run dev; \
	else \
		echo "$(RED)❌ Frontend directory not found$(NC)"; \
	fi

## Run initial setup
setup:
	@echo "$(BLUE)⚙️  Running initial setup...$(NC)"
	@./setup.sh

## Configure cloud services
configure-cloud:
	@echo "$(BLUE)☁️  Configuring cloud services...$(NC)"
	@./configure-cloud.sh

## Generate protocol buffers
proto:
	@echo "$(BLUE)🔧 Generating protocol buffers...$(NC)"
	@if command -v protoc >/dev/null 2>&1; then \
		echo "$(GREEN)Generating Go protobuf files...$(NC)"; \
		cd proto && \
		protoc --go_out=../services/go-api-gateway/proto --go_opt=paths=source_relative \
			   --go-grpc_out=../services/go-api-gateway/proto --go-grpc_opt=paths=source_relative \
			   ai_engine.proto && \
		echo "$(GREEN)Generating Python protobuf files...$(NC)"; \
		python3 -m grpc_tools.protoc -I. --python_out=../services/python-ai-engine/proto \
									   --grpc_python_out=../services/python-ai-engine/proto \
									   ai_engine.proto && \
		echo "$(GREEN)✅ Protocol buffers generated!$(NC)"; \
	else \
		echo "$(RED)❌ protoc not found. Please install Protocol Buffers compiler.$(NC)"; \
		echo "$(YELLOW)macOS: brew install protobuf$(NC)"; \
		echo "$(YELLOW)Ubuntu: sudo apt-get install protobuf-compiler$(NC)"; \
	fi

## Install all dependencies
install-deps: go-deps python-deps frontend-deps
	@echo "$(GREEN)✅ All dependencies installed!$(NC)"

## Install Go dependencies
go-deps:
	@echo "$(BLUE)📦 Installing Go dependencies...$(NC)"
	@if [ -d "services/go-api-gateway" ]; then \
		cd services/go-api-gateway && go mod tidy && go mod download; \
		echo "$(GREEN)✅ Go dependencies installed!$(NC)"; \
	else \
		echo "$(RED)❌ Go service directory not found$(NC)"; \
	fi

## Install Python dependencies
python-deps:
	@echo "$(BLUE)📦 Installing Python dependencies...$(NC)"
	@if [ -d "services/python-ai-engine" ]; then \
		cd services/python-ai-engine && \
		if [ ! -d "venv" ]; then \
			python3 -m venv venv; \
		fi && \
		. venv/bin/activate && \
		pip install --upgrade pip && \
		pip install -r requirements.txt; \
		echo "$(GREEN)✅ Python dependencies installed!$(NC)"; \
	else \
		echo "$(RED)❌ Python service directory not found$(NC)"; \
	fi

## Clean up containers, images, and volumes
clean:
	@echo "$(YELLOW)🧹 Cleaning up Docker resources...$(NC)"
	docker compose -f $(COMPOSE_FILE) down -v --rmi local --remove-orphans
	@echo "$(YELLOW)Removing unused Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)✅ Cleanup completed!$(NC)"

## Clean up Python cache and build artifacts
clean-python:
	@echo "$(YELLOW)🧹 Cleaning Python cache and build artifacts...$(NC)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)✅ Python cleanup completed!$(NC)"

## Monitor resource usage
monitor:
	@echo "$(BLUE)📊 Monitoring resource usage...$(NC)"
	docker stats

## Show running containers
ps:
	@echo "$(BLUE)📋 Running containers:$(NC)"
	docker compose -f $(COMPOSE_FILE) ps

## Open shell in Go service container
shell-go:
	@echo "$(BLUE)🐚 Opening shell in Go API Gateway container...$(NC)"
	docker exec -it ceaser-api-gateway /bin/sh

## Open shell in Python service container
shell-python:
	@echo "$(BLUE)🐚 Opening shell in Python AI Engine container...$(NC)"
	docker exec -it ceaser-ai-engine /bin/bash

## Backup environment files
backup-env:
	@echo "$(BLUE)💾 Backing up environment files...$(NC)"
	@mkdir -p backups
	@cp services/go-api-gateway/.env backups/go-api-gateway.env.backup.$$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "Go .env not found"
	@cp services/python-ai-engine/.env backups/python-ai-engine.env.backup.$$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "Python .env not found"
	@echo "$(GREEN)✅ Environment files backed up to backups/$(NC)"

## Show service URLs
urls:
	@echo "$(BLUE)🌐 Service URLs:$(NC)"
	@echo "$(GREEN)Go API Gateway:$(NC)      http://localhost:8000"
	@echo "$(GREEN)Frontend:$(NC)            http://localhost:3000"
	@echo "$(GREEN)Qdrant Vector DB:$(NC)    http://localhost:6333"
	@echo "$(GREEN)Jaeger Tracing:$(NC)      http://localhost:16686"
	@echo "$(GREEN)API Health Check:$(NC)    http://localhost:8000/health"
	@echo "$(GREEN)gRPC AI Engine:$(NC)      localhost:50051"

## Production deployment
deploy-prod: build
	@echo "$(BLUE)🚀 Deploying to production...$(NC)"
	@echo "$(YELLOW)⚠️  Make sure to configure production environment variables!$(NC)"
	docker compose -f $(COMPOSE_FILE) up -d --force-recreate
	@echo "$(GREEN)✅ Production deployment completed!$(NC)"

## Security scan
security-scan:
	@echo "$(BLUE)🔒 Running security scan...$(NC)"
	@if command -v trivy >/dev/null 2>&1; then \
		trivy config .; \
		trivy fs .; \
	else \
		echo "$(YELLOW)⚠️  Trivy not installed. Install with: brew install trivy$(NC)"; \
	fi

## Update dependencies
update-deps:
	@echo "$(BLUE)🔄 Updating dependencies...$(NC)"
	@cd services/go-api-gateway && go get -u ./... && go mod tidy
	@cd services/python-ai-engine && . venv/bin/activate && pip list --outdated
	@echo "$(GREEN)✅ Dependencies updated!$(NC)"

## Generate documentation
docs:
	@echo "$(BLUE)📚 Generating documentation...$(NC)"
	@echo "$(GREEN)Available documentation:$(NC)"
	@echo "  • Architecture: README-POLYGLOT.md"
	@echo "  • Cloud Setup: docs/CLOUD_CONFIGURATION.md"
	@echo "  • API Documentation: http://localhost:8000/docs (when running)"

## Lint code
lint:
	@echo "$(BLUE)🔍 Linting code...$(NC)"
	@cd services/go-api-gateway && go fmt ./... && go vet ./...
	@cd services/python-ai-engine && . venv/bin/activate && black . && flake8 .
	@echo "$(GREEN)✅ Linting completed!$(NC)"

## Run quick health check
quick-check:
	@echo "$(BLUE)⚡ Quick health check...$(NC)"
	@curl -s http://localhost:8000/health > /dev/null && echo "$(GREEN)✅ API Gateway: Healthy$(NC)" || echo "$(RED)❌ API Gateway: Down$(NC)"
	@curl -s http://localhost:3000 > /dev/null && echo "$(GREEN)✅ Frontend: Healthy$(NC)" || echo "$(RED)❌ Frontend: Down$(NC)"

## Install frontend dependencies
frontend-deps:
	@echo "$(BLUE)📦 Installing Frontend dependencies...$(NC)"
	@if [ -d "frontend" ]; then \
		cd frontend && npm ci; \
		echo "$(GREEN)✅ Frontend dependencies installed!$(NC)"; \
	else \
		echo "$(RED)❌ Frontend directory not found$(NC)"; \
	fi

## Build frontend for production
build-frontend:
	@echo "$(BLUE)🔨 Building Frontend for production...$(NC)"
	@if [ -d "frontend" ]; then \
		cd frontend && npm run build; \
		echo "$(GREEN)✅ Frontend build completed!$(NC)"; \
	else \
		echo "$(RED)❌ Frontend directory not found$(NC)"; \
	fi

## Test frontend application
test-frontend:
	@echo "$(BLUE)🧪 Testing Frontend application...$(NC)"
	@if [ -d "frontend" ]; then \
		cd frontend && npm run test; \
		echo "$(GREEN)✅ Frontend tests completed!$(NC)"; \
	else \
		echo "$(RED)❌ Frontend directory not found$(NC)"; \
	fi

## Start all services in development mode with hot reload
dev-all:
	@echo "$(BLUE)🛠️  Starting all services in development mode...$(NC)"
	@echo "$(YELLOW)This will start services with hot reload enabled$(NC)"
	docker compose -f $(COMPOSE_FILE) -f docker-compose.dev.yml up --build

## Lint frontend code
lint-frontend:
	@echo "$(BLUE)🔍 Linting frontend code...$(NC)"
	@if [ -d "frontend" ]; then \
		cd frontend && npm run lint; \
		echo "$(GREEN)✅ Frontend linting completed!$(NC)"; \
	else \
		echo "$(RED)❌ Frontend directory not found$(NC)"; \
	fi

## Format frontend code
format-frontend:
	@echo "$(BLUE)💅 Formatting frontend code...$(NC)"
	@if [ -d "frontend" ]; then \
		cd frontend && npx prettier --write src/; \
		echo "$(GREEN)✅ Frontend formatting completed!$(NC)"; \
	else \
		echo "$(RED)❌ Frontend directory not found$(NC)"; \
	fi

## Clean frontend build artifacts
clean-frontend:
	@echo "$(YELLOW)🧹 Cleaning frontend build artifacts...$(NC)"
	@if [ -d "frontend" ]; then \
		cd frontend && rm -rf dist/ build/ node_modules/.cache/; \
		echo "$(GREEN)✅ Frontend cleanup completed!$(NC)"; \
	else \
		echo "$(RED)❌ Frontend directory not found$(NC)"; \
	fi
