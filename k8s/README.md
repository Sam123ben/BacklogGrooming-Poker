# Kubernetes Deployment Guide

This document provides detailed information about deploying the Planning Poker application to Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- kubectl configured with cluster access
- Helm 3.0+ (optional)
- cert-manager v1.13.0+ (for TLS)

## Directory Structure

```
k8s/
├── base/                 # Base Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── kustomization.yaml
├── overlays/            # Environment-specific overlays
│   ├── development/
│   └── production/
└── README.md
```

## Deployment Methods

### Using Kustomize

1. Development:
   ```bash
   kubectl apply -k overlays/development
   ```

2. Production:
   ```bash
   kubectl apply -k overlays/production
   ```

### Using Helm

1. Install the chart:
   ```bash
   helm install planning-poker ./helm/planning-poker \
     --namespace planning-poker \
     --create-namespace \
     --set ingress.hosts[0].host=your-domain.com
   ```

2. Upgrade existing installation:
   ```bash
   helm upgrade planning-poker ./helm/planning-poker \
     --namespace planning-poker \
     --set image.tag=new-version
   ```

## Configuration

### Environment Variables

Configure these in the deployment manifests:

```yaml
env:
  - name: NEXT_PUBLIC_APP_URL
    value: "https://your-domain.com"
  - name: NEXT_PUBLIC_APP_NAME
    value: "Planning Poker"
```

### Resource Limits

```yaml
resources:
  limits:
    cpu: "1"
    memory: "512Mi"
  requests:
    cpu: "200m"
    memory: "256Mi"
```

### Autoscaling

```yaml
autoscaling:
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

## Monitoring

### Prometheus Integration

ServiceMonitor configuration:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: planning-poker
spec:
  endpoints:
    - port: http
      path: /metrics
  selector:
    matchLabels:
      app: planning-poker
```

### Health Checks

Probe configuration:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: http
readinessProbe:
  httpGet:
    path: /health
    port: http
```

## Security

### Pod Security

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  readOnlyRootFilesystem: true
```

### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: planning-poker
spec:
  podSelector:
    matchLabels:
      app: planning-poker
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
```

## Troubleshooting

### Common Issues

1. Pod startup failures:
   ```bash
   kubectl describe pod -l app=planning-poker
   kubectl logs -l app=planning-poker
   ```

2. Service connectivity:
   ```bash
   kubectl port-forward svc/planning-poker 8080:80
   curl localhost:8080/health
   ```

3. Ingress issues:
   ```bash
   kubectl describe ingress planning-poker
   kubectl get events --field-selector involvedObject.kind=Ingress
   ```

### Debug Tools

```bash
# Interactive shell in pod
kubectl exec -it deploy/planning-poker -- sh

# Network debugging
kubectl run nettest --rm -it --image=nicolaka/netshoot -- bash
```

## Cleanup

```bash
# Remove all resources
kubectl delete namespace planning-poker

# Remove Helm release
helm uninstall planning-poker -n planning-poker
```