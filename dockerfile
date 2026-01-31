# ---------- STAGE 1: Build frontend ----------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build


# ---------- STAGE 2: Build server ----------
FROM node:20-alpine AS server-builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# build TypeScript server if you have tsconfig
RUN npm run build || true


# ---------- STAGE 3: Production image ----------
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# copy server
COPY --from=server-builder /app ./

# copy built frontend into public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# security
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

EXPOSE 3000

CMD ["npm", "start"]