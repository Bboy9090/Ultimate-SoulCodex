# RC.2 Full Design, Product Spec, System, and Compatibility Audit

**Audit date:** 2026-08-16  
**Frozen application candidate:** `2e02d1023ddeb4e453236c34f2d4d2b7f6948957`  
**Governance main at audit start:** `794e7c26c035dccf253a794d5b62c522736af9cf`  
**Scope:** source-level UI/design audit, wording/voice audit, client↔server contract audit, Compatibility end-to-end audit, native build configuration review, CI/release-gate review, and live Railway API probe.

## Executive verdict

Soul Codex has a coherent product philosophy and a real visual foundation, but the release candidate is not yet system-uniform and the configured production backend is not compatible with the rc.2 clients.

The most important finding is not cosmetic: the live Railway service is healthy but does not expose the Compatibility API mounted by rc.2 source. The newest Railway deployment visible through GitHub is older than rc.2. This directly explains the reported Compatibility failure and creates risk for any other client/server contract introduced after the deployed backend SHA.

The second confirmed Compatibility defect affects master Life Paths 11/22/33. The Foundation profile and scoring engine support them, but the Compatibility router drops them before scoring.

The strongest design problem is fragmentation rather than lack of design. A centralized Soul Codex token/component system exists, but several major pages create their own local CSS systems, hard-coded palette values, spacing, and vocabulary. Compatibility alone has seven page/surface implementations, while only three are part of the current routed flow.

## Severity summary

| Severity | Finding | Status |
|---|---|---|
| P0 | Live Railway backend is stale and returns 404 for `/api/compatibility/ping` | CONFIRMED, issue #213 |
| P1 | Compatibility drops Life Paths 11/22/33 before scoring | CONFIRMED, issue #214 |
| P1 | No end-to-end Compatibility release smoke crosses UI/client/HTTP/server/result rendering | CONFIRMED TEST GAP |
| P1 | Client/server release identity is not asserted at runtime; `/health` proves liveness only | CONFIRMED RELEASE GAP |
| P2 | Compatibility terminology differs across Hub, Explorer, and Person comparison | CONFIRMED UX/SPEC DRIFT |
| P2 | Compatibility Hub exposes Moon/Rising identity context although Foundation Compatibility does not use those layers | CONFIRMED EXPECTATION RISK |
| P2 | Compare-a-person snapshots the active profile once while Explorer subscribes to profile updates | CONFIRMED STATE-CONSISTENCY GAP |
| P2 | Compatibility has seven page/surface implementations and two server route trees exist in the repository | CONFIRMED MAINTAINABILITY RISK |
| P2 | Compatibility Hub/Route and Timeline use bespoke local CSS instead of consistently consuming shared design primitives | CONFIRMED DESIGN DRIFT |
| P2 | Hosted Stripe premium path requires explicit Apple/Google store-policy treatment before production release | KNOWN STORE-POLICY RISK |
| P3 | Trust/disclaimer copy is repeated across surfaces instead of being composed from one canonical trust component | CONFIRMED COPY REPETITION |
| P3 | Product nouns/actions drift among Identity, Soul Profile, profile, identity map, reading, clarity | CONFIRMED COPY DRIFT |

## 1. Canonical product information architecture

The primary product model should remain four user-facing destinations:

1. **Identity** — the saved person's profile and evidence state.
2. **Reading** — interpretation of the active Identity.
3. **Timeline** — symbolic timing/cycle context.
4. **Compatibility** — bounded relationship reflection using supported evidence.

Use **profile** as the data-object noun and **Identity** as the destination name. Recommended action vocabulary:

- `Create profile`
- `Open Identity`
- `Continue reading`
- `Open Timeline`
- `Open Compatibility`

Avoid switching among “Build my Soul Profile,” “New Profile,” “identity map,” and other names for the same object/action unless the distinction is intentional.

## 2. Canonical visual design specification

### Existing design foundation to preserve

The central design system in `client/src/index.css` is the correct source of truth. It already defines:

- cosmic editorial palette: void/ink/panel/ivory/gold/violet/blue/teal/danger
- semantic Tailwind/shadcn tokens
- serif display + sans body + mono technical typography
- shared page shell
- eyebrow, display, lede
- panel/panel-gold
- primary/secondary buttons
- trust chip
- icon well
- focus-visible behavior
- safe-area-aware page spacing

