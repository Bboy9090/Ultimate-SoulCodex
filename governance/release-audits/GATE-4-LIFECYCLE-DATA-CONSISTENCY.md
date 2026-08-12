# Gate 4 — Lifecycle & Data Consistency

**Base:** `main@b5cdcc25665fb1d9c1cc7a087252e69c02b49624`  
**Branch:** `gate4/profile-lifecycle-consistency`  
**Validated candidate:** `b3bfe57b1a32dc9a3672a91cc7305d790d2aaae9`  
**Status:** **REGRESSION + BROWSER LIFECYCLE VALIDATED — CONSUMER DELETION/RESTART JOURNEY OPEN**

## Purpose

Gate 4 proves that a user's Soul Codex state remains coherent through creation, persistence, restart, offline use, migration, corruption, reset, and deletion. Stale or malformed local data must not silently become trusted current state, and reset/deletion must not permit old state to reappear.

## Release-Critical Defects Repaired

The active-profile repository and its existing tests disagreed in several release-critical places:

1. Malformed canonical JSON was swallowed and could be misclassified as missing.
2. Unversioned legacy profiles could not satisfy the current schema validator, making the documented migration path inconsistent.
3. Reset removed only the canonical key, allowing stale legacy profile sources to resurrect.
4. Raw onboarding form data (`onboardingData`) could be promoted into a completed canonical profile solely because it contained a birth date.
5. Root storage/account-deletion tests depended on schema exports for `localUsers` and `accessCodeRedemptions` that were absent, preventing the deletion contract from executing correctly in the Gate 4 lane.

## Remediation

`client/src/lib/ActiveProfileRepository.ts` now:

- distinguishes missing, loaded, and corrupted storage reads;
- treats corrupted canonical state as authoritative failure instead of falling back to stale legacy data;
- migrates eligible unversioned **profile** payloads into schema v1 with read-back validation;
- refuses to silently rewrite explicitly incompatible schema versions;
- excludes raw onboarding questionnaire/form data from completed-profile migration;
- clears canonical and legacy profile sources on reset so stale state cannot resurrect.

Root schema/storage support was also corrected so account-deletion storage contracts execute against the intended in-memory storage implementation instead of failing during module initialization.

## Exact-Head Evidence

Candidate `b3bfe57b1a32dc9a3672a91cc7305d790d2aaae9` completed the following pull-request workflows:

- `Ultimate SoulCodex CI` — **PASS** (run `31580830072`)
- `CI Tests` — **PASS** (run `31580829965`)
- `Gate 4 Lifecycle Validation` — **PASS** (run `31580829935`)
- `Live Ephemeris Evidence` — **FAIL** (run `31580830029`) because the separate live NASA/JPL evidence dependency remains unavailable. Gate 4 does not reclassify that independent failure.

### Profile and deletion contracts — PASS

The Gate 4 contract job passed:

- focused `ActiveProfileRepository` lifecycle regressions;
- account-deletion storage contracts for anonymous-session and authenticated-account data;
- corruption fail-closed behavior;
- legacy profile migration;
- onboarding-data non-promotion;
- reset non-resurrection behavior.

### Chromium + WebKit persistent/offline journey — PASS

The Gate 4 browser job passed on both named browser engines. It:

- builds the production application/PWA assets;
- creates and persists the canonical profile;
- traverses profile-dependent surfaces;
- closes and reopens persistent browser state;
- exercises supported offline mode;
- verifies the same canonical profile identity remains stable after restart/offline use.

## Consumer Deletion Surface

`client/src/pages/AccountDeletionPage.tsx` calls the server deletion endpoint and, after a successful response, clears the query cache, `localStorage`, and `sessionStorage` before replacing the location with `/welcome?accountDeleted=1`.

Storage-level deletion contracts are now exact-head validated. A browser-level deletion journey that performs the user-visible deletion action and then restarts the application to prove the deleted profile cannot reappear remains open and will be tracked as the final Gate 4 closure proof.

## Validation Ladder

- **Implemented:** PASS — lifecycle repository, PWA persistence/offline path, deletion endpoint/UI/storage functions exist.
- **Integrated:** PASS — canonical profile consumers and deletion surfaces are connected.
- **Regression validated:** PASS — corruption/migration/onboarding/reset/deletion storage invariants pass exact-head contracts.
- **Browser lifecycle validated:** PASS — Chromium and WebKit persistence/offline restart journey passes on exact head.
- **Consumer deletion/restart validated:** OPEN — browser-visible delete → restart → non-resurrection receipt still required.
- **Gate 4 release candidate:** OPEN until that final consumer deletion/restart proof is recorded.

## Gate 4 Pass Criteria

- [x] Exact-head core CI passes after profile lifecycle hardening.
- [x] Focused ActiveProfileRepository regression suite passes on exact head.
- [x] Canonical corrupted state cannot silently fall back to legacy state.
- [x] Eligible legacy profile migration produces a valid current-schema canonical profile.
- [x] Raw onboarding form data cannot become a completed canonical profile through legacy migration.
- [x] Reset removes all local profile sources capable of restoring stale identity.
- [x] PWA persistent-browser journey passes on the Gate 4 candidate in Chromium and WebKit.
- [x] Supported offline restart preserves exactly one canonical profile identity.
- [x] Account deletion storage tests pass on exact head.
- [x] Consumer deletion UI clears local/session state after successful server deletion by implementation contract.
- [ ] Browser-level delete → application restart proves the deleted profile cannot resurrect.

## Non-Claims

This receipt does **not** declare full Gate 4 closure yet. It records exact-head regression, storage-deletion, Chromium/WebKit persistence, and offline-restart evidence. The final browser-level consumer deletion/restart proof remains intentionally open.