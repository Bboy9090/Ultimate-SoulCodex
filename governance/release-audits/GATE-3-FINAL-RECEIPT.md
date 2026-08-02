# Gate 3 Final Receipt

Date: 2026-08-02
Repository: `Bboy9090/Ultimate-SoulCodex`
Audit basis: `main` after merged PR #138
Merge commit: `971940cee85d35ca9ddeaa985033df5d1dcb969e`

## Decision

**Gate 3 remains FAILED.**

PR #138 successfully removed the three originally documented silent-upgrade paths, but the post-merge repository-wide re-audit found additional AI ingress paths that still send unverified legacy astrology strings into interpretation prompts.

This receipt intentionally refuses to convert partial remediation into a passing release gate.

## Completed remediation

### Backend astrology service

`server/services/astrology.ts` now:

- returns `sign: null` when no verified ephemeris result exists;
- uses explicit states such as `pending_ephemeris`, `requires_verified_birth_time`, and `requires_location`;
- returns no fabricated planets, houses, aspects, nodes, or Chiron data;
- carries missing-data reasons instead of silently producing approximations.

### Onboarding

`client/src/pages/OnboardingPage.tsx` now:

- removes the date-boundary Sun-sign shortcut;
- does not prefetch compatibility or horoscope content from an approximate sign;
- requires `getVerifiedPlacement(...)` before sending a Sun placement into downstream warmups;
- records `complete_unresolved` when no verified placement is available.

### Poster and export surface

`client/src/pages/PosterPage.tsx` now:

- removes hardcoded Gemini, Pisces, and Sagittarius defaults;
- loads only placements that pass the centralized verification gate;
- clears unresolved placements instead of exporting fabricated values;
- surfaces unresolved status to the user.

### CI evidence

PR #138 passed:

- CI Tests;
- Ultimate SoulCodex CI;
- Railway Container Smoke;
- Chromium and WebKit PWA Offline Browser Validation.

## Post-merge re-audit findings

### Critical blocker 1: Soul Guide database-profile path

File: `routes/chat.ts`

The route passes legacy database fields directly into `runSoulCodexEngine(...)`:

- `profile.sunSign`
- `profile.moonSign`
- `profile.risingSign`

No placement verification status, source, engine, or calculation timestamp is checked before interpretation.

The same file also constructs profile-context prompts from raw `sunSign`, `moonSign`, and `risingSign` values. A caller can therefore supply a sign string and receive interpretation even when the value is unresolved or unverified.

**Severity: Critical**

### Critical blocker 2: Shared AI response gateway

File: `routes/ai-respond.ts`

The gateway creates prompt facts from:

- `astrologyData.sunSign || profile.sunSign`
- `astrologyData.moonSign || profile.moonSign`
- `astrologyData.risingSign || profile.risingSign`

It substitutes `"Unknown"` for missing signs, but it does not require verified evidence before interpreting populated values. It also infers `birthTimeKnown` from the presence of a Rising string rather than verified birth-time and calculation evidence.

The daily horoscope and biography prompt variants explicitly request Sun and Moon references even when the input states are not independently verified.

**Severity: Critical**

### Critical blocker 3: Biography and daily-guidance service

File: `server/services/openai-service.ts`

The service directly inserts legacy `sunSign`, `moonSign`, and `risingSign` strings into AI prompts and deterministic fallback text. The fallback biography and fallback guidance can turn any supplied sign string into confident user-facing identity language without provenance.

**Severity: Critical**

## Search observations

The repository search index still referenced the pre-merge `69acb07...` snapshot during part of this audit. Therefore, search results were treated as discovery hints only. Final blocker confirmation came from direct reads of the current `main` files after merge commit `971940c...`.

Additional legacy sign consumers exist across compatibility, horoscope, profile, prompt, and fallback modules. Their presence is not automatically a violation, because some are type definitions, deterministic lookup tables, tests, or display-only consumers. They require classification in the next audit pass rather than blanket deletion.

## Gate 3 pass conditions still unmet

Gate 3 cannot pass until:

1. all AI ingress paths accept evidence-aware placement objects rather than naked sign strings;
2. raw legacy fields are either migrated to `legacy_unverified` or rejected from interpretation;
3. `birthTimeKnown` is derived from validated birth data, not the presence of a Rising value;
4. deterministic fallbacks refuse to interpret unresolved astrology;
5. adversarial tests prove that a correct-looking sign with a pending status cannot reach AI or fallback interpretation;
6. the follow-up repository-wide audit reports zero critical silent-upgrade paths.

## Required follow-up work order

Create one focused trust PR covering:

- `routes/chat.ts`;
- `routes/ai-respond.ts`;
- `server/services/openai-service.ts`;
- shared server-side placement filtering;
- adversarial AI-ingress regression tests.

## Final classification

```text
Original backend approximation blocker       RESOLVED
Original Onboarding promotion blocker         RESOLVED
Original Poster/export fallback blocker       RESOLVED
AI ingress trust boundary                      FAILED
Deterministic fallback trust boundary          FAILED
Repository-wide zero-critical result           NOT ACHIEVED

GATE 3                                      FAILED
FOUNDATION RELEASE                          BLOCKED
```

The system is safer than before PR #138, but it is not yet entitled to claim a complete trust boundary. A partial lock is still an unlocked door with better branding.
