# One-Click Deploy — Soul Codex

Deploy with **one click**, then add 3 env vars. That's it.

---

## Fastest Path: Click → Add Secrets → Done

### Option 1: Render (Recommended for Zero Config)

**Database included.** Click, connect GitHub, add 3 secrets, deploy.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now)

**What happens:**
1. Click the button
2. Sign in with GitHub, authorize Render
3. Render creates **app + Postgres** from `render.yaml`
4. Add these 3 **required** env vars in the Render dashboard:
   - `SESSION_SECRET` = `openssl rand -hex 64` (run locally)
   - `ADMIN_PASSWORD` = your chosen admin password
   - `OPENAI_API_KEY` = `sk-...` (optional; AI features disabled if empty)
5. Deploy — Render builds and runs. Done.

**Your URL:** `https://soul-codex-xxxx.onrender.com`

---

### Option 2: Railway (~$5/mo, Easiest)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?source=github)

**What happens:**
1. Click → Sign in with GitHub → Select repo: `Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now`
2. Railway creates project + deploys
3. Click **New → Database → PostgreSQL** (DATABASE_URL auto-injected)
4. Add env vars: `NODE_ENV=production`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `OPENAI_API_KEY`
5. Redeploy if needed. Done.

---

### Option 3: Fly.io (Free 24/7)

**Requires:** Fly CLI + one-time setup. After that, push to `main` = auto-deploy.

1. **One-time setup** (5 min):
   ```bash
   curl -L https://fly.io/install.sh | sh
   fly auth signup   # or fly auth login
   cd /path/to/Ultimate-SoulCodex-Engine-of-the-Eternal-Now
   fly launch --no-deploy
   fly postgres create --name soulcodex-db --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 3
   fly postgres attach soulcodex-db
   fly secrets set SESSION_SECRET=$(openssl rand -hex 64) ADMIN_PASSWORD=your_password OPENAI_API_KEY=sk_xxx
   fly deploy
   ```

2. **Enable auto-deploy on push:**
   - GitHub → Settings → Secrets → Add `FLY_API_TOKEN` (get from `fly auth token`)
   - `.github/workflows/fly-deploy.yml` already exists — push to `main` deploys automatically

**After setup:** Every push to `main` = one-click deploy via GitHub Actions.

---

## Required Env Vars (All Platforms)

| Variable | Required | How to get |
|----------|----------|------------|
| `SESSION_SECRET` | ✅ | `openssl rand -hex 64` |
| `ADMIN_PASSWORD` | ✅ | Choose a strong password |
| `DATABASE_URL` | ✅ | Auto on Render/Railway/Fly when you add Postgres |
| `OPENAI_API_KEY` | For AI | [platform.openai.com](https://platform.openai.com/api-keys) |
| `NODE_ENV` | ✅ | Set to `production` (Render/Railway often do this) |

**Optional:** `STRIPE_*`, `VAPID_*` — add later for payments and push notifications.

---

## After Deploy: Run Migrations

One-time, with your production `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://..." npm run db:push
```

Or use the platform's shell/console and run `npm run db:push` there.

---

## Summary

| Platform | Clicks | Cost | Database |
|----------|--------|------|----------|
| **Render** | 1 click + 3 env vars | Free (spins down) / Paid | ✅ Included |
| **Railway** | 1 click + add DB + env vars | ~$5/mo | Add PostgreSQL |
| **Fly.io** | One-time CLI setup, then push | **FREE** | Add Postgres |

**Fastest:** Render — click, add `SESSION_SECRET` + `ADMIN_PASSWORD`, deploy.

**Cheapest long-term:** Fly.io — free tier, 24/7, DB included.

**Easiest:** Railway — great DX, ~$5/mo.
