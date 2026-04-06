# Soul Codex — Canonical API container
# Builds and runs `apps/api` (workspace `@soulcodex/api`) and starts `dist/server.js`.

FROM node:20-alpine AS build
WORKDIR /app

# Install workspace deps with cache-friendly layer
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/*/package.json packages/*/package.json
RUN npm ci

# Copy source and build the API bundle
COPY . .
RUN npm run build -w @soulcodex/api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Railway provides PORT; default for local docker runs.
ENV PORT=3000
EXPOSE 3000

# `@soulcodex/api` build outputs to repo root `dist/server.js`
COPY --from=build /app/dist ./dist

USER node
CMD ["node", "dist/server.js"]
