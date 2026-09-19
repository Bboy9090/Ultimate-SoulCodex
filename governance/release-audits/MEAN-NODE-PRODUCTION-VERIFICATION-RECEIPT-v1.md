# Mean Lunar Node Production Verification Receipt v1

Status: APPROVED FOR PRODUCTION POLICY

Node mode: **Mean Node** only.

This receipt does not claim True Node support.

## Evidence identity

- Evidence workflow run: 35463886745
- Evidence artifact: 10590393354
- Artifact SHA-256 digest: a58a113102eb47ae8dd9405d7039bb57f1c8e4671f999b574d6afabfd07f4b71
- Exact evidence candidate SHA: d5d5f30dd316999c5723e3ff8e3c2270dfd53f6f
- Swiss reference: Swiss Ephemeris 2.10.03 / pyswisseph 20230604
- Body: MEAN_NODE
- Fixtures: 24
- Maximum observed longitude delta: 0.0049561882517537015 degrees

## Approved policy

- Policy ID: ASTRO-MEAN-NODE-v1
- Production tolerance: 0.01 degrees
- North Node: deterministic Meeus mean ascending lunar node longitude.
- South Node: exact 180-degree opposition of the North Node.
- Qualification method: fixture-qualified deterministic astronomy.

The production result is evidence-qualified against the fixed Swiss matrix; it is not represented as a live per-user Swiss lookup.

Approved by: Bboy9090
Approved at: 2026-09-19T19:18:33.000Z
