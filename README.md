# Soul Codex — Engine of the Eternal Now

**Soul Codex** is a mobile-first personality and compatibility app that synthesizes 35+ spiritual and psychological systems — Western & Vedic astrology, Human Design, Gene Keys, numerology, Tarot, I Ching, and more — into a single, unified reading of who you are and how you relate to others.

It is not a horoscope generator. It is not incense smoke wrapped in JSON. It calculates your birth chart, derives your Human Design type and gates, maps your Gene Key profile, computes your numerology, and weaves these together into a coherent narrative that respects your intelligence and does not predict your fate.

---

## What the 35+ Systems Actually Do

| Category | Systems Included |
|---|---|
| **Western Astrology** | Sun/Moon/Rising, 10 planets, 12 houses, major aspects, Chiron, Lilith, North Node |
| **Vedic Astrology** | Jyotish chart, Nakshatras (27 lunar mansions), Dasha periods |
| **Human Design** | Type (Generator/Manifestor/Projector/Reflector/MG), Strategy, Authority, Profile, Defined/Open Centers |
| **Gene Keys** | Activation Sequence (Life's Work, Evolution, Radiance, Purpose), Shadow → Gift → Siddhi arc |
| **Numerology** | Life Path, Expression, Soul Urge, Personality, Birthday, Maturity numbers |
| **Tarot** | Birth card pair (Major Arcana), year card, monthly card |
| **I Ching** | Hexagram derived from birth data, line reading |
| **Runes** | Birth rune and current-cycle rune |
| **Fixed Stars** | Prominent fixed stars conjunct natal planets |
| **Chinese Astrology** | Year animal, element, inner/secret animals |
| **Mayan Calendar** | Tzolk'in day sign and tone |
| **Elemental Medicine** | Five-element profile (Wood/Fire/Earth/Metal/Water) |
| **Enneagram** | Type and wing suggestion based on chart signature |
| **MBTI overlay** | Cognitive function stack correlated to chart |
| **Chakra system** | Dominant and blocked chakras from chart patterns |
| **Sacred Geometry** | Core geometric archetype from numerology/chart |
| **Moral Compass** | Core values cluster derived from chart emphasis |

All calculations are performed on the server using real ephemeris data (`astronomy-engine`). No hardcoded readings. Every result is computed from your exact birth date, time, and place.

---

## The 4 Core Experiences (MVP)

### 1. Profile
Enter your birth date, time, and place once. The engine calculates all 35+ systems and renders your complete Soul Codex — a layered portrait of your archetype, strengths, shadow, purpose, and life path.

### 2. Daily
Every day, your transiting planets, active Gene Key, Tarot card of the day, and I Ching reading combine into a Daily Soul Context — not a forecast, a lens for today.

### 3. Compatibility
Add any person (partner, friend, colleague). The engine runs a 5-pillar compatibility analysis: synastry aspects, Human Design inter-type dynamics, Gene Key resonance, numerology harmony, and elemental balance.

### 4. Codex Reading
A deeper dive into your full reading with AI-generated synthesis (powered by Google Gemini), section-by-section interpretation, and PDF export for offline use.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, TailwindCSS, Radix UI, Wouter |
| Backend | Node.js 20, Express.js, TypeScript |
| Database | PostgreSQL via Neon (serverless), Drizzle ORM |
| AI | Google Gemini (primary), OpenAI GPT-4 (fallback) |
| Payments | Stripe (subscriptions) |
| Build | Vite 5 (client), esbuild (server) |
| Auth | Passport.js local strategy, Argon2id password hashing |
| Ephemeris | astronomy-engine (real planetary calculations) |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now.git
cd Ultimate-SoulCodex-Engine-of-the-Eternal-Now

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — minimum required: DATABASE_URL (or set DEMO_MODE=true to skip DB)

# 4. Build
npm run build

# 5. Run
npm start
```

Open [http://localhost:3000](http://localhost:3000).

> **Note on `npm run dev`:** The dev script uses Vite for hot-module reloading. If you're running locally without a Vite-enabled platform environment, use `npm run build && npm start` instead. `npm start` always works after a build.

### Demo Mode (No Database Required)

Set `DEMO_MODE=true` in your `.env` to run with a seeded demo profile. No PostgreSQL setup needed. All features work except persisting new users and payments.

---

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Unless `DEMO_MODE=true` | PostgreSQL connection string (Neon recommended) |
| `DEMO_MODE` | No | Set to `true` to run with seeded demo data, no DB required |
| `SESSION_SECRET` | Yes (prod) | Random secret for session signing |
| `GEMINI_API_KEY` | Recommended | Google Gemini API key for AI synthesis |
| `OPENAI_API_KEY` | Optional | OpenAI fallback for AI features |
| `STRIPE_SECRET_KEY` | Optional | Stripe key for payment processing |

---

## Deployment

Supports Railway, Fly.io, Render, and any VPS with Docker.

- [Railway](RAILWAY_DEPLOY.md) — Easiest setup, ~$5/mo
- [Fly.io](FLY_IO_DEPLOY.md) — Free tier available
- [VPS / Docker](VPS_SELF_HOSTING.md) — Best value

Health check endpoint: `GET /health` → `{ "status": "ok" }`

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for what's live, what's coming, and what's intentionally out of scope.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Documentation

Full documentation index: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## License

Private repository — all rights reserved.
