# Soul Codex V4 rc.3 Remediation Receipt

## Purpose

This release candidate advances from rc.2 because the full-system audit found production integration and consistency defects that must not be patched into an already-signed artifact identity.

## Release identity

- Release: `4.0.0-rc.3`
- Android versionCode: `4000003`
- iOS CFBundleVersion: `4000003`
- API contract: `foundation-v4`
- Compatibility formula: `foundation-compatibility-v2`
- Exact candidate SHA: established only after the remediation PR reaches its final head.

## Corrected defects

1. Production Compatibility now has a canonical router under `server/routes/compatibility.ts`.
2. Legacy top-level Compatibility route path is a thin compatibility shim rather than a second implementation.
3. Deterministic master Life Paths 11, 22, and 33 remain present through Compatibility request normalization.
4. Compatibility Explorer and person comparison use one four-dimension vocabulary: Romantic connection, Chemistry & attraction, Communication & friendship, Growth & repair.
5. Moon, Rising, houses, and Human Design are explicitly labeled as not used by Foundation Compatibility rather than visually implied as scoring inputs.
6. The active profile is reactive across Home, Navigation, Timeline, and Compatibility through the canonical repository update event.
7. Compare-a-person and Explorer have bounded retry, network failure, API-contract mismatch, and unresolved-evidence states.
8. The three retired Compatibility implementations no longer expose old overall-score/profile-pair contracts; legacy imports resolve to the canonical Hub.
9. Timeline no longer uses a duplicate profile-storage path or a bespoke page theme, and its dead `/start` link is removed.
10. Settings, Pricing, Timeline, and Compatibility use the shared Soul Codex visual primitives rather than independent mini-themes.
11. Pricing fails closed for native purchasing in rc.3; no external checkout action or raw card form is exposed by the native Access page.
12. `/health` reports release version, exact deployment SHA when available, and API contract instead of liveness alone.
13. About & Diagnostics exposes non-sensitive client/backend version, SHA, API contract, API base, and Compatibility route state.
14. Native release validation refuses missing, malformed, or `unknown` client release SHAs.
15. Railway container smoke now proves exact SHA + API contract + Compatibility ping + Explorer POST + person POST + master numbers + absence of universal overall score.
16. A deployed-backend workflow requires an explicit exact SHA and refuses a mutable URL as release evidence by itself.
17. The reusable iOS App Store workflow now uses the proven PKCS#12/profile qualification and signing sequence from the successful rc.2 signed artifact path.
18. The reusable Android workflow verifies the upload keystore, signed AAB, digest, and exact candidate SHA when release signing material exists.

## Required evidence before merge / release declaration

- Exact-head CI/typecheck/tests: PASS
- Foundation Doctrine Gate: PASS
- Gate 4 lifecycle: PASS
- Gate 5 release preflight: PASS
- PWA Offline Browser: PASS
- Mobile Native Smoke: PASS
- Dependency Security Audit: PASS
- Railway Container Smoke: PASS
- Live Ephemeris Evidence: PASS
- Code review actionable findings: resolved

## Required evidence after deployment

The production/staging backend is not considered the rc.3 backend merely because `/health` returns 200. Run `Release Backend Contract` with:

- the exact deployed HTTPS base URL;
- the exact expected rc.3 commit SHA;
- `foundation-v4`.

That workflow must prove the health identity, Compatibility ping, Explorer request, and person comparison request against the deployed service before the deployment receipt is accepted.

## Native distributable boundary

A source-qualified rc.3 is not automatically a native-distributable candidate. Signed iOS and Android artifacts remain separate evidence. Android signing still requires the authoritative Play upload keystore or a valid upload-key reset; the repository must not invent a replacement key silently.
