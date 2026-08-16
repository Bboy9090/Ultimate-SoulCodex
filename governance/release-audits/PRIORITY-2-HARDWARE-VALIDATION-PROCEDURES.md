# Priority 2: Physical Hardware Validation Procedures

**Status**: PREPARED — execution pending store-delivered rc.2 builds  
**Release version**: `v4.0.0-rc.2`  
**Release SHA**: `2e02d1023ddeb4e453236c34f2d4d2b7f6948957`  
**Android AAB SHA-256**: `14a07d97b27eb581471e57d83069f9eb60b4c6d05553b7f077c70dc662052fcd`  
**iOS IPA SHA-256**: `8a8e33beb7931e2c0459129eebecff8cf0e457458867cfdb3b3a39826b8522f0`

## Governing rule

Physical hardware validation proves that the **store-delivered** rc.2 build installs, launches, preserves local state, reaches the supported online boundaries, survives offline/restart/lifecycle transitions, and completes the bounded core journey on real hardware.

It does **not** prove broad device compatibility, long-term performance, store acceptance, or production release. Signed artifacts, store ingestion, physical hardware, deployment proof, store acceptance, and production release remain separate evidence classes.

Priority 2 execution begins only after the corresponding Priority 1 store-ingestion path provides an installable TestFlight or Google Play internal-testing build. A failed store upload is handled as Priority 1 evidence, not bypassed by sideloading and then relabeled as store-delivered hardware validation.

## Test matrix

### iOS validation device

- Real iPhone or iPad, not Simulator
- Validation floor: iOS 15 or later
- Exact model: record in receipt
- Exact OS version: record in receipt
- Distribution source: TestFlight
- Expected app identity: `4.0.0 (4000002)`
- Tester must have access to the TestFlight build

### Android validation device

- Real Android phone or tablet, not emulator
- Validation floor: Android 11 / API 30 or later
- Exact model: record in receipt
- Exact OS/API version: record in receipt
- Distribution source: Google Play internal testing
- Expected app identity: `4.0.0-rc.2 (4000002)`
- Tester Google account must be enrolled in the internal test

The validation floors above are coverage choices for this release receipt. They are not claims about the absolute minimum supported OS unless separately established by the application manifest/project settings.

## Pre-test evidence

Before checkpoint 1, record:

- platform and device model
- OS/API version
- tester
- date/time
- store distribution source
- store-visible version/build
- screenshot of TestFlight or Play internal-testing build identity
- confirmation that an older Soul Codex build is not installed
- network available for initial store delivery

Do not begin the smoke if the installed build identity is not rc.2.

## Result vocabulary

Use only:

- `PASS` — expected behavior observed
- `FAIL` — reproducible release-blocking defect
- `CRASH` — app terminated unexpectedly
- `INCONCLUSIVE` — environment or unavailable path prevents a valid result
- `NOT APPLICABLE` — checkpoint does not apply to the store-approved rc.2 configuration

A `CRASH`, data loss, or blocked canonical journey is an overall FAIL until corrected and retested. `INCONCLUSIVE` does not count as PASS.

# 11-point bounded hardware smoke

## 1. Store install and first launch

1. Open the store-delivery surface: TestFlight on iOS or the Google Play internal-testing install path on Android.
2. Confirm rc.2 build identity before installation.
3. Install Soul Codex from that store-delivery surface.
4. Launch the app.
5. Confirm the home/application shell renders and accepts input.

**PASS**: store installation completes and the app reaches the usable home surface without crash or blocking error.

Record installation source, visible build identity, launch screenshot, and any store/install warning.

## 2. Local profile creation and persistence

Goal: prove local profile state survives application restart without silently depending on server-backed profile recreation.

1. Create a test profile using supported inputs.
2. If the location picker/search requires network access, network use for that external lookup is allowed and must be recorded. Do not misclassify an online geocoder dependency as failure of local profile storage.
3. Save the profile.
4. Confirm the profile is visible.
5. Disable network after the profile exists.
6. Force-quit the app.
7. Relaunch while offline.
8. Confirm the same profile and entered birth inputs remain available.

