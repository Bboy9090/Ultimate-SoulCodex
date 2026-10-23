# App Store Metadata — Soul Codex

The canonical, cross-store copy and compliance draft lives in
[`docs/STORE_SUBMISSION_PACKET.md`](docs/STORE_SUBMISSION_PACKET.md).

Do not duplicate or independently edit store copy here. Use the canonical packet so App Store Connect and Google Play Console stay aligned with the exact release candidate.

## Current release identity

- Android: `4.1.0` / versionCode `4000012` / `soulcodex.app`
- iOS source project: `4.1.0` / build setting `4000011` / `app.soulcodex.ios` / App Store ID `6764221944`
- Apple submission candidate: use the Apple-managed Xcode Cloud build recorded in the current exact-head release receipt; do not assume the source project build setting is the App Store Connect build number.
- Release authority: use the successful exact-head Store Candidate / hardening receipt for the binary being submitted; do not hard-code a moving SHA here.

## Verified public URLs

- Production: <https://soulcodex.up.railway.app>
- Privacy: <https://soulcodex.up.railway.app/privacy>
- Support: <https://soulcodex.up.railway.app/support>
- Account deletion: <https://soulcodex.up.railway.app/account-deletion>

The `soulcodex.app` custom-domain URLs are not the current verified Railway production URLs and must not be used in store submission metadata until that custom domain is actually attached and verified.
