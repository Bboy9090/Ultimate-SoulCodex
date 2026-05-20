# Soul Codex Confidence Rules

## Scope

This document defines confidence disclosures for user-facing outputs and aligns with current runtime enums.

## Runtime Enum Lock (No Drift)

Chart/system badge values:
- `verified`
- `partial`
- `unverified`

Overall confidence values:
- `high`
- `medium`
- `low`

These values are defined in:
- `packages/core/soulcodex-v1/schema.ts`
- `packages/core/compute/confidence.ts`

Related normalization logic also exists in:
- `soulcodex/compute/confidence.ts`

## Disclosure Requirements

Every major reading must display:
- badge value
- plain-language reason
- practical impact of missing data

## Missing Birth Precision Rules

If birth time is missing:
- mark chart-related confidence as `partial` or lower per runtime logic
- state that houses/rising precision is limited
- keep date-stable systems clearly identified

If location or timezone is missing:
- mark chart confidence as `unverified` where required by runtime logic
- state that location-sensitive calculations are limited

## Copy Qualifiers (Human Layer)

Allowed copy qualifiers include:
- "Birth-time sensitive"
- "Location-sensitive"
- "Estimated from available inputs"

These are copy labels only. They do not replace enum values.

## Alignment Check Requirement

When confidence copy is edited, verify that docs still match runtime logic in:
- `packages/core/compute/confidence.ts`
- `packages/core/soulcodex-v1/generate.ts`
