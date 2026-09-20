# Planetary Longitude Verification Receipt v1

Status: APPROVED FOR PRODUCTION POLICY

## Scope

Bodies approved by this receipt:
- Mercury
- Venus
- Mars
- Jupiter
- Saturn
- Uranus
- Neptune
- Pluto

Sun and Moon remain governed by the earlier ASTRO-LONGITUDE-v1 receipt and its tighter 0.001 degree tolerance.

## Exact evidence identity

- Evidence workflow run: 35449041012
- Evidence artifact: 10586208293
- Artifact SHA-256 digest: 45f5294e2498555ea3491eaadf9a15b110b9005c035e788c90135e4f515dfbac
- Exact candidate SHA: e6ee3bc2919aee8c29c137d09ac3d2364b7fbbc6
- Fixtures: 20
- Bodies per fixture: 10
- Comparison rows: 200
- Sign disagreements: 0

## Observed maximum longitude deltas

- Sun: 0.00027293851550780346 degrees
- Moon: 0.0008717338064343494 degrees
- Mercury: 0.0017285373195612408 degrees
- Venus: 0.0007320591801089904 degrees
- Mars: 0.0010895629015408304 degrees
- Jupiter: 0.0015015139203029548 degrees
- Saturn: 0.0030349310078534586 degrees
- Uranus: 0.0031340335349909765 degrees
- Neptune: 0.003351773269912428 degrees
- Pluto: 0.0010113966908704697 degrees

## Approved policy

Observed full-matrix maximum: 0.003351773269912428 degrees.

Applying the existing 1.25 safety multiplier gives 0.004189716587390535 degrees.
Rounded upward to the existing 0.001 degree policy increment, the production tolerance is:

**0.005 degrees**

Policy ID: ASTRO-PLANET-LONGITUDE-v1

The tolerance does not alter or weaken the historical Sun/Moon 0.001 degree policy.

## Coordinate contract

Astronomy Engine geocentric true-ecliptic-of-date longitude is compared against NASA/JPL Horizons geocentric apparent ecliptic-of-date observer quantity 31 at the exact same UTC timestamp.

No candidate may become authoritative when:
- the reference source is unavailable,
- sign disagrees,
- timestamp differs,
- engine/source independence fails,
- or longitude delta exceeds the policy tolerance.

Approved by: Bboy9090
Approved at: 2026-09-19T14:40:27.000Z