### Required uniformity rules

All release surfaces should consume shared tokens/components rather than re-specifying hex values or complete page-local theme systems.

**Page shell:** `sc-app-shell` + `sc-page` or a documented equivalent.  
**Max content width:** one of a small named set, not arbitrary 980/1180/etc.  
**Primary radius:** derive from `--radius`; page-specific values should be exceptions.  
**Primary action:** shared Button/sc-button-primary.  
**Secondary action:** shared outline/sc-button-secondary.  
**Cards/panels:** shared semantic panel primitives.  
**Focus:** global focus-visible rule must remain visible on every custom control.  
**Colors:** use CSS variables/semantic Tailwind tokens; no new hard-coded palette aliases unless added to the central token contract.  
**Loading/empty/error:** shared state components with consistent icon, headline, support copy, retry action, and diagnostic detail.

### Current visual mismatches

Compatibility Hub and CompatibilityRoute use bespoke CSS/hard-coded cosmic colors while Explorer/Person use semantic Tailwind tokens. Timeline contains another large inline style system with its own hard-coded palette and layout rules. Navigation and Home are closer to the central design foundation but still contain repeated raw color values that should be tokenized.

This does not mean the screens are individually unattractive. It means visual correctness is maintained manually rather than structurally, which makes drift likely.

## 3. Canonical wording and trust-language specification

### Trust vocabulary

Use these terms consistently:

- **verified** — calculated placement/result with the required independent evidence contract
- **symbolic** — deterministic or tradition-based interpretation that is not independently verified astronomy or empirical relationship science
- **unavailable** — required data/evidence does not exist
- **coverage** — how much supported evidence is available
- **limitation** — what the current evidence cannot justify

Do not use “confidence” when the intended concept is evidence coverage. Do not imply scientific certainty from symbolic scores.

### Repetition policy

The app repeats variants of “evidence-aware,” “uncertainty stays visible,” “not a prediction,” and “not deterministic” across Home, Timeline, Compatibility, and other surfaces. These principles are correct, but repeated long-form disclaimers create copy fatigue.

Recommended composition:

- one short trust chip or trust strip on ordinary screens
- one expandable `Evidence & limitations` component for detail
- full explanation only at first-use/onboarding, Settings/Methodology, or result detail

The trust language should feel like a system, not a disclaimer pasted independently onto every page.

## 4. Compatibility product specification

### Foundation evidence boundary

Compatibility remains bounded to:

- saved profile Sun sign: verified when evidence-complete, otherwise clearly symbolic fallback when supported
- saved deterministic Life Path when valid
- user-supplied symbolic Sun for a manually entered comparison partner
- Human Design excluded until separately promoted under an authoritative compatibility contract
- no Moon/Rising/planet/houses/aspects implied as scoring inputs unless the formula is intentionally expanded and versioned
- no universal soulmate probability or overall relationship-success claim

### Canonical Compatibility dimensions

Current UI uses three competing vocabularies. Standardize the displayed system to four dimensions that map cleanly to the existing backend modes:

| Canonical display label | Backend concept | Meaning |
|---|---|---|
| Romantic connection | `love` / `romantic` | symbolic ease/fit for partnership themes |
| Chemistry & attraction | `attraction` / `chemistry` | symbolic magnetism/activation |
| Communication & friendship | `friendship` / `mentalFriendship` | symbolic mental/social flow |
| Growth & repair | `growth` | symbolic friction, adaptation, and development pressure |

Avoid **Life Partner** as a mode label because it implies a stronger outcome claim than the model supports. “Sexual Chemistry” may be retained only when the intended audience/age/store classification explicitly supports that language; otherwise “Chemistry & attraction” is broader and more consistent.

### Compatibility Hub

The Hub should explain what the model actually uses, not simply display every available identity fact. If Moon/Rising are shown for identity context, label them explicitly `identity context — not used in Foundation Compatibility` or remove them from the Compatibility hero.

The Hub should expose two paths only:

- **Explore patterns** — all 12 signs against the active profile
- **Compare a person** — bounded direct comparison

### Explore patterns

Required states:

- no active profile
- insufficient supported Sun evidence/symbolic fallback
- loading
- available result
- server/API unavailable
- retry

