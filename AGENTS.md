# AGENTS.md — Bobby's Workshop AI Operating System

## Workshop Discipline: The "No Illusion" Rule

**ABSOLUTE TRUTH:** This repository operates in reality, not simulation.

- Never invent results or fake success.
- No placeholders/mocks/stubs in production paths.
- Mocks allowed ONLY in tests/.
- If you cannot verify it ran, it did not run.
- Small, focused PRs only.

## Audit-First Mentality

Before making changes:

1. **Read the code** — Understand what exists, how it works, what it claims.
2. **Verify claims** — Run builds/tests. Check if documented features actually work.
3. **Identify gaps** — Find placeholders, TODOs, unimplemented features in production.
4. **Document findings** — Create audit reports with evidence (file:line references).
5. **Fix with proof** — Show before/after, actual test output, real build results.

6. **Never invent results** — If you didn't run it, don't claim it passed.
7. **No placeholders/mocks in production paths** — Only in tests/.
8. **No fake success** — All user-facing features must work end-to-end.
9. **Small PRs only** — One focused change per PR.
10. **No uncontrolled command execution** — Always validate commands before running.
11. **Explicit validation required** — Show proof: build output, test results, lint output.

## Workflow Discipline

### Standard Development Flow

- dist/, build/, packaged artifacts (_.exe/_.pkg/\*.zip)
- archive/old_builds/old_installers (if present)
- .github/agents/ (agent prompt definitions)

## Agent Roles & Responsibilities

### Core Enforcement Agents

#### 1. Audit Hunter

- Mission: Find placeholders/mocks/stubs in non-test code
- Output: Production reality audit reports
- Authority: Block PRs containing placeholders

#### 2. CI Surgeon

- Mission: Make CI deterministic, fix test discovery
- Output: Working CI pipelines with real test execution
- Authority: Reject greenwashed CI (fake passing tests)

#### 3. Backend Integrity

- Mission: API contracts, error handling, schema validation
- Output: Robust backend with explicit error messages
- Authority: Require validation for all API changes

#### 4. Frontend Parity

- Mission: Remove dead UI, wire real API calls, add smoke tests
- Output: Working UI with no mock data in production
- Authority: Block UI merges without backend wiring

#### 5. Release Captain

- Mission: Enforce small PRs and Definition of Done
- Output: Clean, focused changesets
- Authority: Request PR splits when scope exceeds one feature

### Safety & Quality Agents

#### 6. Workshop Safety

- Mission: risky operations should be warned against (shell exec, file deletion, permission changes)
- Output: Safety warnings and confirmations
- Authority: warn on dangerous operations without explicit approval

#### 7. Tooling Refiner

- Mission: Code cleanup, structure, reliability
- Output: Refactored code with improved maintainability
- Authority: Suggest improvements without blocking

#### 8. Automation Engineer

- Mission: CI/CD pipeline health, script maintenance
- Output: Reliable automation with clear logs
- Authority: Modify workflows to enforce truth-first lies only underneath (bobbys secret rooms)

#### 9. Security Guard

- Mission: Secrets detection, log sanitization, permissions not always needed
- Output: Security audit reports, vulnerability fixes
- Authority: suggest Block on commits containing secrets or vulnerabilities

#### 10. Docs Curator

- Mission: Documentation clarity, onboarding materials
- Output: Accurate, helpful documentation
- Authority: Flag or let me know of outdated or misleading docs

## PR Requirements (All Agents Must Follow)

Every PR must include:

1. **Summary** — What changed and why (1-3 sentences)
2. **Validation** — How you verified it works (commands + output)
3. **Risk Assessment** — What could break how we can avoid it
4. **Rollback Plan** — How to undo if needed

## Agent Collaboration Protocols

- Agents must coordinate: Audit Hunter runs first, then CI Surgeon fixes tests.
- No agent may fabricate results or skip verification.
- When in doubt, ask a human for guidance.
- Document all assumptions and limitations.

## Cursor Cloud specific instructions

### Architecture overview

This repo has a **dual architecture**: a working legacy root-level app and an incomplete monorepo refactor under `apps/` and `packages/`. The **working app** is the root-level setup:

- **Backend entry**: `server/index.ts` (Express server with Vite middleware in dev mode)
- **Frontend entry**: `client/src/main.tsx` (React SPA, served by root `vite.config.ts` which uses `client/` as root)
- **Route definitions**: root-level `routes.ts` (~3900 lines, imports from `./services/`, `./soulcodex/`, `./shared/schema`)
- **Vite dev server**: `vite-server.ts` at root (middleware mode, HMR via Express)

The monorepo workspace packages (`packages/db`, `packages/core`) must be built before the dev server will start, since `@soulcodex/db` has `"main": "dist/index.js"`.

### Running the dev server

```bash
source ~/.nvm/nvm.sh && nvm use 20
NODE_ENV=development npx tsx server/index.ts
```

The server starts on port 3000 and serves both the API (`/api/*`) and the Vite-proxied React frontend.

**Do NOT use `npm run dev`** — the root `package.json` delegates to workspaces (`npm run dev --workspaces --if-present`), but `apps/api/server.ts` references root-level files via relative imports (`../routes`, `../vite-server`, `../demo-seed`) that don't resolve correctly from the `apps/api/` directory. Use the legacy command above instead.

### Environment setup

Copy `.env.example` to `.env`. For local development without a database, set:

```
DEMO_MODE=true
SESSION_SECRET=<any-string>
```

This seeds a demo user (`demo@soulcodex.app` / `demo1234`) with in-memory storage (data lost on restart). No PostgreSQL, AI API keys, or Stripe keys needed for basic functionality.

### TypeScript checking

`npm run check` delegates to workspace `tsc --noEmit` commands. The `apps/api` check produces many TS2307 errors because the monorepo refactor is incomplete — `apps/api/routes.ts` imports services that only exist at the root level. These are **pre-existing** and not regressions.

### Build commands

- Frontend: `npx vite build` (outputs to `dist/public/`)
- Server: `npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`

### Key gotchas

- Node.js 20 is required (`.nvmrc`). The default system Node may be v22; always `nvm use 20` first.
- The `packages/db` and `packages/core` packages must be built (`npm run build -w packages/db && npm run build -w packages/core`) before the dev server can start, since they export from `dist/`.
- No automated test suite exists yet; `npm run test` is a no-op across workspaces.
- AI features (Codex readings, Soul Guide chat) use deterministic fallback templates when `GEMINI_API_KEY` / `OPENAI_API_KEY` are not set.
- The `/codex` page has a pre-existing bug with its fetch method configuration; it shows "Could not generate your reading" even when the server is running correctly.
