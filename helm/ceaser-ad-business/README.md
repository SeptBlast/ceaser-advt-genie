# Ceaser Ad Business Helm Chart

This Helm chart deploys the Ceaser Ad Business multi-tenant generative AI advertising platform on Kubernetes.

## Overview

The Ceaser Ad Business platform consists of:

- **Frontend**: React-based web application with TypeScript and Vite
- **Go API Gateway**: RESTful API gateway built with Go and Gin
- **Python AI Engine**: AI/ML service using LangChain, gRPC, and various AI providers
- **Qdrant**: Vector database for AI embeddings
- **Redis**: Caching and session storage
- **PostgreSQL**: Primary database (optional, can use external)

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- PV provisioner support in the underlying infrastructure (for persistent storage)

## Installing the Chart

### Quick Start (Development)

```bash
# Add the chart repository (if you publish it)
helm repo add ceaser-ad-business https://your-chart-repo.com

# Create namespace
kubectl create namespace adgenius

# Install with development values
helm install adgenius ceaser-ad-business/ceaser-ad-business \
  --namespace adgenius \
  --values values-development.yaml
```

### From Source

```bash
# Clone the repository
git clone https://github.com/SeptBlast/ceaser-advt-genie.git
cd ceaser-advt-genie/helm/ceaser-ad-business

# Install the chart
helm install adgenius . --namespace adgenius --create-namespace
```

### Production Deployment

```bash
# Install with production values
helm install adgenius . \
  --namespace adgenius-prod \
  --create-namespace \
  --values values-production.yaml \
  --set secrets.firebase.projectId="your-firebase-project" \
  --set secrets.apiKeys.openai="your-openai-key" \
  --set secrets.apiKeys.google="your-google-key" \
  --set ingress.hosts[0].host="adgenius.yourdomain.com"
```

## Configuration

### Required Secrets

Before deploying to production, you must configure the following secrets:

```yaml
secrets:
  firebase:
    projectId: "your-firebase-project-id"
    databaseId: "your-firebase-database-id"
    storageBucket: "your-firebase-bucket.appspot.com"
    serviceAccountKey: "base64-encoded-service-account-json"

  apiKeys:
    openai: "your-openai-api-key"
    google: "your-google-api-key"
    runway: "your-runway-api-key"
    pika: "your-pika-api-key"
    stability: "your-stability-api-key"
    luma: "your-luma-api-key"
```

### Key Configuration Parameters

| Parameter                | Description                       | Default |
| ------------------------ | --------------------------------- | ------- |
| `frontend.enabled`       | Enable frontend deployment        | `true`  |
| `frontend.replicaCount`  | Number of frontend replicas       | `2`     |
| `goApiGateway.enabled`   | Enable Go API Gateway             | `true`  |
| `pythonAiEngine.enabled` | Enable Python AI Engine           | `true`  |
| `qdrant.enabled`         | Enable Qdrant vector database     | `true`  |
| `redis.enabled`          | Enable internal Redis             | `true`  |
| `postgresql.enabled`     | Enable internal PostgreSQL        | `true`  |
| `ingress.enabled`        | Enable ingress controller         | `true`  |
| `autoscaling.enabled`    | Enable horizontal pod autoscaling | `false` |

### Image Configuration

```yaml
global:
  imageRegistry: "your-registry.com"
  imagePullSecrets:
    - name: registry-secret

frontend:
  image:
    repository: ceaser-ad-business/frontend
    tag: "v1.0.0"
    pullPolicy: IfNotPresent
```

### Resource Management

```yaml
frontend:
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi

pythonAiEngine:
  resources:
    limits:
      cpu: 2000m
      memory: 4Gi
    requests:
      cpu: 1000m
      memory: 2Gi
```

### Ingress Configuration

```yaml
ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: adgenius.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
          service:
            name: frontend
            port: 80
        - path: /api
          pathType: Prefix
          service:
            name: go-api-gateway
            port: 8080
  tls:
    - secretName: adgenius-tls
      hosts:
        - adgenius.yourdomain.com
```

## External Dependencies

### External Redis

For production, it's recommended to use an external Redis service:

```yaml
redis:
  enabled: false

externalRedis:
  url: "redis://your-redis-host:6379"
```

### External PostgreSQL

For production, use an external PostgreSQL database:

```yaml
postgresql:
  enabled: false

externalPostgresql:
  url: "postgresql://user:password@your-postgres-host:5432/adgenius"
```

## Monitoring and Observability

### Prometheus Integration

```yaml
monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
    namespace: monitoring
    interval: 30s
```

### Health Checks

The chart includes comprehensive health checks:

- HTTP health checks for frontend and API gateway
- gRPC health checks for Python AI Engine
- Database connectivity checks

## Security

### Network Policies

```yaml
networkPolicy:
  enabled: true
```

### Pod Security

```yaml
podSecurityContext:
  fsGroup: 2000

securityContext:
  capabilities:
    drop:
      - ALL
  readOnlyRootFilesystem: false
  runAsNonRoot: true
  runAsUser: 1000
```

## Scaling

### Horizontal Pod Autoscaling

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

### Pod Disruption Budgets

```yaml
podDisruptionBudget:
  enabled: true
  minAvailable: 1
```

## Storage

### Qdrant Persistence

```yaml
qdrant:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"
```

## Environment-Specific Deployments

### Development Environment

Use `values-development.yaml` for local development with:

- Single replicas
- Internal databases
- Debug logging
- No TLS
- Minimal resources

### Production Environment

Use `values-production.yaml` for production with:

- Multiple replicas
- External databases
- Production logging
- TLS enabled
- Proper resource limits
- Monitoring enabled
- Network policies

## Upgrading

```bash
# Upgrade with new values
helm upgrade adgenius . \
  --namespace adgenius \
  --values values-production.yaml

# Rollback if needed
helm rollback adgenius 1 --namespace adgenius
```

## Uninstalling

```bash
helm uninstall adgenius --namespace adgenius
```

## Testing

```bash
# Run helm tests
helm test adgenius --namespace adgenius

# Check pod status
kubectl get pods -n adgenius

# View logs
kubectl logs -l app.kubernetes.io/name=ceaser-ad-business -n adgenius
```

## Troubleshooting

### Common Issues

1. **Pod startup failures**: Check resource limits and node capacity
2. **Service connectivity**: Verify network policies and service discovery
3. **External API failures**: Check API keys and network egress rules
4. **Database connections**: Verify database credentials and connectivity

### Debug Commands

```bash
# Check all resources
kubectl get all -l app.kubernetes.io/instance=adgenius -n adgenius

# Describe problematic pods
kubectl describe pod <pod-name> -n adgenius

# View events
kubectl get events -n adgenius --sort-by='.lastTimestamp'

# Port forward for direct access
kubectl port-forward svc/adgenius-go-api-gateway 8080:8080 -n adgenius
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `helm lint` and `helm template`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- GitHub Issues: https://github.com/SeptBlast/ceaser-advt-genie/issues
- Documentation: https://github.com/SeptBlast/ceaser-advt-genie/docs
