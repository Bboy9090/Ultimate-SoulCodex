# Astrology Longitude Tolerance Policy Proposal v1

## Status

**DRAFT. NOT APPROVED. NO PLACEMENT PROMOTION AUTHORIZED.**

## Evidence basis

Live workflow run: `30793529466`

- Comparisons: 10
- Sign disagreements: 0
- Maximum Sun delta: `0.0002682866178815857°`
- Maximum Moon delta: `0.0007351139863658318°`
- Maximum overall delta: `0.0007351139863658318°`

## Proposed tolerance

`0.001°`

The proposal applies a 1.25 safety multiplier to the observed maximum and rounds upward to the next `0.001°` increment.

## Why this remains draft

Ten successful comparisons prove the comparison pipeline works and show excellent agreement between Astronomy Engine and NASA/JPL Horizons. Ten rows are not broad enough to establish production confidence across the full supported date range, all timezone transitions, leap-day behavior, and sign-boundary proximity.

The proposal therefore remains a governance input, not a verification key.

## Approval gates still required

1. Expand the evidence matrix substantially, including more sign-boundary, DST, historical, leap-day, and timezone fixtures.
2. Re-run live evidence with zero sign disagreements.
3. Confirm maximum deltas remain below the proposed tolerance.
4. Review the coordinate-frame and timestamp assumptions for both engines.
5. Record explicit human approval with approver, date, evidence receipt IDs, and policy version.
6. Only then change policy status from `draft` to `approved`.

## Enforcement

The code-generated proposal always returns:

```text
status: draft
promotionAllowed: false
```

The existing verification layer rejects draft policies with `policy_not_approved`. This prevents a measured tolerance from quietly becoming a user-facing fact because someone got impatient near the finish line, a beloved human tradition with consistently poor results.
