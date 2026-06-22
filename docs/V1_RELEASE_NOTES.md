# Soul Codex V1.0 Release Notes

**Version:** 1.0.0-rc1
**Date:** 2026-06-21
**Branch:** `main`

---

## What Is Ready

Soul Codex V1.0 is a multi-system self-discovery platform that blends astrology, numerology, Human Design, behavioral patterns, and timing into a single unified reading.

### Core Features
- **Soul Archetype Profile** — unified identity reading with codename, core patterns, strengths, and pressure points
- **Today's Reading** — daily guidance based on personal numerology cycle, moon phase, and profile context
- **Compatibility Engine** — multi-system comparison between two profiles with confidence badges and system-level scoring
- **AI Soul Guide** — conversational assistant anchored to the user's profile data with provider cascade (Gemini → Groq → OpenAI → deterministic fallback)
- **Premium Access** — access code redemption, gated PDF generation, entitlement tracking
- **Unknown Birth Time Honesty** — partial profiles never fabricate rising sign, houses, or time-dependent data

### Supported Systems
| System | Data Source |
|--------|-----------|
| Astrology | Sun, Moon, Rising (when time known), houses, aspects |
| Numerology | Life Path, Personal Year/Day, Expression |
| Human Design | Type, Authority, Strategy, Profile |
| Personality | Enneagram, MBTI (when provided) |
| Moral Compass | Behavioral questionnaire data |

---

## What Was Hardened

### Security
- **Helmet** security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, X-DNS-Prefetch-Control, X-Powered-By hidden
- **Three-tier rate limiting**: Global (300/15min), AI (10/min), Auth (20/15min)
- **CORS**: Environment-driven allowlist in production, permissive in dev
- **Session cookies**: httpOnly, secure (production), sameSite=lax, 7-day expiry
- **JSON body limit**: 1MB max
- **Error safety**: No stack traces in production responses

### Reliability
- **Startup validation**: Fail-fast on missing SESSION_SECRET, warnings for missing AI keys
- **AI cascade**: Three-provider fallback with deterministic last resort
- **Error boundary**: Branded React fallback UI catches client-side crashes
- **Graceful shutdown**: SIGTERM/SIGINT handlers with 10s force-close timeout

### Performance
- **Static asset caching**: Hashed assets get `max-age=1y, immutable`; others get `max-age=1h`
- **DEMO_MODE**: Runs without database via MemStorage for zero-dependency development

---

## Test Scoreboard

| Suite | Tests | Result |
|-------|-------|--------|
| smoke-astrology | 7/7 | PASS |
| smoke-compatibility | 6/6 | PASS |
| smoke-unknown-time | 7/7 | PASS |
| smoke-premium | 7/7 | PASS |
| smoke-production | 7/7 | PASS |
| smoke-ai-live | 4/4 | PASS |
| rc1-walkthrough | 20/20 | PASS |
| **Total** | **58/58** | **ALL PASS** |

### Flows Validated
1. Fresh User (landing → onboarding → profile → today/codex)
2. Returning User (session persistence, dashboard restore)
3. Compatibility (known×known, known×unknown, confidence badges)
4. Premium (free gate → access code → entitled content)
5. AI Soul Guide (known-time response, unknown-time honesty, cascade fallback)
6. Mobile (375px, 390px, 768px, desktop — all clean)
7. Production Readiness (health, headers, rate limits, CORS, session, errors)

---

## Known Non-Blockers

| Item | Severity | Notes |
|------|----------|-------|
| Gemini free-tier quota exhaustion (429) | INFO | AI cascade handles this — Groq responds as fallback. Use paid tier in production. |
| Input validation on API routes | MEDIUM | Server rejects malformed data but doesn't use schema validation (e.g., Zod). Acceptable for V1. |

---

## Required Deploy Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Must be `production` |
| `SESSION_SECRET` | Yes | Cryptographic session secret (min 32 chars) |
| `PORT` | Yes | Server port (platform usually sets this) |
| `ALLOWED_ORIGINS` | Yes | Comma-separated list of allowed CORS origins |
| `DATABASE_URL` | Recommended | PostgreSQL connection string (falls back to MemStorage) |
| `GEMINI_API_KEY` | Recommended | Primary AI provider |
| `GROQ_API_KEY` | Recommended | Secondary AI fallback |
| `OPENAI_API_KEY` | Optional | Tertiary AI fallback |
| `DEMO_MODE` | No | Set `true` only for local dev without database |

---

## Ops Checklist

- [ ] Set all required environment variables on deploy platform
- [ ] Provision PostgreSQL database and run `npm run db:init`
- [ ] Verify `npm run build` succeeds (client + server)
- [ ] Deploy and verify `/health` returns `{"status":"ok"}`
- [ ] Verify security headers present (X-Content-Type-Options, X-Frame-Options)
- [ ] Verify rate limit headers on `/api` routes
- [ ] Verify CORS allows production origin only
- [ ] Run production smoke suite against deployed URL
- [ ] Verify AI cascade responds (test with profile-anchored chat)
- [ ] Monitor error logs for first 24 hours

---

## Rollback Plan

1. **Immediate**: Redeploy previous known-good commit from `main` history
2. **Database**: No destructive migrations in V1 — rollback is safe
3. **Session**: Sessions are server-side; restarting clears MemStorage sessions (acceptable) or preserves Postgres sessions
4. **AI**: If all AI providers fail, deterministic fallback keeps the app functional
5. **Static assets**: Immutable cache headers mean old assets are still served from CDN until cache expires; new deploy overwrites

### Emergency Contacts
- Health endpoint: `GET /health`
- Force restart: Redeploy from platform dashboard
- Kill switch: Set `DEMO_MODE=true` to bypass database dependency
