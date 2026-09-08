# Gate 2 — Native Mobile Platform Validation

**Base:** `main@b5cdcc25665fb1d9c1cc7a087252e69c02b49624`  
**Candidate:** `443c23cfb5fcb19771589721d75132224ab3c65e`  
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

Candidate `443c23cfb5fcb19771589721d75132224ab3c65e` completed Mobile Native Smoke run `31579821940` successfully.

The workflow explicitly checks out `github.event.pull_request.head.sha` for PR runs and verifies `git rev-parse HEAD` equals the candidate SHA before native build work begins. This prevents GitHub's synthetic PR merge commit from being misreported as exact-head evidence.

### Android debug build — PASS

The PR-triggered Android job:

- checked out the exact PR head;
- used Node 22, the minimum generation supported by Capacitor 8.4.2;
- installed exact npm dependencies;
- built canonical workspaces;
- passed Android release configuration validation;
- built the production web bundle;
- synced Capacitor Android;
- completed Gradle `assembleDebug`;
- verified and uploaded the debug APK.

Artifact:

- name: `gate2-android-debug-apk`
- artifact id: `9134704520`
- digest: `sha256:f7c3c60385a5dc8b899a3cf87d018e839e2f23fd65e420c4618e269c9a0b84c9`

### iOS Simulator build — PASS

The PR-triggered iOS job:

- checked out the exact PR head;
- used Node 22 because Capacitor 8.4.2 declares `node >=22.0.0`;
- ran on GitHub `macos-26`;
- explicitly verified Xcode major version 26 or newer;
- bootstrapped JavaScript and local Swift packages;
- passed iOS release configuration validation;
- resolved Swift package dependencies;
- built the checked-in `Soul Codex` scheme for generic iOS Simulator with signing disabled;
- verified and uploaded `Ultimate Soul Codex.app`;
- retained the Xcode build log as a diagnostic artifact.

Artifacts:

- app name: `gate2-ios-simulator-app`
- app artifact id: `9134755003`
- app digest: `sha256:6f9846f91267e2dd15500885ccb47c8bcdb6cd230692645dc39312aca8e45892`
- diagnostic name: `gate2-ios-xcodebuild-log`
- diagnostic artifact id: `9134753289`
- diagnostic digest: `sha256:ba22673c54ddf304c05a292366403dd51011442989d2395b5c392fbd67b4a6d2`

## Toolchain Reconciliation

Two stale assumptions were exposed during this gate.

1. `macos-14` selected Xcode 16.2, which is unsupported by Capacitor 8's current iOS toolchain. The native iOS lane was moved to `macos-26` with an explicit Xcode-major guard.
2. Repository legacy-development instructions still describe Node 20 for the root server lane, but the installed `@capacitor/cli@8.4.2` package declares `node >=22.0.0`. Native mobile workflows therefore use Node 22 while legacy server instructions remain independently scoped.

The release gate follows the actual dependency contract rather than forcing an unsupported Node/Xcode combination merely to satisfy stale documentation.

## Companion Exact-Head Checks

On candidate `443c23cfb5fcb19771589721d75132224ab3c65e`:

- `Ultimate SoulCodex CI` — **PASS** (`31579821995`)
- `CI Tests` — **PASS** (`31579821945`)
- `Mobile Native Smoke` — **PASS** (`31579821940`)
- `Live Ephemeris Evidence` — **FAIL** (`31579822012`) because the external NASA/JPL Horizons service remains unavailable to the live evidence job. This failure is not reclassified or silently waived by Gate 2.

The JPL condition prevents claiming an all-green repository release candidate, but it does not invalidate the native build evidence recorded above because the failing job exercises an independent external astronomy-verification dependency rather than the native packaging path.

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
