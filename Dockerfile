# Stage 1: Build
FROM node:20 AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-slim
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

COPY --from=build /usr/src/app/package*.json ./
# Copy pre-compiled node_modules from the build stage (avoids recompiling
# native modules like argon2/sharp that require build toolchains)
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Remove dev-only packages to keep the image lean
RUN npm prune --production

USER node
CMD ["node", "dist/index.js"]
