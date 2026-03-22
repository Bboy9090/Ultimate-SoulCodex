# ─────────────────────────────────────────────────────────────────────────────
# Soul Codex — Express API + Next.js Static Frontend
# Builds both the Next.js upgraded UI (src/) and the Express API server (server/).
# The Express server auto-detects and serves the Next.js static export.
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (layer-cached)
COPY package*.json ./
RUN npm ci

# Copy full source
COPY . .

# Build the Next.js static export (dist/next-public/) and the Express bundle (dist/)
RUN npm run build:next && npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

# Copy the Express server bundle and Next.js static output
COPY --from=build /app/dist ./dist
# Copy package.json for any runtime peer resolution
COPY --from=build /app/package.json ./package.json
# Copy node_modules (Express uses --packages=external so they must be present)
COPY --from=build /app/node_modules ./node_modules
# Copy public assets
COPY --from=build /app/public ./public

USER node
CMD ["node", "dist/index.js"]