**PASS**: profile identity and entered data survive force-quit/relaunch while offline, with no replacement profile fabricated.

## 3. Reading, evidence, limitations, and certainty language

1. Open the test profile.
2. Open the canonical reading path.
3. Confirm the reading renders without crash or indefinite loading.
4. Inspect evidence/confidence/coverage information exposed by the UI.
5. Inspect limitations and unknown-time handling where applicable.
6. Confirm the UI does not claim unavailable Moon/Rising/houses/planet data when birth-time/evidence support is absent.
7. Confirm the reading avoids obvious placeholder/filler output and remains usable on the physical viewport.

Do **not** require internal implementation keys such as `mirror.driver` to be user-visible unless the shipped UI intentionally exposes them.

**PASS**: substantive reading renders, evidence/limitations are inspectable, and visible certainty does not exceed the supported evidence state.

## 4. Timeline navigation

1. Navigate to Timeline using the active profile.
2. Confirm the page renders without recreating the profile.
3. Scroll through available entries/time periods.
4. Open one available detail entry when the UI provides one.
5. Return to the previous surface.

**PASS**: timeline remains responsive, profile context is preserved, and no crash/blocking layout failure occurs.

If no timeline data is legitimately available for the test state, record `INCONCLUSIVE` with the exact UI state rather than inventing PASS.

## 5. Compatibility journey

1. Open Compatibility using the active profile.
2. Enter the supported inputs for a second person/profile.
3. Generate or open the supported comparison.
4. Confirm the result stays within the Foundation compatibility contract.
5. Inspect visible evidence/limitations.
6. Confirm there is no fabricated universal soulmate/relationship probability.

**PASS**: compatibility renders, uses the supported data boundary, exposes limitations, and does not overclaim unsupported systems.

## 6. Explicit online astronomy verification

1. Enable network.
2. Use the actual shipped UI path for online astronomy verification.
3. Confirm the action is explicit rather than a silent background upload.
4. Confirm the request completes without TLS/certificate failure.
5. Confirm the UI distinguishes verified results from local/symbolic or unavailable evidence.
6. Confirm unknown birth time remains unknown rather than being silently guessed.

**PASS**: explicit verification completes and the evidence state updates honestly without certificate/network-path failure.

If rc.2 exposes no verification control for the current profile state, record `INCONCLUSIVE` and capture the surface shown.

## 7. Offline relaunch and cached/local navigation

1. Ensure profile and at least one previously viewed reading are available.
2. Enable airplane mode and verify Wi-Fi/cellular are disabled.
3. Force-quit the app.
4. Relaunch.
5. Open the existing profile and previously available local/cached reading surfaces.
6. Navigate through available offline evidence/limitations.
7. Attempt one operation that genuinely requires network.

**PASS**: local/cached surfaces remain usable, network-required behavior fails gracefully, and no blocking network-error loop or crash occurs.

Do not require fresh server-only content to materialize offline.

## 8. Sign-in/account boundary

1. Restore network.
2. Navigate to the shipped sign-in/account path.
3. Start the supported authentication flow.
4. Either complete it with a designated test account or cancel it intentionally.
5. Confirm the app returns to a coherent state.
6. If authentication completes, force-quit/relaunch and confirm expected session state.

**PASS**: supported sign-in flow launches and completion/cancellation/error handling does not crash or corrupt local profile state.

A provider unavailable because of tester/account configuration is `INCONCLUSIVE`, not PASS.

## 9. Premium/payment boundary — test the store-approved rc.2 configuration

The rc.2 application code currently starts premium purchase through `/api/billing/checkout` and redirects to **Hosted Stripe Checkout**. Hardware validation must not invent an Apple StoreKit or Google Play Billing sheet that rc.2 does not implement.

However, store policy approval is a Priority 1 prerequisite for exercising this checkpoint. Digital premium functionality may be subject to Apple/Google store-payment rules, storefront restrictions, or enrolled alternative/external-payment programs.

