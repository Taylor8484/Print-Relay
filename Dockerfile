# ============================================
# Stage 1: Build React Frontend
# ============================================
FROM node:18 AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY package.json package-lock.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY index.html index.tsx App.tsx tsconfig.json vite.config.ts ./

# Build the React application
RUN npm run build

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:18-slim

# Install CUPS client and Avahi for mDNS support
RUN apt-get update && \
    apt-get install -y \
      cups-client \
      libavahi-compat-libdnssd-dev \
      avahi-daemon \
      avahi-utils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend package file and install dependencies
COPY server-package.json ./package.json
RUN npm ci --only=production

# Copy the Express server
COPY server.js ./

# Copy the built React frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./dist

# Create directory for printer configuration persistence
RUN mkdir -p /app/printer-config

# Create directory for temporary file uploads
RUN mkdir -p /tmp/printer-uploads

# Environment variables (can be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start the server
CMD ["node", "server.js"]
