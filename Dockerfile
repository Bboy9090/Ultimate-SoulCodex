# Soul Codex Production Dockerfile
# This builds the Express server from server/index.ts with all root-level dependencies

FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY .nvmrc ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy all source files
COPY . .

# Build workspace packages that are required
RUN npm run build --workspace=packages/db --if-present
RUN npm run build --workspace=packages/core --if-present

# Build the server bundle using esbuild
# The server is at server/index.ts (not apps/api/server.ts)
RUN npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --outExtension:.js=.js

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --production --ignore-scripts

# Copy built server from builder
COPY --from=builder /app/dist ./dist

# Copy workspace package dist folders (needed for runtime imports)
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/db/package.json ./packages/db/package.json
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/package.json

# Copy TypeScript source packages that don't have build steps
COPY --from=builder /app/packages/astrology ./packages/astrology
COPY --from=builder /app/packages/ai ./packages/ai

# Copy necessary root-level files that might be imported
COPY --from=builder /app/db.ts ./db.ts
COPY --from=builder /app/storage.ts ./storage.ts
COPY --from=builder /app/demo-seed.ts ./demo-seed.ts

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3000

# Use node user for security
USER node

CMD ["node", "dist/index.js"]
