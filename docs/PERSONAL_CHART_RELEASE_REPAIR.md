# Personal chart release repair

This change addresses the October 28, 2026 customer audit: a complete timed profile could show supported planets but a missing natal wheel, and the Free reading repeated generic prose rather than explaining those placements.

## Behavior

- The reading and interactive planetary panel use the same placement-meaning function. Each admitted planet explains its function, sign style, supported house, possible strength, tradeoff, and a practice. Interpretation remains symbolic; no causal or psychological effect is represented as verified.
- Core chart explanations remain available on Free. Cached paid prose is still excluded by the Free entitlement boundary. Missing houses are explicitly unresolved, and range-stable signs never acquire invented houses or degrees.
- A partial chart can enter the natal-wheel component. The component still enforces its own verified cusp and longitude requirements; no candidate is promoted to make a wheel drawable.
- Partial success no longer falls through to the numerology-only evidence banner. The birth inputs are inspectable, and a manual online recheck remains possible even after completion. Opening a profile still never uploads it.
- Transient planetary reference failures preserve earlier verified geocentric results only for the identical exact UTC instant. A changed instant or a contradictory reference is not merged. Coordinate-dependent angles and geometry always come from the new response. Dependent aspect summaries remain partial pending a complete server recalculation.
- NASA/JPL retrieval has process-wide concurrency of three, identical-request coalescing, and a bounded 24-hour success-only reference cache. Existing policy checks still run against retrieved references. Network errors and unsuccessful responses are not cached.
- Timeline's expansion button reports the available count.
- Decorative nebula/star animation does not alter zodiac coordinates. Reduced motion and an explicit pause control remain available.

## Validation and release boundary

Node 22 type checking, production build, focused regressions, and the store release gate are required. New regressions cover meaningful chart differentiation, untrusted input rejection, unchanged-instant retry preservation, changed-instant/contradiction rejection, request coalescing/concurrency, and the independently calculated Scorpio Ascendant reference. The existing 11:11 golden case is retained; the owner's explicitly requested 10:10 case is a separate regression.

The invalid MC/Chiron fixtures in the clarity inspector test now include the evidence artifact identifiers required by the implementation. The privacy contract follows the manual-recheck callback signature and retains its no-background-upload assertions.

Risk: symbolic wording may not fit the user; it must remain open to correction. Reference queuing can increase cold-request latency, and process-local caching does not survive a restart. A refresh cannot repair a different device's saved inputs automatically. Inspect that device's date, time, timezone, coordinates, evidence UTC and policy before replacing its old chart. No compatibility formula, price, billing activation, native version, or store submission is changed here.

Rollback: revert this branch's commit. Existing successful stored evidence is preserved; no destructive migration is performed.

Passing code/build checks does not establish physical-device validation, signed-artifact distribution, purchase/restore qualification, store approval, or public-release readiness. Keep the PR draft until the exact-head remote and browser/native evidence is available.

## Pre-submission audit follow-up — October 28, 2026

Two additional defects were reproduced and corrected during the requested deeper audit:

1. Planets sharing a sign had identical strength/tradeoff prose and could share an exercise. Ten distinct planetary functions now supply their own strength, tension and practice, combined with the admitted sign and house. The corpus checks all 1,440 planet/sign/house combinations, removes cosmetic name prefixes before checking uniqueness, checks Free/Plus core equality and verifies invalid/unknown houses never acquire a house claim.
2. The installed Framer Motion reduced-motion hook captured the initial preference without rerendering on a later OS change. The personal planet system and natal chart now use a reactive media-query subscription with cleanup. Decorative loops explicitly transition to static values at zero duration when paused or reduced; merely removing an animation target did not establish that running loops stopped.

The strengthened browser journey checks 320/390/768/1365px overflow, pause semantics, changing reduced motion while mounted, stable SVG values across rendered frames, keyboard selection, screenshot evidence, offline reading reload, absence of Plus fields on Free, and the existing verified-owner expansion fixture. The fixture remains isolated to the test HTTP server; it does not verify astronomy or activate a real owner account. Local Chromium passed both journeys. Local WebKit is blocked by missing system libraries. Hosted WebKit reproduced the documented Linux Playwright offline-switch navigation abort. Its recovery gate now verifies a direct HTTP navigation receives 503 while the service worker restores the saved reading; Chromium retains strict networking-off validation. Physical Safari offline testing remains required.

The independent calculation was repeated with Swiss Ephemeris 2.10.03 / FLG_MOSEPH at 1990-09-17T14:10:00Z, Bronx coordinates 40.8448/-73.8648. All ten planetary candidates agree within 0.005 degrees (largest difference: Uranus, approximately 0.001269 degrees). A new regression retains these independent longitudes alongside the existing Scorpio Ascendant reference. This comparison does not upgrade production candidates or replace live reference verification. Equal House placements are conditional on that declared house system; they must not be compared as if they were Placidus placements.

Both full-tree and production-only dependency audits have zero high/critical findings. Eight moderate findings remain in the full tree, including two in production. They are recorded as residual findings rather than silently removed with forced dependency changes.

Submission remains held. Required remaining evidence includes exact new-head hosted workflows, named native-device runtime checks, new unused platform build identifiers and distributable artifacts, actual purchase/restore qualification before paid billing is enabled, and post-deploy smoke. Account linking/owner activation is still incomplete. PR #605's separate App Store EULA guard must also be included in the eventual combined release candidate and validated at that combined head; #606 does not incorporate it automatically.
