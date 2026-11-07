# Soul Codex — Release Certification Status

**Last Updated:** 2026-11-07  
**Current Branch:** `main`  
**Current repository main:** `689ed8a22027086ba58566c0d4fd215640e85969`  
**Current Milestone:** Soul Codex 4.1.0 split-store launch / external provider and store-owner completion

## Current Authority Model

Soul Codex now uses separate evidence classes. Do not collapse these into one “release SHA.”

### 1. Current source authority

- Repository `main`: `689ed8a22027086ba58566c0d4fd215640e85969`
- Latest exact-head Store Candidate source: `4932a8699bd47a436222647f993aa87f8d80992a`
- Store Candidate run: `42385459376` — PASS
- Current source mobile identity:
  - Android: `4.1.0` / versionCode `4000015` / package `soulcodex.app`
  - iOS source project: `4.1.0` / build `4000014` / bundle `app.soulcodex.ios`
- Latest qualified source artifacts:
  - release-gate artifact ID: `13579505543`
  - iOS qualification artifact ID: `13579820889`
  - Android qualification artifact ID: `13578818837`
  - Google Play production-handoff artifact ID: `13578888737`

These artifacts qualify the exact source head above. They do not automatically replace the frozen store-upload authority described below.

### 2. Live Railway production authority

Public production domain:
- `https://soulcodex.up.railway.app`

Live service:
- Railway project: `Soulcodex`
- service: `soulcodex-recovery`
- deployment: `b9b475bf-626c-44b2-af28-3da32d782da2`
- deployed commit: `689ed8a22027086ba58566c0d4fd215640e85969`
- deployment status: **SUCCESS**

Runtime evidence:
- `Release: 4.1.0 689ed8a22027086ba58566c0d4fd215640e85969 foundation-v4`
- production environment
- Postgres-backed application storage
- Postgres session store
- schema preflight ready
- `/health` registered
- `/ready` registered
- Gemini provider configured

The older Railway `soulcodex` service is rollback-only and does not own the public production domain.

### 3. Frozen binary/store-upload authority

The historical frozen binary authority remains:

- `governance/release-audits/V4_1_CURRENT_RELEASE_AUTHORITY_2026-10-24.md`

Do **not** rewrite that receipt to a newer SHA merely because `main`, Railway, or source qualification advanced. A new frozen store-upload authority requires a new explicit artifact/submission receipt.

## Current 4.1 Product Boundary

The Free → Plus boundary is enforced across the current app architecture, including:

- Identity/profile surfaces
- Systems Details
- Timeline
- Compatibility/Friends
- Aureon/Soul Guide response depth
- Quick / Standard / Deep Dive reading modes
- online and offline Clarity reading construction
- local/offline profile generation and repair
- stored verification
- server-generated biography/archetype/guidance
- owned-profile API responses
- Ultimate Codex synthesis
- public-share projection
- PDF premium authority

Current core rule:
- accuracy, evidence, uncertainty, missing-data honesty, verified natal geometry, and verified Human Design core remain Free;
- qualified deeper interpretation and paid systems use the shared capability registry;
- planned capabilities are not sold or treated as live gates.

Current capability highlights:
- Free/live: core profile, Big Three, date numerology, evidence provenance, Diamond closure, basic Connections/Compatibility, verified full natal geometry, verified HD Type/Strategy/Authority/Profile
- Plus/live: interpretation depth, full-name numerology, advanced Daily, cross-system synthesis, premium exports
- Plus/planned: deeper HD definition/centers/channels/gates, advanced transits, timeline history, advanced Connections, premium tarot

## Billing and Entitlement Status

Architecture:
- provider-signed evidence is required;
- server verification precedes durable entitlement;
- local flags and retired one-time premium state cannot grant Plus;
- web/native purchase surfaces remain feature-gated and fail closed when configuration/provider evidence is unavailable.

Provider qualification remains **INCONCLUSIVE**.

Authoritative receipt:
- `governance/release-audits/V4_1_NATIVE_BILLING_QUALIFICATION_RECEIPT.md`

Therefore:
- iOS production billing flag: **MUST REMAIN FALSE**
- Android production billing flag: **MUST REMAIN FALSE**
- legacy umbrella native-billing flag: **MUST REMAIN FALSE**

