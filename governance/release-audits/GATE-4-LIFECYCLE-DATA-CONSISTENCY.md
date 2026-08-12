# Gate 4 — Lifecycle & Data Consistency

**Closure lineage:** `main@4a06ea416e312bec28755f77abf5b6d31e32bfe1`  
**Validated implementation head:** `2bae6eaacc883bd76062bf5ec6d10fd25c7c1daf`  
**Runtime repair:** PR `#198`  
**Status:** **PASS — LIFECYCLE, PERSISTENCE, OFFLINE RESTART, AND CONSUMER DELETION/NON-RESURRECTION VALIDATED**

## Purpose

Gate 4 proves that a user's Soul Codex state remains coherent through creation, persistence, restart, offline use, migration, corruption, reset, and deletion. Stale or malformed local data must not silently become trusted current state. Persistent server-owned data must survive ordinary process restart semantics, and deletion must remove both server-owned and client-owned state without allowing a deleted profile to reappear.

## Release-Critical Defects Repaired

The Gate 4 lane ultimately exposed two classes of release defect: local profile lifecycle defects and a production server split-brain defect.

### Local profile lifecycle

The active-profile repository and its older behavior disagreed in several release-critical places:

1. Malformed canonical JSON could be misclassified as missing.
2. Unversioned legacy profiles could not consistently satisfy current schema validation.
3. Reset could leave legacy sources capable of resurrecting stale identity.
4. Raw onboarding form data (`onboardingData`) could be mistaken for a completed profile candidate.
5. The onboarding non-promotion assertion existed outside the Gate 4 CI suite and therefore was not protected by the gate.

`client/src/lib/ActiveProfileRepository.ts` and the Gate 4 contracts now:

- distinguish missing, loaded, and corrupted canonical state;
- treat corrupted canonical state as an authoritative failure rather than falling back to stale legacy state;
- migrate eligible unversioned **profile** payloads into schema v1 with read-back validation;
- refuse to silently rewrite explicitly incompatible schema versions;
- exclude raw onboarding questionnaire/form data from completed-profile migration;
- clear canonical and legacy profile sources on reset so stale state cannot resurrect;
- execute the onboarding non-promotion assertion in the CI-protected Gate 4 suite.

### Active production persistence and deletion

The final Gate 4 review uncovered a more serious production architecture defect:

- `server/index.ts` registers `server/routes.ts`, while the previously inspected deletion endpoint lived in the legacy root `routes.ts`;
- active `server/routes.ts` therefore did not expose `DELETE /api/auth/account`;
- active `server/storage.ts` was in-memory only, so server-owned profile state could disappear across process restarts even with `DATABASE_URL` configured;
- anonymous profile creation was not consistently bound to the Express session that must later own deletion;
- the browser deletion journey mocked a successful server response and therefore could not reveal the inactive route/persistence split;
- `server/db.ts` used the Neon WebSocket adapter for a generic PostgreSQL deployment contract, producing `ECONNREFUSED 127.0.0.1:443` against an ordinary PostgreSQL service.

PR `#198` repaired the active production path:

- `server/storage.ts` now selects a focused PostgreSQL-backed implementation when `DATABASE_URL` is configured and uses memory only for local/demo operation;
- `server/session.ts` installs the active Express session middleware and uses PostgreSQL-backed sessions when a database is available;
- anonymous profiles are associated with the actual server-generated `sessionID`;
- `DELETE /api/auth/account` is registered in the active `server/routes.ts` path used by `server/index.ts`;
- `server/db.ts` now uses Drizzle's standard Node/PostgreSQL transport rather than the Neon WebSocket adapter for the active server;
- Gate 4 CI provisions an isolated PostgreSQL 16 service and applies the current Drizzle schema;
- the persistent deletion proof obtains a genuine signed `connect.sid` cookie from the active session middleware, writes session-owned rows through the active DB authority, calls the real HTTP deletion route, and proves those rows are gone afterward;
- Gate 4's pull-request path filter now watches the active route, storage, session, DB, and schema files so future persistence/deletion changes cannot bypass the gate.

## Exact-Head Evidence

Implementation head `2bae6eaacc883bd76062bf5ec6d10fd25c7c1daf` completed all required pull-request workflows successfully before merge:

