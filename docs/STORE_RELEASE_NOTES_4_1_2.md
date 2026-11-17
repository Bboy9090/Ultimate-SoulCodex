# Soul Codex 4.1.2 — Store Release Notes

**Status:** New native store candidate; provider upload and approval require independent receipts.

## What’s New

- More reliable saved birth-chart verification. When birth details change, outdated chart evidence is discarded instead of silently reusing old Rising signs or houses.
- Clearer, more distinctive zodiac interpretations, with less repeated generic copy across placements.
- Improved treatment of missing or unverified planetary positions: no invented Mercury, Venus, Mars or Ascendant interpretation.
- Stronger evidence boundaries for Human Design and Galactic Code synthesis.
- Additional profile, sharing, accessibility, billing, and release checks.

## Release identity

- iOS bundle ID: `app.soulcodex.ios`; version `4.1.2`; build `4000016`.
- Android application ID: `soulcodex.app`; version `4.1.2`; versionCode `4000019`.
- Google Play target: **Alpha closed testing first**; never claim production release without Play Console evidence.
- Apple target: **App Store Connect/TestFlight qualification**; do not treat unsigned CI archives as provider uploads.
- Do not infer a user's actual Rising sign from release notes; that comes only from qualified chart evidence.
- Web/backend package remains `4.1.0` unless separately promoted.

## Before publishing

Capture the merge/source commit, exact-head CI run, signed Android AAB checksum, Apple signed IPA/archive checksum, Play edit and track receipt, App Store Connect build and processing state, and the actual tester/public availability.
