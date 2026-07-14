# Golden Fixture Provenance

## Overview

Golden fixtures are canonical test datasets that detect unintended changes in Soul Codex calculation engines. This document describes the provenance system that tracks the source, methodology, and verification status of all five canonical fixtures.

## Purpose

The provenance system separates two distinct claims:

1. **Deterministic Regression Behavior**: The engine consistently produces the stored result under the same computational conditions.
2. **Historical or Externally Verified Accuracy**: The stored result has been independently compared against a documented external source or calculation provider and found to be accurate.

A passing regression test establishes the first claim only. Verification status is tracked separately and must be documented explicitly.

## What Passing Tests Prove

- Deterministic behavior: calculations are stable across code changes
- Regression consistency: outputs remain unchanged when code is not modified
- Fixture compatibility: the engine correctly implements its contract against test data
- Structural integrity: numerical calculations follow their specification

## What Passing Tests Does Not Prove

- Historical truth: the birth data is accurate or documented
- Astronomical accuracy: the celestial calculations match real sky positions
- Correct historical timezone conversion: ancient timezone records may be incomplete
- Human Design provider parity: outputs match a specific Human Design calculation tool
- Scientific validity: interpretive systems (numerology, astrology, Human Design) have scientific merit

## Verification Status Definitions

### externally-verified

A fixture receives this status only when:

- The expected value was independently compared against a cited external record or provider
- The comparison source is explicitly named and dated
- Relevant location, time conversion methodology, and calculation provider are documented
- The verification date and verifying party are recorded
- Known limitations are disclosed, including:
  - Precision limits of the external source
  - Sensitivity to birth-time uncertainty
  - Provider-specific coordinate modes or ephemerides used

This status indicates high confidence for the specific claim verified. It does not transfer to unverified fields.

### partially-verified

A fixture receives this status when:

- Some metadata is documented (e.g., birth record exists and birth date is corroborated)
- One or more expected outputs remain unverified
- Historical input data may be sourced, but calculation parity has not been proven
- The limitations list explicitly names what is verified and what is not

Example: Albert Einstein's birth date and time are well-documented, but his expected astrology outputs have not been independently compared against a named astronomy provider.

### unverified

A fixture receives this status when:

- The source record is incomplete, synthetic, or internal to this project
- No independent auditing or external comparison has been performed
- The limitations list explains why verification is missing

Important: A test can pass with an unverified fixture. Passing tests do not automatically upgrade status to `partially-verified` or `externally-verified`.

## Timezone Policy

Historical dates require special handling:

### Local Mean Time

Before the adoption of standard time (typically late 19th century), cities used **local mean time** (LMT), calculated from local solar noon. Standard time (e.g., Central European Time) was adopted internationally starting in the 1880s–1890s, but the transition was not simultaneous.

When a birth record is from the pre-standard-time era:

- Document the recorded local time exactly as reported
- Record the historical timezone method (e.g., "local-mean-time")
- Calculate or estimate the UTC offset based on geographic longitude
- If the historical conversion has not been independently audited, record `timezoneMethod: "unknown"` or the documented method with a limitation explaining the audit gap

### Timezone Identifiers

Modern IANA timezone identifiers (e.g., "Europe/Berlin") may not accurately describe historical conditions, because:
- Timezone definitions change over time
- DST rules vary by era
- Political boundaries shifted

When in doubt, document the local mean time with geographic coordinates and note that historical reconstruction is pending.

## Tolerance Policy

Tolerances (for astronomical coordinates or time-sensitive values) depend on:

- **Source precision**: Does the external source report degrees, minutes, or seconds?
- **Calculation parity**: Which provider and ephemeris version was used?
- **Coordinate mode**: Geocentric vs. topocentric calculations differ slightly
- **Rounding**: Different providers round differently
- **Birth-time precision**: Uncertainty in birth time propagates to Ascendant and Human Design calculations
- **Numerical stability**: Small precision errors in intermediate calculations compound

### When Tolerance is Null

If `expectedCoordinates.sunLongitudeDegrees` is `null`, then `tolerances.sunLongitudeDegrees` must also be `null`. Do not invent a tolerance for a missing expected value.

### Examples

**Example 1: Expected value with known tolerance**

```
expectedCoordinates.sunLongitudeDegrees: 350.25,
tolerances.sunLongitudeDegrees: 0.1,
```

