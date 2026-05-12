# Soul Codex Documentation Index

**Last Updated:** May 12, 2026  
**Status:** Canon refresh (docs-only)

## Start Here

- [README.md](./README.md): quick orientation and local run/build commands.
- [AGENTS.md](./AGENTS.md): hard operating rules and architecture realities.
- [QUICK_START.md](./QUICK_START.md): rapid environment setup.
- [ROADMAP.md](./ROADMAP.md): project direction.

## Canonical Doctrine (New Source of Truth)

- [docs/soul-codex/README.md](./docs/soul-codex/README.md)
- [docs/soul-codex/product-doctrine.md](./docs/soul-codex/product-doctrine.md)
- [docs/soul-codex/system-boundaries.md](./docs/soul-codex/system-boundaries.md)
- [docs/soul-codex/reading-quality-standard.md](./docs/soul-codex/reading-quality-standard.md)
- [docs/soul-codex/confidence-rules.md](./docs/soul-codex/confidence-rules.md)
- [docs/soul-codex/explanation-template.md](./docs/soul-codex/explanation-template.md)
- [docs/soul-codex/parent-family-layer.md](./docs/soul-codex/parent-family-layer.md)

## Engine Planning Canon

- [docs/engine/calculation-contract.md](./docs/engine/calculation-contract.md)
- [docs/engine/ephemeris-strategy.md](./docs/engine/ephemeris-strategy.md)
- [docs/engine/system-inputs.md](./docs/engine/system-inputs.md)
- [docs/engine/system-outputs.md](./docs/engine/system-outputs.md)
- [docs/engine/test-fixtures.md](./docs/engine/test-fixtures.md)

## Existing Root-Level Canon (Legacy Entry Points)

These files remain available but now point to the docs canon above:

- [SOUL_CODEX_CANON.md](./SOUL_CODEX_CANON.md)
- [SOUL_CODEX_OUTPUT_SCHEMA_V1.md](./SOUL_CODEX_OUTPUT_SCHEMA_V1.md)
- [SOUL_CODEX_PARENT_CONTEXT_LAYER.md](./SOUL_CODEX_PARENT_CONTEXT_LAYER.md)

## Technical and Deployment References

- [CONFIDENCE.md](./CONFIDENCE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)
- [DEPLOYMENT_COMPARISON.md](./DEPLOYMENT_COMPARISON.md)
- [PUBLISHING_GUIDE.md](./PUBLISHING_GUIDE.md)
- [app_store_metadata.md](./app_store_metadata.md)
- [server/README.md](./server/README.md)
- [client/README.md](./client/README.md)

## Architecture Reality Check

The active app path in this repo is root-level (`server/index.ts`, `client/src/main.tsx`, root `routes.ts`, root `vite.config.ts`) with shared libraries under `packages/*`.

Documentation that references missing `apps/web` or `apps/api` directories should be treated as stale unless refreshed.
