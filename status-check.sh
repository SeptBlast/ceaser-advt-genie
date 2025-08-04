#!/bin/bash

# Ceaser Ad Business - Polyglot Architecture Status Check
# This script verifies the polyglot architecture setup and services

echo "🔍 Ceaser Ad Business - Polyglot Architecture Status"
echo "=============="
echo "🚀 Quick Commands"
echo "================="
echo "Start services:       make start"
echo "Stop services:        make stop"
echo "View logs:            make logs"
echo "Health check:         make health"
echo "Development setup:    ./setup.sh"
echo "API documentation:    curl http://localhost:8080/health"
echo "Cloud configuration:  docs/CLOUD_CONFIGURATION.md"

echo
echo "📚 Documentation"
echo "================="
echo "Architecture docs:  README-POLYGLOT.md"
echo "Cloud setup guide:  docs/CLOUD_CONFIGURATION.md"
echo "Original analysis:  docs/Go\ for\ RAG\ Backend__.md"
echo "======================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check service status
check_service() {
    local service_name=$1
    local expected_status=$2
    
    if docker-compose -f docker-compose.polyglot.yml ps | grep -q "$service_name.*$expected_status"; then
        echo -e "${GREEN}✓${NC} $service_name is $expected_status"
        return 0
    else
        echo -e "${RED}✗${NC} $service_name is not $expected_status"
        return 1
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local name=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name endpoint responding"
        return 0
    else
        echo -e "${RED}✗${NC} $name endpoint not responding"
        return 1
    fi
}

echo
echo "🏗️ Architecture Components"
echo "========================="

# Check if Docker is running
if command_exists docker && docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Docker is running"
else
    echo -e "${RED}✗${NC} Docker is not running or not installed"
    exit 1
fi

# Check if Docker Compose file exists
if [ -f "docker-compose.polyglot.yml" ]; then
    echo -e "${GREEN}✓${NC} docker-compose.polyglot.yml exists"
else
    echo -e "${RED}✗${NC} docker-compose.polyglot.yml not found"
    exit 1
fi

echo
echo "📦 Service Status"
echo "================"

# Check if services are running
services_running=true

# Core services (no local MongoDB or Redis since we use cloud)
if check_service "api-gateway" "Up"; then :; else services_running=false; fi
if check_service "ai-engine" "Up"; then :; else services_running=false; fi

echo
echo "🌐 Endpoint Health Checks"
echo "========================"

# Test endpoints if services are running
if [ "$services_running" = true ]; then
    test_endpoint "http://localhost:8080/health" "Go API Gateway"
    
    # Check if AI Engine gRPC port is listening
    if netstat -an 2>/dev/null | grep -q ":50051.*LISTEN" || ss -an 2>/dev/null | grep -q ":50051.*LISTEN"; then
        echo -e "${GREEN}✓${NC} Python AI Engine gRPC port (50051) is listening"
    else
        echo -e "${RED}✗${NC} Python AI Engine gRPC port (50051) not listening"
    fi
else
    echo -e "${YELLOW}⚠${NC} Services not running - skipping endpoint tests"
fi

echo
echo "☁️ Cloud Services Configuration"
echo "=============================="

# Check Redis Cloud configuration
if grep -q "REDIS_URL=redis://" services/go-api-gateway/.env 2>/dev/null && grep -q "REDIS_URL=redis://" services/python-ai-engine/.env 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Redis Cloud URL configured in both services"
else
    echo -e "${RED}✗${NC} Redis Cloud URL not configured - check .env files"
    echo -e "    Add: REDIS_URL=redis://default:password@endpoint:port"
fi

# Check MongoDB Atlas configuration
if grep -q "ceaser-ad-gini.jokuuab.mongodb.net" services/go-api-gateway/.env 2>/dev/null; then
    echo -e "${GREEN}✓${NC} MongoDB Atlas configured"
else
    echo -e "${RED}✗${NC} MongoDB Atlas configuration missing"
fi

