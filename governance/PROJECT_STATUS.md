# Soul Codex Foundation Release — Project Status

**Last Updated:** 2026-08-12  
**Current Branch:** `main`  
**Current Milestone:** Consumer/App Store Release Certification

---

## Gate Status

| Gate | Status | Notes |
|------|--------|-------|
| Gate 1 | 🟡 **READY FOR PASS** | Canonical evidence, persistence, certainty ceiling, and live-reference fail-closed policy complete; final closure PR pending |
| Gate 2 | 🟡 **SIMULATOR / EMULATOR VALIDATED** | Android debug APK + iOS Simulator exact-head builds pass; signed artifacts, hardware, and stores remain open |
| Gate 3 | 🟢 **PASS** | No-silent-upgrade trust boundary enforced |
| Gate 4 | 🟢 **PASS (evidence complete)** | Profile/offline/deletion/restart/non-resurrection journeys pass in Chromium + WebKit; final receipt PR #196 pending |
| Gate 5 | 🟡 **RELEASE TOOLCHAIN VALIDATED** | Release preflight and signed-build workflows hardened; real signing, deployment rollback, and store acceptance remain account/environment bound |

---

## Foundation / Release Evidence

- Diamond Doctrine is canonical under `governance/THE-DIAMOND-DOCTRINE.md`.
- Gate 1 calculation/evidence architecture was reconciled across astrology, numerology, Human Design, Galactic Code, persistence, and UI certainty contracts.
- Gate 2 native smoke validation now builds Android and iOS from the supported Capacitor 8 toolchain on exact candidate heads.
- Gate 3 remains closed and protected by no-silent-upgrade regressions.
- Gate 4 now covers canonical profile persistence, corruption, legacy migration, offline restart, account deletion, blocked IndexedDB deletion, browser restart, and non-resurrection.
- Gate 5 hardened iOS/Android release automation so unsupported Xcode, masked archive failures, bad provisioning identity, empty IPA output, and unsigned-release claims fail closed.
- NASA/JPL Horizons availability is tracked as an external evidence dependency. Transient outages produce explicit fail-closed receipts and no longer masquerade as unrelated application regressions.

---

## What Is Still Required Before Consumer Store Release

1. Merge the final Gate 1 and Gate 4 governance closure receipts after exact-head checks/review.
2. Produce a signed Android release AAB with release keystore identity recorded.
3. Produce a signed iOS App Store archive/IPA with Apple certificate, Team ID, bundle ID, and provisioning identity recorded.
4. Install and exercise the signed release candidate on identified physical Android and Apple devices.
5. Validate staging/production deployment, health checks, database migration state, monitoring, and rollback to the previous stable release.
6. Complete TestFlight/App Store Connect validation and Google Play internal-testing validation.
7. Record store metadata/privacy/support/account-deletion URLs and any store review findings against the exact release candidate.
8. Tag the exact approved release SHA and create the final release receipt only after all account-bound evidence exists.

---

## Classification Discipline

A lower validation class never implies a higher one:

- simulator build ≠ signed artifact;
- signed artifact ≠ physical-device validation;
- physical-device validation ≠ store acceptance;
- external reference outage ≠ calculation failure;
- documentation saying PASS ≠ PASS without executable evidence.

The release remains fail-closed until the account-bound signing, deployment, hardware, and store receipts exist.
