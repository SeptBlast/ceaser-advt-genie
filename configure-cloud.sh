#!/bin/bash

# Cloud Environment Configuration Script
# This script helps you configure Redis Cloud and MongoDB Atlas credentials

echo "☁️ Ceaser Ad Business - Cloud Configuration Helper"
echo "================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo
echo "This script will help you configure cloud services for your polyglot architecture."
echo

# Check if environment files exist
GO_ENV_FILE="services/go-api-gateway/.env"
PYTHON_ENV_FILE="services/python-ai-engine/.env"

if [ ! -f "$GO_ENV_FILE" ] || [ ! -f "$PYTHON_ENV_FILE" ]; then
    print_error "Environment files not found. Run ./setup.sh first."
    exit 1
fi

echo "🔴 Redis Cloud Configuration"
echo "============================"
echo
echo "1. Create account at https://redis.com/redis-enterprise-cloud/"
echo "2. Create a new database"
echo "3. Get your connection details"
echo

read -p "Do you have your Redis Cloud connection details? (y/n): " has_redis
if [ "$has_redis" = "y" ]; then
    echo
    echo "Please enter your Redis Cloud connection details:"
    read -p "Redis Endpoint (e.g., redis-11552.c301.ap-south-1-1.ec2.redns.redis-cloud.com): " redis_endpoint
    read -p "Redis Port (e.g., 11552): " redis_port
    read -p "Redis Username (usually 'default'): " redis_username
    read -p "Redis Password: " redis_password
    
    if [ -n "$redis_endpoint" ] && [ -n "$redis_port" ] && [ -n "$redis_username" ] && [ -n "$redis_password" ]; then
        redis_url="redis://${redis_username}:${redis_password}@${redis_endpoint}:${redis_port}"
        
        # Update Go service .env
        if grep -q "REDIS_URL=" "$GO_ENV_FILE"; then
            sed -i.bak "s|REDIS_URL=.*|REDIS_URL=${redis_url}|" "$GO_ENV_FILE"
        else
            echo "REDIS_URL=${redis_url}" >> "$GO_ENV_FILE"
        fi
        
        # Update Python service .env  
        if grep -q "REDIS_URL=" "$PYTHON_ENV_FILE"; then
            sed -i.bak "s|REDIS_URL=.*|REDIS_URL=${redis_url}|" "$PYTHON_ENV_FILE"
        else
            echo "REDIS_URL=${redis_url}" >> "$PYTHON_ENV_FILE"
        fi
        
        print_status "Redis Cloud URL configured in both services"
    else
        print_warning "Missing Redis details. Please configure manually in .env files"
    fi
else
    print_warning "Please set up Redis Cloud and run this script again"
    echo "Or manually add REDIS_URL to both .env files:"
    echo "REDIS_URL=redis://username:password@endpoint:port"
    echo ""
    echo "Example format:"
    echo "REDIS_URL=redis://default:CRxqRlrx7wB6srqs1cFfBE6lM3X7ISS4@redis-11552.c301.ap-south-1-1.ec2.redns.redis-cloud.com:11552"
fi

echo
echo "🍃 MongoDB Atlas Configuration"
echo "============================="
echo
print_status "MongoDB Atlas is already configured:"
echo "• Host: ceaser-ad-gini.jokuuab.mongodb.net"
echo "• Database: ceaser-advt-genie"
echo "• Username: developer"
echo
print_warning "Ensure your MongoDB Atlas cluster is:"
print_warning "1. Running and accessible"
print_warning "2. Has the correct database user configured"
print_warning "3. Network access allows your deployment IP"

echo
echo "🤖 AI Service Configuration"
echo "==========================="
echo
read -p "Do you have OpenAI API key? (y/n): " has_openai
if [ "$has_openai" = "y" ]; then
    read -p "Enter your OpenAI API key: " openai_key
    if [ -n "$openai_key" ]; then
        if grep -q "OPENAI_API_KEY=" "$PYTHON_ENV_FILE"; then
            sed -i.bak "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=${openai_key}|" "$PYTHON_ENV_FILE"
        else
            echo "OPENAI_API_KEY=${openai_key}" >> "$PYTHON_ENV_FILE"
        fi
        print_status "OpenAI API key configured"
    fi
fi

read -p "Do you have Google AI API key? (y/n): " has_google
if [ "$has_google" = "y" ]; then
    read -p "Enter your Google AI API key: " google_key
    if [ -n "$google_key" ]; then
        if grep -q "GOOGLE_API_KEY=" "$PYTHON_ENV_FILE"; then
            sed -i.bak "s|GOOGLE_API_KEY=.*|GOOGLE_API_KEY=${google_key}|" "$PYTHON_ENV_FILE"
        else
            echo "GOOGLE_API_KEY=${google_key}" >> "$PYTHON_ENV_FILE"
        fi
        print_status "Google AI API key configured"
    fi
fi

echo
echo "✅ Configuration Summary"
echo "======================="

# Check what's configured
redis_configured=$(grep -q "REDIS_URL=redis://" "$GO_ENV_FILE" && echo "Yes" || echo "No")
openai_configured=$(grep -q "OPENAI_API_KEY=.." "$PYTHON_ENV_FILE" && echo "Yes" || echo "No")
google_configured=$(grep -q "GOOGLE_API_KEY=.." "$PYTHON_ENV_FILE" && echo "Yes" || echo "No")

echo "• MongoDB Atlas: ✓ Configured"
echo "• Redis Cloud: $redis_configured"
echo "• OpenAI API: $openai_configured"
echo "• Google AI API: $google_configured"

echo
echo "🚀 Next Steps"
echo "============"
echo "1. Review your .env files:"
echo "   • $GO_ENV_FILE"
echo "   • $PYTHON_ENV_FILE"
echo
echo "2. Start the services:"
echo "   make start"
echo
echo "3. Verify setup:"
echo "   ./status-check.sh"
echo
echo "📚 For detailed setup instructions, see:"
echo "   docs/CLOUD_CONFIGURATION.md"

# Clean up backup files
rm -f "$GO_ENV_FILE.bak" "$PYTHON_ENV_FILE.bak" 2>/dev/null

echo
print_status "Configuration complete! 🎉"
