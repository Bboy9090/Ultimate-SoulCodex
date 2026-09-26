# Soul Codex

**A personal insight and journaling app for self-discovery**

Soul Codex combines governed symbolic systems only when their evidence contracts pass. It currently uses independently verified natal astrology, deterministic numerology, and the verified Human Design core as stable identity inputs. The repository contains historical code for many additional systems, but code presence does **not** make a system production-governed.

The executable source of truth is `shared/system-registry.ts`, mirrored in `governance/SYSTEM_REGISTRY.md`.

---

## Current Production System States

### Governed stable identity inputs

| System | Current production scope |
|---|---|
| **Natal Astrology** | Verified Sun, Moon, Rising, ten natal planets, Equal Houses, Ascendant, Midheaven, major aspects, Mean Nodes, qualified Chiron, and verified-chart aggregates such as elements/modalities |
| **Numerology Core** | Life Path, Birthday, Expression, Soul Urge, Personality, and Maturity under the documented deterministic arithmetic policy |
| **Human Design Core** | Verified Type, Strategy, Authority, Profile, Definition, centers, channels, gates, and conscious/unconscious gate-line activations |

### Governed current guidance

| System | Current production scope |
|---|---|
| **Numerology Cycles** | Personal Year/day-style deterministic timing themes used as reflection, not prediction |
| **Verified natal / Human Design context** | May support current guidance only when the relevant personal evidence contract is already satisfied |

### Supporting context, not birth-derived identity

| System | Current production scope |
|---|---|
| **MBTI / Enneagram / similar assessments** | User-supplied assessment context only. Soul Codex does not infer these types from a birth chart. |
| **Moral Compass** | User-response context only; not derived from zodiac, numerology, or compatibility weights |

### Inspect-only

- Human Design Variables / Incarnation Cross naming remains inspect-only until independently qualified.

### Unavailable / quarantined from production synthesis

The registry currently excludes unsupported legacy implementations and placeholders for systems including:

- Vedic astrology / Nakshatras
- Gene Keys
- Chinese astrology
- Ayurveda
- I Ching
- Mayan / Tzolk'in-style astrology
- Chakras / energy-center profiles
- Runes
- Tarot birth cards
- Kabbalah / Tree of Life paths
- Sacred geometry
- Sabian Symbols
- Biorhythms
- Asteroids
- Arabic Parts / Lots
- Fixed stars
- Astrocartography
- Palmistry
- Solar/Lunar Returns and Secondary Progressions

These systems may be promoted later only after they receive their own calculation, evidence, privacy, and interpretation contracts.

---

## The 4 Core Experiences

### 1. Profile

Enter birth data once. Soul Codex builds the strongest profile justified by the available evidence. Exact-time systems stay unresolved when exact time or location evidence is missing; the app does not substitute noon or fabricate placements.

### 2. Daily

Daily guidance is selective rather than additive. Soul Codex chooses only context-qualified systems for the job instead of forcing every registered system into every reading. Repeated themes may be shown as symbolic resonance, never as extra proof or inflated certainty.

### 3. Compatibility

Compatibility uses saved profile evidence and symbolic relationship models. It distinguishes verified inputs from interpretive scoring and does not present symbolic compatibility scores as empirical predictions of relationship success.

### 4. Codex Reading

The Codex synthesizes qualified evidence into a readable narrative, with unresolved and excluded systems kept explicit. AI-assisted prose may improve clarity, but it may not invent missing evidence, rewrite system status, or turn symbolic interpretation into factual identity claims.

---

## Accuracy and Evidence Doctrine

- No invented noon charts.
- No fake houses, aspects, Nodes, Chiron, Human Design, or unsupported system values.
- No chart-derived MBTI, Enneagram, dosha, chakra, rune, tarot, or Gene Key fallback.
- Exact astronomical verification requires explicit zoned instants and governed tolerance policies.
- Symbolic interpretations stay labeled as symbolic.
- Missing evidence produces **unresolved**, not filler.
- More systems do not automatically mean more certainty.

Calculation paths may be local or server-side depending on the feature. Governed astronomy uses pinned calculation engines and independent verification policies where required.

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

For deeper understanding:

- `docs/soul-codex/README.md`
- `docs/soul-codex/product-doctrine.md`
- `docs/soul-codex/system-boundaries.md`
- `docs/soul-codex/reading-quality-standard.md`
- `docs/soul-codex/confidence-rules.md`
- `docs/soul-codex/explanation-template.md`
- `docs/soul-codex/parent-family-layer.md`
- `docs/engine/calculation-contract.md`
- `docs/engine/ephemeris-strategy.md`
- `docs/engine/system-inputs.md`
- `docs/engine/system-outputs.md`
- `docs/engine/test-fixtures.md`

