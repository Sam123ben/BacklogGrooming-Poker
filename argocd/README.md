# ArgoCD Configuration Guide

This directory contains the ArgoCD configuration for deploying and managing the Planning Poker application across multiple environments.

## Overview

The ArgoCD configuration consists of:

- **Application Sets**: Manages multiple environments (dev, staging, prod)
- **Project**: Defines permissions, source repos, and deployment targets
- **Root Application**: Manages the ArgoCD configurations themselves

## Directory Structure

```
argocd/
├── applicationset.yaml   # Environment-specific application definitions
├── application.yaml     # Root application configuration
├── project.yaml        # Project settings and permissions
└── README.md          # This documentation
```

## Configuration Details

### Application Set

The `applicationset.yaml` manages deployments across environments:

- **Development**: Uses `develop` branch
  - Namespace: `planning-poker-dev`
  - Values: `values-dev.yaml`

- **Staging**: Uses `staging` branch
  - Namespace: `planning-poker-stage`
  - Values: `values-stage.yaml`

- **Production**: Uses `main` branch
  - Namespace: `planning-poker-prod`
  - Values: `values-prod.yaml`

Features:
- Automated sync policies
- Pruning of removed resources
- Self-healing capabilities
- Retry logic for failed syncs

### Project Configuration

The `project.yaml` defines:

1. **Source Repositories**:
   - Application repository
   - Helm chart repositories

2. **Destination Rules**:
   - Allowed clusters
   - Namespace restrictions

3. **Resource Permissions**:
   - Cluster-scoped resources
   - Namespace-scoped resources

4. **Sync Windows**:
   - Development: Always allowed
   - Staging: Always allowed
   - Production: Sundays at 2 AM only

5. **RBAC Roles**:
   - Developer: Development access only
   - Reviewer: Read access + staging sync
   - Admin: Full access to all environments

### Root Application

The `application.yaml` manages:
- ArgoCD configurations
- Automated sync of ArgoCD resources
- Self-healing of configurations

## Usage

### Installation

1. Apply the project:
   ```bash
   kubectl apply -f project.yaml
   ```

2. Apply the root application:
   ```bash
   kubectl apply -f application.yaml
   ```

3. Apply the application set:
   ```bash
   kubectl apply -f applicationset.yaml
   ```

### Monitoring

1. Check application status:
   ```bash
   argocd app get planning-poker-development
   argocd app get planning-poker-staging
   argocd app get planning-poker-production
   ```

2. View sync history:
   ```bash
   argocd app history planning-poker-development
   ```

3. Check project status:
   ```bash
   argocd proj get planning-poker
   ```

### Manual Operations

1. Force sync:
   ```bash
   argocd app sync planning-poker-development
   ```

2. Rollback:
   ```bash
   argocd app rollback planning-poker-production
   ```

3. Refresh:
   ```bash
   argocd app refresh planning-poker-staging
   ```

## Security

### RBAC Configuration

1. Developer Role:
   ```yaml
   - name: developer
     policies:
     - p, proj:planning-poker:developer, applications, get, planning-poker/planning-poker-development, allow
     - p, proj:planning-poker:developer, applications, sync, planning-poker/planning-poker-development, allow
   ```

2. Reviewer Role:
   ```yaml
   - name: reviewer
     policies:
     - p, proj:planning-poker:reviewer, applications, get, planning-poker/*, allow
     - p, proj:planning-poker:reviewer, applications, sync, planning-poker/planning-poker-staging, allow
   ```

### Resource Protection

1. Cluster Resources:
   - Limited to specific API groups
   - Restricted to necessary resources

2. Namespace Resources:
   - Full access within allowed namespaces
   - Protected by RBAC policies

## Troubleshooting

### Common Issues

1. Sync Failures:
   ```bash
   argocd app logs planning-poker-development
   kubectl logs -n argocd deployment/argocd-application-controller
   ```

2. Permission Issues:
   ```bash
   argocd proj role list planning-poker
   kubectl auth can-i --as system:serviceaccount:argocd:argocd-application-controller -n planning-poker-dev
   ```

3. Resource Conflicts:
   ```bash
   argocd app diff planning-poker-development
   ```

### Debug Tools

```bash
# Health check
argocd app get planning-poker-development --health

# Resource tree
argocd app tree planning-poker-development

# Sync status
argocd app wait planning-poker-development
```

## Best Practices

1. **Sync Policies**:
   - Enable automated sync for dev/staging
   - Manual sync for production
   - Always use pruning

2. **Resource Management**:
   - Use Helm for templating
   - Implement proper health checks
   - Configure resource limits

3. **Security**:
   - Follow least privilege principle
   - Regular credential rotation
   - Audit logging enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This configuration is licensed under the MIT License.