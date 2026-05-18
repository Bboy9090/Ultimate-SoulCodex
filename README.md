# Ultimate Soul Codex (Engine of the Eternal Now)

Soul Codex is a personal identity operating system: daily guidance on the surface, deeper metaphysical and behavioral interpretation underneath, with explicit confidence labeling.

## Canonical doctrine docs

Product and quality canon now lives in `docs/`:

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

## Run locally

```bash
npm install
cp .env.example .env
source ~/.nvm/nvm.sh && nvm use 20
NODE_ENV=development npx tsx server/index.ts
```

Open `http://localhost:3000`.

## Build

```bash
npm run build -w packages/db
npm run build -w packages/core
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

## Confidence and contracts

- Confidence model overview: `CONFIDENCE.md`
- Runtime confidence logic: `packages/core/compute/confidence.ts`
- Structured output schema: `packages/core/soulcodex-v1/schema.ts`
- Generator and pipeline: `packages/core/soulcodex-v1/generate.ts` and `packages/core/soulcodex-v1/engine/`

## Repository rules

See `AGENTS.md` for audit-first and no-illusion requirements.
