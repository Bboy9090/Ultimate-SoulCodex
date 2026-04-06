## Legacy directory: `server/` (quarantined)

This repository’s canonical backend implementation lives in:

- `apps/api` (entrypoint / build wiring)
- root `routes.ts` + `vite-server.ts` (canonical Express router + dev/static middleware)
- shared libraries under `packages/*`

The `server/` directory contains legacy/duplicated backend code from earlier iterations.

### Do not extend

Do not add new routes/services here. Migrate any needed behavior into canonical paths instead.

