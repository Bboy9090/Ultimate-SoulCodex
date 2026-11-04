# Soul Codex 4.1 Metadata Reconciliation

This change reconciles `app.metadata.json` with the current checked-in native and store-release source of truth.

Verified source identities:

- Release line: **4.1.0**
- Capacitor identity: `app.soulcodex.main`
- iOS bundle ID: `app.soulcodex.ios`
- iOS source build: `4.1.0 (4000014)`
- App Store numeric ID: `6764221944`
- Android application ID: `soulcodex.app`
- Node toolchain: **22**
- Public product name: **Soul Codex**

No runtime identifier is renamed by this reconciliation. The stale metadata file previously described the old 1.0/PWA-first state and incorrectly marked native mobile targets disabled.

Remaining release gates are intentionally not converted to success claims:

- final Android/iOS screenshots from the exact candidate,
- physical-device Android qualification,
- final store declarations and review,
- exact-head signed-artifact/store receipt reconciliation,
- subscription catalog provider qualification where applicable.

Canonical store authority remains `docs/STORE_SUBMISSION_PACKET.md`.
