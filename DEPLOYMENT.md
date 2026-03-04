# Soul Codex — Deployment Setup Guide

**C for production, A for development.** Replit was training wheels. Now we run on real infrastructure like responsible lunatics.

---

## Start Here

| You want to… | Go to |
|--------------|-------|
| **Choose a hosting platform** | [DEPLOYMENT_INDEX.md](./DEPLOYMENT_INDEX.md) — Platform comparison and quick decision |
| **Deploy to a specific platform** | [DEPLOYMENT_INDEX.md](./DEPLOYMENT_INDEX.md) → Platform guides (Fly.io, Railway, Koyeb, etc.) |
| **Set up local development** | You're in the right place — see below |
| **Compare costs** | [DEPLOYMENT_COMPARISON.md](./DEPLOYMENT_COMPARISON.md) |
| **Self-host on VPS** | [VPS_SELF_HOSTING.md](./VPS_SELF_HOSTING.md) |

---

## Stack Overview

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 20 (LTS) |
| **Framework** | Express + Vite (React) — *not* Next.js |
| **Database** | PostgreSQL (Neon, Fly Postgres, or self-hosted) |
| **ORM** | Drizzle |
| **Production hosts** | Fly.io, Koyeb, Railway, Render, VPS |

---

## A) Local Development (Your Mac)

### 1) Install Prerequisites

```bash
# Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install node git
```

### 2) Clone and Run

```bash
git clone <YOUR_REPO_URL>
cd soul-codex  # or your project folder name
npm install
npm run dev
```

Open: **http://localhost:3000**

### 3) Database for Dev

**Option A: No database (in-memory)**

If `DATABASE_URL` is unset or invalid, the app uses **MemStorage** — great for quick UI hacking.

**Option B: PostgreSQL (matches production)**

```bash
brew install postgresql@16
brew services start postgresql@16
createdb soul_codex_dev
```

`.env`:
```
DATABASE_URL="postgresql://$(whoami)@localhost:5432/soul_codex_dev"
```

**Option C: Docker Compose (Postgres + app)**

```bash
cp .env.example .env
# Edit .env with DB_PASSWORD, SESSION_SECRET, etc.
docker compose up -d
```

See [docker-compose.yml](./docker-compose.yml).

### 4) Migrations (when using PostgreSQL)

```bash
npm run db:push     # Push schema to DB
npm run db:studio   # Open Drizzle Studio (optional)
```

---

## C) Production Deployment

### Quick Platform Picks

| Goal | Platform | Cost | Guide |
|------|----------|------|-------|
| **Free 24/7** | Fly.io | $0 | [FLY_IO_DEPLOY.md](./FLY_IO_DEPLOY.md) |
| **Free 24/7, GUI** | Koyeb + Neon | $0 | [KOYEB_DEPLOY.md](./KOYEB_DEPLOY.md) |
| **Easiest, paid** | Railway | ~$5/mo | [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) |
| **Full control** | VPS (Hetzner) | €4/mo | [VPS_SELF_HOSTING.md](./VPS_SELF_HOSTING.md) |
| **Testing only** | Render | $0 (spins down) | [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) |

**Full comparison:** [DEPLOYMENT_COMPARISON.md](./DEPLOYMENT_COMPARISON.md)

### Pre-Deployment Checklist

Before deploying to any platform:

- [ ] **OPENAI_API_KEY** ([get one](https://platform.openai.com/api-keys))
- [ ] **STRIPE keys** (test mode OK) ([dashboard](https://dashboard.stripe.com/apikeys))
- [ ] **SESSION_SECRET**: `openssl rand -hex 64`
- [ ] **ADMIN_PASSWORD** (strong password)
- [ ] **DATABASE_URL** — from Neon, Fly Postgres, or platform DB
- [ ] Optional: VAPID keys for push notifications (`web-push generate-vapid-keys`)

### Environment Variables (Production)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes* | PostgreSQL connection string (*unless MemStorage) |
| `SESSION_SECRET` | Yes | Random hex string for sessions |
| `OPENAI_API_KEY` | For AI | OpenAI API key |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | Stripe webhook signing secret |
| `ADMIN_PASSWORD` | Yes | Admin panel access |
| `VAPID_PUBLIC_KEY` | For push | Web Push public key |
| `VAPID_PRIVATE_KEY` | For push | Web Push private key |

See [.env.example](./.env.example) for the full list.

### Run Migrations in Production

One-time (with production `DATABASE_URL`):

```bash
DATABASE_URL="postgresql://..." npm run db:push
```

---

## Build & Run

```
npm install
npm run build
npm start
```

- **Build:** Bundles client (Vite) + server (esbuild → `dist/index.js`)
- **Start:** `node dist/index.js` — serves on `PORT` (default 3000)
- **Health:** `GET /health` → `{ "status": "ok" }`

---

## Production Checklist (Avoid Explosions)

1. **Cache keys:** Horoscope cache includes `userId` + `dateISO` (user timezone) + `timezone` + `profileUpdatedAt` ✅
2. **Profile updates:** When birth info changes, `updatedAt` invalidates related caches ✅
3. **Provider missing degrees:** Return HTTP 501 with clear error (not fake data) if astro provider can't return longitudes
4. **Health check:** `/health` for load balancers ✅

---

## Optional Add-Ons

- **Custom domain + CDN:** [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) — Cloudflare in front of Railway
- **Cron jobs:** Pre-generate daily cards (Upstash QStash, Railway cron, or host cron)
- **Share images:** Endpoint for social share cards (`@resvg/resvg-js`)
- **App Store:** [APP_STORE_DEPLOYMENT_GUIDE.md](./APP_STORE_DEPLOYMENT_GUIDE.md) — Capacitor wrapping

---

## Recommended Workflow

1. Develop locally (A) with `npm run dev`
2. Commit and push to GitHub
3. Host auto-deploys (Fly, Railway, etc.) on push
4. Neon / Fly Postgres holds production data

**Result:** Fast dev, stable prod, no Replit limits, no mystery downtime.

---

## Documentation

- **Deployment index:** [DEPLOYMENT_INDEX.md](./DEPLOYMENT_INDEX.md)
- **Migration from Replit:** [MIGRATION_FROM_REPLIT.md](./MIGRATION_FROM_REPLIT.md) (if applicable)
- **All docs:** [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

---

*Replit ran out because you built something worth running.*
