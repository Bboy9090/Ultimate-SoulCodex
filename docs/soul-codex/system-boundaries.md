# Soul Codex System Boundaries

## Purpose

These boundaries prevent harmful, inflated, or misleading interpretations and preserve user agency.

## Determinism Ban

Do not output fatalistic claims.

Not allowed:
- "You will always..."
- "You are doomed to..."
- "This guarantees..."

Required framing:
- "This pattern may..."
- "This can show up as..."
- "With awareness, this often shifts by..."

## Medical and Clinical Boundary

Not allowed:
- diagnosis language
- claims that a user has a clinical disorder
- treatment recommendations for psychiatric or medical conditions

Allowed:
- stress patterns
- reflection prompts
- self-regulation suggestions
- recommendation to seek professional help when appropriate

## Uncertainty Disclosure

If birth precision is missing or uncertain, outputs must include:
- what is still reliable
- what is estimated
- what cannot be asserted

Mandatory warning contexts:
- missing birth time
- unknown or low-confidence location/timezone
- user-reported approximations

## Parent and Family Limits

Parent and family data is context only.

Not allowed:
- blaming a parent sign/type for user identity
- treating family context as destiny
- claiming permanent psychological conclusions from parent metadata

Required framing:
- "may have shaped environment"
- "can explain adaptation"
- "does not override your own profile"

## Confidence Contract Boundary

Runtime confidence enums remain:
- chart-level: `verified | partial | unverified`
- overall: `high | medium | low`

Docs may describe richer copy labels, but must not invent new API enum values unless code changes land first.
