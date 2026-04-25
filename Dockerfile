# ── Build Stage ─────────────────────────────────────────────────────────────
FROM node:20 AS builder

WORKDIR /app

# Install build tools for native modules (argon2, sharp)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
COPY packages ./packages
RUN npm install

# Copy source
COPY . .

# Build everything (Client + Server)
RUN npm run build

# ── Runtime Stage ───────────────────────────────────────────────────────────
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built assets to runtime
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose production port
EXPOSE 3000

# Start the Soul Oracle
CMD ["node", "dist/index.js"]
