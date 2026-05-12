# Confidence Rules

Confidence is a first-class trust system in Soul Codex.

This document extends the product meaning of the existing implementation model in [CONFIDENCE.md](../../CONFIDENCE.md). It does not change the current public runtime contract.

## Current Canonical Badges

Use the existing badge keys:

- `verified`
- `partial`
- `unverified`

Do not invent new runtime badge values without a schema migration. More specific states such as "estimated", "birth-time sensitive", or "location-sensitive" should be expressed in the `reason`, display copy, or future trace metadata until the public contract changes.

## Verified

Use `verified` when:

- Birth time is known.
- Location is provided and resolved.
- Timezone is resolved.
- The relevant system has enough data to compute the claimed output.

Meaning:

```txt
The calculation has enough source data for the displayed layer.
```

Verified does not mean the user's future is guaranteed. It only means the underlying data supports the calculation.

## Partial

Use `partial` when:

- Birth date exists, but birth time is missing.
- Some systems can be computed, but precision-sensitive layers must be omitted or qualified.
- The app has enough data for broad signals, but not enough for full chart precision.

Birth-time warning:

```txt
Birth time is missing, so rising sign, houses, degree-sensitive placements, and some Human Design details may be limited or unavailable.
```

## Unverified

Use `unverified` when:

- Birth location is missing or unresolved.
- Timezone cannot be resolved.
- Core source data is missing.
- A stored or generated value cannot be traced to reliable input.

Location warning:

```txt
Birth location or timezone is missing, so location-sensitive calculations are not reliable.
```

## System-Level Confidence

Confidence must be evaluated per system when possible:

- Astrology: birth date, time, location, timezone, ephemeris source.
- Numerology: full legal/current name source, birth date, spelling confidence.
- Human Design: birth date, exact time, location, timezone, calculation source.
- Family layer: self-reported context, parent data completeness, behavioral evidence.
- AI synthesis: source signals used, missing context, and whether text is deterministic or generated.

## Confidence Display Rules

- Always show confidence when a reading depends on birth time or location.
- Always state what data is missing.
- Never present AI wording as the source of truth for calculation confidence.
- Separate "computed fact" from "interpretive guidance."
- Use plain language. A user should not need to know astrology to understand why a result is partial.

## Missing Data Policy

Missing data should reduce precision, not usefulness.

When data is missing:

- Omit unsupported claims.
- Explain the limitation.
- Offer what can still be read.
- Invite the user to add missing data.
- Avoid filling gaps with fake certainty.
