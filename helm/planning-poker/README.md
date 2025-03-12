# Planning Poker Helm Chart

This Helm chart deploys the Planning Poker application on Kubernetes with support for Redis, automatic scaling, monitoring, and TLS certificate management.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- cert-manager v1.13.0+ (for TLS)
- Nginx Ingress Controller
- Prometheus Operator (optional)

## Installation

1. Add the Helm repository:
   ```bash
   helm repo add planning-poker https://your-org.github.io/planning-poker
   helm repo update
   ```

2. Install cert-manager (if not installed):
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   kubectl wait --for=condition=Ready pods -n cert-manager --all
   ```

3. Install the chart:
   ```bash
   helm install planning-poker . \
     --namespace planning-poker \
     --create-namespace \
     --set ingress.hosts[0].host=your-domain.com \
     --set certificates.clusterIssuer.email=your-email@example.com
   ```

## Configuration

### Global Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `nameOverride` | Override chart name | `""` |
| `fullnameOverride` | Override full name | `""` |
| `replicaCount` | Number of replicas | `2` |

### Image Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.repository` | Image repository | `planning-poker` |
| `image.tag` | Image tag | `latest` |
| `image.pullPolicy` | Pull policy | `IfNotPresent` |

### Resource Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `resources.limits.cpu` | CPU limit | `200m` |
| `resources.limits.memory` | Memory limit | `256Mi` |
| `resources.requests.cpu` | CPU request | `100m` |
| `resources.requests.memory` | Memory request | `128Mi` |

### Redis Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `redis.enabled` | Enable Redis | `true` |
| `redis.architecture` | Redis architecture | `standalone` |
| `redis.persistence.enabled` | Enable persistence | `true` |
| `redis.persistence.size` | Storage size | `10Gi` |

### Certificate Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `certificates.enabled` | Enable TLS | `true` |
| `certificates.issuerRef.kind` | Issuer kind | `ClusterIssuer` |
| `certificates.issuerRef.name` | Issuer name | `letsencrypt-prod` |
| `certificates.duration` | Cert duration | `2160h` |
| `certificates.renewBefore` | Renewal period | `360h` |

### Ingress Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class | `nginx` |
| `ingress.hosts[0].host` | Hostname | `planning-poker.example.com` |
| `ingress.tls[0].secretName` | TLS secret | `planning-poker-tls` |

### Monitoring Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `metrics.enabled` | Enable metrics | `true` |
| `metrics.serviceMonitor.enabled` | Enable ServiceMonitor | `true` |
| `metrics.serviceMonitor.interval` | Scrape interval | `30s` |

## Environment Variables

Configure application settings in `values.yaml`:

```yaml
env:
  NEXT_PUBLIC_APP_URL: https://your-domain.com
  NEXT_PUBLIC_APP_NAME: Planning Poker
  REDIS_HOST: redis
  REDIS_PORT: "6379"
  REDIS_SSL: "false"
```

## Examples

### Basic Installation
```bash
helm install planning-poker . \
  --namespace planning-poker \
  --create-namespace
```

### Production Setup
```bash
helm install planning-poker . \
  --namespace planning-poker \
  --values values-prod.yaml \
  --set ingress.hosts[0].host=poker.example.com \
  --set redis.persistence.size=20Gi
```

### Development Environment
```bash
helm install planning-poker . \
  --namespace planning-poker-dev \
  --values values-dev.yaml \
  --set ingress.hosts[0].host=dev.poker.example.com
```

## Upgrading

To upgrade the release:
```bash
helm upgrade planning-poker . \
  --namespace planning-poker \
  --reuse-values \
  --set image.tag=new-version
```

## Monitoring

### Prometheus Integration

1. Enable metrics:
   ```yaml
   metrics:
     enabled: true
     serviceMonitor:
       enabled: true
   ```

2. Access metrics:
   ```bash
   kubectl port-forward svc/planning-poker 9090:9090
   ```

### Health Checks

The chart configures:
- Liveness probe: `/health`
- Readiness probe: `/health`
- Startup probe: `/health`

## Security

### Pod Security

```yaml
securityContext:
  runAsNonRoot: true
  readOnlyRootFilesystem: true
```

### Network Policies

```yaml
networkPolicy:
  enabled: true
  ingressRules:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
```

## Troubleshooting

### Common Issues

1. Certificate Issues:
   ```bash
   kubectl get certificate -n planning-poker
   kubectl describe certificate planning-poker-tls
   ```

2. Pod Startup:
   ```bash
   kubectl describe pod -l app=planning-poker
   kubectl logs -l app=planning-poker
   ```

3. Redis Connection:
   ```bash
   kubectl exec -it planning-poker-redis-0 -- redis-cli ping
   ```

### Debug Tools

```bash
# Check pod status
kubectl get pods -n planning-poker

# View logs
kubectl logs -f deployment/planning-poker

# Redis shell
kubectl exec -it planning-poker-redis-0 -- redis-cli
```

## Uninstallation

Remove the release:
```bash
helm uninstall planning-poker -n planning-poker
```

Clean up PVCs:
```bash
kubectl delete pvc -l app=planning-poker
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License