# Golden Fixture Provenance

## Purpose

Golden fixtures detect unintended engine changes through regression testing.

## What Passing Tests Prove

✅ **Deterministic behavior** — The engine consistently produces the stored result for given inputs.
✅ **Stable regression output** — Fixture compatibility with current engine contracts.
✅ **Code change detection** — Changes to core calculation logic are immediately visible.

## What Passing Tests Does NOT Prove

⚠️ **Historical truth** — Stored expected values may not match historical astronomical records.
⚠️ **Astronomical accuracy** — Output coordinates may not match published ephemerides.
⚠️ **Correct historical timezone conversion** — UTC conversions from historical local time remain unverified.
⚠️ **Human Design provider parity** — Outputs may not match the system they claim to represent.
⚠️ **Scientific validity** — Tests do not validate the systems themselves, only consistency.

## Verification Status Definitions

### externally-verified
- Expected value was **independently compared** against a cited external record or calculation provider.
- The external source, provider name, and version are documented.
- Comparison target is recorded (e.g., "calculated against Astrodatabank reference, 2024-01-15").
- Relevant birthplace, time conversion method, and calculation method are documented.
- Verification date and verifier are recorded.
- Limitations and tolerances are disclosed.

**Status is promoted to this level only after independent audit.**

### partially-verified
- Some source metadata is documented (e.g., birth record exists in Astrodatabank).
- One or more expected outputs remain unverified against external sources.
- Historical input data may be sourced, but calculation parity has not been proven.
- A limitations list explains exactly what has been verified and what has not.

**This is the default for well-sourced historical fixtures.**

### unverified
- Source record is incomplete, synthetic, internal, or has not been independently audited.
- Regression tests may still pass.
- Deterministic behavior may still be established.

**This is correct for test subjects, synthetic fixtures, and any fixture lacking external source verification.**

**Never promote status based solely on test results.**

## Timezone Policy

Historical dates require special timezone handling:

- **Modern IANA timezones are not accurate for historical dates.** They reflect current rules, not those that applied when a fixture was born.
- Prefer documented historical timezone method (e.g., "local mean time," "standard time adoption date").
- Preserve the source's recorded timezone convention; do not assume UTC conversion.
- If conversion method is uncertain, record `timezoneMethod: "unknown"` and note the limitation.
- UTC offset should match historical practice, not modern standard time.

**Example:** Einstein was born in Ulm, Germany at 11:30 local time on March 14, 1879. Germany did not adopt standard time until 1893. The recorded time is local mean time (LMT), not Central European Time. Conversion to UTC requires historical time data, not the modern `Europe/Berlin` zone.

## Tolerance Policy

Tolerances depend on source and calculation parity, not a universal standard:

- **Exact astronomical output tolerances** depend on ephemeris choice, coordinate mode, rounding, and birth-time precision.
- **Ascendant tolerance** must account for birth-time uncertainty. Unknown birth time means no Ascendant, not merely "low confidence."
- **Human Design time sensitivity** must be documented separately from astrology.
- **Null expected coordinate** requires null tolerance. Tolerance cannot substitute for missing input data.
- **Tolerances must not be used to convert an unverified value into a verified one.**

Do not apply ±0.5° merely because it sounds reasonable. Document the actual source of tolerance values.

## Fixture Inventory

### Fixture 001: Albert Einstein

| Field | Status |
|-------|--------|
| **ID** | fixture-001 |
| **Name** | Albert Einstein |
| **Purpose** | Historical reference figure with well-documented birth data |
| **Source** | Astrodatabank (Rating A: Reliable) |
| **Birthplace** | Ulm, Württemberg, Germany (48.4008°N, 9.9878°E) |
| **Birth Date/Time** | March 14, 1879 at 11:30 local mean time |
| **Time Status** | Exact, but LMT conversion uncertainty ±5 minutes |
| **Externally Verified Fields** | Birth date and time (historical consensus) |
| **Unverified Fields** | Astrology outputs, Human Design outputs |
| **Known Limitations** | UTC conversion method has not been independently audited; Astrodatabank rating certifies source reliability, not calculation accuracy |
| **Next Action** | Independent comparison of astrology/HD outputs against named external provider |

### Fixture 002: Marie Curie

| Field | Status |
|-------|--------|
| **ID** | fixture-002 |
| **Name** | Marie Curie |
| **Purpose** | Historical reference figure with verified birth record |
| **Source** | Astrodatabank (Rating A: Reliable) |
| **Birthplace** | Warsaw, Mazovia, Poland (52.2297°N, 21.0122°E) |
| **Birth Date/Time** | November 24, 1867 at 18:30 local mean time |
| **Time Status** | Exact, but historical Polish timezone conversion uncertain ±10 minutes |
| **Externally Verified Fields** | Birth date and time (historical records) |
| **Unverified Fields** | Astrology outputs, Human Design outputs |
| **Known Limitations** | Birth occurred during Russian Poland; modern Polish timezone does not apply; UTC conversion method unaudited |
| **Next Action** | Obtain original birth certificate; verify UTC conversion with historical timezone expert |

### Fixture 003: Test Subject A

