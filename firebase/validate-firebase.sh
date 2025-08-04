#!/bin/bash

# Firebase Configuration Validation Script
# Quick script to validate Firebase setup

set -e

echo "🔥 Firebase Configuration Validation"
echo "===================================="

# Check if firebase folder exists
if [ ! -d "./firebase" ]; then
    echo "❌ Firebase folder not found"
    exit 1
fi

echo "✅ Firebase folder exists"

# Check service account file
if [ -f "./firebase/service-account.json" ]; then
    echo "✅ Service account file found"
    
    # Validate JSON
    if jq . "./firebase/service-account.json" >/dev/null 2>&1; then
        PROJECT_ID=$(jq -r '.project_id' "./firebase/service-account.json")
        echo "✅ Service account JSON is valid (Project: $PROJECT_ID)"
    else
        echo "❌ Service account JSON is invalid"
        exit 1
    fi
else
    echo "⚠️  Service account file not found at ./firebase/service-account.json"
    echo "   Run 'make setup-firebase' to set it up"
fi

# Check Firebase configuration files
FILES=("firebase.json" ".firebaserc" "firebase-config.template.json")
for file in "${FILES[@]}"; do
    if [ -f "./firebase/$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check Docker Compose files
echo ""
echo "🐳 Docker Configuration Check"
echo "-----------------------------"

# Check dev docker compose
if grep -q "/app/firebase" docker-compose.dev.yaml; then
    echo "✅ Development Docker Compose configured for Firebase"
else
    echo "❌ Development Docker Compose missing Firebase configuration"
fi

# Check prod docker compose
if grep -q "/app/firebase" docker-compose.prod.yaml; then
    echo "✅ Production Docker Compose configured for Firebase"
else
    echo "❌ Production Docker Compose missing Firebase configuration"
fi

# Check environment files
echo ""
echo "🌍 Environment Files Check"
echo "-------------------------"

ENV_FILES=("services/python-ai-engine/.env" "services/go-api-gateway/.env" ".env")
for env_file in "${ENV_FILES[@]}"; do
    if [ -f "$env_file" ]; then
        echo "✅ $env_file exists"
        
        # Check for Firebase variables
        if grep -q "FIREBASE_PROJECT_ID" "$env_file"; then
            echo "   ✅ Contains Firebase configuration"
        else
            echo "   ⚠️  Missing Firebase configuration"
        fi
    else
        echo "❌ $env_file missing"
    fi
done

echo ""
echo "🚀 Validation Complete!"
echo ""

if [ -f "./firebase/service-account.json" ]; then
    echo "✅ Firebase is ready to use!"
else
    echo "⚠️  To complete setup, run: make setup-firebase"
fi
