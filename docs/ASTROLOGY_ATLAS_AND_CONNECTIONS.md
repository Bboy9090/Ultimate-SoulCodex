# Profile depth, Astrology Atlas, and connections

Development branch: develop/4.0.1-atlas-connections
Base: 4608cdb4853f187f2e37b68b2996fb9061e13c95 (4.0.1 build 179 source).
Build 179 and its release branch are unchanged.

## Implemented first slice

- /systems/atlas is reachable from Systems with or without a saved profile.
- Original compositional educational content covers 12 signs x 12 houses.
- House selectors, animated educational wheel and reading transitions honor reduced motion.
- Date exploration samples all ten planetary bodies every ten minutes, including the final millisecond of the local civil date. Birthplace timezone is required. 23/25-hour DST days are supported; skipped or unsupported historical midnight transitions fail closed.
- Each result is explicitly a calculated possibility, not independently verified. A quarter-degree proximity to a sign boundary includes a neighboring candidate. This is a conservative educational sample, not an exhaustive continuous-time proof or a probability distribution.
- Date exploration does not write storage, request the backend, create houses/angles, supply Human Design, or change primary synthesis.
- House-system explanations distinguish a cusp sign from a planet in a house and explain why Equal-house MC need not be the tenth cusp.
- Verified Equal-house profiles receive a personal Atlas containing verified planetary sign/house placements, all twelve verified cusp signs, Midheaven, mean Nodes, and independently qualified Chiron. Partial, legacy, unverified, or differently governed chart structures fail closed.
- Verified Equal House geometry, Midheaven, mean Nodes, qualified Chiron, and planetary-house assignments may support symbolic synthesis under their approved evidence contracts. Candidates and unverified structures remain excluded.
- Connections adds a private, versioned device list for names/nicknames and user-selected Sun signs. Saved people open directly in Compatibility. It does not upload contacts, imply membership/consent, or expose another person's birth data.

## Reference observations

Inspected contact sheets from both user-supplied September 16 and September 17 recordings. The recordings show a chart table, placement explanation cards, separated sign and house explanations, decorative moving objects, friends updates, and a subscription screen. The second shows Porphyry selected and a birth-time edit from 11:11 AM to 10:10 AM. These observations do not establish unknown-time behavior.

Co–Star's official FAQ documents Porphyry and friend comparisons:
https://www.costarastrology.com/faq

No official unknown-time fallback was verified in that source. Do not claim Co–Star recovers missing birth times. Never use perceived personality fit to promote a guessed time.

## Remaining work and acceptance gates

1. Independent interval evidence: evaluate complete local date/time windows with transition detection and independent ephemeris comparison. Promote only genuinely supported sign results. Support approximate user-supplied time ranges, with explicit uncertainty.
2. Primary synthesis: chart geometry is governed by the approved ASTRO-EQUAL-HOUSE-v1 contract, and verified supporting interpretation is now enabled by policy. Continue reviewing every system's source, timestamp, uncertainty, and distinct contribution; preserve the 60/96 profile tests and prevent duplicate themes. Never admit candidates or add prose merely to make a reading longer.
3. Personal Atlas: bind cards to verified profile placements, show the selected house convention, evidence and input version. Add planet-sign-house and aspect-specific content with editorial review. Current 144 entries are compositional educational content, not 144 independently authored personal readings.
4. Social friends: the device-private Connections list is implemented. A future opt-in network graph still requires durable authenticated storage, explicit invitations and acceptance, private defaults, separate consent for chart sharing, block/remove/revoke, deletion cascade, and server-side authorization against cross-user reads. No contact upload or public birth details by default.
5. Visual acceptance: phone/WebKit and physical-device review, 320px layout, focus, screen-reader output, reduced motion, no time-consuming main-thread calculation on older phones. Current date exploration is synchronous after its lazy import; move to a worker if device profiling requires it.
6. Monetization: later StoreKit lane; no purchase or premium entitlement changes here.

## Validation and release status

Node 22.23.2: TypeScript check, 24 focused tests, the 60-profile corpus, the 96-profile structural audit, and production build passed. Tests include all 144 combinations, unknown-time disclosure, invalid civil dates, DST, personal Atlas fail-closed behavior, existing primary-synthesis exclusion, and 24 Swiss-qualified house fixtures. Full Federation/security/privacy/billing gates and browser/device acceptance are not claimed for this slice.

Receipt: evidence/atlas/node22-validation.log
State: development implementation with local validation, not release-ready.
Rollback: revert this feature commit; it introduces no schema migration or stored-profile mutation.
