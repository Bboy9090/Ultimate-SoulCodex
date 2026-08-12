# Gate 2 — Native Mobile Platform Validation

**Base:** `main@b5cdcc25665fb1d9c1cc7a087252e69c02b49624`  
**Candidate:** `f97c37ca024009b0c9eb6ece0e7bdf32635f405f`  
**Status:** **SIMULATOR / EMULATOR VALIDATED — SIGNED, HARDWARE, AND STORE VALIDATION OPEN**

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

## Exact-Head Native CI Evidence

Candidate `f97c37ca024009b0c9eb6ece0e7bdf32635f405f` completed Mobile Native Smoke run `31576839055` successfully.

### Android debug build — PASS

The PR-triggered Android job:

- installed exact npm dependencies;
- built canonical workspaces;
- passed Android release configuration validation;
- built the production web bundle;
- synced Capacitor Android;
- completed Gradle `assembleDebug`;
- verified and uploaded the debug APK.

Artifact:

- name: `gate2-android-debug-apk`
- artifact id: `9133532842`
- digest: `sha256:2212df5fea67520233c0ebb1bec9efc4cb86eeca98c2983ea7c16d3138149288`

### iOS Simulator build — PASS

The PR-triggered iOS job:

- runs on GitHub `macos-26`;
- explicitly verifies Xcode major version 26 or newer because Capacitor 8 requires the Xcode 26 / Swift 6.2 toolchain;
- bootstraps JavaScript and local Swift packages;
- passes iOS release configuration validation;
- resolves Swift package dependencies;
- builds the checked-in `Soul Codex` scheme for generic iOS Simulator with signing disabled;
- verifies and uploads `Ultimate Soul Codex.app`;
- retains the Xcode build log as a diagnostic artifact.

Artifacts:

- app name: `gate2-ios-simulator-app`
- app artifact id: `9133559275`
- app digest: `sha256:68afd4aab73e52fdf7f89ccce2e2814964367f734ae329f3f85c242e8dba0a96`
- diagnostic name: `gate2-ios-xcodebuild-log`
- diagnostic artifact id: `9133557914`
- diagnostic digest: `sha256:8d863595261e2ae78bda822ccd3a1197a092b38cfed97b0582601b963348c2aa`

## Toolchain Failure Resolved During Gate 2

Earlier Gate 2 runs used `macos-14`, which selected Xcode 16.2. The build reached Swift compilation but failed in Capacitor 8 plugin source with missing `PluginConfig.getString` and incompatible color API signatures. This was not treated as an application-source defect. The workflow was moved to the supported Xcode 26 toolchain and an explicit toolchain guard was added so future runner-image drift fails clearly. The next exact-head native run passed Android and iOS.

## Companion Exact-Head Checks

On candidate `f97c37ca024009b0c9eb6ece0e7bdf32635f405f`:

- `Ultimate SoulCodex CI` — **PASS** (`31576839098`)
- `CI Tests` — **PASS** (`31576839121`)
- `Mobile Native Smoke` — **PASS** (`31576839055`)
- `Live Ephemeris Evidence` — **FAIL** (`31576839086`) because the external NASA/JPL Horizons service remains unavailable to the live evidence job. This failure is not reclassified or waived here.

The JPL condition prevents claiming an all-green repository release candidate, but it does not erase the native build evidence recorded above.

## Validation Ladder

Gate 2 evidence is classified explicitly:

- **Implemented:** PASS — native projects, workflows, and configuration exist.
- **Integrated:** PASS — Capacitor sync and native dependency paths connect to the production web build.
- **Simulator/emulator validated:** PASS — Android debug APK and iOS Simulator app build successfully in exact-head CI.
- **Signed-artifact validated:** OPEN — release AAB and App Store IPA still require configured signing identities/secrets.
- **Hardware validated:** OPEN — signed candidate has not yet been recorded as exercised on identified physical Android/iPhone/iPad hardware.
- **Store validation:** OPEN — App Store/Play pre-submission validation has not yet been recorded for this candidate.

No lower class is promoted into a higher class.

## Gate 2 Pass Criteria

- [x] PR-triggered Android debug build passes on the exact candidate head.
- [x] PR-triggered iOS Simulator build passes on the exact candidate head.
- [x] Production `VITE_API_URL` passes both mobile validators in exact-head CI.
- [ ] Android release keystore/secrets are configured for this release lane.
- [ ] Signed Android AAB is produced and artifact identity recorded.
- [ ] Apple distribution certificate/provisioning profile match Team ID and bundle ID.
- [ ] Signed iOS archive exports a valid IPA and artifact identity is recorded.
- [ ] Release candidate is installed/tested on identified physical devices.
- [ ] Any Xcode Cloud/App Store Connect build failure on the release candidate is resolved or explicitly superseded by a successful signed archive from the same candidate.

## Account-Bound Actions

The following cannot be fabricated by repository automation and require release-account material or owner-console access:

- Android keystore and signing secrets;
- Apple distribution certificate `.p12` and password;
- Apple App Store provisioning profile;
- App Store Connect/TestFlight upload/testing;
- Google Play Console upload/testing.

## Current Classification

Gate 2 is **simulator/emulator validated**. Code-side native reproducibility has been demonstrated on the exact candidate head for both platforms. Full Gate 2 PASS remains intentionally open until signed-artifact and hardware/store evidence is recorded.
