# Foundation Web RC Receipt v1

Status: **AUTOMATED WEB FOUNDATION PASS**

## Scope

This receipt covers the Soul Codex Foundation web application only.

The owner has explicitly deferred iOS App Store and Google Play work until further notice. Native-store status is recorded but is not a web release gate.

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

## Foundation web RC automation evidence

Validated code head: `b3b6a881996e869882262d2da405d38a3209b5a0`

| Workflow | Run | Result |
|---|---:|---|
| Ultimate SoulCodex CI | 30885940725 | PASS |
| CI Tests | 30885940600 | PASS |
| Dependency Security Audit | 30885940630 | PASS |
| Live Ephemeris Evidence | 30885940665 | PASS |
| Railway Container Smoke | 30885940596 | PASS |
| PWA Offline Browser Validation | 30885940638 | PASS |

The Ultimate SoulCodex CI run included the new 16-check Foundation Web RC invariant audit. All 16 checks passed.

## Permanent RC invariants

The `scripts/verify-foundation-web-rc.mjs` audit fails CI unless the following remain true:

- Helmet and API rate limiting are active.
- API responses are non-cacheable.
- referrer leakage is disabled.
- the client contains no card-number, expiry, CVV, or CVC fields.
- billing uses hosted Stripe Checkout.
- webhook signatures are verified.
- raw payment fields are rejected.
- the retired direct-card route is rejected before JSON parsing.
- production astrology integrates verified Ascendant output.
- the approved Ascendant evidence receipt remains attached.
- saved profiles require the Big Three verification migration.
- Human Design remains unresolved or calculated-unverified until verified.
- Human Design cannot contribute to Compatibility without verification.
- Big Three golden and billing security tests remain in CI.
- Chromium and WebKit offline restart validation remains configured.

## Billing persistence correction

Stripe Checkout cannot become enabled unless persistent database storage is configured.

Without `DATABASE_URL`, the active server uses memory storage. Accepting payment in that state could lose premium entitlement after restart. Billing now remains disabled until both Stripe configuration and persistent entitlement storage are present.

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
- current copy reflects what the product actually includes rather than advertising systems still behind trust boundaries.

## Final classification

```text
Automated web foundation:       PASS
Trust boundary:                 PASS
Security boundary:              PASS
Persistent billing entitlement: PASS, FAIL-CLOSED WITHOUT DATABASE
Offline lifecycle:              PASS
Manual consumer QA:             PENDING
Foundation Web RC:              NOT DECLARED YET
Native stores:                  OWNER-DEFERRED
```

This receipt establishes that the automated web foundation is release-candidate capable. Public RC declaration remains blocked only by the final manual consumer and responsive-layout pass.