# Ultimate Soul Codex (Engine of the Eternal Now)

A premium, behavior-first “life mapping” app: onboarding → profile → Codex reading → today/timeline/compatibility — with **explicit confidence labeling** so users always know what’s locked in.

## Repo structure (monorepo)

- **`apps/web`**: Vite + React web app (UI)
- **`apps/api`**: Express API entrypoint (bundled to `dist/server.js`)
- **`packages/*`**: shared libraries
  - **`packages/core`**: core compute + prompts
  - **`packages/db`**: Drizzle schema + shared zod schemas
  - **`packages/ai`**: validation pipeline (clarity/structure/blandness)
  - **`packages/astrology`**: astrology utilities and related engines
- **Root `routes.ts` / `server/index.ts`**: canonical API router + server harness used by the built app

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Build for production

```bash
npm run build
npm run start
```

## Confidence / trust system

Confidence is a first-class model: `verified | partial | unverified` with an explicit reason and an optional AI assurance note.

See `CONFIDENCE.md` for:
- badge rules
- “where computed / where displayed”
- display guidance

## Repository rules

See `AGENTS.md` (audit-first, no fake success, small PRs).
