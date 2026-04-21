# ── Build Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ── Runtime Stage ───────────────────────────────────────────────────────────
FROM node:20-alpine-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Expose production port
EXPOSE 5000

# Start the Soul Oracle
CMD ["node", "dist/index.js"]
