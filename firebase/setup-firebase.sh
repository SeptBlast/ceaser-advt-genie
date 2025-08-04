#!/bin/bash

# Firebase Configuration Setup Script
# This script helps set up Firebase configuration for the AdGenius platform

set -e

FIREBASE_DIR="./firebase"
PROJECT_ROOT="$(pwd)"

echo "🔥 Firebase Configuration Setup for AdGenius"
echo "=============================================="

# Ensure we're in the project root
if [ ! -f "docker-compose.dev.yaml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Create firebase directory if it doesn't exist
if [ ! -d "$FIREBASE_DIR" ]; then
    echo "📁 Creating firebase directory..."
    mkdir -p "$FIREBASE_DIR"
fi

# Function to check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        echo "⚠️  Firebase CLI not found. Installing..."
        npm install -g firebase-tools
    else
        echo "✅ Firebase CLI is already installed"
    fi
}

# Function to setup service account
setup_service_account() {
    echo ""
    echo "🔐 Service Account Setup"
    echo "------------------------"
    
    if [ ! -f "$FIREBASE_DIR/service-account.json" ]; then
        echo "📋 Please follow these steps to set up your Firebase service account:"
        echo ""
        echo "1. Go to Firebase Console: https://console.firebase.google.com/"
        echo "2. Select your project: ceaseradvtgenerator"
        echo "3. Go to Project Settings > Service Accounts"
        echo "4. Click 'Generate new private key'"
        echo "5. Save the downloaded file as: $FIREBASE_DIR/service-account.json"
        echo ""
        read -p "Press Enter when you have placed the service account file..."
        
        if [ ! -f "$FIREBASE_DIR/service-account.json" ]; then
            echo "❌ Service account file not found. Please place it at: $FIREBASE_DIR/service-account.json"
            exit 1
        fi
    fi
    
    echo "✅ Service account configuration found"
}

# Function to setup environment variables
setup_environment() {
    echo ""
    echo "🌍 Environment Variables Setup"
    echo "------------------------------"
    
    # Check if .env files exist
    ENV_FILES=("services/python-ai-engine/.env" "services/go-api-gateway/.env" ".env")
    
    for env_file in "${ENV_FILES[@]}"; do
        if [ ! -f "$env_file" ]; then
            echo "📝 Creating $env_file template..."
            case "$env_file" in
                "services/python-ai-engine/.env")
                    cat > "$env_file" << EOF
# Firebase Configuration
FIREBASE_PROJECT_ID=ceaseradvtgenerator
GOOGLE_APPLICATION_CREDENTIALS=/app/firebase/service-account.json

# LLM API Keys
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Redis Configuration (Remote)
REDIS_URL=your_redis_url_here

# Development Settings
LOG_LEVEL=DEBUG
LOG_FORMAT=json
EOF
                    ;;
                "services/go-api-gateway/.env")
                    cat > "$env_file" << EOF
# Application Configuration
GIN_MODE=debug
PORT=8080
LOG_LEVEL=debug

# Firebase Configuration
FIREBASE_PROJECT_ID=ceaseradvtgenerator
GOOGLE_APPLICATION_CREDENTIALS=/app/firebase/service-account.json

# Redis Configuration (Remote)
REDIS_HOST=your_redis_host_here
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here
REDIS_TLS=true

# AI Engine Configuration
AI_ENGINE_ADDRESS=python-ai-engine:50051
AI_ENGINE_TIMEOUT=30s
EOF
                    ;;
                ".env")
                    cat > "$env_file" << EOF
# Firebase Configuration
FIREBASE_PROJECT_ID=ceaseradvtgenerator

# Frontend Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBSKSmGFHqPeJHSxCjPbQeBk1p0_NYnkoE
VITE_FIREBASE_AUTH_DOMAIN=ceaseradvtgenerator.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ceaseradvtgenerator
VITE_FIREBASE_STORAGE_BUCKET=ceaseradvtgenerator.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=264142471895
VITE_FIREBASE_APP_ID=1:264142471895:web:93f12742d042c09eb2a692
VITE_FIREBASE_MEASUREMENT_ID=G-LJXQZ4GZ4T

# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_GO_API_BASE_URL=http://localhost:8080

# Redis Configuration (Remote)
REDIS_URL=your_redis_url_here
REDIS_HOST=your_redis_host_here
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here
REDIS_TLS=true

# LLM API Keys
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
EOF
                    ;;
            esac
        else
            echo "✅ $env_file already exists"
        fi
    done
}

# Function to validate configuration
validate_config() {
    echo ""
    echo "🔍 Validating Configuration"
    echo "---------------------------"
    
    # Check service account
    if [ -f "$FIREBASE_DIR/service-account.json" ]; then
        # Basic JSON validation
        if jq . "$FIREBASE_DIR/service-account.json" >/dev/null 2>&1; then
            PROJECT_ID=$(jq -r '.project_id' "$FIREBASE_DIR/service-account.json")
            echo "✅ Service account is valid (Project: $PROJECT_ID)"
        else
            echo "❌ Service account JSON is invalid"
            exit 1
        fi
    else
        echo "❌ Service account file missing"
        exit 1
    fi
    
    # Check Firebase configuration files
    if [ -f "$FIREBASE_DIR/firebase.json" ]; then
        echo "✅ Firebase configuration found"
    else
        echo "❌ Firebase configuration missing"
    fi
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo "🚀 Next Steps"
    echo "============="
    echo ""
    echo "1. Edit your environment files with actual values:"
    echo "   - services/python-ai-engine/.env"
    echo "   - services/go-api-gateway/.env"
    echo "   - .env"
    echo ""
    echo "2. Start the development environment:"
    echo "   docker-compose -f docker-compose.dev.yaml up --build"
    echo ""
    echo "3. For production deployment:"
    echo "   docker-compose -f docker-compose.prod.yaml up --build"
    echo ""
    echo "4. Firebase emulators (optional for development):"
    echo "   cd firebase && firebase emulators:start"
    echo ""
}

# Main execution
main() {
    check_firebase_cli
    setup_service_account
    setup_environment
    validate_config
    show_next_steps
    
    echo "✅ Firebase configuration setup complete!"
}

# Run main function
main "$@"