Each result should show canonical dimension label, symbolic score/signal, evidence mode, and limitations without implying measured relationship outcomes.

### Compare a person

Current required input can remain partner name/label + symbolic Sun sign. Name is display-only and should never be required by the scoring formula.

Future optional enhancement: derive the other person's deterministic Life Path locally from a birth date, then transmit/store only the resulting number if the privacy contract permits it. This would make numerology symmetric without sending raw date of birth. This is a future model/version change, not an rc.2 bug fix.

### State consistency

Both Explorer and Compare-a-person should use the same active-profile hook/store subscription. Compare currently snapshots the active profile on mount while Explorer listens for `soulcodex:profile-updated` and storage events. Consolidate into `useActiveProfile()` so verification/reconciliation changes are reflected consistently.

## 5. Confirmed Compatibility defects

### P0 — live backend mismatch

Audit workflow run `31967378736` probed the production API target baked into the native build contract.

Observed:

- `/health` → HTTP 200, `{"status":"ok"}`
- `/api/compatibility/ping` → HTTP 404, `{"message":"Route not found"}`

Frozen rc.2 source mounts the top-level Compatibility router and defines the ping plus both POST routes. GitHub deployment records show the latest Railway deployment surfaced at audit time was SHA `9f605a150f0a4b4d9e0d9aadea3cc877d85b3642` from 2026-08-10, older than the 2026-08-15 rc.2 candidate.

**Effect:** the UI can load but server-backed Compatibility cannot function against that live backend.

**Required remediation:** deploy an exact backend candidate, smoke it, and record release identity. Do not accept mere `/health` liveness as client/server compatibility proof.

### P1 — master Life Paths discarded

Foundation numerology preserves 11/22/33. The archetype scoring engine normalizes them. The Compatibility router's deterministic input filter only allows 1–9, so those values are dropped before the engine.

**Required remediation:** preserve 11/22/33 through the route contract; centralize normalization; add 11/22/33 regression cases for both Explorer and Person comparison.

## 6. Architecture and maintainability audit

### Compatibility surface sprawl

The rc.2 source contains seven Compatibility-related pages/surfaces:

- CompatibilityDashboard
- CompatibilityExperience
- CompatibilityExplorerPage
- CompatibilityHubPage
- CompatibilityPage
- CompatibilityPersonPage
- CompatibilityRoute

Current `App.tsx` routes the Hub wrapper, Explorer, and Person pages. Audit the remaining surfaces for actual imports, migrate any unique required behavior, and delete/archive unused implementations. There should be one Compatibility domain, not several historical versions silently coexisting.

### Route-tree split

Compatibility lives in top-level `routes/compatibility.ts`, while most current server route modules live under `server/routes/`. `server/routes.ts` contains wording that can be read as if Compatibility is in the server route tree. Consolidate the route location or document the split explicitly. Prefer one server routing convention.

### Profile-store adapter

`profileStorage.ts` is currently a compatibility wrapper over `ActiveProfileRepository`. This is safe today, but it is migration debt. New pages should use the canonical repository/hook directly; old wrappers should be removed once callers are migrated.

### Type-contract drift

The stored-profile typing contains permissive/legacy shapes around astrology data while runtime code supports multiple historical aliases. This flexibility helped migration but weakens compile-time guarantees. Define one versioned `ActiveProfileV2`/schema and migrate aliases at the repository boundary rather than throughout feature code.

## 7. Client/server release contract

The release process currently proves binaries and a healthy backend separately but does not prove that the exact mobile client is talking to the exact compatible backend.

Add a release identity endpoint or extend `/health` with non-secret fields:

```json
{
  "status": "ok",
  "appVersion": "4.0.0-rc.3",
  "releaseSha": "<git sha>",
  "apiContract": "foundation-v4"
}
```

Native/web build receipts should record the expected API contract. Release smoke should fail if the backend contract or required routes do not match.

Required API smoke:

1. health/release identity
2. Compatibility ping
3. symbolic Compatibility Explorer POST
4. person comparison POST
5. explicit astronomy verification boundary
6. authentication/session boundary
7. billing checkout boundary without charge

## 8. CI/test audit

Existing Compatibility tests are valuable but mostly contract/unit-level: claims, data minimization, saved-profile shaping, and scoring behavior. The native smoke compiles Android/iOS artifacts but does not exercise the Compatibility user journey or remote API.

