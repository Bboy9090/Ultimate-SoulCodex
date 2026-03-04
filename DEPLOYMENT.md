# Soul Codex — Development & Production Deployment Guide

**C for production, A for development.** Replit was training wheels. Now we run on real infrastructure like responsible lunatics.

---

## Stack Overview

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js (LTS) |
| **Framework** | Express + Vite (React) — *not* Next.js |
| **Database** | PostgreSQL (Neon in prod, optional SQLite for dev) |
| **ORM** | Drizzle — *not* Prisma |
| **Production Host** | Railway / Render / Fly.io (Express works here; Vercel is for Next.js) |

---

## A) Development on Your Mac (Fast, Cheap, Under Your Control)

### 1) Install Prerequisites

```bash
# Homebrew (if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node LTS
brew install node

# Git (usually already there)
brew install git
```

### 2) Clone and Run

```bash
git clone <YOUR_REPO_URL>
cd soul-codex
npm install
npm run dev
```

Open: **http://localhost:3000**

### 3) Database for Dev

**Option A: PostgreSQL (matches production)**

```bash
brew install postgresql@16
brew services start postgresql@16
createdb soul_codex_dev
```

`.env`:
```env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/soul_codex_dev"
```

**Option B: In-memory (no DB)**

If `DATABASE_URL` is unset or invalid, the app uses `MemStorage` for bootstrap — useful for quick UI/dev without a database.

### 4) Run Migrations (when using PostgreSQL)

```bash
npx drizzle-kit push    # Push schema to DB
# or
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

## C) Production Deployment (Real Internet App)

### Production Stack

| Component | Service |
|-----------|---------|
| **App host** | Railway, Render, or Fly.io |
| **Database** | Neon (or Supabase) — hosted Postgres |
| **Optional later** | Upstash Redis (caching), Cloudflare (assets) |

### Step 1) Create a Neon Postgres DB

1. Go to [neon.tech](https://neon.tech)
2. Create project/database
3. Copy the connection string: `postgresql://...`

### Step 2) Add Production Environment Variables

Set these in your host (Railway → Variables, Render → Environment, etc.):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon connection string |
| `OPENAI_API_KEY` | If using OpenAI (e.g. `sk-...`) |
| `OPENAI_MODEL` | e.g. `gpt-4.1-mini` |
| `VITE_APP_NAME` or `APP_NAME` | e.g. `Soul Codex` |
| `STRIPE_SECRET_KEY` | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Push notifications |

### Step 3) Push Repo to GitHub

```bash
git add .
git commit -m "Deploy Soul Codex"
git push origin main
```

### Step 4) Deploy to Railway / Render / Fly.io

**Railway** (already configured via `railway.json`):

- Import GitHub repo
- Add `DATABASE_URL` and other env vars
- Deploy — `npm start` runs the built app

**Render**:

- New Web Service → Connect repo
- Build: `npm run build`
- Start: `npm start`
- Add env vars

**Fly.io**:

- `fly launch` then `fly deploy`
- Set secrets: `fly secrets set DATABASE_URL=...`

### Step 5) Run Migrations in Production

One-time from your local machine with production `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://..." npx drizzle-kit push
```

Or use Neon's SQL editor for manual schema if needed.

---

## Build Scripts (package.json)

The build process includes:

- `npm run build` → client + server bundles
- `postinstall` can run `drizzle-kit generate` if schema is bundled

Production hosts run `npm install` then `npm run build` and `npm start`.

---

## Production Checklist (So It Doesn’t Explode Later)

### 1) Cache Keys Must Include Timezone + Date

- **Horoscope cache**: `userId` + `dateISO` (in user timezone) + `timezone` + `profileUpdatedAt`
- **Compatibility**: Stored in DB keyed by `profile1Id` + `profile2Id`; in-memory cache would use `hash(A+B)`

### 2) If Birth Info Changes → Invalidate Caches

- Use `profile.updatedAt` in cache keys so profile changes invalidate horoscope/compat caches
- `cacheKey = sha256(userId + dateISO + tz + profileUpdatedAt)` for stricter hashing if needed

### 3) "Provider Missing Degrees" → Return 501 (Not Lie)

- If an astro provider doesn’t return planet longitudes, return HTTP 501 with a clear message
- Example: `{ error: "Provider does not return planet longitudes yet. Upgrade provider to Wave 2B spec." }`

### 4) Health Check

- `/health` returns `{ status: "ok" }` for load balancers and platforms

---

## Recommended Workflow (C + A Together)

1. Develop locally (A) with `npm run dev`
2. Commit changes, push to GitHub
3. Railway/Render auto-deploys to production (C)
4. Neon holds production data
5. Optional: SQLite or in-memory for quick local dev

**Result:**

- Fast local development
- Stable production
- No Replit limits
- No mystery downtime

---

## Optional Upgrades (After Basic Deploy)

1. **Cron**: Pre-generate daily cards at 6–9am user timezone (e.g. via Upstash QStash, Railway cron, or host cron)
2. **Share card rendering**: Endpoint using `@resvg/resvg-js` (or similar) for social share images
3. **Capacitor**: Wrap in Capacitor for App Store later

---

## VPS Self-Hosting

See **[VPS_SELF_HOSTING.md](./VPS_SELF_HOSTING.md)** for the cheapest 24/7 option ($3–6/month) with full control.

---

*Replit ran out because you built something worth running.*
