# Test Fixtures and Acceptance Rules

## Purpose

Define fixture coverage expectations for deterministic quality checks and uncertainty behavior.

## Existing Test Anchor

- `packages/core/soulcodex-v1/tests/canonical.test.ts`

## Fixture Matrix (Planning Baseline)

1. Full precision profile
- complete birth date, time, and location/timezone
- expected: `verified` chart confidence and valid overall confidence assignment

2. Missing birth time
- date and location present, no birth time
- expected: downgraded chart precision with explicit limitation copy

3. Missing location/timezone
- date present, incomplete geo/timezone
- expected: `unverified` chart confidence path where runtime logic requires it

4. Date-only profile
- minimal viable input
- expected: date-stable layers render, precision-sensitive layers disclosed as limited

5. Sparse behavioral/context inputs
- no mirror/family context
- expected: stable baseline reading without fabricated specificity

6. Rich behavioral/context inputs
- mirror and contextual answers present
- expected: differentiation in statement selection while preserving schema stability

## Acceptance Rules

- no schema parse failures for valid fixture payloads
- confidence enums must remain in allowed sets
- missing data must produce explicit limitations
- deterministic pipeline should avoid placeholder text in production outputs
- wording guards should block deterministic or diagnostic phrasing

## Drift Monitoring Guidance

When adding new systems or precision engines:
- compare outputs against baseline fixtures
- document intentional deltas
- reject silent contract drift
