# Soul Codex Production System Registry

This document mirrors the executable source of truth in `shared/system-registry.ts`.

The rule is strict:

> Existing code, calculators, prompt templates, marketing copy, or historical outputs do not make a system production-governed.

A system may alter the **Ultimate Galactic Codex** only when the executable registry marks it as allowed and its evidence contract passes. Missing or unsupported systems stay visible in the excluded/unresolved ledger; they never receive a stock archetype, placeholder label, guessed placement, or generic fallback.

## Governed identity inputs

| System | Production state | Stable identity influence | Contract |
|---|---|---:|---|
| Natal planets / Big Three | Governed | Yes | Independently verified astronomical placements |
| Houses / Ascendant / Midheaven | Governed | Yes | `ASTRO-EQUAL-HOUSE-v1` + verified Ascendant |
| Major natal aspects | Governed | Yes | `ASTRO-ASPECT-MAJOR-v1` |
| Mean Nodes / Chiron | Governed | Yes | `ASTRO-MEAN-NODE-v1` + `ASTRO-CHIRON-v1` |
| Elements / modalities / stellium-style concentrations | Governed aggregation | Yes | Derived only from verified natal placements |
| Numerology stable core | Governed deterministic | Yes | Documented arithmetic |
| Numerology current cycles | Governed deterministic | No | Time-varying guidance only; excluded from stable fingerprint |
| Human Design core bodygraph | Governed | Yes | `HUMAN-DESIGN-CORE-v1` |
| Human Design Variables / Incarnation Cross naming | Inspect-only | No | No approved independent verification contract |
| Personality assessments | User-assessed supporting context | No, until normalized assessment schema is promoted | Explicit user assessment only |
| Moral Compass | User-assessed | No by default | Explicit responses required |

## Legacy and unavailable systems

The repository contains historical code or templates for additional systems. Until each has its own governed calculation, evidence, privacy, and interpretation contract, it is **excluded** from the Ultimate Codex:

- Chinese astrology
- Ayurveda
- Vedic astrology / Nakshatras
- Gene Keys
- I Ching
- Mayan / Tzolk'in-style astrology
- Chakra / energy-center profiles
- Runes
- Tarot birth cards
- Kabbalah / Tree of Life paths
- Sacred geometry
- Sabian Symbols
- Biorhythms
- Asteroids
- Arabic Parts / Lots
- Fixed stars
- Astrocartography
- Palmistry

The old template bank contains portable filler such as generic “purpose,” zodiac, or nakshatra placeholders. Those strings are not evidence and must not enter production identity synthesis.

## Full-profile output contract

A complete governed timed profile should expose, when the evidence exists:

1. All ten verified natal planets with sign, degree, and house.
2. Verified Ascendant and Midheaven.
3. All twelve verified Equal House cusps, with sign-on-house interpretation.
4. Mean North/South Nodes and qualified Chiron.
5. Governed major aspects.
6. Sign and house concentration / stellium-style detection with the rule disclosed.
7. Verified Human Design Type, Strategy, Authority, Profile, Definition, centers, channels, gates, and conscious/unconscious gate-line activations.
8. Governed numerology core.
9. A deterministic Codex fingerprint / number / ID made only from allowed stable evidence.
10. Cross-system resonance, tension, contradiction-integration guidance, and an unresolved/excluded ledger.

A complete output does **not** mean every historical system is forced into the reading. Completeness means every registered system has an explicit disposition: **used, supporting, inspect-only, unresolved, or unavailable/excluded**.

## No-fallback doctrine

Forbidden:

- default Life Path archetypes;
- default zodiac/sign personalities;
- generic Galactic Code functions used because evidence is missing;
- invented noon charts;
- fake houses, aspects, Nodes, Chiron, or Human Design;
- inferred MBTI/Enneagram/dosha/chakra/rune/tarot/Gene Key/etc. from unrelated birth fields;
- “divine purpose” or similar mystical filler standing in for missing source data.

When evidence is absent, the correct output is **unresolved**.
