# App Store Metadata — Soul Codex

The canonical, cross-store copy and compliance draft lives in
[`docs/STORE_SUBMISSION_PACKET.md`](docs/STORE_SUBMISSION_PACKET.md).

Do not duplicate or independently edit store copy here. Use the canonical packet so App Store Connect and Google Play Console stay aligned with the exact release candidate.

## Current release identity

- Android: `4.1.0` / versionCode `4000015` / `soulcodex.app`
- iOS: `4.1.0` / build `4000014` / `app.soulcodex.ios` / App Store ID `6764221944` (source project identity)
- Apple submission candidate: use the Apple-managed Xcode Cloud build recorded in the current exact-head release receipt; do not assume the source project build setting is the App Store Connect build number.
- Release authority: use the successful exact-head Store Candidate / hardening receipt for the binary being submitted; do not hard-code a moving SHA here.

## Verified public store-review URLs

- Privacy: <https://bboy9090.github.io/Ultimate-SoulCodex/privacy/>
- Support: <https://bboy9090.github.io/Ultimate-SoulCodex/support/>
- Account deletion: <https://bboy9090.github.io/Ultimate-SoulCodex/account-deletion/>

The static legal/support site is independently hosted on GitHub Pages and verified over HTTPS. The application backend/runtime origin remains a separate release dependency and must not be substituted with the static Pages host. Do not use an unverified custom domain in store metadata.