Add three layers:

### HTTP integration
Boot the actual server and call the Compatibility routes through Express, validating status codes and response schema.

### Browser journey
Create a local profile → open Compatibility → Explorer → switch dimension → Compare person → render result → simulate API failure/retry.

### Native/network journey
On at least one device/emulator build configured with the release API base, assert required remote routes and render one Compatibility result.

A compile-only native smoke remains useful but must not be labeled feature validation.

## 9. Error-state and diagnostics specification

Every network-backed feature should distinguish:

- offline
- server unreachable
- route/contract mismatch (404/410)
- validation error (4xx with supported payload)
- server error (5xx)
- unexpected response/schema

For release/test builds, expose a non-sensitive diagnostic panel under Settings/About showing:

- client version/build
- client release SHA
- API base hostname
- backend release SHA/API contract from health
- last API connectivity status

This would have made the stale Railway mismatch immediately visible.

## 10. Billing/store-policy audit

The rc.2 premium UI launches hosted Stripe checkout for digital premium functionality. This code path is technically clear and avoids handling card data, but store acceptance is a separate policy question. Do not hard-code hardware smoke to expect StoreKit/Play Billing when the shipped code does not implement those systems. Conversely, do not infer store approval of Hosted Stripe merely because the build signs or installs.

Treat monetization as a dedicated store-policy gate. If native store requirements force a billing architecture change, that change requires a new application candidate/build identity.

## 11. Missing items worth adding

### Release-critical

- exact backend deployment for the mobile candidate
- release SHA/API contract in backend health
- client↔backend compatibility gate
- Compatibility end-to-end smoke
- master-number regression coverage
- store-ingestion payment-policy resolution

### Product/system quality

- `useActiveProfile()` canonical reactive hook
- one Compatibility vocabulary/schema
- one shared `Evidence & limitations` component
- shared Loading/Empty/Error/Retry states
- centralized design-token enforcement/lint policy
- removal of obsolete Compatibility surfaces
- migration from page-local CSS systems to shared primitives
- About/Diagnostics build identity panel
- structured client error telemetry with feature/route/status, excluding sensitive profile data

### Future Compatibility depth, without violating Foundation honesty

- optional local calculation of comparison partner Life Path
- save/revisit comparisons using derived/minimized data only
- side-by-side evidence coverage display
- explain `why this signal moved` per dimension
- versioned formula identifier in result payload
- explicit `not used in this formula` section for Moon/Rising/Human Design when users have those data elsewhere in Identity

## 12. Remediation order

### Phase A — unblock integration

1. Resolve issue #213 by deploying and proving the intended backend.
2. Run live Compatibility ping + both POST routes.
3. Re-run app-level Compatibility journey against that backend.
4. Audit all other server-backed rc.2 routes for deployment skew.

### Phase B — next application candidate

1. Fix issue #214 (11/22/33).
2. Introduce canonical `useActiveProfile()`.
3. Consolidate Compatibility display vocabulary.
4. Correct Hub expectations around Moon/Rising.
5. Add E2E Compatibility and API contract smoke.
6. Advance native build identity; do not rewrite signed rc.2 artifacts.

### Phase C — design consolidation

1. Inventory all page-local CSS/hard-coded palette use.
2. Move reusable patterns into central tokens/components.
3. Convert Compatibility and Timeline first because they currently behave like separate visual sub-systems.
4. Normalize copy/action vocabulary.
5. Add visual regression screenshots for Home, Identity, Reading, Timeline, Compatibility Hub/Explorer/Compare, Settings, Pricing, and key empty/error states.

## 13. Release classification after audit

- **Implemented:** Compatibility code paths exist.
- **Integrated in source:** client and server contracts connect in rc.2 source.
- **Unit/contract validated:** yes for major Compatibility claims and payload behavior.
- **Live production-integrated:** **NO** at audit time because configured Railway backend lacks the Compatibility route.
- **Hardware validated:** not yet.
- **Store accepted:** not yet.
- **Production release:** not eligible while P0 client/server drift remains.

## Final audit rule

A healthy process is not enough. A healthy server is not enough. A signed binary is not enough. Release evidence must prove that the exact client, exact backend contract, exact store-delivered build, and exact user journey agree with one another.
