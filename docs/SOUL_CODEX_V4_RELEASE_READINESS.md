# Soul Codex V4 Release Readiness

## Current classification

**Integrated, automated-test validated, and deployment-smoke validated. Not yet declared release candidate.**

A release-candidate declaration requires every item below to have current evidence against the same commit.

## Product journey gates

- [ ] A new user can create a local profile without an account.
- [ ] A returning user can resume the active profile from the home screen.
- [ ] Server and local profiles both open the same clarity-reading contract.
- [ ] Every profile exposes an obvious route into the clarity reading.
- [ ] Every clarity reading exposes a route back to the full evidence profile.
- [ ] Missing profiles fail honestly and do not generate replacement interpretations.

## Trust gates

- [ ] Verified astronomy is visibly distinguished from symbolic fallback.
- [ ] Deterministic numerology is not labeled independently verified.
- [ ] Unknown or approximate birth time never creates confident Moon, Rising, house, or timing claims.
- [ ] Evidence source and confidence class remain inspectable.
- [ ] Lived experience is presented as the final correction layer.
- [ ] No fake user counts, ratings, testimonials, or unsupported outcome claims exist.

## Offline and privacy gates

- [ ] Local profiles remain readable with the network disabled.
- [ ] Offline reading and evidence navigation survive reload.
- [ ] No local profile data is silently uploaded.
- [ ] Online verification failures preserve the local reading and show deferred status.
- [ ] Privacy and terms pages describe actual behavior rather than aspirational behavior.

## Accessibility and mobile gates

- [ ] Main content has a landmark and logical heading hierarchy.
- [ ] Keyboard focus is visible on all interactive elements.
- [ ] Primary controls meet minimum mobile tap-target expectations.
- [ ] Reading typography remains usable at narrow phone widths.
- [ ] Fixed controls respect safe-area insets.
- [ ] Loading and failure states are announced without relying only on animation or color.

## Engineering gates

- [ ] TypeScript check passes.
- [ ] Production build passes.
- [ ] Unit and integration tests pass.
- [ ] Dependency security audit passes.
- [ ] PWA offline browser validation passes.
- [ ] Railway container smoke passes.
- [ ] Live ephemeris evidence passes.
- [ ] The release commit and all evidence refer to the same SHA.

## Release declaration rule

Soul Codex V4 may be called a **release candidate** only after the checklist is completed with links to current evidence. Green checks from an older commit do not count. Human optimism is not a test runner.
