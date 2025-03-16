# Stage 1: Base Image for Dependencies
FROM ghcr.io/sam123ben/poker-base:latest AS deps

# Copy package files for Node dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Stage 2: Test Base
FROM deps AS test-base
WORKDIR /app
COPY . .
RUN npm run build

# Stage 3: Unit Tests
FROM test-base AS unit-test
ENV CI=true
ENV NODE_ENV=test
CMD ["npm", "run", "test"]

# Stage 4: E2E Tests
FROM test-base AS e2e-test
ENV CI=true
ENV NODE_ENV=test
CMD ["xvfb-run", "--auto-servernum", "--server-args='-screen 0 1280x960x24'", "npm", "run", "test:e2e"]

# Stage 5: Acceptance Tests
FROM test-base AS acceptance-test
ENV CI=true
ENV NODE_ENV=test
CMD ["xvfb-run", "--auto-servernum", "--server-args='-screen 0 1280x960x24'", "npm", "run", "test:acceptance"]

# Stage 6: Smoke Tests
FROM test-base AS smoke-test
ENV CI=true
ENV NODE_ENV=test
CMD ["xvfb-run", "--auto-servernum", "--server-args='-screen 0 1280x960x24'", "npm", "run", "test:smoke"]

# Stage 7: Performance Tests
FROM test-base AS perf-test
ENV CI=true
ENV NODE_ENV=test
EXPOSE 8089
CMD ["npm", "run", "test:perf"]

# Stage 8: Builder
FROM test-base AS builder
ENV NODE_ENV=production
RUN npm run build

# Stage 9: Production Runner
FROM node:23-alpine AS runner
WORKDIR /app

# Copy built assets and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set environment variables
ENV PORT=3000
EXPOSE 3000

# Run the Next.js app in production mode
CMD ["node", "server.js"]