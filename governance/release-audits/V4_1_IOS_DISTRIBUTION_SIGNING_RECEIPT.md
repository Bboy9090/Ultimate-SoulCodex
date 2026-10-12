# Soul Codex 4.1 iOS Distribution Signing Receipt

Validated on October 11, 2026 against branch `fix/ios-release-signing-authority`, based on authoritative main `192221e2e79634111be71f07e0261ff840b39add`.

## Purpose

Replace the stale Release signing contract that hard-coded a manual provisioning profile name with the Xcode-managed archive/export path proven on the authorized Mac.

## Project signing contract

Release target:

- bundle: `app.soulcodex.ios`
- Apple team: `86NUJ8M3B8`
- archive signing style: Automatic
- archive identity: Apple Development
- hard-coded provisioning profile: none
- export signing style: Automatic
- export method: `app-store-connect`

Capacitor sync preserved these settings.

## Local validation

Contract and toolchain tests:

- `tests/xcode-cloud-scheme-contract.test.ts` — PASS
- `tests/release-toolchain-contract.test.ts` — PASS
- total focused tests: 11/11 PASS
- `npm run check` — PASS

Normal archive command, with no CODE_SIGN or provisioning overrides:

```sh
xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme "Ultimate Soul Codex" \
  -configuration Release \
  -sdk iphoneos \
  -archivePath /tmp/SoulCodex-4.1-signfix.xcarchive \
  -allowProvisioningUpdates \
  archive
```

Result: **ARCHIVE SUCCEEDED**.

Normal checked-in export:

```sh
xcodebuild \
  -exportArchive \
  -archivePath /tmp/SoulCodex-4.1-signfix.xcarchive \
  -exportPath /tmp/SoulCodex-4.1-signfix-export-v2 \
  -exportOptionsPlist ios/App/ExportOptions.plist \
  -allowProvisioningUpdates
```

Result: **EXPORT SUCCEEDED**.

## Exported IPA proof

- bundle: `app.soulcodex.ios`
- version: `4.1.0`
- build: `4000011`
- signing authority: `Apple Distribution: robert gonzalez (86NUJ8M3B8)`
- team: `86NUJ8M3B8`
- provisioning profile: `iOS Team Store Provisioning Profile: app.soulcodex.ios`
- provisioning UUID: `b4005973-914a-46b5-89b5-509afce424a7`
- `get-task-allow=false`
- `beta-reports-active=true`
- strict deep codesign verification: PASS
- IPA SHA-256: `d3d62c3d923570fe6a5a88f460a5664a3a87b23c6ea2f6dbf8ab6ce3b381af06`

## Scope

This proves local App Store/TestFlight-capable signing and export from the current 4.1 source.

It does **not** prove:

- App Store Connect ingestion,
- TestFlight processing,
- StoreKit product availability,
- monthly/annual purchase success,
- restore/reinstall/second-device behavior,
- cancellation, expiration, refund, or revocation handling.

Those remain governed by `V4_1_NATIVE_BILLING_QUALIFICATION.md`.
