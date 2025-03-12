# Stage 1: Dependencies
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_DESCRIPTION
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AUTH_ENABLED
ARG NEXT_PUBLIC_ENABLE_DARK_MODE
ARG NEXT_PUBLIC_ENABLE_ANALYTICS

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_DESCRIPTION=$NEXT_PUBLIC_APP_DESCRIPTION
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AUTH_ENABLED=$NEXT_PUBLIC_AUTH_ENABLED
ENV NEXT_PUBLIC_ENABLE_DARK_MODE=$NEXT_PUBLIC_ENABLE_DARK_MODE
ENV NEXT_PUBLIC_ENABLE_ANALYTICS=$NEXT_PUBLIC_ENABLE_ANALYTICS

RUN npm run build

# Stage 3: Runner
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/out .
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a script to replace environment variables at runtime
RUN echo "#!/bin/sh" > /docker-entrypoint.d/40-replace-env-vars.sh && \
    echo "envsubst '\$NEXT_PUBLIC_APP_URL \$NEXT_PUBLIC_APP_NAME \$NEXT_PUBLIC_APP_DESCRIPTION \$NEXT_PUBLIC_API_URL \$NEXT_PUBLIC_AUTH_ENABLED \$NEXT_PUBLIC_ENABLE_DARK_MODE \$NEXT_PUBLIC_ENABLE_ANALYTICS' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp && mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html" >> /docker-entrypoint.d/40-replace-env-vars.sh && \
    chmod +x /docker-entrypoint.d/40-replace-env-vars.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]