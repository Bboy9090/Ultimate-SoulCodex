# Gate 2 — Native Mobile Platform Validation

**Base:** `main@b5cdcc25665fb1d9c1cc7a087252e69c02b49624`  
**Status:** **IN PROGRESS**

## Purpose

Gate 2 separates native mobile implementation from actual validation. It proves that the checked-in Capacitor projects can build reproducibly for Android and iOS, then advances through signing and physical-device evidence without promoting one validation class into another.

## Current Implemented State

- Capacitor app ID: `app.soulcodex.main`.
- Android application ID: `app.soulcodex.main`.
- Android compile/target SDK: 36.
- iOS release bundle ID validated by `scripts/validate-mobile-release.mjs` as `app.soulcodex.ios`.
- iOS privacy manifest exists and is required by the mobile validator.
- Public support and account-deletion pages exist and are required by the mobile validator.
- Manual Android release workflow supports debug APK, release APK, and signed release AAB.
- Manual iOS workflow supports simulator development build and signed App Store archive/export.
- Release builds require a public HTTPS `VITE_API_URL` and reject localhost.

## New Gate 2 CI Evidence

This branch adds `.github/workflows/mobile-native-smoke.yml` with two PR-triggered jobs:

1. **Android debug build**
   - installs exact npm dependencies;
   - builds canonical workspaces;
   - validates Android release configuration;
   - builds the production web bundle;
   - syncs Capacitor;
   - runs Gradle `assembleDebug`;
   - verifies and uploads the APK.

2. **iOS Simulator build**
   - bootstraps JavaScript and local Swift packages;
   - validates iOS release configuration;
   - resolves Swift packages;
   - builds the checked-in `Soul Codex` scheme for generic iOS Simulator with signing disabled;
   - verifies and uploads the `.app` bundle.

The workflow intentionally uses repository variable `VITE_API_URL` with no hidden localhost/default substitution. Missing production API configuration must fail closed.

## Validation Ladder

Gate 2 evidence must be classified explicitly:

- **Implemented:** native projects/workflows/configuration exist.
- **Integrated:** Capacitor sync and native dependency paths connect to the production web build.
- **Simulator/emulator validated:** Android debug APK and iOS Simulator app build successfully in CI.
- **Signed-artifact validated:** release AAB and App Store IPA are produced with the configured signing identities.
- **Hardware validated:** signed candidate is exercised on identified physical Android/iPhone/iPad hardware.
- **Store validation:** App Store/Play pre-submission validation accepts the candidate artifact.

No lower class is promoted into a higher class.

## Gate 2 Pass Criteria

- [ ] PR-triggered Android debug build passes on the exact candidate head.
- [ ] PR-triggered iOS Simulator build passes on the exact candidate head.
- [ ] Production `VITE_API_URL` is configured and passes both mobile validators.
- [ ] Android release keystore/secrets are configured.
- [ ] Signed Android AAB is produced and artifact identity recorded.
- [ ] Apple distribution certificate/provisioning profile match Team ID and bundle ID.
- [ ] Signed iOS archive exports a valid IPA and artifact identity is recorded.
- [ ] Release candidate is installed/tested on identified physical devices.
- [ ] Any Xcode Cloud/App Store Connect build failure on the release candidate is resolved or explicitly superseded by a successful signed archive from the same candidate.

## Account-Bound Actions

The following cannot be fabricated by repository automation and require the owner account:

- GitHub Actions repository variable `VITE_API_URL` if not already configured;
- Android keystore and signing secrets;
- Apple distribution certificate `.p12` and password;
- Apple App Store provisioning profile;
- App Store Connect/TestFlight and Google Play Console upload/testing actions.

## Current External Signal

GitHub currently reports an external Apple/Xcode status failure on `main@b5cdcc...`. The target points to App Store Connect/Xcode Cloud, whose private job details are not available through the repository connector. Gate 2 remains open until native CI and signed-artifact evidence establish the current failure's relevance or supersede it with a successful exact-candidate build.