This means the sun longitude is expected to be 350.25° ±0.1°, based on comparison against a named provider with documented ephemeris version.

**Example 2: Unknown expected value**

```
expectedCoordinates.sunLongitudeDegrees: null,
tolerances.sunLongitudeDegrees: null,
```

Expected value and tolerance are both unknown. The regression test may verify sign labels ("Pisces") but not exact coordinates.

**Example 3: Uncertain birth time**

```
timeHandling.uncertaintyMinutes: 1440,
tolerances.ascendantLongitudeDegrees: null,
```

Birth time is unknown (±24 hours uncertainty). Ascendant cannot be reliably calculated. Do not use a broad tolerance to pretend the Ascendant is valid.

## Numerology Convention

The repository preserves **master numbers** (11, 22, 33, and sometimes 44+, depending on convention) as final values when they occur as the result of a reduction step.

**Documented convention:**
> Reduce each birth-date component independently while preserving 11, 22, and 33 when encountered as final component values.

**Example for Marie Curie (November 24, 1867):**

- **Day**: 24 → 2 + 4 = 6
- **Month**: 11 → preserved as 11 (master number)
- **Year**: 1867 → 1 + 8 + 6 + 7 = 22 → preserved as 22 (master number)
- **Life Path**: (1 + 1) + 6 + (2 + 2) = 2 + 6 + 4 = 12 → 1 + 2 = 3

Different numerology schools have different conventions for when to preserve master numbers and how to combine them into the Life Path. This fixture convention is documented in provenance but is not validated against external sources.

## Fixture Inventory

### fixture-001: Albert Einstein

**Person**: Albert Einstein (1879–1955), theoretical physicist

**Birth Data**:
- Date: March 14, 1879
- Time: 11:30 AM (exact)
- Place: Ulm, Württemberg, Germany (48.4°N, 9.99°E)
- Source: Astrodatabank (rating A)

**Purpose**: Regression testing with a well-documented historical figure

**Verification Status**: `partially-verified`

**Verified Input Data**:
- Birth date and time are well-documented in historical records
- Birth location is known
- Astrodatabank source rating is A (reliable)

**Unverified Outputs**:
- Astrology coordinates (sun, moon, ascendant)
- Human Design outputs
- Expected longitude values are not recorded

**Time Handling**:
- Birth occurred under local mean time (LMT) regime
- Germany adopted standard time (Mitteleuropäische Zeit) in 1893
- UTC conversion based on documented LMT with ±5 minute tolerance
- Historical method has not been independently audited

**Tolerances**: All coordinate tolerances are null (no external comparison documented)

**Next Action**:
- Obtain official astrodatabank entry for Albert Einstein
- Compare expected astrology outputs against a modern astronomy provider (e.g., Swiss Ephemeris)
- Record the ephemeris version and coordinate mode used
- Document any discrepancies
- Update verification status and tolerance fields

---

### fixture-002: Marie Curie

**Person**: Marie Curie (1867–1934), physicist and chemist

**Birth Data**:
- Date: November 24, 1867
- Time: 18:30 (6:30 PM, exact)
- Place: Warsaw, Poland (then Russian Poland, 52.23°N, 21.01°E)
- Source: Astrodatabank (rating A)

**Purpose**: Regression testing with a well-documented historical figure; validates master-number preservation (month 11, year 22)

**Verification Status**: `partially-verified`

**Verified Input Data**:
- Birth date and time are documented
- Birth location is known
- Astrodatabank source rating is A
- Numerology: month 11 and year 22 are correctly preserved as master numbers

**Unverified Outputs**:
- Astrology coordinates
- Human Design outputs
- Expected longitude values are not recorded

**Time Handling**:
- Birth occurred in Russian Poland under Russian Empire time conventions
- Poland adopted standard time (Mitteleuropäische Zeit) in 1893
- UTC conversion based on documented LMT with ±10 minute tolerance
- Historical reconstruction from Russian time standards has not been independently audited

**Tolerances**: All coordinate tolerances are null

**Next Action**:
- Verify UTC conversion methodology for Russian Poland, 1867
- Compare expected astrology outputs against a modern astronomy provider
- Record ephemeris version and coordinate mode
- Document verification results
- Update verification status if comparison is completed

---

### fixture-003: Test Subject A

**Person**: Synthetic contemporary test fixture (not a real person)

