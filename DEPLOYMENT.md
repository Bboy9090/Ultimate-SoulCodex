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
| **App host** | **Railway** (recommended), Render, or Koyeb |
| **Database** | Railway PostgreSQL (or Neon) |
| **Optional later** | Upstash Redis (caching), Cloudflare (assets) |

### Step 1) Create Database

**Railway:** Add PostgreSQL via Dashboard (New → Database → PostgreSQL). `DATABASE_URL` is auto-injected.

**Or Neon:** Go to [neon.tech](https://neon.tech), create project/database, copy connection string.

### Step 2) Add Production Environment Variables

Set these in your host (Railway → Variables, Render → Environment, etc.):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon connection string |
| `OPENAI_API_KEY` | If using OpenAI (e.g. `sk-...`) |
| `OPENAI_MODEL` | e.g. `gpt-4.1-mini` |
| `VITE_APP_NAME` or `APP_NAME` | e.g. `Soul Codex` |
| `GEMINI_API_KEY` | Google Gemini AI key (recommended) |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Push notifications |

### Step 3) Push Repo to GitHub

```bash
git add .
git commit -m "Deploy Soul Codex"
git push origin main
```

### Step 4) Deploy to Railway (Recommended)

**Railway** (configured via `railway.json`):

- New Project → Deploy from GitHub repo
- Add PostgreSQL (New → Database → PostgreSQL)
- Set env vars in Variables tab
- Deploy — Railway auto-builds and runs `npm start`
- Run migrations: `railway run npm run db:push`

**Alternatives:** See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) for full Railway guide, or [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) / [KOYEB_DEPLOY.md](./KOYEB_DEPLOY.md) for other options.

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
3. Railway auto-deploys to production (C) when repo is connected
4. Railway PostgreSQL (or Neon) holds production data
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

---

## Upgraded Next.js Frontend (src/)

Soul Codex now ships an upgraded frontend built with **Next.js 14** (static export).
It lives in the `src/` directory and offers an improved mobile-first UI with richer
animations, better navigation, and additional pages (journal, growth, guide, lifemap, etc.).

### Build the Next.js frontend

```bash
npm run build:next
```

This generates static HTML/CSS/JS to `dist/next-public/`.

### Serve from the same Express server

The Express server **automatically** detects and serves the Next.js frontend when
`dist/next-public/` exists. Just run:

```bash
npm run build:next   # build the new frontend
npm run build        # also rebuild the Express server
npm start            # Express serves Next.js frontend + API
```

### Deploy to Vercel (recommended for the frontend)

For best performance, deploy the Next.js frontend to Vercel and the Express API
to Railway/Render/Fly.io:

1. Deploy Express API to Railway (set `PORT`, `GEMINI_API_KEY`, `DATABASE_URL`)
2. Deploy this repo to Vercel — it auto-detects Next.js
3. Set `NEXT_PUBLIC_API_URL=https://your-express-api.railway.app` in Vercel env vars

### Development

```bash
# Run the upgraded Next.js frontend (port 3001) + Express API (port 3000):
npm run dev          # Express API at http://localhost:3000
npm run dev:next     # Next.js frontend at http://localhost:3001
```

Set `NEXT_PUBLIC_API_URL=http://localhost:3000` in a `.env.local` file for the
Next.js frontend to proxy API calls to the local Express server.
