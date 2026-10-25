# Soul Codex — Release Certification Status

**Last Updated:** 2026-10-24
**Current Branch:** `main`
**Release-authority main snapshot:** `8ee3757df895abe806c3fa1a2ee048d4fc84e392`
**Current Milestone:** Soul Codex 4.1.0 split-store launch / provider qualification

---

## Gate Status

| Gate | Status | Evidence / remaining boundary |
|---|---|---|
| Gate 1 | 🟢 **PASS** | Canonical evidence semantics, fail-closed synthesis, differentiation, Galactic Code trust boundaries, current entitlement projection, and profile UI integration are merged and regression-covered. |
| Gate 2 | 🟡 **NATIVE PACKAGING QUALIFIED / DEVICE-PROVIDER EVIDENCE OPEN** | Android 4.1.0 signed AAB is built and signature-verified; iOS 4.1.0 Simulator Release and generic-device archive qualification pass. Current-build physical-device purchase/restore/lifecycle evidence remains incomplete. |
| Gate 3 | 🟢 **PASS** | No-silent-upgrade and entitlement downgrade boundaries remain regression-covered. |
| Gate 4 | 🟢 **PASS** | Persistent profile, offline restart, real PostgreSQL account deletion, non-resurrection, and Galactic persistence deletion lifecycle are covered. |
| Gate 5 | 🟡 **STORE CANDIDATE QUALIFIED / EXTERNAL LAUNCH GATES OPEN** | Exact-head Store Candidate, security, accessibility, Xcode parity, iOS billing parity, signed Android AAB, and iOS archive qualification are green. Store-owner metadata, current Xcode Cloud final-build receipt, real provider transactions, Play production eligibility, and final store submission remain external gates. |

---

## Current Release Authority

Release-authority merged-main snapshot:

`8ee3757df895abe806c3fa1a2ee048d4fc84e392`

Latest frozen exact-head binary qualification source:

`00c38dcc540ab730830462fad8c681eb84fdbc87`

At the authority freeze, the merged main tree was file-identical to that qualified source head. Later documentation/test-only merges do not automatically replace binary release authority; a new signed/native artifact receipt must do that explicitly.

Canonical current receipt:

`governance/release-audits/V4_1_CURRENT_RELEASE_AUTHORITY_2026-10-24.md`

### Exact-head qualification

The qualified source head passed:

- Accessibility Device Acceptance Gate
- Diamond Way Synthesis Gate
- Device Security Data Integrity Gate
- Xcode Cloud Bootstrap Parity
- iOS Billing Qualification Parity
- Soul Codex Store Candidate — Android 4.1.0 / iOS 4.1.0
- Vercel

Store Candidate workflow run: `40156358212`.

---

## Current Native Candidates

### Android

- Application ID: `soulcodex.app`
- Namespace: `app.soulcodex.main`
- Version: `4.1.0`
- Version code: `4000012`
- Signed AAB: **PASS**
- `jarsigner -verify`: **PASS**
- AAB SHA-256: `64d609cf7311c614af4f777cb258b7b8bc6753fd4635d8013286f9de8a795076`
- GitHub Actions artifact ID: `12584354857`
- Debug APK smoke build: **PASS**
- Automated production publishing: **not attempted**
- Google Play service-account publishing credential in qualifying run: **not configured**

Latest separately recorded Play Console state from 2026-10-23:

- Closed testing track Alpha has 4.1.0 / 4000012
- tester list contains 25 addresses
- dashboard recorded 0 opted-in testers
- production access remains blocked until Google’s tester-duration eligibility requirement is satisfied

That Console state is external and must be refreshed before any production-access claim.

### iOS

- Bundle ID: `app.soulcodex.ios`
- Version: `4.1.0`
- Source project build: `4000011`
- Simulator Release: **PASS**
- Generic-device unsigned archive qualification: **PASS**
- GitHub Actions qualification artifact ID: `12585215434`
- Signed App Store upload: **delegated to Xcode Cloud after main merge**

Historical Apple-managed Xcode Cloud build 324 was produced from earlier main `805c4b30247283b34f3d22da54038e2fc612e98c`. It proves pipeline capability but is not the final current-build release authority.