**Birth Data**:
- Date: August 15, 1990
- Time: 14:30 (exact for testing purposes)
- Place: Unknown
- Source: Internal test suite

**Purpose**: Regression testing with a contemporary date; validates engine behavior

**Verification Status**: `unverified`

**Rationale**:
- This is an internal test fixture with no external source
- Birth location and timezone are not documented
- Expected outputs are provided for regression consistency only
- Not intended to represent a real person or historical data

**Input Limitations**:
- Birthplace coordinates are unknown
- Timezone information is not documented
- No external source record exists

**Output Limitations**:
- Expected astrology values are for regression testing only
- Expected Human Design values are for regression testing only
- These outputs have not been independently verified
- Passing regression tests do not establish accuracy

**Next Action**:
- No independent verification is planned for synthetic fixtures
- This fixture is suitable for deterministic regression testing only
- Do not use this fixture for any accuracy or validity claims

---

### fixture-004: Test Subject B

**Person**: Synthetic test fixture (not a real person)

**Birth Data**:
- Date: December 31, 1975
- Time: Unknown (estimated to 00:00 for testing)
- Place: Unknown
- Source: Birth certificate record (time not recorded)

**Purpose**: Regression testing with missing birth-time data; validates engine behavior when time is unknown

**Verification Status**: `unverified`

**Rationale**:
- Birth time is completely unknown
- Estimated time of 00:00 (midnight) is arbitrary and used only for testing
- No external source has been consulted

**Input Limitations**:
- Birth time is unknown with ±1440-minute uncertainty (full 24-hour range)
- Birthplace coordinates are unknown
- Timezone information is not documented

**Output Limitations**:
- Moon sign calculation is time-sensitive and unreliable without exact birth time
- Ascendant depends critically on birth time and is unknown without it
- Human Design outputs (strategy, authority, type) require exact birth time and cannot be reliably calculated
- Sun sign (Capricorn) is reliable because it depends only on the date
- Numerology is reliable because it depends only on the date components

**Verification Status by Field**:

| Field | Status | Reason |
|-------|--------|--------|
| Day Number (4) | Reliable | Depends only on date |
| Month Number (3) | Reliable | Depends only on date |
| Year Number (22) | Reliable | Depends only on date |
| Sun Sign (Capricorn) | Reliable | Depends only on date |
| Moon Sign | Unknown | Requires accurate birth time |
| Ascendant | Unknown | Requires accurate birth time |
| Human Design | Unknown | Requires accurate birth time |

**Next Action**:
- This fixture documents engine behavior when birth time is missing
- It is not a candidate for historical verification
- Use only for testing edge cases and missing data handling

---

### fixture-005: Master Number Test

**Person**: Synthetic test fixture (not a real person)

**Birth Data**:
- Date: February 29, 1964 (leap day)
- Time: 11:00 (arbitrary for testing)
- Place: Unknown
- Source: Internal synthetic fixture

**Purpose**: Regression testing; validates edge-case handling for leap-day dates and master-number preservation

**Verification Status**: `unverified`

**Rationale**:
- This is a synthetic fixture designed to test numerology edge cases
- It does not represent a real person or historical data
- It was created specifically to validate leap-day parsing and master-number preservation

**Input Focus**:
- Leap day (February 29) is a valid date only in leap years
- 1964 was a leap year
- The fixture tests that the engine correctly parses February 29

**Output Focus**:
- **Numerology**: Tests master-number preservation
  - Day: 2 + 9 = 11 (master number, preserved)
  - Month: 02 → 2 (single digit)
  - Year: 1 + 9 + 6 + 4 = 20 → 2 + 0 = 2 (single digit)
- **Astrology and Human Design**: Provided for regression consistency only; not validated

**Expected Values**:
- Personal day: 11 (master number)
- Personal month: 2
- Personal year: 2
- Sun sign: Pisces (date-based, reliable)
- Moon sign: Libra (time-based, for regression only)
- Ascendant: Taurus (time-based, for regression only)
- Human Design: Reflector 4/6 (time-based, for regression only)

**Limitations**:
- Time is arbitrarily set and not realistic
- Birthplace and timezone are not applicable
- Astrology and Human Design outputs are for regression testing only
- This fixture does not validate astronomical accuracy
- The sole purpose is to ensure the numerology engine handles leap days and preserves master numbers

