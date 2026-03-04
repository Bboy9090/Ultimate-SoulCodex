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
COPY --from=build /usr/src/app/dist ./dist
RUN npm ci --omit=dev

USER node
CMD ["node", "dist/index.js"]
