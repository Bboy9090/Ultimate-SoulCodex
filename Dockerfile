# SoulCodex production image for Railway.
# Build the complete web application and API in one stage, then copy only
# production runtime files into the final image.
#
# Node 22 is the canonical Soul Codex toolchain. Keep the container aligned
# with CI and Capacitor 8 instead of tolerating engine mismatches at build time.

FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Railway exposes Git deployment metadata to Dockerfile builds when the
# corresponding variable is declared as ARG. CI supplies the same argument
# explicitly, so the browser bundle and backend can prove one candidate SHA.
ARG RAILWAY_GIT_COMMIT_SHA=unknown
ARG SOUL_CODEX_RELEASE_VERSION=4.0.0-rc.3
ARG VITE_API_CONTRACT=foundation-v4

ENV VITE_RELEASE_SHA=$RAILWAY_GIT_COMMIT_SHA
ENV VITE_RELEASE_VERSION=$SOUL_CODEX_RELEASE_VERSION
ENV VITE_API_CONTRACT=$VITE_API_CONTRACT

# Copy the full workspace before npm ci. The root package references local
# workspaces, so installing with only the root package.json is not valid.
COPY . .

RUN npm ci
RUN npm run build:workspaces
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/packages ./packages
COPY --from=builder --chown=node:node /app/dist ./dist

EXPOSE 3000

# Railway performs the /health check declared in railway.json. Avoid a second
# image-level health check tied to a hard-coded port because Railway may
# override PORT at runtime.
USER node
CMD ["node", "dist/index.js"]
