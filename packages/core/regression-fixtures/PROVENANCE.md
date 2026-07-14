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
- Time: 11:30 AM (recorded local time)
- Place: Ulm, Württemberg, Germany (48.4°N, 9.99°E)
- Source: Astrodatabank (rating A, but access date not recorded)

**Purpose**: Regression testing with documented historical birth data; not verification of astrology or Human Design

**Verification Status**: `partially-verified`

**What is Verified**:
- Birth date is documented in historical records
- Birth time is documented (though source access is not recorded)
- Birth location is known and coordinates are established

**What is NOT Verified**:
- UTC offset conversion from local mean time (no independent audit)
- Astrology coordinate calculations (no comparison against external provider)
- Human Design outputs (no comparison against Human Design provider)
- Any calculation method or ephemeris version

**Time Handling**:
- Birth recorded as 11:30 local time in Ulm
- Birth occurred during local mean time (LMT) regime
- Germany adopted standard time (Mitteleuropäische Zeit) in 1893
- UTC offset calculation requires geographic coordinates and historical timezone research
- Uncertainty ±5 minutes reflects potential transcription or rounding error in historical source
- Astrodatabank provides the birth record; it does not certify the UTC conversion

**Calculation Metadata**: All calculation fields are null (no provider, ephemeris version, or method documented)

**Tolerances**: All coordinate tolerances are null (no external comparison performed)

**Next Action**:
- If future verification is pursued: obtain official Astrodatabank entry with full source citation
- Compare expected astrology outputs against a modern astronomy provider (e.g., Swiss Ephemeris) with recorded ephemeris version
- Document UTC conversion method used and verify against historical timezone records
- Record verification date, verifier, and any limitations
- Update verification status only after these steps are complete

---

### fixture-002: Marie Curie

**Person**: Marie Curie (1867–1934), physicist and chemist

**Birth Data**:
- Date: November 24, 1867
- Time: 18:30 (6:30 PM, recorded local time)
- Place: Warsaw, Poland (then Russian Poland, 52.23°N, 21.01°E)
- Source: Astrodatabank (rating A, but access date not recorded)

**Purpose**: Regression testing with documented historical birth data; validates master-number preservation in numerology tests

**Verification Status**: `partially-verified`

**What is Verified**:
- Birth date is documented
- Birth time is documented (though source access is not recorded)
- Birth location is known and coordinates are established

**What is NOT Verified**:
- UTC offset conversion from Russian Empire local time (no independent audit)
- Astrology coordinate calculations (no comparison against external provider)
- Human Design outputs (no comparison against Human Design provider)
- Master-number preservation method (asserted but not independently validated)

**Time Handling**:
- Birth recorded as 18:30 local time in Warsaw
- Birth occurred during Russian Empire administrative period
- Poland adopted standard time (Mitteleuropäische Zeit) in 1893
- UTC offset calculation requires geographic coordinates and historical Russian time standards research
- Uncertainty ±10 minutes reflects potential transcription or rounding error
- Astrodatabank provides the birth record; it does not certify the UTC conversion

**Calculation Metadata**: All calculation fields are null (no provider, ephemeris version, or method documented)

**Tolerances**: All coordinate tolerances are null (no external comparison performed)

**Next Action**:
- If future verification is pursued: obtain Astrodatabank entry with full source citation
- Verify UTC conversion methodology for Russian Poland, 1867 against historical timezone records
- Compare expected astrology outputs against a modern astronomy provider with recorded ephemeris version
- Document verification date, verifier, and limitations
- Update verification status only after these steps are complete

---

### fixture-003: Test Subject A

**Person**: Internal synthetic test fixture (not a real person)

**Birth Data**:
- Date: August 15, 1990
- Time: 14:30 (synthetic for testing purposes)
- Place: Unknown (deliberately unspecified)
- Source: Internal test suite

**Purpose**: Deterministic regression testing only; not intended to represent real data or validate any engine accuracy

**Verification Status**: `unverified`

**Rationale**:
- This is an internal synthetic fixture created for regression testing
- No external source record exists
- Birth location and timezone are deliberately not specified
- Expected outputs are provided for deterministic regression consistency only

**Input Limitations**:
- Birthplace coordinates are unknown (intentional)
- Timezone information is not documented (intentional)
- No external source record exists
- Should not be treated as representing a real person

**Output Limitations**:
- Expected astrology values are for regression testing only
- Expected Human Design values are for regression testing only
- No external comparison has been performed
- Passing regression tests do not establish astrology accuracy, Human Design validity, or any real-world applicability
- These outputs should never be cited as validation evidence

**Suitable Use**:
- Regression testing to detect unintended code changes
- Testing engine behavior under specific input conditions

**Unsuitable Use**:
- Validating astrology calculations
- Validating Human Design methodology
- Making any accuracy or validity claims

**Next Action**:
- This fixture requires no external verification
- It is fit for purpose as a regression test
- Do not use it to support any claims about the engines' real-world accuracy

---

### fixture-004: Test Subject B

**Person**: Internal synthetic test fixture (not a real person)

**Birth Data**:
- Date: December 31, 1975
- Time: Unknown (estimated to 00:00 for testing purposes only)
- Place: Unknown (intentionally unspecified)
- Source: Internal synthetic fixture (birth certificate scenario)

