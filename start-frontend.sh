#!/bin/bash

# AdGenius Frontend Development Setup
# This script helps set up and run the frontend development environment

set -e

echo "🚀 AdGenius Frontend Setup & Development"
echo "========================================"

# Check Node.js version
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Navigate to frontend directory
cd frontend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check environment file
if [ ! -f ".env" ]; then
    echo "⚙️  Setting up environment configuration..."
    cp .env.example .env
    echo "✅ Environment file created (.env)"
    echo "📝 Please update .env with your API configuration if needed"
else
    echo "✅ Environment file exists"
fi

# Check if backend is running
echo "🔍 Checking backend connectivity..."
BACKEND_URL=$(grep VITE_API_BASE_URL .env | cut -d'=' -f2)
if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "✅ Backend is running at $BACKEND_URL"
else
    echo "⚠️  Backend not detected at $BACKEND_URL"
    echo "   Make sure your Go API Gateway is running:"
    echo "   cd ../services/go-api-gateway && go run cmd/main.go"
fi

# Show current configuration
echo ""
echo "📋 Current Configuration:"
echo "========================"
cat .env

echo ""
echo "🎯 Quick Start Commands:"
echo "========================"
echo "Development server:  npm run dev"
echo "Type checking:       npm run type-check"
echo "Build production:    npm run build"
echo "Preview build:       npm run preview"
echo "Linting:            npm run lint"

echo ""
echo "🌐 URLs:"
echo "========"
echo "Frontend:    http://localhost:5173"
echo "Backend:     $BACKEND_URL"

# Option to start development server
echo ""
read -p "🚀 Start development server now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting development server..."
    echo "   Access the app at: http://localhost:5173"
    echo "   Press Ctrl+C to stop"
    echo ""
    npm run dev
else
    echo "✅ Setup complete! Run 'npm run dev' in the frontend directory to start development."
fi
