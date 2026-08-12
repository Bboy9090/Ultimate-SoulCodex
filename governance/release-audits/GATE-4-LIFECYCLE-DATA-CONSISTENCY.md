# Gate 4 — Lifecycle & Data Consistency

**Base:** `main@b5cdcc25665fb1d9c1cc7a087252e69c02b49624`  
**Branch:** `gate4/profile-lifecycle-consistency`  
**Status:** **IN PROGRESS — PROFILE LIFECYCLE HARDENED, EXACT-HEAD CI REQUIRED**

## Purpose

Gate 4 proves that a user's Soul Codex state remains coherent through creation, persistence, restart, offline use, migration, corruption, reset, and deletion. The gate is intentionally broader than a happy-path browser session: stale or malformed local data must not silently become trusted current state, and reset/deletion must not permit old state to reappear.

## Defects Found on Main

The active-profile repository and its existing tests disagreed in three release-critical places:

1. Malformed canonical JSON was swallowed by the storage helper and therefore looked absent rather than corrupted.
2. Legacy migration passed unversioned legacy payloads through the current-schema validator, which requires schema version 1, making the documented migration path unreachable for ordinary legacy data.
3. Reset removed only the canonical key. Remaining legacy keys could be discovered on the next load and resurrect a profile the user had just cleared.

These are lifecycle consistency defects, not cosmetic behavior.

## Remediation on This Branch

`client/src/lib/ActiveProfileRepository.ts` now:

- distinguishes missing, loaded, and corrupted storage reads;
- treats an existing corrupted canonical profile as authoritative failure and does not silently fall back to stale legacy data;
- migrates eligible unversioned legacy payloads into the current schema with schema/timestamp normalization;
- refuses to silently rewrite an explicitly incompatible legacy schema version;
- immediately reads back and validates canonical saves/migrations;
- clears the canonical profile plus every legacy profile source on reset so stale state cannot resurrect.

## Regression Coverage

`client/src/lib/__tests__/ActiveProfileRepository.test.ts` now locks:

- canonical save/load and schema/timestamp enrichment;
- malformed canonical data reported as corrupted;
- corrupted canonical data remaining fail-closed even when a valid legacy profile exists;
- unversioned legacy migration into schema v1;
- migration read-back becoming the canonical loaded profile;
- explicitly incompatible legacy schema not silently rewritten;
- generate → close/reopen → compatibility identity continuity;
- reset removing canonical and legacy profile sources.

## Existing End-to-End Lifecycle Evidence on Main

The repository already contains a PWA browser journey in `tests/pwa/foundation-profile-journey.spec.mjs`. It creates one profile, verifies the canonical local profile identity, traverses Reading/Timeline/Compatibility, closes the persistent browser context, reopens it, enters supported offline mode, and verifies the same profile identity remains stable while service-worker control remains active.

The corresponding `.github/workflows/pwa-offline-browser.yml` currently runs manually and on version tags, not on ordinary pull requests. Gate 4 therefore does not claim new exact-head browser evidence from that workflow until it is run against the candidate or promoted into an appropriate release-gate trigger.

## Existing Deletion Evidence on Main

`tests/account-deletion.test.ts` covers storage-layer deletion for:

- anonymous session profile, contacts, frequency logs, push subscriptions, and access-code redemption;
- authenticated user account, profile-derived assessment data, and access-code redemption.

`package.json` exposes this as `npm run test:account-deletion`. Gate 4 still requires exact-head execution evidence and route/consumer-path reconciliation before deletion is promoted to fully validated consumer behavior.

## Gate 4 Validation Ladder

- **Implemented:** lifecycle repository, PWA persistence path, offline service-worker path, and deletion storage functions exist.
- **Integrated:** active-profile consumers use the canonical repository and deletion routes connect to storage deletion behavior.
- **Regression validated:** corruption/migration/reset invariants pass focused automated tests.
- **Browser lifecycle validated:** one canonical profile survives route traversal, browser restart, and supported offline mode on named browser engines.
- **Deletion journey validated:** user-visible deletion request removes server and local profile state and does not resurrect after restart.
- **Release candidate:** all Gate 4 checks pass on the exact release candidate with no unresolved lifecycle contradiction.

## Gate 4 Pass Criteria

- [ ] Exact-head CI passes after profile lifecycle hardening.
- [ ] Focused ActiveProfileRepository regression suite passes on exact head.
- [ ] Canonical corrupted state cannot silently fall back to legacy state.
- [ ] Legacy migration produces a valid current-schema canonical profile.
- [ ] Reset removes all local profile sources capable of restoring stale identity.
- [ ] PWA persistent-browser journey passes on the Gate 4 candidate in Chromium and WebKit.
- [ ] Supported offline restart preserves exactly one canonical profile identity.
- [ ] Account deletion storage tests pass on exact head.
- [ ] Consumer deletion flow clears/reconciles local active-profile state after server deletion.
- [ ] Reopen after deletion/reset cannot resurrect the deleted profile.

## Non-Claims

This receipt does not yet declare Gate 4 PASS. It records defects, implemented remediation, and existing evidence surfaces. Exact-head automated results and the full deletion/restart consumer path remain required before closure.