A new Apple-managed final-build receipt tied to the current release tree is still required.

---

## Billing / Entitlement State

Code, server, archive, and entitlement boundaries are hardened. Real provider qualification remains separate.

- Free/Plus projection: **server-enforced**
- entitlement downgrade/expiry/revocation replay: **regression-covered**
- iOS StoreKit current-build purchase/restore/lifecycle: **INCONCLUSIVE**
- Google Play Billing current-build purchase/restore/lifecycle: **INCONCLUSIVE**
- native production billing flags: **must remain disabled until provider qualification passes**
- anonymous/free fallback: **safe default**

Do not treat `iOS Billing Qualification Parity` as proof of a real StoreKit transaction. It is code/config/archive qualification.

---

## Consumer Experience Now Integrated

The current 4.1.0 product includes:

- evidence-aware profile synthesis
- verified/fail-closed Big Three handling
- governed numerology
- governed Human Design core
- Galactic Code server-owned synthesis
- secure Galactic persistence/replay
- Free concise Galactic brief
- capability-gated Soul Codex+ Galactic depth
- profile-owned compatibility and connections
- Timeline/Daily qualification boundaries
- premium PDF export gate
- native subscription infrastructure with server-verified entitlement design

The current consumer surface has passed real-browser, accessibility, security, and production-build gates on recent exact heads.

---

## Required Before Public Native Release Claims

1. Verify the final Railway production deployment identity and `/health` SHA/API contract.
2. Produce and record the final Apple-managed Xcode Cloud build for the current release tree.
3. Run physical-device current-build StoreKit purchase, restore, relaunch, reinstall, second-device, expiry/cancellation, and refund/revocation tests.
4. Run equivalent Google Play Billing qualification through the active test track.
5. Refresh Play Console tester opt-in state and satisfy production-access eligibility.
6. Reconcile App Store Connect privacy metadata and age-rating answers with the exact 4.1.0 behavior; tracked in #346.
7. Capture final store screenshots from actual native builds.
8. Preserve final App Store Connect and Play Console submission/processing receipts.
9. Only then claim store submission, approval, or public deployment at the corresponding evidence level.

---

## Validation Classification

A lower validation class never implies a higher one:

- **Implemented** = code path exists.
- **Integrated** = callers and dependencies are connected.
- **CI / simulator qualified** = reproduced under an exact named build/workflow.
- **Signed artifact qualified** = signed binary exists and its identity/signature is verified.
- **Physical-device qualified** = reproduced on identified hardware.
- **Provider qualified** = real store/payment provider transaction and lifecycle evidence passes.
- **Store accepted** = App Store Connect or Play Console accepted the intended artifact.
- **Publicly released** = the store reports the release publicly available.

These classes must not be silently promoted into one another.

---

## Current External Issues

- #202 — split-store launch / exact current release and external receipts
- #346 — App Store privacy metadata reconciliation
- #299 — historical 4.0.1 Google Play closed-test authority; superseded for current artifact identity by the 4.1.0 receipt and should be retired after issue reconciliation

---

## Canonical Receipts

- Diamond Doctrine: `governance/THE-DIAMOND-DOCTRINE.md`
- Gate 1: `governance/release-audits/GATE-1-FINAL-RECEIPT.md`
- Gate 2: `governance/release-audits/GATE-2-NATIVE-MOBILE-VALIDATION.md`
- Gate 3: `governance/release-audits/GATE-3-FINAL-RECEIPT.md`
- Gate 4: `governance/release-audits/GATE-4-LIFECYCLE-DATA-CONSISTENCY.md`
- Gate 5: `governance/release-audits/GATE-5-RELEASE-READINESS.md`
- Current 4.1.0 release authority: `governance/release-audits/V4_1_CURRENT_RELEASE_AUTHORITY_2026-10-24.md`
- Native billing qualification: `governance/release-audits/V4_1_NATIVE_BILLING_QUALIFICATION_RECEIPT.md`
- Store packet: `docs/STORE_SUBMISSION_PACKET.md`

Truth before certainty remains the release rule. A passing code gate, signed artifact, physical-device run, provider transaction, store acceptance, and public release are separate evidence classes.
