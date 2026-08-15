# Soul Codex V4 Release Readiness

## Proposed release

**Version:** `4.0.0-rc.2`  
**Release line:** `v4-clarity-first`  
**Target:** Foundation Web + native distribution Release Candidate  
**Previous milestone:** `v4.0.0-rc.1` remains pinned to the earlier Foundation Web RC and is not moved.

This declaration branch may merge only after every workflow named in `V4_RELEASE_MANIFEST.requiredWorkflows` passes on the same exact head SHA. Older green runs remain historical evidence only.

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

Exact-head PWA evidence from candidate `3a4cfd5db2a41650240b7d0a1767bb544d432cdf` captured 40 screens across:

- Chromium phone `390x844`
- Chromium tablet `834x1194`
- Chromium desktop `1440x900`
- WebKit iPhone `390x844`

Evidence summary:

- [x] No page errors were reported.
- [x] No critical console errors were reported.
- [x] Primary layouts are readable at phone, tablet, and desktop widths.
- [x] The repaired Compatibility layout does not horizontally overflow at the tablet breakpoint.
- [x] Main navigation and consumer hierarchy remain coherent across the captured viewport matrix.

## Engineering and release gates

The formal `4.0.0-rc.2` declaration requires all of these workflows to pass on one exact release-declaration SHA:

- [ ] Ultimate SoulCodex CI
- [ ] CI Tests
- [ ] Foundation Doctrine Gate
- [ ] Gate 4 Lifecycle Validation
- [ ] PWA Offline Browser Validation
- [ ] Mobile Native Smoke
- [ ] Dependency Security Audit
- [ ] Railway Container Smoke
- [ ] Live Ephemeris Evidence

Native distribution additionally requires:

- [ ] Xcode Cloud archive succeeds on the distributable SHA.
- [ ] Android signed AAB is produced from the distributable SHA.
- [ ] iOS/TestFlight delivery is backed by a valid Apple signing identity or Xcode Cloud managed signing.
- [ ] Real-device/store acceptance receipts remain distinct from simulator/build proof.

## Rollback contract

1. Keep the last known-good main SHA and release tag recorded before deployment.
2. If production smoke fails, redeploy the last known-good Railway deployment or deploy that exact prior SHA.
3. Verify `/health`, the application shell, the canonical local-profile journey, and API 404 behavior after rollback.
4. Do not migrate forward or grant paid entitlement while the rollback state is uncertain.
5. Open a focused hotfix only after the stable deployment is restored.

## Declaration rule

`4.0.0-rc.2` may be called **Foundation + native distributable Release Candidate** only when:

- every required workflow above is green on the same exact declaration SHA;
- the responsive/offline visual evidence remains valid;
- the release receipt records that exact SHA and workflow run IDs;
- the native package graph and simulator builds remain green;
- the declaration branch merges without changing runtime behavior after validation.

Publication is a separate state. **Published** requires a production deployment receipt and post-deploy smoke evidence against the deployed commit. Store distribution requires signed artifact / Xcode Cloud and tester/store receipts.

A release candidate is a tested thing, not a mood.