**Next Action**:
- This fixture is fit for purpose as a regression test
- No historical or external verification is expected or appropriate
- Use only to validate leap-day parsing and master-number preservation

---

## Independent Audit Checklist

If you wish to independently verify a fixture against an external source, follow this process:

1. **Obtain source record**
   - Consult Astrodatabank, official historical records, or government birth certificates
   - Verify the source data is accessible and meets your standards of reliability
   - Document the exact source reference and URL (if applicable)

2. **Record exact input data**
   - Birth date (YYYY-MM-DD)
   - Birth time (HH:MM) with precision to the minute if available
   - Birth location (city, region, country)
   - Geographic coordinates (latitude, longitude) used for calculation

3. **Confirm birthplace coordinates**
   - Verify latitude and longitude against a geographic reference (e.g., GIS database, GPS records)
   - Document the source of coordinates
   - Note any ambiguity or historical shifts in city boundaries

4. **Reconstruct historical time standard**
   - Determine the time convention in use at birth (e.g., local mean time, standard time)
   - Identify when standard time was adopted in that region
   - Calculate or look up the UTC offset for the local mean time at that location
   - Note any uncertainty in the historical conversion method

5. **Convert local time to UTC**
   - Apply the historical UTC offset (or modern offset if standard time was in effect)
   - Document the exact conversion method used
   - Record the conversion source (e.g., "LMT calculated from longitude: 9.9878°E")
   - Note the uncertainty range (e.g., ±5 minutes)

6. **Record calculation provider and version**
   - Identify the astronomy provider (e.g., Swiss Ephemeris, Astro.com, etc.)
   - Record the exact version number of the ephemeris used
   - Document the coordinate mode (geocentric or topocentric)
   - Note the zodiac convention (tropical or sidereal)

7. **Compare longitude outputs**
   - Request or calculate expected longitude values for sun, moon, and ascendant
   - Compare the Soul Codex engine outputs against these values
   - Record any discrepancies, even if they are small (e.g., ±0.1°)
   - Document the tolerance based on provider precision and rounding

8. **Record tolerances**
   - If multiple independent sources are compared, document the range of variation
   - Tolerance is not synonymous with accuracy; it is a range within which outputs are expected
   - Tolerances for time-sensitive values (moon, ascendant) must account for birth-time uncertainty

9. **Record verifier and date**
   - Who performed the verification?
   - When was it performed?
   - Was this an automatic test, a manual comparison, or a secondary audit?
   - Document the context and any limitations

10. **Update verification status**
    - Only after steps 1–9 are complete, update the provenance field:
      - `verification.status`: Update from "unverified" to "partially-verified" or "externally-verified"
      - `verification.verifiedAt`: ISO 8601 date of completion
      - `verification.verifiedBy`: Name or identifier of the verifier
      - `verification.comparedAgainst`: Array of comparison sources (e.g., `["Swiss Ephemeris v6.15, geocentric"]`)
      - `expectedCoordinates.*`: Fill in with verified values
      - `tolerances.*`: Fill in with documented ranges
      - `limitations`: Document any caveats, precision limits, or provider-specific behaviors

## Key Guardrails

**Do not accept this claim:**

> "Astrodatabank says it, therefore all derived outputs are verified."

Astrodatabank is a source for **birth record data** (date, time, location). It does not certify:
- The engine's timezone conversion (especially for historical dates)
- The engine's planetary position calculations
- The engine's ascendant (rising sign) calculation
- The engine's Human Design mapping
- The engine's numerology reduction algorithm

Each of these is a separate calculation with its own potential sources of error.

**Do not claim external verification without:**
- An explicit comparison against a named external source
- A recorded date of verification
- The verifying party or method
- Known tolerances and precision limits
- A limitations list explaining what remains unverified

**Do use this system to:**
- Document what is known and what is unknown
- Track future verification efforts
- Prevent overstated confidence in test results
- Make it easy for others to audit or extend the fixture metadata

---

## Summary

This provenance system enables:

- **Transparent documentation** of fixture origins and limitations
- **Separation of concerns** between deterministic behavior and historical accuracy
- **Clear pathways** for future independent verification
- **Conservative claims** that do not overstate test results
- **Maintainability** of fixture metadata over time

Passing regression tests are valuable for detecting unintended changes. Provenance documentation ensures those tests are interpreted correctly and limitations are always visible.
