#!/bin/bash

# Ceaser Ad Business Helm Chart Deployment Script
# Usage: ./deploy.sh [environment] [namespace]

set -e

ENVIRONMENT=${1:-development}
NAMESPACE=${2:-adgenius}
CHART_PATH="helm/ceaser-ad-business"

echo "🚀 Deploying Ceaser Ad Business Platform"
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo "=================================="

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed. Please install Helm first."
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Create namespace if it doesn't exist
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "📁 Creating namespace: $NAMESPACE"
    kubectl create namespace "$NAMESPACE"
fi

# Determine values file based on environment
VALUES_FILE="values.yaml"
if [ "$ENVIRONMENT" = "development" ]; then
    VALUES_FILE="values-development.yaml"
elif [ "$ENVIRONMENT" = "production" ]; then
    VALUES_FILE="values-production.yaml"
fi

echo "📋 Using values file: $VALUES_FILE"

# Check if chart directory exists
if [ ! -d "$CHART_PATH" ]; then
    echo "❌ Chart directory not found: $CHART_PATH"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Lint the chart
echo "🔍 Linting Helm chart..."
helm lint "$CHART_PATH"

# Dry run to validate
echo "🧪 Performing dry run..."
helm install adgenius "$CHART_PATH" \
    --namespace "$NAMESPACE" \
    --values "$CHART_PATH/$VALUES_FILE" \
    --dry-run --debug > /dev/null

# Install or upgrade the chart
if helm list -n "$NAMESPACE" | grep -q "adgenius"; then
    echo "⬆️  Upgrading existing deployment..."
    helm upgrade adgenius "$CHART_PATH" \
        --namespace "$NAMESPACE" \
        --values "$CHART_PATH/$VALUES_FILE" \
        --wait --timeout=10m
else
    echo "📦 Installing new deployment..."
    helm install adgenius "$CHART_PATH" \
        --namespace "$NAMESPACE" \
        --values "$CHART_PATH/$VALUES_FILE" \
        --wait --timeout=10m
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Checking deployment status..."
kubectl get all -l app.kubernetes.io/instance=adgenius -n "$NAMESPACE"

echo ""
echo "🔗 Access URLs:"
if [ "$ENVIRONMENT" = "development" ]; then
    echo "Frontend: http://localhost (with port-forward)"
    echo "API Gateway: http://localhost:8080/api (with port-forward)"
    echo ""
    echo "To access the application locally:"
    echo "kubectl port-forward svc/adgenius-frontend 8080:80 -n $NAMESPACE"
else
    echo "Check your ingress configuration for external access URLs"
fi

echo ""
echo "📝 Useful commands:"
echo "View logs: kubectl logs -l app.kubernetes.io/instance=adgenius -n $NAMESPACE"
echo "Get status: kubectl get all -l app.kubernetes.io/instance=adgenius -n $NAMESPACE"
echo "Run tests: helm test adgenius -n $NAMESPACE"
echo "Uninstall: helm uninstall adgenius -n $NAMESPACE"