Historical Apple sandbox purchase evidence is not a PASS because server verification failed with `authentication_required` / HTTP 401. The repaired current build still requires real provider purchase/restore/lifecycle qualification.

## App Store Status

Public evidence as of 2026-11-07:
- Soul Codex 4.1 is publicly available on Apple’s store at App Store ID `6764221944`.
- Public storefront evidence does **not** expose an internal build number or source SHA, so public 4.1 availability is not proof of current-main binary parity.
- The exact U.S. listing still shows:
  - App Privacy: `Data Not Collected`
  - age rating: `9+`
  - older marketing copy
  - Railway privacy-policy URL rather than the current canonical GitHub Pages URL
- another regional Apple storefront result surfaced linked-data categories, so public privacy rendering is inconsistent across storefront evidence.

Current external Apple metadata gate:
- issue #346 — App Store privacy, age, description, and privacy-URL reconciliation

Canonical store/legal packet:
- `docs/STORE_SUBMISSION_PACKET.md`
- Privacy: `https://bboy9090.github.io/Ultimate-SoulCodex/privacy/`
- Support: `https://bboy9090.github.io/Ultimate-SoulCodex/support/`
- Account deletion: `https://bboy9090.github.io/Ultimate-SoulCodex/account-deletion/`

## Google Play Status

Current source qualification:
- signed Android AAB build: PASS
- signature verification: PASS
- versionCode: `4000015`
- exact-head Android artifact ID: `13578818837`

Publishing automation:
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` is currently absent in the qualifying GitHub Actions environment;
- automated Play production upload remains unavailable;
- latest production-handoff artifact ID: `13578888737`.

This blocks only automated publishing. Manual Play Console handling remains possible.

Do **not** claim Google Play production publication or current tester-count eligibility without a fresh Play Console receipt.

Historical Play Console evidence remains useful context only; it is not promoted to a current Nov 7 claim.

## Release Gates

### Current source / application

- exact-head build/typecheck: PASS
- qualified astrology and differentiation corpus: PASS
- privacy/security/data-integrity gates: PASS
- Accessibility Device Acceptance: PASS
- Diamond Way synthesis: PASS
- Account Sign-In qualification: PASS on the current release line
- Xcode bootstrap/archive qualification: PASS on qualified heads
- Personal Chart Browser Acceptance: PASS after pinning the Playwright lane to Ubuntu 24.04
- signed Android AAB qualification: PASS
- iOS simulator/archive qualification: PASS

### Production runtime

- Railway exact-main deployment parity: **PASS**
- production schema preflight: PASS
- Postgres storage/session startup: PASS
- live Compatibility API stale-backend defect: RESOLVED
  - issue #213 closed after Railway proxy evidence showed `GET /api/compatibility/ping` = HTTP 200

### External / owner/provider gates still open

- real iOS StoreKit purchase/restore/lifecycle qualification: OPEN
- real Google Play Billing purchase/restore/lifecycle qualification: OPEN
- App Store U.S. privacy/age/copy/legal-URL reconciliation: OPEN (#346)
- fresh Google Play Console tester/track/production-access receipt: OPEN
- final current-build store screenshots / physical-device evidence where required: OPEN

## Active Release Tracking

Primary release tracker:
- issue #202 — Soul Codex 4.1 split-store launch: current release authority and external receipts

Current App Store metadata tracker:
- issue #346

Retired/superseded release issues:
- issue #213 — closed; stale Railway Compatibility backend resolved
- issue #299 — closed; 4.0.1 Android authority superseded by 4.1

## Release Decision

Current source and web production are healthy and SHA-aligned.

The remaining blockers are primarily provider/store-owner evidence classes, not unresolved application architecture:

1. Complete real current-build StoreKit provider qualification before enabling iOS billing.
2. Complete real current-build Play Billing provider qualification before enabling Android billing.
3. Reconcile App Store U.S. metadata against the current 4.1 privacy/store packet.
4. Obtain fresh Play Console tester/track/production evidence before claiming Android production publication.
5. Preserve a new explicit frozen store-upload receipt whenever a new binary is actually selected for submission; do not mutate the Oct 24 historical receipt.

No production billing flag should be enabled merely because source CI, Railway deployment, subscription catalog configuration, or public App Store availability is green.
