# Soul Codex V1.0 — Deployment Checklist

**Target:** Production deploy of `v1.0.0-rc1`

---

## 1. Environment Variables

Set all of the following on your deploy platform before deploying.

| Variable | Value | Status |
|----------|-------|--------|
| `NODE_ENV` | `production` | [ ] |
| `SESSION_SECRET` | Random 32+ character string | [ ] |
| `PORT` | Platform-assigned (Render sets automatically) | [ ] |
| `ALLOWED_ORIGINS` | `https://yourdomain.com` (comma-separated if multiple) | [ ] |
| `DATABASE_URL` | PostgreSQL connection string | [ ] |
| `GEMINI_API_KEY` | Google AI Studio API key | [ ] |
| `GROQ_API_KEY` | Groq API key (fallback) | [ ] |
| `OPENAI_API_KEY` | OpenAI API key (optional tertiary fallback) | [ ] |

**Do NOT set:**
- `DEMO_MODE` — leave unset in production (defaults to false)

---

## 2. Database Setup

If using PostgreSQL (recommended for production):

```bash
# Initialize schema
npm run db:init
```

If no database is available, the app falls back to MemStorage (data lost on restart).

---

## 3. Build

```bash
npm install
npm run build
```

This produces:
- `dist/public/` — client bundle (Vite)
- Server runs via `npx tsx server/index.ts` (dev) or compiled entry

---

## 4. Health Endpoint Check

After deploy, verify the server is running:

```bash
curl https://yourdomain.com/health
# Expected: {"status":"ok"}
```

---

## 5. Security Verification

```bash
curl -I https://yourdomain.com/health
```

Verify these headers are present:
- [x] `x-content-type-options: nosniff`
- [x] `x-frame-options: SAMEORIGIN`
- [x] `referrer-policy: no-referrer`
- [x] `x-dns-prefetch-control: off`
- [x] No `x-powered-by` header

---

## 6. CORS Verification

```bash
curl -X OPTIONS https://yourdomain.com/api/soul-archetype \
  -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: POST" \
  -I
```

Verify:
- `access-control-allow-origin` matches your domain
- `access-control-allow-credentials: true`

---

## 7. Rate Limiting Verification

```bash
curl -I -X POST https://yourdomain.com/api/soul-archetype \
  -H "Content-Type: application/json" \
  -d '{}'
```

Verify headers:
- `ratelimit-limit: 300`
- `ratelimit-remaining: <number>`

---

## 8. Smoke Test Commands

Run against the deployed URL:

```bash
# Production hardening suite (7 tests)
SMOKE_BASE=https://yourdomain.com npx tsx scripts/smoke-production.ts

# Full local suite (requires server running locally)
npx tsx scripts/smoke-astrology.ts
npx tsx scripts/smoke-compatibility.ts
npx tsx scripts/smoke-unknown-time.ts
npx tsx scripts/smoke-premium.ts
SMOKE_BASE=https://yourdomain.com npx tsx scripts/smoke-ai-live.ts
```

---

## 9. Post-Deploy Verification

| Check | Command / Action | Expected |
|-------|-----------------|----------|
| Health | `GET /health` | `{"status":"ok"}` |
| Landing page | Visit `/` in browser | Renders without errors |
| Profile creation | Create profile via onboarding | Returns archetype with sun/moon signs |
| AI Soul Guide | Send a chat message | Receives AI response (or deterministic fallback) |
| Premium gate | Try premium feature without code | Returns 403 |
| Access code | Redeem `guest123t` (or production code) | Unlocks premium |
| Mobile | Visit on 375px device | No overflow, CTAs accessible |
| Error boundary | Check browser console | No uncaught errors |

---

## 10. Monitoring (First 24 Hours)

- [ ] Watch server logs for unhandled rejections
- [ ] Monitor AI provider rate limits (especially Gemini free tier)
- [ ] Verify session persistence across page reloads
- [ ] Check that `/api` routes return proper error codes (not 500s with stack traces)

---

## Rollback Procedure

If critical issues are found post-deploy:

1. Redeploy previous commit from platform dashboard
2. No database rollback needed (no destructive migrations)
3. Clear CDN cache if static assets are stale
4. Set `DEMO_MODE=true` as emergency bypass if database is the issue
