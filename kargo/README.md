# Kargo Configuration Guide

This document provides detailed information about the Kargo configuration for the Planning Poker application's continuous deployment pipeline.

## Overview

Kargo is used to manage the continuous deployment pipeline for Planning Poker, providing:

- Automated promotion between environments
- Smoke testing before promotion
- Rollback capabilities
- Webhook notifications

## Directory Structure

```
kargo/
├── analysis-templates/    # Analysis templates for testing
├── promotion.yaml        # Promotion configuration
├── stage.yaml           # Stage definitions
├── warehouse.yaml       # Artifact warehouse configuration
└── README.md
```

## Configuration

### Stages

The pipeline consists of two stages:

1. Development
   - Manual promotion
   - Initial testing environment
   - Feature validation

2. Production
   - Automated promotion
   - Requires successful smoke tests
   - Production environment

### Promotion Requirements

Before promotion to production:

1. Smoke Tests
   - Basic functionality verification
   - API health checks
   - User flow validation

2. Security Scans
   - Vulnerability scanning
   - Dependency checks
   - Configuration validation

3. Load Tests
   - Performance verification
   - Scalability checks
   - Resource utilization analysis

## Usage

### Monitoring Promotions

```bash
# Check promotion status
kargo get promotion planning-poker

# View promotion details
kargo describe promotion planning-poker

# Check stage status
kargo get stage development
kargo get stage production
```

### Manual Operations

```bash
# Trigger manual promotion
kargo promote planning-poker --from development --to production

# Rollback promotion
kargo rollback planning-poker --to development
```

### Webhook Integration

Webhooks are configured to notify external systems about:

- Promotion success/failure
- Smoke test results
- Security scan findings
- Load test metrics

## Analysis Templates

### Smoke Tests

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: smoke-tests
spec:
  metrics:
  - name: smoke-test-success
    provider: webhook
    successCondition: result.passed == true
```

### Security Scans

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: security-scan
spec:
  metrics:
  - name: vulnerability-check
    provider: webhook
    successCondition: result.critical == 0
```

### Load Tests

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: load-test
spec:
  metrics:
  - name: response-time
    provider: prometheus
    successCondition: result < 500
```

## Troubleshooting

### Common Issues

1. Promotion Failures
```bash
# Check promotion events
kargo get events --field-selector involvedObject.kind=Promotion

# View promotion logs
kargo logs promotion planning-poker
```

2. Analysis Failures
```bash
# Check analysis runs
kargo get analysisrun

# View analysis details
kargo describe analysisrun <name>
```

3. Webhook Issues
```bash
# Verify webhook configuration
kargo get webhook-config

# Test webhook connectivity
kargo test webhook <name>
```

### Debug Tools

```bash
# Enable debug logging
kargo --v=4 get promotion

# Export promotion configuration
kargo export promotion planning-poker > promotion-debug.yaml
```

## Best Practices

1. Promotion Strategy
   - Use automated promotions for predictability
   - Include comprehensive smoke tests
   - Implement gradual rollouts

2. Analysis Configuration
   - Set appropriate timeouts
   - Define clear success/failure conditions
   - Include relevant metrics

3. Security
   - Use secrets for sensitive data
   - Implement RBAC controls
   - Audit promotion activities

## Contributing

1. Fork the repository
2. Create your feature branch
3. Submit a pull request

## License

This configuration is licensed under the MIT License.