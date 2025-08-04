#!/bin/bash

# Setup script for Ceaser Ad Business Polyglot Architecture
echo "🚀 Setting up Ceaser Ad Business Polyglot Architecture"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check Go (for local development)
if ! command -v go &> /dev/null; then
    print_warning "Go is not installed. You'll need Go 1.21+ for local development."
else
    GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
    print_status "Go version: $GO_VERSION"
fi

# Check Python (for local development)
if ! command -v python3 &> /dev/null; then
    print_warning "Python 3 is not installed. You'll need Python 3.11+ for local development."
else
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    print_status "Python version: $PYTHON_VERSION"
fi

echo ""
echo "☁️ Cloud Configuration Notice"
echo "============================="
print_status "This architecture is configured for cloud services:"
print_status "• MongoDB Atlas (configured)"
print_status "• Redis Cloud (requires configuration)"
echo ""
print_warning "IMPORTANT: Configure your Redis Cloud URL in the .env files"
print_warning "See docs/CLOUD_CONFIGURATION.md for detailed setup instructions"
echo ""
print_status "MongoDB Atlas connection details:"
print_status "• Host: ceaser-ad-gini.jokuuab.mongodb.net"
print_status "• Database: ceaser-advt-genie"
print_status "• Username: developer"
echo ""

# Setup environment files
echo ""
echo "⚙️ Setting up environment files..."

# Copy environment files if they don't exist
if [ ! -f "services/go-api-gateway/.env" ]; then
    cp services/go-api-gateway/.env.example services/go-api-gateway/.env
    print_status "Created Go API Gateway .env file"
    print_warning "Please configure your environment variables in services/go-api-gateway/.env"
fi

if [ ! -f "services/python-ai-engine/.env" ]; then
    cp services/python-ai-engine/.env.example services/python-ai-engine/.env
    print_status "Created Python AI Engine .env file"
    print_warning "Please configure your API keys in services/python-ai-engine/.env"
fi

# Generate Protocol Buffers
echo ""
echo "🔧 Generating Protocol Buffers..."

# Check if protoc is installed
if command -v protoc &> /dev/null; then
    print_status "Generating Go protobuf files..."
    cd proto
    protoc --go_out=../services/go-api-gateway/proto --go_opt=paths=source_relative \
           --go-grpc_out=../services/go-api-gateway/proto --go-grpc_opt=paths=source_relative \
           ai_engine.proto
    
    print_status "Generating Python protobuf files..."
    python3 -m grpc_tools.protoc -I. --python_out=../services/python-ai-engine/proto \
                                       --grpc_python_out=../services/python-ai-engine/proto \
                                       ai_engine.proto
    cd ..
else
    print_warning "protoc not found. Skipping protocol buffer generation."
    print_warning "Install protoc and run: make proto"
fi

# Setup Go dependencies
echo ""
echo "📦 Setting up Go dependencies..."
cd services/go-api-gateway
if [ -f "go.mod" ]; then
    go mod tidy
    print_status "Go dependencies updated"
else
    print_warning "go.mod not found in Go service"
fi
cd ../..

# Setup Python virtual environment and dependencies
echo ""
echo "🐍 Setting up Python environment..."
cd services/python-ai-engine

if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

print_status "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

cd ../..

# Final instructions
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables:"
echo "   - Add OpenAI API key to services/python-ai-engine/.env"
echo "   - Add Google API key to services/python-ai-engine/.env (optional)"
echo ""
echo "2. Start the services:"
echo "   make start"
echo ""
echo "3. Check service health:"
echo "   make health"
echo ""
echo "4. View logs:"
echo "   make logs"
echo ""
echo "5. Access the services:"
echo "   - Frontend: http://localhost:3000"
echo "   - API Gateway: http://localhost:8080"
echo "   - MongoDB: localhost:27017"
echo "   - Redis: localhost:6379"
echo ""
echo "For development:"
echo "   - Run Go service locally: make dev-go"
echo "   - Run Python service locally: make dev-python"
echo ""
print_status "Happy coding! 🚀"