# Test cloud connections if services are running
if [ "$services_running" = true ]; then
    # Test Redis Cloud connection from AI Engine
    echo "Testing cloud service connections..."
    
    # Check if Redis connection is working
    if docker exec ceaser-ai-engine python -c "import redis; import os; r=redis.from_url(os.getenv('REDIS_URL', '')); r.ping()" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Redis Cloud connection successful"
    else
        echo -e "${RED}✗${NC} Redis Cloud connection failed"
    fi
    
    # Check if MongoDB Atlas connection is working  
    if docker exec ceaser-api-gateway wget -q --spider --timeout=5 "https://ceaser-ad-gini.jokuuab.mongodb.net" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} MongoDB Atlas endpoint reachable"
    else
        echo -e "${YELLOW}⚠${NC} MongoDB Atlas endpoint test inconclusive"
    fi
fi

echo
echo "📁 Project Structure"
echo "=================="

# Check key directories and files
check_file_or_dir() {
    local path=$1
    local type=$2  # "file" or "directory"
    
    if [ "$type" = "file" ] && [ -f "$path" ]; then
        echo -e "${GREEN}✓${NC} $path (file)"
    elif [ "$type" = "directory" ] && [ -d "$path" ]; then
        echo -e "${GREEN}✓${NC} $path (directory)"
    else
        echo -e "${RED}✗${NC} $path ($type) - missing"
    fi
}

# Key directories
check_file_or_dir "services/go-api-gateway" "directory"
check_file_or_dir "services/python-ai-engine" "directory"
check_file_or_dir "proto" "directory"

# Key files
check_file_or_dir "services/go-api-gateway/cmd/main.go" "file"
check_file_or_dir "services/python-ai-engine/main.py" "file"
check_file_or_dir "proto/ai_engine.proto" "file"
check_file_or_dir "setup.sh" "file"
check_file_or_dir "Makefile" "file"

echo
echo "🔧 Development Tools"
echo "=================="

# Check development prerequisites
if command_exists go; then
    go_version=$(go version | awk '{print $3}')
    echo -e "${GREEN}✓${NC} Go installed: $go_version"
else
    echo -e "${YELLOW}⚠${NC} Go not installed (needed for local development)"
fi

if command_exists python3; then
    python_version=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python installed: $python_version"
else
    echo -e "${YELLOW}⚠${NC} Python not installed (needed for local development)"
fi

if command_exists protoc; then
    protoc_version=$(protoc --version)
    echo -e "${GREEN}✓${NC} Protocol Buffers compiler installed: $protoc_version"
else
    echo -e "${YELLOW}⚠${NC} protoc not installed (needed for protocol buffer generation)"
fi

echo
echo "📊 Resource Usage"
echo "================"

if [ "$services_running" = true ]; then
    echo "Container resource usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker-compose -f docker-compose.polyglot.yml ps -q) 2>/dev/null || echo "Could not retrieve container stats"
else
    echo -e "${YELLOW}⚠${NC} Services not running - no resource usage data"
fi

echo
echo "🚀 Quick Commands"
echo "================"
echo "Start services:     make start"
echo "Stop services:      make stop"
echo "View logs:          make logs"
echo "Health check:       make health"
echo "Development setup:  ./setup.sh"
echo "API documentation:  curl http://localhost:8080/health"

echo
echo "📚 Documentation"
echo "================"
echo "Architecture docs:  README-POLYGLOT.md"
echo "Original analysis:  docs/Go\ for\ RAG\ Backend__.md"

# Summary
echo
echo "📋 Summary"
echo "=========="

if [ "$services_running" = true ]; then
    echo -e "${GREEN}🎉 Polyglot architecture is running successfully!${NC}"
    echo -e "${GREEN}✓${NC} Go API Gateway: http://localhost:8080"
    echo -e "   • Python AI Engine: gRPC on port 50051"
    echo -e "   • MongoDB Atlas: ceaser-ad-gini.jokuuab.mongodb.net"
    echo -e "   • Redis Cloud: configured via REDIS_URL"
else
    echo -e "${YELLOW}🔧 Polyglot architecture is set up but not running${NC}"
    echo -e "   Run 'make start' or './setup.sh' to start services"
fi

echo
echo "For detailed documentation, see README-POLYGLOT.md"
