# Soul Codex V4 Release Readiness

## Proposed release

**Version identity under qualification:** `4.0.0-rc.2`  
**Release line:** `v4-clarity-first`  
**Current earned scope:** Foundation Web Release Candidate  
**Native scope:** explicitly reopened by the owner on 2026-08-15 and now qualifying for native distribution  
**Previous milestone:** `v4.0.0-rc.1` remains pinned to the earlier Foundation Web RC and is not moved.

This declaration branch may merge only after every workflow named in `V4_RELEASE_MANIFEST.requiredWorkflows` passes on the same exact head SHA. Older green runs remain historical evidence only.

Merging this branch does **not** by itself declare native-distributable status. The native-distributable classification remains fail-closed until signed artifact receipts exist.

## Product journey gates

- [x] A new user can create a local profile without an account.
- [x] A returning user can resume the active profile from the home screen.
- [x] Server and local profiles use the same clarity/depth contract.
- [x] Every profile exposes a direct route into the reading.
- [x] Readings expose evidence, limitations, and a route back to Identity.
- [x] Missing profiles fail honestly and do not generate replacement interpretations.
- [x] Timeline reuses the active profile.
- [x] Compatibility reuses the active profile and specific-person comparison asks only for the other person's supported inputs.

## Trust gates

- [x] Verified astronomy is visibly distinguished from symbolic fallback.
- [x] Deterministic numerology is not labeled independently verified.
- [x] Unknown birth time remains unknown and does not manufacture Moon, Rising, houses, planets, or timing claims.
- [x] Local profile generation is Foundation-safe and does not use the legacy placeholder astronomy path.
- [x] Evidence source, confidence class, exclusions, and limitations remain inspectable.
- [x] Lived experience is presented as a correction layer rather than model obedience.
- [x] Human Design is excluded from Foundation Compatibility until its own evidence contract is promoted.
- [x] Simulated Palmistry and Astrocartography are not exposed by production routes.
- [x] No universal soulmate probability is presented as fact.

## Offline and privacy gates

- [x] Local profiles remain readable with the network disabled after the application shell has been cached.
- [x] Offline reading and evidence navigation survive reload/restart.
- [x] Local profile creation does not silently upload data.
- [x] Online astronomy verification is explicit opt-in and uses a minimal verification-only endpoint.
- [x] Reopening a local profile does not trigger background upload.
- [x] Server-backed profile reads and personal-data mutations enforce user/session ownership.
- [x] Compatibility requests minimize transmitted profile data.
- [x] Privacy and Terms describe the implemented data boundary.

## Security and billing gates

- [x] Hosted Stripe Checkout is the only payment-entry boundary.
- [x] Raw card number, expiry, CVC, and CVV fields are rejected from application routes.
- [x] Premium entitlement remains webhook-driven.
- [x] API responses are no-store and referrer leakage is disabled.
- [x] Helmet security headers and rate limiting are active.
- [x] Production errors do not expose internal stack traces to clients.

## Accessibility, responsive, and browser evidence

Existing exact-head PWA evidence captured 40 screens across Chromium phone, tablet, desktop, and WebKit iPhone. The rc.2 declaration reruns the browser/offline workflow so version qualification does not borrow a stale green check.

Evidence requirements:

- [x] No page errors in the locked visual receipt.
- [x] No critical console errors in the locked visual receipt.
- [x] Primary layouts readable at phone, tablet, and desktop widths.
- [x] Compatibility does not horizontally overflow at the tablet breakpoint.
- [x] Main navigation and consumer hierarchy remain coherent across the captured viewport matrix.

## Engineering and web release gates

The `4.0.0-rc.2` identity may merge only after all of these workflows pass on one exact release-declaration SHA:

- [ ] Ultimate SoulCodex CI
- [ ] CI Tests
- [ ] Foundation Doctrine Gate
- [ ] Gate 4 Lifecycle Validation
- [ ] PWA Offline Browser Validation
- [ ] Mobile Native Smoke
- [ ] Dependency Security Audit
- [ ] Railway Container Smoke
- [ ] Live Ephemeris Evidence

These gates preserve the already-earned Foundation Web RC and prove that advancing release identity did not regress it.

## Native distribution qualification

Owner authorization to resume native release work is recorded in `governance/FOUNDATION-WEB-RELEASE-v1.md`.

Native-distributable status requires all of the following in addition to the web RC evidence:

- [ ] Xcode Cloud archive succeeds for the distributable SHA.
- [ ] A signed or Apple-managed-signed iOS artifact exists for that SHA.
- [ ] A signed Android AAB exists for that SHA.

Current known external credential state before rc.2 qualification completes:

- Android engineering/debug build passes, but the repository signing probe found `ANDROID_KEYSTORE` absent.
- iOS simulator/build integration passes and Apple-managed Xcode Cloud archive is the preferred signing path.
- GitHub-hosted iOS P12 material exists and contains a private key, but the macOS keychain import path has not produced a usable codesigning identity receipt.

Therefore simulator/debug success alone must never upgrade this release to native-distributable status.

TestFlight, Play internal testing, real-device validation, and store acceptance remain later distribution/publication receipts and must be named separately when earned.

## Rollback contract

1. Keep the last known-good main SHA and release tag recorded before deployment.
2. If production smoke fails, redeploy the last known-good Railway deployment or deploy that exact prior SHA.
3. Verify `/health`, the application shell, the canonical local-profile journey, and API 404 behavior after rollback.
4. Do not migrate forward or grant paid entitlement while the rollback state is uncertain.
5. Open a focused hotfix only after the stable deployment is restored.

## Declaration rule

`4.0.0-rc.2` may be merged as the **next V4 release identity under native qualification** when the same-SHA web/Foundation matrix is green.

It may be called **native-distributable Release Candidate** only when `canDeclareV4NativeDistributableCandidate(...)` also passes with:

- Xcode Cloud archive receipt;
- signed iOS artifact receipt;
- signed Android AAB receipt.

Publication is a separate state. **Published** requires a production deployment receipt and post-deploy smoke evidence against the deployed commit. Store distribution requires tester/store receipts.

A release candidate is a tested thing, not a mood.
