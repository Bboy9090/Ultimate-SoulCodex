# Equal House / Midheaven Production Verification Receipt v1

Status: APPROVED FOR PRODUCTION POLICY

House system: Equal House (Swiss Ephemeris system E).

This receipt does not claim Placidus, Koch, Whole Sign, or any other house system.

## Evidence identity

- Evidence workflow run: 35449945640
- Evidence artifact: 10586653891
- Artifact SHA-256 digest: fa801246ef13786dab5e6ad4939907ae1371e68bc051eba60adabd6e2c288a82
- Exact evidence candidate SHA: ef242e304747065e3305ea62883cde3589ab895c
- Swiss reference: Swiss Ephemeris 2.10.03 / pyswisseph 20230604
- Function: swe_houses_ex()
- Zodiac: tropical
- Longitude convention: east-positive
- Fixtures: 24

## Observed maxima

- Ascendant delta: 0.004287078216634654 degrees
- Candidate MC delta: 0.0005004738771390294 degrees
- Independent MC reference delta: 0.000532682797711459 degrees
- Equal House cusp delta: 0.004287078216634654 degrees

The cusp error is inherited from the verified Ascendant longitude because Equal House is defined as twelve 30-degree sectors beginning at the Ascendant.

## Approved policy

- Policy ID: ASTRO-EQUAL-HOUSE-v1
- Midheaven maximum delta: 0.001 degrees
- Equal House cusp maximum delta: 0.01 degrees
- Ascendant remains governed separately by ASTRO-ASCENDANT-v1.

MC is a separate chart angle. In Equal House it is not silently relabeled as the tenth-house cusp.

Unknown or unverified birth time/location must prevent authoritative MC and house output.

Approved by: Bboy9090
Approved at: 2026-09-19T14:54:41.000Z
