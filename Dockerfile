# Multi-stage build for production deployment - Optimized for better-sqlite3 and Sharp compatibility
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install build tools for native modules including vips for Sharp
RUN apk add --no-cache \
    python3 \
    py3-setuptools \
    py3-pip \
    make \
    g++ \
    libc6-compat \
    sqlite \
    sqlite-dev \
    vips-dev \
    pkgconfig

# Copy package files and lock files
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json* ./server/
COPY mailer-service/package.json mailer-service/package-lock.json* ./mailer-service/

# Install production dependencies for root
ENV PYTHON=/usr/bin/python3
RUN npm ci --omit=dev

# For server: Install node-addon-api first (required for Sharp to build from source)
# Then install all deps (including dev) and prune after
RUN cd server && npm install && npm prune --omit=dev

# For mailer service
RUN cd mailer-service && npm install --omit=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install build tools for native modules including vips for Sharp
RUN apk add --no-cache \
    python3 \
    py3-setuptools \
    py3-pip \
    make \
    g++ \
    libc6-compat \
    sqlite \
    sqlite-dev \
    vips-dev \
    pkgconfig

# Copy package files and lock files
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json* ./server/
COPY mailer-service/package.json mailer-service/package-lock.json* ./mailer-service/

# Install all dependencies (including dev for building)
# IMPORTANT: Override NODE_ENV to ensure devDependencies are installed
# Coolify passes NODE_ENV=production as build ARG which would skip vite, typescript, etc.
ENV PYTHON=/usr/bin/python3
ENV NODE_ENV=development
RUN npm ci
RUN cd server && npm install
RUN cd mailer-service && npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Build backend
RUN cd server && npm run build

# Build mailer service
RUN cd mailer-service && npm run build

# Production image with Node.js 20 + Nginx
FROM node:20-alpine AS runner

# Install Nginx, runtime dependencies, and vips (required for Sharp at runtime)
RUN apk add --no-cache \
    nginx \
    dumb-init \
    curl \
    supervisor \
    vips \
    sqlite-libs

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 banking

# Copy built frontend to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy built backend - use node_modules from deps (pruned production deps)
COPY --from=builder --chown=banking:nodejs /app/server/dist /app/backend
COPY --from=deps --chown=banking:nodejs /app/server/node_modules /app/backend/node_modules
COPY --from=builder --chown=banking:nodejs /app/server/package.json /app/backend/

# Copy data directory if exists (might not exist in fresh builds)
COPY --from=builder --chown=banking:nodejs /app/server/src/data /app/backend/data

WORKDIR /app/backend

# Copy built mailer service
COPY --from=builder --chown=banking:nodejs /app/mailer-service/dist /app/mailer
COPY --from=deps --chown=banking:nodejs /app/mailer-service/node_modules /app/mailer/node_modules
COPY --from=builder --chown=banking:nodejs /app/mailer-service/package.json /app/mailer/

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set working directory back to /app
WORKDIR /app

# Create data directories with proper permissions
RUN mkdir -p /app/data /app/uploads /app/logs /app/mailer/logs /app/backend/data
RUN chown -R banking:nodejs /app/data /app/uploads /app/logs /app/backend/data

# Create supervisor configuration
RUN echo '[supervisord]' > /etc/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisord.conf && \
    echo 'user=root' >> /etc/supervisord.conf && \
    echo '' >> /etc/supervisord.conf && \
    echo '[program:nginx]' >> /etc/supervisord.conf && \
    echo 'command=nginx -g "daemon off;"' >> /etc/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo '' >> /etc/supervisord.conf && \
    echo '[program:backend]' >> /etc/supervisord.conf && \
    echo 'command=node /app/backend/index.js' >> /etc/supervisord.conf && \
    echo 'directory=/app/backend' >> /etc/supervisord.conf && \
    echo 'user=banking' >> /etc/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo '' >> /etc/supervisord.conf && \
    echo '[program:mailer]' >> /etc/supervisord.conf && \
    echo 'command=node /app/mailer/index.js' >> /etc/supervisord.conf && \
    echo 'directory=/app/mailer' >> /etc/supervisord.conf && \
    echo 'user=banking' >> /etc/supervisord.conf && \
    echo 'environment=PORT=3002' >> /etc/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisord.conf && \
    echo 'stdout_logfile=/dev/stdout' >> /etc/supervisord.conf && \
    echo 'stdout_logfile_maxbytes=0' >> /etc/supervisord.conf && \
    echo 'stderr_logfile=/dev/stderr' >> /etc/supervisord.conf && \
    echo 'stderr_logfile_maxbytes=0' >> /etc/supervisord.conf

# Expose port 80 for Nginx
EXPOSE 80

# Health check for the application
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start both Nginx and Node.js using supervisor
ENTRYPOINT ["dumb-init", "--"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