Procedure:

1. Use the exact premium/payment path that survived Priority 1 store ingestion for that platform/storefront.
2. Confirm the UI describes the payment boundary accurately.
3. Start checkout only far enough to prove the approved payment surface launches.
4. **Do not complete a live charge** unless a dedicated sandbox/test purchase path is intentionally configured.
5. Cancel/dismiss/return.
6. Confirm Soul Codex returns to a coherent state and no premium entitlement is granted from cancellation alone.

**PASS**: the **store-approved** payment boundary launches and can be safely cancelled without crash, unintended charge, or false entitlement.

If the store rejects rc.2 because the current hosted Stripe path is not permitted for the submitted storefront/program configuration, this checkpoint is `NOT APPLICABLE` until the Priority 1 policy blocker is resolved. Do not call the hardware build FAIL for a store-ingestion policy rejection that prevented delivery.

## 10. Rotation, background, resume, and state preservation

1. Open a reading or other stateful core surface.
2. Rotate the device where rotation is supported.
3. Confirm content remains readable and operable.
4. Return to the original orientation.
5. Background the app.
6. Wait at least five seconds.
7. Resume from the app switcher/home surface.
8. Confirm the user returns to a coherent application state with active profile/context preserved.

**PASS**: no crash, black screen, destructive state loss, or unusable overflow occurs through lifecycle transitions.

If a platform intentionally locks orientation, record that behavior and validate background/resume; do not fail solely because unsupported orientation does not rotate.

## 11. Crash-free bounded completion

Review checkpoints 1–10.

Required evidence:

- zero observed unhandled crashes
- zero destructive profile/data loss
- no blocking navigation dead-end in the canonical journey
- screenshots for key surfaces and any anomaly
- TestFlight/Play/device crash diagnostics when available

A normal store-delivered build does not provide a developer debug console to the tester. Do not require “console logs show no errors” as a mandatory PASS criterion. Use observable behavior plus store/device diagnostics when available.

**PASS**: the bounded sequence completes without crash or data loss and every required checkpoint is PASS. Any required `INCONCLUSIVE` item keeps the overall hardware gate open until resolved.

# Failure handling

When a checkpoint fails:

1. Stop promotion of the hardware gate.
2. Record platform, device, OS/API, store build identity, checkpoint, exact steps, observed result, timestamp, and screenshot/video if available.
3. Reproduce once when safe.
4. Open a focused defect linked to the rc.2 SHA and store build.
5. Do not modify the receipt to PASS until the corrected build is store-delivered and the failed checkpoint plus bounded regression sequence are rerun.

Do not quietly substitute a sideloaded build for the failed store-delivered build and retain the same hardware classification.

# Scope exclusions

This bounded smoke does not claim:

- exhaustive feature QA
- every supported device/OS combination
- performance benchmarking
- battery/thermal characterization
- accessibility certification
- internationalization/localization coverage
- long-duration soak testing
- store-policy acceptance
- production deployment health

Those require separate evidence when included in release scope.

# Receipt handoff

Record execution results in:

`governance/release-audits/RC-2-HARDWARE-VALIDATION-RECEIPT.md`

Required final fields:

```text
Release SHA: 2e02d1023ddeb4e453236c34f2d4d2b7f6948957

iOS
- Device/model:
- OS:
- TestFlight version/build: 4.0.0 (4000002)
- Tester:
- Test date:
- Checkpoints 1-11:
- Crash-free:
- Data-loss-free:
- Evidence links/attachments:
- Result: PASS / FAIL / INCONCLUSIVE

Android
- Device/model:
- OS/API:
- Play version/code: 4.0.0-rc.2 (4000002)
- Tester:
- Test date:
- Checkpoints 1-11:
- Crash-free:
- Data-loss-free:
- Evidence links/attachments:
- Result: PASS / FAIL / INCONCLUSIVE

Overall hardware gate: PASS only when both platform results are PASS.
```
