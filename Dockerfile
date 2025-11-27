# Computer Store KS Version 3.0
# Multi-stage build for static site with Express API backend

# Stage 1: Build and prepare
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for sharp (image processing)
RUN apk add --no-cache python3 make g++ vips-dev

# Copy API package files
COPY api/package*.json ./api/

# Install API dependencies
WORKDIR /app/api
RUN npm ci --only=production

# Stage 2: Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies for sharp
RUN apk add --no-cache vips-dev

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy all static files
COPY --chown=appuser:nodejs index.html style.css script.js config.js ./
COPY --chown=appuser:nodejs admin-login.html admin-gallery.html admin-gallery.js ./
COPY --chown=appuser:nodejs add-computer.html edit-computer.html ./
COPY --chown=appuser:nodejs sitemap.xml robot.txt ./
COPY --chown=appuser:nodejs assets/ ./assets/
COPY --chown=appuser:nodejs checklists/ ./checklists/
COPY --chown=appuser:nodejs "Sales Cards/" "./Sales Cards/"

# Copy API with installed dependencies
COPY --from=builder --chown=appuser:nodejs /app/api/node_modules ./api/node_modules
COPY --chown=appuser:nodejs api/gallery-api.js ./api/
COPY --chown=appuser:nodejs api/package.json ./api/

# Create directory for backups with proper permissions
RUN mkdir -p backups && chown appuser:nodejs backups

# Install a simple static file server for the frontend
RUN npm install -g serve@14

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Starting Computer Store KS..."' >> /app/start.sh && \
    echo '# Start static file server on port 3000' >> /app/start.sh && \
    echo 'serve -s /app -l 3000 &' >> /app/start.sh && \
    echo '# Start API server on port 3001' >> /app/start.sh && \
    echo 'cd /app/api && node gallery-api.js' >> /app/start.sh && \
    chmod +x /app/start.sh

USER appuser

# Expose ports
EXPOSE 3000 3001

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ && \
        wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["/app/start.sh"]
