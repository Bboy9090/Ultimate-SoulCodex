# Ascendant Verification Receipt v1

Status: **APPROVED FOR ASCENDANT PRODUCTION PROMOTION**

Approval timestamp: `2026-08-04T04:07:09.547Z`

## Scope

This receipt governs the tropical Ascendant only. It does not approve houses, Midheaven, nodes, Chiron, planetary house placements, or interpretation claims beyond the verified Ascendant placement itself.

## Candidate engine

- Astronomy Engine 2.1.19 apparent sidereal time
- IAU 2006 mean obliquity
- Eastern ecliptic/horizon intersection with quadrant-preserving `atan2`

## Independent reference

- Independently coded Meeus apparent sidereal time
- Separate nutation calculation and true obliquity
- Swiss-Ephemeris-compatible Asc1 geometry

## External fixture authority

Twenty-four fixture longitudes were generated with Swiss Ephemeris 2.10.03 `swe_houses_ex()` in tropical mode. Each row stores an exact UTC timestamp and east-positive coordinates.

The matrix spans northern and southern hemispheres, equatorial and high-latitude locations, DST boundaries, leap days, quarter-hour and half-hour zones, the international date line, historic dates, future dates, and Bobby's raw Bronx birth fixture.

## Promotion gates

A production Ascendant may be exposed only when:

1. exact birth date, time, timezone, latitude, and longitude are present;
2. candidate and independent reference use the same UTC timestamp and coordinates;
3. engine and source identities differ;
4. both engines agree on zodiac sign;
5. circular longitude delta is within the approved tolerance;
6. the 24-row Swiss Ephemeris regression matrix passes;
7. provenance is retained in the saved profile.

## Evidence execution

- Pull request: `#159`
- Workflow: `Ultimate SoulCodex CI`
- Workflow run: `30876666388`
- Job: `91889441968`
- Fixture count: `24`
- Fixture sign disagreements: `0`
- Maximum candidate-to-Swiss delta: `0.004287078014272083°`
- Maximum independent-reference-to-Swiss delta: `0.00047676849806066457°`
- Maximum candidate-to-independent-reference delta: `0.0042490351064543574°`
- Approved production tolerance: `0.01°`
- Full trust-boundary test result: `49 passed, 0 failed`
- Full workspace test result: `385 passed, 0 failed`
- TypeScript check: `PASS`
- Production build: `PASS`

The `0.01°` tolerance is more than twice the maximum observed cross-engine delta while remaining one-third of a zodiac degree minute. Sign agreement remains mandatory, so a value near a sign boundary cannot be promoted merely because its longitude difference is small.

## Bobby fixture

Raw input:

- Local birth date and time: `1990-09-17 11:11`
- Timezone: `America/New_York`
- UTC timestamp: `1990-09-17T15:11:00Z`
- Latitude: `40.8448`
- Longitude: `-73.8648`

Swiss Ephemeris fixture longitude: `227.314087669°`, which is approximately `17.314° Scorpio`.

The production result is derived from the raw timestamp and coordinates. The expected sign is a regression assertion, not a hardcoded return value.
