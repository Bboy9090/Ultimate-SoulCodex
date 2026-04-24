# ── Build Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for all workspaces
COPY package*.json ./
COPY packages ./packages
COPY apps ./apps
RUN npm install

# Copy source
COPY . .

# Build monorepo packages first, then the app
RUN npm run build:server

# ── Runtime Stage ───────────────────────────────────────────────────────────
FROM node:20-alpine-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy root package.json and built assets
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose production port
EXPOSE 3000

# Start the Soul Oracle
# Use the compiled index.js in the dist folder
CMD ["node", "dist/index.js"]

