# ── Build Stage ─────────────────────────────────────────────────────────────
FROM node:20 AS builder

WORKDIR /app

# Install build tools for native modules (argon2, sharp)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install dependencies for all workspaces
COPY package*.json ./
COPY packages ./packages
COPY tsconfig.json ./
COPY shared ./shared
RUN npm install

# Build workspace packages first (required for root build)
RUN npm run build -w packages/db
RUN npm run build -w packages/core

# Copy remaining source
COPY . .

# Build main app (Client + Server)
RUN npm run build

# ── Runtime Stage ───────────────────────────────────────────────────────────
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built assets and necessary files to runtime
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# Include built packages for runtime imports if they use dist/
COPY --from=builder /app/packages ./packages

# Expose production port
EXPOSE 3000

# Start the Soul Oracle
CMD ["node", "dist/index.js"]
