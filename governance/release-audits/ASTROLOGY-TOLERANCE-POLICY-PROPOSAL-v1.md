# Astrology Longitude Tolerance Policy v1

## Status

**APPROVED FOR SUN AND MOON LONGITUDE VERIFICATION ONLY.**

- Policy ID: `ASTRO-LONGITUDE-v1`
- Maximum permitted circular longitude delta: `0.001°`
- Approved by: `Bboy9090`
- Approved at: `2026-08-03T11:26:00.000Z`
- Promotion scope: `Sun`, `Moon`

This approval does not apply to the Ascendant, houses, nodes, Chiron, asteroids, Human Design, or any other calculation.

## Evidence receipt

Live GitHub Actions workflow run: `30803626991`

Artifact:

- Name: `ephemeris-live-evidence-receipt`
- Artifact ID: `8851843885`
- SHA-256: `bc23e71ebffe3bb7532b2c511999e2da3ac5ba4af394092dd55c454e40f52d8d`
- Retention at capture: 90 days

Measured results:

- Comparisons: `40`
- Sign disagreements: `0`
- Maximum Sun delta: `0.00027293851550780346°`
- Maximum Moon delta: `0.0008717338064343494°`
- Maximum overall delta: `0.0008717338064343494°`

The matrix includes seasonal sign boundaries, New York/London/Sydney DST transitions, leap days, historical dates, date-line edges, quarter-hour and half-hour time zones, and controlled profile geographies.

## Coordinate and timestamp contract

Candidate engine:

- Astronomy Engine `2.1.19`
- geocentric true-ecliptic-of-date longitude

Independent reference:

- NASA/JPL Horizons API `1.3`
- geocentric apparent ecliptic-of-date observer quantity 31

Comparison requirements:

1. Both calculations must represent the same celestial body.
2. Both must use the exact same normalized UTC input timestamp.
3. Candidate and reference must identify different engines and different sources.
4. Zodiac signs must agree.
5. Circular longitude delta must be less than or equal to `0.001°`.
6. Any missing evidence, network failure, parse failure, sign disagreement, or tolerance failure leaves the placement unresolved.

## Why `0.001°`

The observed maximum was `0.0008717338064343494°`. The original proposal applied a `1.25` safety multiplier and rounded upward to a practical `0.001°` boundary. The expanded 40-comparison live receipt remained below that boundary with zero sign disagreements.

The approved tolerance is intentionally narrow. It is a release contract for agreement between two astronomical calculation paths, not permission to relax failed comparisons until they become convenient.

## What this approval means

A Sun or Moon placement may be promoted to `verified` only when a fresh independent NASA/JPL reference passes the approved verification contract. The verified record must retain candidate provenance, reference provenance, policy ID, evidence receipt ID, exact UTC timestamp, and measured longitude delta.

## What this approval does not mean

This policy verifies astronomical calculation agreement. It does not establish that astrology is scientifically validated, that symbolic interpretations are factual, or that unresolved chart components may be inferred. Interpretations remain symbolic and must be presented as such.

The Ascendant and houses remain blocked pending their own formula validation, independent reference suite, evidence receipt, and explicit approval. No legacy approximation may fill that gap.

## Revocation and review

The policy fails closed and must be reviewed if any of the following occurs:

- a supported engine or coordinate frame changes
- a live evidence run records a sign disagreement
- a measured delta exceeds `0.001°`
- the input timestamp contract changes
- the NASA/JPL response format or quantity definition changes
- a production incident reveals an untracked promotion path

A future policy version must receive a new ID and evidence receipt. Existing approval cannot be silently stretched to cover new bodies or formulas. Apparently even software needs rules against mission creep, because humans keep feeding it after midnight.