| Field | Status |
|-------|--------|
| **ID** | fixture-003 |
| **Name** | Test Subject A |
| **Purpose** | Contemporary chart for regression testing |
| **Source** | Direct verification (internal) |
| **Birthplace** | Synthetic / Representative coordinates only |
| **Birth Date/Time** | August 15, 1990 at 14:30 exact |
| **Time Status** | Exact (exact birth time) |
| **Externally Verified Fields** | None (synthetic fixture) |
| **Unverified Fields** | All astrology and Human Design outputs |
| **Known Limitations** | This fixture represents a test subject, not a historical person; outputs validate consistency, not external accuracy |
| **Next Action** | If this fixture is upgraded to represent a real person, perform independent source verification |

### Fixture 004: Test Subject B

| Field | Status |
|-------|--------|
| **ID** | fixture-004 |
| **Name** | Test Subject B |
| **Purpose** | Test fixture with estimated birth time |
| **Source** | Birth certificate (no time) – estimated to midnight |
| **Birthplace** | Synthetic / Representative coordinates only |
| **Birth Date/Time** | December 31, 1975 at 00:00 (midnight, estimated) |
| **Time Status** | Estimated (midnight used as placeholder; actual time unknown) |
| **Externally Verified Fields** | Birth date only |
| **Unverified Fields** | All astrology and Human Design outputs; Ascendant cannot be verified without exact time |
| **Known Limitations** | Estimated midnight time; Ascendant is not available, not low-confidence; Human Design requires exact time and is not verified |
| **Next Action** | Do not use this fixture to validate Ascendant or time-dependent Human Design calculations |

### Fixture 005: Master Number / Leap Day

| Field | Status |
|-------|--------|
| **ID** | fixture-005 |
| **Name** | Master Number Test (Leap Day) |
| **Purpose** | Synthetic fixture testing numerology edge case (leap day, master number) |
| **Source** | Synthetic (constructed for testing) |
| **Birthplace** | Synthetic / Representative coordinates only |
| **Birth Date/Time** | February 29, 1964 at 11:00 |
| **Time Status** | Exact (by definition for test fixture) |
| **Externally Verified Fields** | Numerology reduction rule implementation only |
| **Unverified Fields** | All astrology and Human Design outputs |
| **Known Limitations** | This is a synthetic numerology test case, not a historical person; astrology and Human Design outputs do not validate external systems |
| **Next Action** | Use only to verify numerology reduction behavior; do not extend to astronomical system validation |

## Independent Audit Checklist

Before promoting a fixture's verification status, perform the following:

- [ ] **Obtain source record:** Access the primary source (e.g., historical birth certificate, published record, trusted database)
- [ ] **Record exact source reference:** Document URL, book/page, database ID, access date, retrieved data
- [ ] **Confirm birthplace coordinates:** Verify latitude and longitude (e.g., OpenStreetMap, GPS coordinates)
- [ ] **Reconstruct historical time standard:** Determine whether local mean time, standard time, daylight time, or estimated time was used
- [ ] **Identify historical timezone rules:** Research the UTC offset that applied on the birth date at the birthplace
- [ ] **Convert local time to UTC:** Calculate UTC time using documented historical standards
- [ ] **Record provider and version:** Name the astrology ephemeris/software, Human Design system/method, numerology convention
- [ ] **Calculate expected outputs:** Run the engine using UTC time; record Sun, Moon, Ascendant, and Human Design outputs
- [ ] **Compare against source:** If external provider outputs are available, compare with ±tolerance
- [ ] **Record tolerances:** Document why each tolerance value was chosen (ephemeris parity, birth-time uncertainty, provider differences, etc.)
- [ ] **Record verifier and date:** Document who performed the audit and when (e.g., "Jane Doe, 2024-07-14")
- [ ] **Update verification status:** Promote to "externally-verified" only after all steps are complete and documented
- [ ] **Disclose limitations:** Record any caveats (e.g., "ephemeris available only to 0.5° precision," "provider version may differ from historical version," etc.)

## Example: Complete External Verification

**Fixture:** Albert Einstein
**Action:** Independent verification against JPL Horizons System

1. ✅ Source record: Astrodatabank entry retrieved 2024-01-15, corroborated by Einstein biography (Isaacson, 2007, p. xxx)
2. ✅ Reference: Birth certificate shows 11:30 Ulm local time
3. ✅ Birthplace: Ulm, Germany (48.4008°N, 9.9878°E confirmed via OpenStreetMap)
4. ✅ Historical timezone: Ulm used local mean time LMT (UT+0:33:20) until German standard time adoption in 1893
5. ✅ UTC conversion: 11:30 LMT = 10:56:40 UTC (verified against Meeus algorithms)
6. ✅ Provider: JPL Horizons System (version 2024-01-15)
7. ✅ Calculated outputs: Sun 23° Pisces, Moon 14° Scorpio, Ascendant 28° Capricorn
8. ✅ Comparison: Stored outputs match JPL within ±0.5° (ephemeris limit)
9. ✅ Tolerance: ±0.5° documented as ephemeris standard deviation
10. ✅ Verifier: Dr. X, Astronomical Society, 2024-07-14
11. ✅ Status update: "externally-verified" with limitations recorded
12. ✅ Limitations: "JPL Horizons uses modern ephemerides (HORIZONS 2024). Historical ephemerides available at the birth date were less precise. Comparison represents modern accuracy, not 1879 accuracy."

---

## Summary

Fixtures provide regression safety, not historical proof. A passing test confirms the code hasn't changed. It does not confirm the code is correct for real-world use.

Verification status separates these concerns. Use `unverified` and `partially-verified` liberally. Reserve `externally-verified` for fixtures that have actually been audited against named external sources.

When in doubt, use null and document the limitation. A null value is honest. A guess is a debt.
