# Docker Guide for Planning Poker

This document provides detailed information about the Docker setup and deployment process for the Planning Poker application.

## Docker Configuration

### Multi-stage Build

The application uses a multi-stage Dockerfile to optimize the build process and final image size:

1. **Dependencies Stage**
   - Base: `node:20-slim`
   - Purpose: Install npm dependencies
   - Output: `node_modules` directory

2. **Builder Stage**
   - Base: `node:20-slim`
   - Purpose: Build the Next.js application
   - Output: Static files in `out` directory
   - Handles environment variable injection

3. **Runner Stage**
   - Base: `nginx:alpine`
   - Purpose: Serve the static files
   - Configuration: Custom nginx.conf
   - Runtime environment variable substitution

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Application URL | http://localhost:3000 |
| `NEXT_PUBLIC_APP_NAME` | Application name | Planning Poker |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Application description | A real-time planning poker application... |
| `NEXT_PUBLIC_API_URL` | API endpoint | http://localhost:3000/api |
| `NEXT_PUBLIC_AUTH_ENABLED` | Enable authentication | false |
| `NEXT_PUBLIC_ENABLE_DARK_MODE` | Enable dark mode | true |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | false |

## Building the Image

```bash
# Basic build
docker build -t planning-poker:latest .

# Build with environment variables
docker build \
  --build-arg NEXT_PUBLIC_APP_URL=https://your-domain.com \
  --build-arg NEXT_PUBLIC_APP_NAME="Your App Name" \
  --build-arg NEXT_PUBLIC_APP_DESCRIPTION="Your Description" \
  -t planning-poker:latest .
```

## Running the Container

### Development

```bash
# Run with docker-compose
docker-compose up --build

# Run with hot reload
docker run -it \
  -p 3000:80 \
  -v $(pwd):/app \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  planning-poker:latest
```

### Production

```bash
# Run production container
docker run -d \
  -p 80:80 \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  -e NEXT_PUBLIC_APP_NAME="Your App Name" \
  planning-poker:latest
```

## Health Checks

The container includes a health check endpoint at `/health`:

```nginx
location /health {
    access_log off;
    add_header Content-Type text/plain;
    return 200 'healthy\n';
}
```

## Caching Strategy

Nginx is configured with optimal caching rules:

- Static assets: 1-year cache with public access
- Dynamic routes: No caching, must revalidate
- API endpoints: No caching

## Security Considerations

1. **Base Images**
   - Using official Node.js and Nginx images
   - Regular security updates
   - Minimal base images

2. **Runtime**
   - Non-root user
   - Read-only file system
   - Limited capabilities

3. **Secrets**
   - Environment variables for configuration
   - No secrets in images
   - Support for Docker secrets

## Optimization Tips

1. **Image Size**
   ```bash
   # Use multi-stage builds
   # Only copy necessary files
   # Remove development dependencies
   ```

2. **Build Cache**
   ```bash
   # Layer ordering for better cache utilization
   # Copy package files first
   # Install dependencies before copying source
   ```

3. **Performance**
   ```bash
   # Use production builds
   # Enable compression
   # Optimize static assets
   ```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   docker build --progress=plain .
   ```

2. **Runtime Errors**
   ```bash
   # Check container logs
   docker logs <container_id>
   ```

3. **Performance Issues**
   ```bash
   # Monitor container metrics
   docker stats <container_id>
   ```

### Debug Mode

```bash
# Run with debug options
docker run -it \
  --rm \
  -p 3000:80 \
  -e DEBUG=true \
  planning-poker:latest
```

## CI/CD Integration

The Docker setup integrates with CI/CD pipelines:

1. **Build Stage**
   ```bash
   docker build \
     --target builder \
     -t planning-poker:build .
   ```

2. **Test Stage**
   ```bash
   docker build \
     --target test \
     -t planning-poker:test .
   ```

3. **Deploy Stage**
   ```bash
   docker build \
     --target runner \
     -t planning-poker:deploy .
   ```