# Soul Codex — Release Certification Status

**Last Updated:** 2026-08-14  
**Current Branch:** `main`  
**Current Main:** `72a24915569a8f276a0d73d4d15e9a805550ae5b`  
**Current Milestone:** v4.0.0-rc1 release certification

---

## Gate Status

| Gate | Status | Evidence / remaining boundary |
|------|--------|-------------------------------|
| Gate 1 | 🟢 **PASS** | Canonical evidence semantics, persistence, certainty ceilings, fail-closed reference behavior, and consumer intelligence contracts are integrated; final closure receipt recorded in `GATE-1-FINAL-RECEIPT.md`. |
| Gate 2 | 🟡 **SIMULATOR / EMULATOR VALIDATED** | Exact-head Android debug APK and iOS Simulator builds pass. Signed artifacts, identified physical-device validation, and store validation remain open. |
| Gate 3 | 🟢 **PASS** | No-silent-upgrade trust boundary remains enforced by regression coverage. |
| Gate 4 | 🟢 **PASS** | Persistent profile, offline restart, real PostgreSQL account deletion, Chromium/WebKit restart, and non-resurrection evidence are closed. |
| Gate 5 | 🟡 **RELEASE TOOLCHAIN / PREFLIGHT VALIDATED** | Release automation is hardened, but signed Android/iOS artifacts, staging/rollback proof, physical hardware, and store acceptance still require account-bound evidence. |

---

## Current Consumer Candidate

PR #203 merged the approved consumer experience and pre-RC intelligence quality tranche to:

`main@72a24915569a8f276a0d73d4d15e9a805550ae5b`

The exact PR head `8c7d5726bf5f3bf8e1a98b714428f7f91aef75ba` passed all required PR gates on the same SHA:

- Ultimate SoulCodex CI — PASS
- CI Tests — PASS
- Gate 4 Lifecycle Validation — PASS
- Mobile Native Smoke — PASS

Gate 4 included Chromium and WebKit persistent-profile/offline/deletion/restart journeys plus real PostgreSQL deletion proof. Mobile Native Smoke produced a successful Android debug APK and iOS Simulator application. After merge, push-triggered Ultimate SoulCodex CI and CI Tests also passed on the main merge SHA.

### Intelligence quality now integrated

- Human-depth chapters use distinct reasoning rather than repeated connective boilerplate.
- Expression and Soul Urge materially affect interpretation instead of appearing only as evidence receipts.
- Cross-system tensions are surfaced with explicit symbolic/non-diagnostic boundaries.
- User fit feedback recalibrates current and later reading guidance.
- Compatibility supports verified, symbolic, and unavailable evidence modes without promoting symbolic inputs into verified astronomy.
- Compatibility scoring is documented and presented as a traditional symbolic model, not empirical relationship science.

---

## Validation Classification

A lower validation class never implies a higher one:

- **Implemented** = code path exists and focused tests exist.
- **Integrated** = caller and dependency paths are connected.
- **Simulator / emulator validated** = reproduced under a named simulator/emulator or CI-native build configuration.
- **Hardware validated** = reproduced on identified physical hardware.
- **Release candidate** = the declared release gates for that candidate pass; publication is not implied.

Accordingly:

- Web/PWA consumer foundation: **release-candidate quality at the code/test level**.
- Android native wrapper: **simulator/emulator/native-build validated**, not hardware validated.
- iOS native wrapper: **simulator validated**, not hardware validated.
- Full signed mobile/store release: **not yet release candidate** because Gate 2 signed/hardware/store evidence and Gate 5 signed/deployment/rollback/store evidence remain open.

---

## Required Before Full Mobile / Store RC

1. Configure Android release signing and produce a signed AAB with SHA-256 receipt.
2. Configure Apple distribution certificate/provisioning and produce a signed App Store IPA with SHA-256 receipt.
3. Install and exercise the signed candidate on identified physical Android and Apple devices.
4. Validate staging deployment, production health, and rollback to a named previous stable candidate.
5. Obtain TestFlight/App Store Connect acceptance for the iOS artifact.
6. Obtain Google Play internal-testing acceptance for the Android artifact.
7. Reconcile store metadata, privacy, support, and account-deletion surfaces with the exact signed candidate.
8. Tag `v4.0.0-rc1` only when the chosen RC scope and its required evidence are explicitly satisfied.

---

## Canonical Receipts

- Diamond Doctrine: `governance/THE-DIAMOND-DOCTRINE.md`
- Gate 1: `governance/release-audits/GATE-1-FINAL-RECEIPT.md`
- Gate 2: `governance/release-audits/GATE-2-NATIVE-MOBILE-VALIDATION.md`
- Gate 3: `governance/release-audits/GATE-3-FINAL-RECEIPT.md`
- Gate 4: `governance/release-audits/GATE-4-LIFECYCLE-DATA-CONSISTENCY.md`
- Gate 5: `governance/release-audits/GATE-5-RELEASE-READINESS.md`

Truth before certainty remains the release rule: documentation, simulator builds, signed artifacts, physical-device proof, deployment proof, and store acceptance are separate evidence classes and are never silently promoted into one another.
