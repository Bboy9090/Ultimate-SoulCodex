# Gate 5 — Deployment & Store Release Readiness

**Base:** `main@b5cdcc25665fb1d9c1cc7a087252e69c02b49624`  
**Branch:** `gate5/release-toolchain-hardening`  
**Status:** **IN PROGRESS — RELEASE TOOLCHAIN HARDENED; SIGNED/DEPLOYMENT RECEIPTS STILL REQUIRED**

## Purpose

Gate 5 proves that Soul Codex can move from a tested codebase into a reproducible consumer release without turning configuration, signing, deployment, or store submission assumptions into fake success.

## Defects Found

### iOS runner was incompatible with the installed native stack

The manual App Store workflow used `macos-14`. Gate 2 demonstrated that this selects an Xcode 16 generation that cannot compile the current Capacitor 8 native stack. Gate 5 moves the signed iOS workflow to `macos-26` and requires Xcode major version 26 or newer.

### iOS export success check could report success without an IPA

The old workflow used `if find build/export -name "*.ipa" -type f; then`. `find` exits successfully even when it finds no matching file, so the branch could print an IPA success message with an empty export directory. Gate 5 replaces this with an explicit first-match path, `test -n`, `test -s`, and SHA-256 generation.

### `tee` could hide the real xcodebuild exit status

Archive/export commands piped through `tee` did not enable `pipefail`. Gate 5 runs release commands under `set -euo pipefail`, so a failed `xcodebuild` cannot be masked by a successful logging process.

### Signing identity was not structurally reconciled before archive

The iOS release project is bound to Apple Team `86NUJ8M3B8` and bundle ID `app.soulcodex.ios`. Gate 5 decodes the supplied provisioning profile and checks both its TeamIdentifier and `application-identifier` before an App Store archive can proceed.

## Remediation

`.github/workflows/build-ios.yml` now:

- runs on `macos-26`;
- uses Node 22 for Capacitor 8;
- fails if Xcode major version is below 26;
- records the candidate commit SHA;
- validates mobile release configuration before native packaging;
- requires all three Apple signing inputs;
- imports the distribution certificate;
- decodes and inspects the provisioning profile;
- requires Team ID `86NUJ8M3B8`;
- requires application identifier `86NUJ8M3B8.app.soulcodex.ios`;
- uses strict shell/pipe failure handling;
- requires a real, non-empty IPA;
- records an IPA SHA-256 digest;
- uploads diagnostic logs even when packaging fails.

## Automated Gate 5 Preflight

`.github/workflows/gate5-release-preflight.yml` runs on release-toolchain changes and:

- checks out the exact candidate head;
- builds canonical workspaces;
- runs `tests/release-toolchain-contract.test.ts`;
- validates Android release configuration;
- validates iOS release configuration;
- builds the production application;
- runs the production dependency security audit at high severity.

The contract test locks:

- macOS 26 / Xcode 26+ for iOS release builds;
- Node 22 for the native Capacitor lane;
- strict archive/export pipe handling;
- non-empty IPA verification and digest generation;
- Apple Team/bundle provisioning identity;
- Android signing-secret requirements;
- Android `bundleRelease` and AAB existence checks.

## Validation Ladder

- **Implemented:** signed Android/iOS workflows and release validators exist.
- **Integrated:** release workflows build the production web bundle and connect it to native packaging.
- **Preflight validated:** release-toolchain contracts, mobile validators, production build, and high-severity dependency audit pass on exact head.
- **Signed-artifact validated:** signed Android AAB and signed App Store IPA are produced from an identified candidate SHA.
- **Staging validated:** server/web candidate is deployed to staging and smoke-tested.
- **Rollback validated:** a named previous candidate can be restored and smoke-tested.
- **Store validated:** App Store Connect and Google Play accept the release artifacts for testing/submission.
- **Consumer release candidate:** all required gates are green or have a narrowly documented external-service exception that does not affect the candidate's release path.

## Gate 5 Pass Criteria

- [ ] Gate 5 exact-head CI passes.
- [ ] Production build passes on the release candidate.
- [ ] Production dependency audit has no high/critical vulnerabilities.
- [ ] Android signing secrets are configured.
- [ ] Signed Android AAB is produced and its SHA-256 recorded.
- [ ] Apple distribution certificate is configured.
- [ ] Apple provisioning profile matches Team `86NUJ8M3B8` and bundle `app.soulcodex.ios`.
- [ ] Signed App Store IPA is produced and its SHA-256 recorded.
- [ ] Staging deployment is smoke-tested.
- [ ] Production health endpoint is verified on the candidate deployment.
- [ ] Rollback procedure is exercised against a named previous release candidate.
- [ ] App Store Connect/TestFlight accepts the iOS artifact.
- [ ] Google Play internal testing accepts the Android artifact.
- [ ] Store metadata, privacy, support, and account-deletion surfaces are reconciled with actual app behavior.

## Account-Bound / External Actions

Repository automation cannot fabricate:

- Android keystore values;
- Apple distribution `.p12` and password;
- Apple provisioning profile;
- App Store Connect upload acceptance;
- Google Play Console upload acceptance;
- identified physical-device installation receipts.

Those remain open until actual account-bound evidence exists.

## Current Classification

Gate 5 is **implementation/preflight work in progress**. This branch improves the truthfulness and reproducibility of release automation but intentionally does not claim signed-artifact, deployment, rollback, physical-device, or store validation yet.
