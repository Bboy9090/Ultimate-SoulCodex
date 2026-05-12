# Test Fixtures

Soul Codex needs fixtures before calculation-engine upgrades.

Fixtures let future agents compare engines, protect confidence behavior, and prevent generic astrology output from replacing Soul Codex quality.

## Fixture Goals

Fixtures should prove:

- Missing birth time lowers or qualifies confidence.
- Missing location lowers or qualifies confidence.
- Two users with the same Sun sign receive different readings when other inputs differ.
- Family context affects imprint language without becoming destiny.
- Advanced symbols receive plain-language explanation.
- Medical and deterministic claims are rejected.
- Engine outputs remain traceable.

## Required Fixture Set

Create fixture profiles for:

| Fixture | Purpose |
| --- | --- |
| Full birth data | Verifies high-confidence astrology, houses, and Human Design-sensitive outputs. |
| Missing birth time | Verifies rising/houses/degree-sensitive warnings. |
| Missing location | Verifies location-sensitive warnings. |
| Same Sun sign A | Verifies non-identical synthesis with distinct Moon/context/self-report. |
| Same Sun sign B | Paired with A to prevent generic Sun sign output. |
| Family context present | Verifies imprint language and no blame. |
| Parent data only | Verifies family confidence is partial without behavioral context. |
| Numerology name variant | Verifies name source and spelling confidence. |
| Advanced mode | Verifies trace and technical details are exposed. |
| Beginner mode | Verifies simple, calm, non-jargon explanation. |

## Quality Assertions

Each fixture should assert:

- Confidence badge is present.
- Confidence reason is present.
- Missing data note appears when needed.
- No deterministic claims are present.
- No medical diagnosis is present.
- At least one growth move is present.
- Explanation includes gift and shadow.
- Output separates calculated facts from interpretive guidance.

## Engine Comparison Assertions

When evaluating a future precision engine:

- Compare planetary sign.
- Compare degree.
- Compare house placement.
- Compare aspects.
- Compare nodes.
- Compare timezone handling.
- Compare confidence decisions.
- Record all differences in a fixture report before switching engines.

## Non-Goals

Fixtures should not require:

- A new Python backend.
- Swiss Ephemeris implementation.
- Production schema changes.
- iOS changes.
- AI API access for deterministic contract checks.