**Purpose**: Regression testing for missing birth-time data; validates engine behavior when exact time is unavailable

**Verification Status**: `unverified`

**Rationale**:
- This fixture tests edge cases where birth time is not available
- Estimated time of 00:00 (midnight) is arbitrary and used only for testing
- No external source has been consulted
- This is NOT a real person or real birth certificate

**Input Limitations**:
- Birth time is completely unknown; uncertainty ±1440 minutes (full 24-hour range)
- Birthplace coordinates are unknown
- Timezone information is not documented

**Output Limitations by Field**:

| Field | Reliability | Reason |
|-------|------------|--------|
| Day Number (4) | Reliable | Depends only on date |
| Month Number (3) | Reliable | Depends only on date |
| Year Number (22) | Reliable | Depends only on date |
| Sun Sign (Capricorn) | Reliable | Depends only on date |
| Moon Sign | Unreliable | Requires accurate birth time |
| Ascendant | Unreliable | Requires exact birth time; unknown without it |
| Human Design (all fields) | Unreliable | Require exact birth time; cannot be reliably calculated |

**Critical Note**: This fixture demonstrates that the engine returns values for fields that cannot be reliably calculated. Do not use Moon sign, Ascendant, or Human Design outputs from this fixture as evidence that the engine correctly calculates these values when birth time is missing.

**Suitable Use**:
- Regression testing to ensure consistent engine behavior when birth time is missing
- Testing error handling and fallback behavior for incomplete input

**Unsuitable Use**:
- Validating astrology calculations for charts without accurate birth times
- Validating Human Design calculations when birth time is unknown
- Supporting any claim that the engine correctly calculates time-sensitive fields from date alone

**Next Action**:
- This fixture is fit for purpose as a regression test
- Do not use it for any accuracy or validity validation claims

---

### fixture-005: Master Number Test

**Person**: Internal synthetic test fixture (not a real person)

**Birth Data**:
- Date: February 29, 1964 (leap day)
- Time: 11:00 (arbitrary for testing)
- Place: Unknown (not applicable)
- Source: Internal synthetic fixture designed for edge-case testing

**Purpose**: Regression testing for leap-day date handling and numerology edge cases; not intended to validate any real-world accuracy

**Verification Status**: `unverified`

**Rationale**:
- This is a synthetic fixture created specifically to test edge cases
- It does not represent a real person or real historical data
- It was designed to validate leap-day parsing and test numerology calculations

**Input Focus**:
- Leap day (February 29) is valid only in leap years
- 1964 was a leap year; February 29, 1964 is a valid test date
- The fixture tests that the engine correctly parses leap dates

**Output Focus by Field**:

| Field | Purpose | Notes |
|-------|---------|-------|
| Day (11) | Numerology test | Tests master-number preservation (2 + 9 = 11) |
| Month (2) | Numerology test | Tests single-digit reduction (0 + 2 = 2) |
| Year (2) | Numerology test | Tests reduction sequence (1+9+6+4=20, 2+0=2) |
| Sun sign | Regression only | Pisces, date-based and date-independent |
| Moon sign | Regression only | Libra, time-based output for regression consistency |
| Ascendant | Regression only | Taurus, time-based output for regression consistency |
| Human Design | Regression only | All fields time-based, for regression consistency only |

**Limitations**:
- Birth time (11:00) is arbitrarily set and not realistic
- Birthplace and timezone information are not applicable to this synthetic fixture
- Numerology convention is not documented in provenance metadata
- Astrology and Human Design outputs are provided for regression consistency only
- No external verification or astronomical validation has been performed
- This fixture does not establish the accuracy or validity of astrology or Human Design calculations
- Leap-day handling is the only aspect validated by this fixture

**Suitable Use**:
- Regression testing to ensure consistent engine behavior on leap dates
- Testing numerology edge cases and master-number preservation
- Validating that the engine correctly parses February 29

**Unsuitable Use**:
- Validating astrology calculations
- Validating Human Design methodology
- Supporting any claim about the engines' astronomical or numerological accuracy
- Using as evidence that numerology reduction methods are correct or verified

**Next Action**:
- This fixture is fit for purpose as a regression test
- No historical or external verification is needed or appropriate
- Use only to validate leap-date parsing and regression consistency

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

**Do not accept these claims:**

> "Astrodatabank says it, therefore all derived outputs are verified."

Astrodatabank is a source for **birth record data** (date, time, location). It does not certify:
- The engine's timezone conversion (especially for historical dates)
- The engine's planetary position calculations
- The engine's ascendant (rising sign) calculation
- The engine's Human Design mapping
- The engine's numerology reduction algorithm

Each of these is a separate calculation with its own potential sources of error.

> "The test passes, therefore the output is historically accurate."

Passing regression tests establish that the engine produces consistent output under the same code and input. They do NOT establish:
- Historical accuracy of birth records
- Correctness of timezone conversions from historical sources
- Astronomical accuracy of celestial calculations
- Validity of numerology or Human Design methodologies
- Accuracy of any output for real-world decision-making

Tests validate deterministic behavior. They do not validate truth claims.

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