## Working architecture in this repo

The active app path in this worktree is root-level:

- Backend entry: `server/index.ts` (Express + Vite middleware in dev).
- Frontend entry: `client/src/main.tsx` (served by root `vite.config.ts` with `client/` root).
- Route layer: root `routes.ts`.
- Shared and engine packages: `packages/*` (`core`, `db`, `ai`, `astrology`).

## Quick Start

### Prerequisites
- Node.js 20 (use nvm: `nvm use 20`)
- npm 10+

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/Bboy9090/Ultimate-SoulCodex.git
cd Ultimate-SoulCodex
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

For local development without a database, set in `.env`:
```
DEMO_MODE=true
SESSION_SECRET=your-secret-here
```

This enables demo mode with in-memory storage for local development.

4. **Build workspace packages**
```bash
npm run build -w packages/db
npm run build -w packages/core
```

5. **Start the development server**
```bash
source ~/.nvm/nvm.sh && nvm use 20
NODE_ENV=development npx tsx server/index.ts
```

6. **Open the app**
Navigate to `http://localhost:5000`

### Production Build

```bash
npm run build:client  # Build frontend to dist/public/
npm run build:server  # Build backend to dist/
npm start             # Run production server
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SESSION_SECRET` | Yes | Session encryption key. Server fails fast without it. |
| `DEMO_MODE` | No | Set `true` for in-memory storage (no database). |
| `DATABASE_URL` | No | Postgres connection string. Omit for MemStorage. |
| `GEMINI_API_KEY` | No | Google Gemini AI. Falls back to deterministic if absent. |
| `GROQ_API_KEY` | No | Groq AI (second cascade tier). |
| `OPENAI_API_KEY` | No | OpenAI (third cascade tier). |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins for production. Dev allows all. |
| `NODE_ENV` | No | Set `production` for secure cookies, generic errors, helmet defaults. |
| `PORT` | No | Server port (default: 5000). |

### Testing

Six smoke test suites verify all core systems. No database or AI keys required for non-AI tests.

```bash
# Service-level tests (no server needed)
npx tsx scripts/smoke-astrology.ts       # 7/7 — natal chart, vedic, transits
npx tsx scripts/smoke-compatibility.ts   # 6/6 — scoring honesty, missing systems
npx tsx scripts/smoke-unknown-time.ts    # 7/7 — AI unknown-time guards

# Server-level tests (start server first)
SESSION_SECRET=dev DEMO_MODE=true PORT=5055 npx tsx server/index.ts &
SMOKE_BASE=http://localhost:5055 npx tsx scripts/smoke-premium.ts      # 7/7
SMOKE_BASE=http://localhost:5055 npx tsx scripts/smoke-production.ts   # 7/7
SMOKE_BASE=http://localhost:5055 npx tsx scripts/smoke-ai-live.ts      # 4/4 (needs AI keys)
```

**Total: 38/38 tests across 6 suites.**

## Architecture Overview

The active app structure:

- **Backend**: `server/index.ts` (Express + Vite middleware in dev mode)
- **Frontend**: `client/src/main.tsx` (React SPA)
- **Routes**: `routes.ts` (~3900 lines)
- **Packages**: `packages/*` (core, db, ai, astrology)

### Key Files
- Confidence model: `CONFIDENCE.md`
- Runtime confidence: `packages/core/compute/confidence.ts`
- Output schema: `packages/core/soulcodex-v1/schema.ts`
- Generator pipeline: `packages/core/soulcodex-v1/generate.ts`

## Known Limitations (MVP)

- No fake or randomly generated mystical data
- Basic personalization (not deeply customized at MVP stage)
- AI-powered features require API keys (GEMINI_API_KEY or OPENAI_API_KEY)
- Journal UI page pending implementation
- Saved insights UI pending implementation

## Next Steps

See `ROADMAP.md` for planned features:
- Dynamic reading engines
- Data privacy review
- Mobile sync capabilities
- Enhanced journal UI
- Saved insights interface

## Contributing

See `AGENTS.md` for development guidelines and the "No Illusion" rule:
- Never invent results or fake success
- No placeholders/mocks in production paths
- Small, focused PRs only
- Always verify changes work end-to-end

## License

Private repository - All rights reserved.
