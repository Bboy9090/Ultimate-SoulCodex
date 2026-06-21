# Soul Codex

**A personal insight and journaling app for self-discovery**

Soul Codex is your personal identity operating system that provides daily guidance, deep metaphysical insights, and behavioral interpretation tools. Get clarity on who you are, understand your patterns, and track your journey with integrated journaling and reading features.

## What is Soul Codex?

Soul Codex combines multiple wisdom systems—astrology, numerology, Human Design, Gene Keys, and more—into one unified personal insight engine. It's designed for daily use with beautiful, simple guidance on the surface and deep traceability for those who want to understand the calculations behind it.

## MVP Features

Soul Codex includes:

### 1. Profile Onboarding
Create your profile with:
- Name and birth date (required)
- Birth time (optional, improves accuracy)
- Birth location (optional, improves accuracy)
- Behavioral pattern questions for deeper personalization

### 2. Reading Dashboard
Access your complete soul reading with:
- Daily context and guidance
- Complete birth chart analysis
- Human Design chart and type
- Gene Keys activation sequence
- Numerology insights (Life Path, Expression, Soul Urge)
- Integrated multi-system synthesis

### 3. Journal System
Reflect and track your journey:
- 100+ guided reflection prompts
- Daily intention and integration
- Shadow work and gratitude practices
- Transit-aware journaling
- Mood and energy tracking

### 4. Saved Insights
Save and revisit important sections:
- Bookmark key insights from your readings
- Build your personal wisdom library
- Review saved sections anytime

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
