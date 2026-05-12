# Calculation Contract

This document defines the future calculation-engine contract for Soul Codex.

It is planning documentation only. It does not replace the current engine, add Python code, add Swiss Ephemeris, change public APIs, or alter iOS/App Store hardening.

## Purpose

The calculation engine must produce precise, traceable, confidence-aware signals that can be translated into Soul Codex explanations.

The engine should separate:

- Raw inputs.
- Normalized inputs.
- Calculated facts.
- Confidence and trace metadata.
- Interpretive explanation content.
- AI or deterministic synthesis.

## Existing Contract Alignment

The current public output reference is [SOUL_CODEX_OUTPUT_SCHEMA_V1.md](../../SOUL_CODEX_OUTPUT_SCHEMA_V1.md).

Future engine work must preserve existing app stability unless a migration is explicitly planned.

## Future Engine Responsibilities

The engine should eventually calculate or normalize:

- Astrology placements: Sun, Moon, Ascendant, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto.
- Lunar nodes: North Node and South Node.
- Chiron and Lilith.
- Houses and house cusps.
- Major aspects.
- Asteroids later.
- Numerology: Life Path, Expression, Soul Urge, Personality, and related values.
- Human Design: type, strategy, authority, profile, definition, centers, gates, channels, incarnation cross later.
- Family/context signals.
- Behavioral self-report signals.

## Contract Shape

Future calculation outputs should include:

```txt
system:
name:
value:
technical_label:
source_inputs:
confidence:
confidence_reason:
birth_time_sensitive:
location_sensitive:
calculation_engine:
calculated_at:
trace:
```

Interpretive outputs should be separate and follow [Explanation Template](../soul-codex/explanation-template.md).

## Non-Goals

This contract does not authorize:

- Rebuilding the backend.
- Replacing the current engine.
- Adding Python services.
- Adding Swiss Ephemeris or `pyswisseph`.
- Changing database schema.
- Changing current API responses.
- Changing Capacitor or iOS hardening code.

## Upgrade Rule

Before any engine replacement or sidecar is introduced:

1. Define fixtures.
2. Compare current output against candidate engine output.
3. Document deltas.
4. Resolve licensing and deployment risks.
5. Add trace and confidence behavior.
6. Migrate incrementally behind a stable contract.
