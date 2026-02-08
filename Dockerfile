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

# Install production dependencies for root
ENV PYTHON=/usr/bin/python3
RUN npm ci --omit=dev

# For server: Install node-addon-api first (required for Sharp to build from source)
# Then install all deps (including dev) and prune after
RUN cd server && npm install && npm prune --omit=dev

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

# Install all dependencies (including dev for building)
# IMPORTANT: Override NODE_ENV to ensure devDependencies are installed
# Coolify passes NODE_ENV=production as build ARG which would skip vite, typescript, etc.
ENV PYTHON=/usr/bin/python3
ENV NODE_ENV=development
RUN npm ci
RUN cd server && npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Build backend
RUN cd server && npm run build

# Production image with Node.js 20 (single-process backend serving API + frontend)
FROM node:20-alpine AS runner

# Install runtime dependencies for Sharp/SQLite + health checks
RUN apk add --no-cache \
    dumb-init \
    curl \
    vips \
    sqlite-libs

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 banking

# Copy built frontend for Express static serving (server/src/routes/index.ts uses /app/dist)
COPY --from=builder /app/dist /app/dist

# Copy built backend - use node_modules from deps (pruned production deps)
COPY --from=builder --chown=banking:nodejs /app/server/dist /app/backend
COPY --from=deps --chown=banking:nodejs /app/server/node_modules /app/backend/node_modules
COPY --from=builder --chown=banking:nodejs /app/server/package.json /app/backend/

# Copy data directory if exists (might not exist in fresh builds)
COPY --from=builder --chown=banking:nodejs /app/server/src/data /app/backend/data

WORKDIR /app/backend

# Set working directory back to /app
WORKDIR /app

# Create data directories with proper permissions
RUN mkdir -p /app/data /app/uploads /app/logs /app/backend/data /app/dist
RUN chown -R banking:nodejs /app/data /app/uploads /app/logs /app/backend/data /app/dist

# Expose backend port (Railway routes to the running process port)
EXPOSE 3001

# Health check for the application
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD sh -c 'curl -f http://localhost:${PORT:-3001}/api/health || exit 1'

# Start backend process
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "node /app/backend/index.js"]
