# ─────────────────────────────────────────────────────────────────────────────
# Soul Codex — Next.js 16 Standalone Build
# Serves the Emergent psychology engine (src/) via Next.js standalone server
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (layer-cached)
COPY package*.json ./
RUN npm ci

# Copy full source and build the Next.js app
# next.config has output: "standalone" — produces a self-contained server
COPY . .
RUN npm run build:next

# Stage 2: Production — only the standalone output is needed
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

# The standalone folder contains everything needed to run the server
COPY --from=build /app/.next/standalone ./
# Static assets must be copied separately (Next.js standalone doesn't include them)
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER node
CMD ["node", "server.js"]
