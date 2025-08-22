# Multi-stage build for AI Lecturer project
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production
RUN cd client && npm ci --only=production

# Build stage for frontend
FROM base AS build
WORKDIR /app/client
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Copy built frontend
COPY --from=build /app/client/build ./client/build

# Copy backend source code
COPY . .

# Remove dev dependencies and client source
RUN rm -rf client/src client/public client/package*.json client/tailwind.config.js client/postcss.config.js

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
