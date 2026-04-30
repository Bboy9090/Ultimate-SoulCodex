# ── Build Stage ─────────────────────────────────────────────────────────────
FROM node:20 AS builder

WORKDIR /app

# Install build tools for native modules (argon2, sharp)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Group config files for better caching
COPY package*.json tsconfig.json ./
COPY shared ./shared
COPY packages ./packages

# Install dependencies for all workspaces
RUN npm install

# Build workspace packages first (required for root build)
# Explicitly build in order of dependency if needed, but db and core are independent
RUN npm run build -w packages/db
RUN npm run build -w packages/core

# Copy remaining source
COPY . .

# Build main app (Client + Server)
RUN npm run build

# ── Runtime Stage ───────────────────────────────────────────────────────────
FROM node:20-slim

WORKDIR /app

# Install runtime dependencies for native modules if needed (usually slim is fine)
RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*

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
CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then npm run db:init; fi && node dist/index.js"]
