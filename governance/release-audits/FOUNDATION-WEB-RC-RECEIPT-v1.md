# Foundation Web RC Receipt v1

Status: **AUTOMATED RE-AUDIT IN PROGRESS**

## Scope

This receipt covers the Soul Codex Foundation web application only.

The owner has explicitly deferred iOS App Store and Google Play work until further notice. Native-store status is therefore recorded but is not a web release gate.

## Canonical journey

```text
Create one local-first profile
→ open Identity
→ reconcile verified Sun, Moon, and Ascendant
→ open Reading
→ inspect evidence and limitations
→ open Timeline
→ open Compatibility without re-entering the user's data
→ refresh
→ close and reopen the browser
→ reopen the saved profile offline
```

## Proven merged foundations

| Area | Evidence | Classification |
|---|---|---|
| Canonical profile journey | PR #145 | Integrated and browser-validated |
| Foundation backend receipt | PR #146 | Evidence receipt merged |
| Sun/Moon candidate engine | PR #147 | Implemented |
| Independent verification contract | PR #148 | Implemented and tested |
| NASA/JPL Horizons reference | PR #149 | Integrated |
| 40-row astronomy evidence matrix | PRs #150-154 | Live evidence passed with zero sign disagreements |
| Dependency remediation | PR #155 | Production high-severity gate passed |
| Human Design trust boundary | PR #157 | Unverified output excluded from authoritative use |
| Local profile verification reconciliation | PR #158 | Integrated |
| Ascendant verification | PR #159 | Independently verified against 24 Swiss Ephemeris fixtures |
| Saved-profile Ascendant migration | PR #160 | Integrated |
| Bobby Big Three golden fixture | PR #161 | Virgo Sun, Virgo Moon, Scorpio Rising locked in CI |
| Web privacy and billing hardening | PR #162 | Merged and deployed |

## Latest completed security-lane evidence

PR #162 head: `19c5f4b84ad03e0ec63ae2aadf1fd4ea64187abe`

| Workflow | Run | Result |
|---|---:|---|
| Ultimate SoulCodex CI | 30884749128 | PASS |
| CI Tests | 30884750033 | PASS |
| Dependency Security Audit | 30884749118 | PASS |
| Live Ephemeris Evidence | 30884749199 | PASS |
| Railway Container Smoke | 30884749412 | PASS |
| PWA Offline Browser Validation | 30884749632 | PASS |

PR #162 merge commit: `fe30613d765fdff24a7bd1fc04203cd3bc62a8c7`

Railway deployment for the merge commit: **PASS**.

## New RC gate added in this lane

The `scripts/verify-foundation-web-rc.mjs` audit fails CI unless the following invariants remain true:

- Helmet and API rate limiting are active.
- API responses are non-cacheable.
- referrer leakage is disabled.
- the client contains no card-number, expiry, CVV, or CVC fields;
- billing uses hosted Stripe Checkout;
- webhook signatures are verified;
- raw payment fields are rejected;
- the retired direct-card route is rejected before JSON parsing;
- production astrology integrates verified Ascendant output;
- the approved Ascendant evidence receipt remains attached;
- saved profiles require the Big Three verification migration;
- Human Design remains unresolved or calculated-unverified until verified;
- Human Design cannot contribute to Compatibility without verification;
- Big Three golden and billing security tests remain in CI;
- Chromium and WebKit offline restart validation remains configured.

## Billing persistence correction

This lane adds an additional fail-closed requirement discovered during the RC audit:

> Stripe Checkout cannot become enabled unless persistent database storage is configured.

Without `DATABASE_URL`, the active server uses memory storage. Accepting payment in that state could lose a premium entitlement after restart, which would be an astonishingly efficient way to turn a customer into an enemy. The billing status now remains disabled until both Stripe configuration and persistent entitlement storage are present.

## Deliberately unresolved

- Astrological houses and Midheaven
- Nodes, Chiron, and planetary house placements
- Human Design verification and interpretation
- Human Design contribution to Compatibility
- Native iOS validation and App Store release
- Native Android validation and Google Play release

## Remaining manual gate

Automated evidence does not replace the final human consumer pass. Before declaring the web build a public release candidate, manually confirm:

- primary navigation works at phone, tablet, and desktop widths;
- the canonical profile journey completes without recreation;
- verified Virgo Sun, Virgo Moon, and Scorpio Rising appear for Bobby's exact fixture;
- Compatibility opens once verified core inputs exist;
- no direct card-entry interface appears anywhere;
- no critical console error appears during the canonical journey;
- the current copy reflects what the product actually includes rather than advertising systems still behind trust boundaries.

## Final classification

To be updated from this PR's final head after all workflows complete.

```text
Automated web foundation:       RE-AUDIT IN PROGRESS
Trust boundary:                 PASS on prior merged head
Security boundary:              PASS on prior merged head
Persistent billing entitlement: FIX IMPLEMENTED, CI PENDING
Offline lifecycle:              PASS on prior merged head
Manual consumer QA:             PENDING
Foundation Web RC:              NOT DECLARED YET
Native stores:                  OWNER-DEFERRED
```
