# Gate 4 — Lifecycle & Data Consistency

**Final validated candidate:** `fba7a2e0f886b628241be7557999784a4b5aae59`  
**Merged by PR:** `#194`  
**Merge commit:** `6accba21275a7ab49a5f3b9cce1f8ab2eab27618`  
**Status:** **PASS — CONSUMER DELETION / RESTART NON-RESURRECTION VALIDATED**

## Purpose

Gate 4 proves that Soul Codex user state remains coherent through creation, persistence, restart, offline use, legacy migration, corruption, reset, and account deletion. Corrupted or stale state must fail closed, and deleted/reset profile state must not silently reappear.

## Release-Critical Defects Repaired

1. Malformed canonical JSON could be misclassified as missing.
2. Unversioned legacy profiles could not consistently migrate into the current schema.
3. Reset removed only the canonical key and could allow stale legacy state to resurrect.
4. Raw onboarding form data could be promoted into a completed canonical profile solely because it contained a birth date.
5. Root account-deletion contracts could not execute because required schema exports were absent.
6. IndexedDB deletion could be blocked by another tab while leaving local profile state behind after irreversible server deletion.
7. The public account-deletion route and Settings entry point were not fully reconciled with the consumer deletion journey.

## Final Remediation

The merged Gate 4 implementation now:

- distinguishes missing, loaded, and corrupted active-profile storage states;
- treats corrupted canonical state as authoritative failure instead of falling back to stale legacy data;
- migrates eligible legacy **profile** payloads into schema v1 with read-back validation;
- excludes raw onboarding questionnaire data from completed-profile migration;
- refuses incompatible schema upgrades rather than silently rewriting them;
- removes canonical and legacy profile sources on reset;
- routes the consumer account-deletion page and Settings entry point to the real deletion path;
- uses the real API request helper for deletion;
- clears query cache, Web Storage, offline fallback storage, and the `soulcodex-offline` IndexedDB profile store after successful server deletion;
- closes IndexedDB connections on `versionchange` and treats a blocked database removal as non-fatal once the profile object store is already cleared;
- restarts the application after deletion and verifies the profile cannot resurrect.

## Exact-Head Evidence

Candidate `fba7a2e0f886b628241be7557999784a4b5aae59` completed:

- `Ultimate SoulCodex CI` — **PASS** (`31589250693`)
- `CI Tests` — **PASS** (`31589250735`)
- `Gate 4 Lifecycle Validation` — **PASS** (`31589250773`)
- `Mobile Native Smoke` — **PASS** (`31589250671`)

At that time the independent live NASA/JPL workflow was still red from Horizons service availability. That unrelated external-reference lane was subsequently hardened separately in PR #195; Gate 4 does not reinterpret that external outage as lifecycle evidence.

### Profile and deletion contracts — PASS

The exact-head Gate 4 contract job passed:

- active-profile corruption, migration, onboarding non-promotion, continuity, and reset contracts;
- anonymous-session and authenticated-account deletion storage contracts;
- blocked IndexedDB database-removal regression coverage after profile-store clearing.

### Chromium + WebKit lifecycle journeys — PASS

The browser job passed on Chromium and WebKit and explicitly ran:

- persistent profile journey;
- offline restart journey;
- account deletion journey;
- post-deletion application restart;
- deleted-profile non-resurrection verification.

The workflow step `Run persistent profile, offline restart, and account deletion restart journeys` completed successfully on the exact candidate head.

## Gate 4 Guarantees

Gate 4 now establishes:

1. Canonical corrupted state cannot silently fall back to stale legacy state.
2. Only eligible completed-profile legacy payloads can become canonical profiles.
3. Raw onboarding form state cannot masquerade as a generated Soul Codex profile.
4. Reset clears local profile sources capable of restoring stale identity.
5. Supported offline restart preserves one coherent canonical profile identity.
6. Account deletion removes server-side storage covered by the deletion contract and clears client-side profile state.
7. A blocked IndexedDB database deletion cannot leave profile records behind once the store clear succeeded.
8. Browser restart after deletion does not resurrect the deleted profile.

## Validation Ladder

- **Implemented:** PASS
- **Integrated:** PASS
- **Regression validated:** PASS
- **Browser lifecycle validated:** PASS
- **Consumer deletion/restart validated:** PASS
- **Gate 4:** **PASS**

## Non-Claims

Gate 4 does not prove signed mobile artifacts, physical-device validation, deployment rollback, TestFlight/App Store acceptance, or Google Play acceptance. Those remain release/signing/store gates.
