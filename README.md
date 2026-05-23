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

This enables demo mode with an in-memory user (`demo@soulcodex.app` / `demo1234`).

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
Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build:client  # Build frontend to dist/public/
npm run build:server  # Build backend to dist/
npm start             # Run production server
```

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