- `Ultimate SoulCodex CI` — **PASS** (run `31614893478`)
- `CI Tests` — **PASS** (run `31614893500`)
- `Mobile Native Smoke` — **PASS** (run `31614893465`)
- `Gate 4 Lifecycle Validation` — **PASS** (run `31614893432`)

PR `#198` then merged to `main` at `4a06ea416e312bec28755f77abf5b6d31e32bfe1`.

### Profile lifecycle contracts — PASS

The Gate 4 Node contract suite proves:

- canonical save/reload with current schema;
- corrupted canonical state remains corrupted rather than silently degrading to missing;
- corrupted canonical state cannot fall back to stale legacy profile state;
- eligible unversioned legacy profile migration occurs once and validates as schema v1;
- raw onboarding form data is not promoted into a completed active profile;
- explicitly incompatible schema versions are not silently upgraded;
- reset removes canonical, legacy, and onboarding sources capable of resurrecting stale identity.

### Persistent production deletion — PASS

The PostgreSQL-backed Gate 4 job proves the active server path end-to-end:

1. starts PostgreSQL 16;
2. applies the repository's current Drizzle schema;
3. starts the active route/session/storage stack;
4. obtains a genuine signed Express session cookie;
5. associates persistent profile/redemption state with the server-generated session id;
6. calls the real `DELETE /api/auth/account` route over HTTP;
7. verifies the session-owned persistent rows no longer exist afterward.

This is a production-path proof, not a mocked response and not an in-memory-only storage substitute.

### Chromium + WebKit lifecycle and deletion/restart — PASS

The Gate 4 browser job passes on both named browser engines. It validates:

- production application/PWA build output;
- canonical profile creation and persistence;
- close/reopen lifecycle behavior;
- supported offline restart behavior;
- account deletion UI flow;
- local and session state clearing after server success;
- application restart after deletion;
- deleted-profile non-resurrection.

## Validation Ladder

- **Implemented:** PASS — lifecycle repository, persistent active server storage, session ownership, deletion endpoint, and browser deletion UI exist.
- **Integrated:** PASS — the deployed `server/index.ts` route stack uses the active persistence/session/deletion path.
- **Regression validated:** PASS — corruption, migration, onboarding, reset, storage deletion, and route deletion invariants pass exact-head contracts.
- **Persistent database validated:** PASS — isolated PostgreSQL 16 route/session/storage deletion proof passes.
- **Browser lifecycle validated:** PASS — Chromium and WebKit persistence/offline restart journeys pass.
- **Consumer deletion/restart validated:** PASS — delete → clear local/session state → restart → non-resurrection passes in both browser engines.
- **Mobile smoke:** PASS on the exact implementation head.
- **Gate 4 release candidate:** **PASS**.

## Gate 4 Pass Criteria

- [x] Exact-head core CI passes after lifecycle/persistence hardening.
- [x] Focused ActiveProfileRepository regression suite passes.
- [x] Canonical corrupted state cannot silently fall back to legacy state.
- [x] Eligible legacy profile migration produces valid current-schema canonical state.
- [x] Raw onboarding form data cannot become a completed canonical profile through legacy migration.
- [x] Reset removes local profile sources capable of restoring stale identity.
- [x] Active production storage uses PostgreSQL when `DATABASE_URL` is configured.
- [x] Anonymous server-owned profiles are associated with their real session identity.
- [x] Active production route exposes account/session deletion.
- [x] Real HTTP deletion with a signed session cookie removes persistent PostgreSQL state.
- [x] Gate 4 CI watches the production route/storage/session/DB/schema dependencies.
- [x] PWA persistent-browser journey passes in Chromium and WebKit.
- [x] Supported offline restart preserves exactly one canonical profile identity before deletion.
- [x] Consumer delete → application restart proves the deleted profile cannot resurrect.
- [x] Mobile native smoke remains green on the exact implementation head.

## Non-Claims

Gate 4 closure proves lifecycle and data consistency for the tested profile/session/deletion surfaces. It does **not** by itself certify every authentication provider, App Store signing credential, physical device, store-console submission, production deployment, backup/restore operation, or external ephemeris provider. Those remain governed by their own release gates.
