# Ascendant Verification Receipt v1

Status: **evidence run pending**

## Scope

This receipt governs the tropical Ascendant only. It does not approve houses, Midheaven, nodes, Chiron, planetary house placements, or any interpretation layer.

## Candidate engine

- Astronomy Engine 2.1.19 apparent sidereal time
- IAU 2006 mean obliquity
- Eastern ecliptic/horizon intersection with quadrant-preserving `atan2`

## Independent reference

- Independently coded Meeus apparent sidereal time
- True obliquity with a separate nutation calculation
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

## Evidence result

To be filled from CI before merge. No hardcoded sign is permitted, including the known Bobby fixture expectation.
