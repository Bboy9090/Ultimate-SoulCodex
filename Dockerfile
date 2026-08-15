# SoulCodex production image for Railway.
# Build the complete web application and API in one stage, then copy only
# production runtime files into the final image.
#
# Node 22 is the canonical Soul Codex toolchain. Keep the container aligned
# with CI and Capacitor 8 instead of tolerating engine mismatches at build time.

FROM node:22-bookworm-slim AS builder
WORKDIR /app

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
