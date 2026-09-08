# W2-ASTRO-001: Swiss Ephemeris Calculation Engine

**Status:** Ready for Implementation (T+3 Kickoff)
**Squad Lead:** TBD
**Team:** 2 agents
**Timeline:** T+3 → T+5.5
**Input Spec:** `specs/ASTROLOGY_CALCULATION_SPEC.json`
**Dependencies:** None (foundational engine)
**Feeds:** W2-ASTRO-002, W2-ASTRO-003, W2-ASTRO-004, W2-CALC-001

---

## Mission

Implement a Swiss Ephemeris-based planetary position calculation engine that:
- Calculates positions for 10 planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
- Handles timezone conversions (UTC ↔ local) via `pytz`
- Achieves precision tolerances (Sun/Moon ±0.05°, outer planets ±0.10°, Ascendant/MC ±0.25°)
- Validates calculations against PyEphem independent calculations
- Provides checksum-based audit trail for reproducibility

---

## Technical Approach

### Primary Engine: PyEphem v3.7.8.0
```python
import ephem

# PyEphem's ephemeris calculations use XEphem format data (Swiss Ephemeris v2.10+)
body = ephem.Sun('2023-01-15 12:00:00')
ra, dec = body.ra, body.dec
```

**Advantage:** Comprehensive planetary calculations, built-in timezone support, well-tested.

### Secondary Validator: PyEphem Native Comparison
Same library used for dual-calculation consistency check to catch any algorithmic edge cases.

### Timezone Handling
```python
from pytz import timezone
import datetime

# Input: "2023-01-15 12:00:00 EST"
# Process: Convert to UTC, calculate, optionally report local coordinates
tz = timezone('US/Eastern')
local_time = tz.localize(datetime.datetime(2023, 1, 15, 12, 0, 0))
utc_time = local_time.astimezone(timezone('UTC'))
```

---

## Implementation Checklist

### Phase 1: Setup & Core Logic (T+3.0 → T+3.5)

- [ ] Setup Python environment
  - [ ] `pip install ephem==3.7.8.0 pytz numpy pandas`
  - [ ] Verify installation: `python -c "import ephem; print(ephem.__version__)"`

- [ ] Create module structure
  ```
  src/
  ├── ephemeris.py          # Main calculation engine
  ├── validators.py         # PyEphem validation logic
  ├── timezone_handler.py   # UTC ↔ local conversion
  ├── checksum_protocol.py  # SHA256 audit trail
  └── __init__.py
  ```

- [ ] Implement planet position calculation
  ```python
  class EphemerisEngine:
      def calculate_planet(self, body_name, date_utc, observer_location=None):
          """
          Calculate planet position for given UTC date.

          Args:
              body_name: "Sun", "Moon", "Mercury", ..., "Pluto"
              date_utc: datetime object (UTC timezone)
              observer_location: (latitude, longitude) tuple (default: geocentric)

          Returns:
              {
                  "body": "Sun",
                  "ra": 123.45,        # Right ascension (degrees)
                  "dec": -45.67,       # Declination (degrees)
                  "lon": 356.78,       # Ecliptic longitude (0-360°)
                  "lat": 0.01,         # Ecliptic latitude
                  "distance": 0.9833   # AU from Earth
              }
          """
  ```

- [ ] Implement timezone conversion handler
  ```python
  def local_to_utc(local_time_str, timezone_str):
      """Convert local birth time to UTC."""
      # Example: "1985-03-21 14:30:00" + "America/New_York" → UTC

  def utc_to_local(utc_time, timezone_str):
      """Convert UTC back to local for reporting."""
  ```

- [ ] Implement precision validator
  ```python
  def validate_precision(calculated_lon, ephem_reference_lon, tolerance_deg):
      """Check if calculated position is within tolerance of PyEphem."""
      diff = abs(calculated_lon - ephem_reference_lon)
      if diff > tolerance_deg:
          return {"valid": False, "error": diff}
      return {"valid": True, "error": diff}
  ```

### Phase 2: Test Birth Data & Validation (T+3.5 → T+4.0)

- [ ] Load 10 test births (from `ASTROLOGY_CALCULATION_SPEC.json`)
  ```json
  [
      {
          "name": "Test Birth 1: Standard",
          "date": "1985-03-21",
          "time": "14:30:00",
          "timezone": "America/New_York",
          "location": "New York, NY, USA",
          "latitude": 40.7128,
          "longitude": -74.0060
      },
      {
          "name": "Test Birth 2: Epoch Test",
          "date": "1970-01-01",
          "time": "00:00:00",
          "timezone": "UTC",
          "location": "Greenwich, UK",
          "latitude": 51.4769,
          "longitude": -0.0005
      },
      {
          "name": "Test Birth 3: DST Boundary",
          "date": "1985-04-28",
          "time": "02:00:00",
          "timezone": "America/New_York",
          "location": "New York, NY, USA",
          "latitude": 40.7128,
          "longitude": -74.0060
      },
      {
          "name": "Test Birth 4: Y2K Boundary",
          "date": "2000-01-01",
          "time": "00:00:00",
          "timezone": "UTC",
          "location": "Greenwich, UK",
          "latitude": 51.4769,
          "longitude": -0.0005
      },
      {
          "name": "Test Birth 5: Retrograde Station",
          "date": "1985-05-15",
          "time": "12:00:00",
          "timezone": "UTC",
          "location": "Greenwich, UK",
          "latitude": 51.4769,
          "longitude": -0.0005
      },
      // ... (5 more test births from spec)
  ]
  ```

- [ ] Run all 10 test births through engine
  ```python
  for test_birth in test_births:
      positions = engine.calculate_all_planets(
          date_utc=test_birth['date_utc'],
          timezone=test_birth['timezone']
      )
      # Results: dict with Sun, Moon, Mercury, ..., Pluto positions
  ```

- [ ] Validate each position against PyEphem
  ```
  Test Birth 1: Standard
  ✓ Sun:        diff 0.02° (tolerance: 0.05°)
  ✓ Moon:       diff 0.01° (tolerance: 0.05°)
  ✓ Mercury:    diff 0.03° (tolerance: 0.05°)
  ✓ Venus:      diff 0.04° (tolerance: 0.05°)
  ✓ Mars:       diff 0.08° (tolerance: 0.10°)
  ... (all 10 planets)
  ```

### Phase 3: Checksum Validation Protocol (T+4.0 → T+4.5)

- [ ] Implement SHA256 checksum generation
  ```python
  import hashlib

  def generate_checksum(all_planet_positions):
      """
      Create audit-trail checksum of all 10 planet positions.

      Format: SHA256(serialized_positions_dict)
      Input: {
          "sun": 123.456789,
          "moon": 45.678901,
          "mercury": 67.890123,
          ...
      }
      Output: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
      """
  ```

- [ ] Document checksum methodology in `tests/CHECKSUM_PROTOCOL.md`
  - Expected checksums for each of 10 test births
  - Reproduction steps
  - Validation script

### Phase 4: Edge Case Handling (T+4.5 → T+5.0)

- [ ] Handle retrograde stations (planets appear to move backward)
  - Validate positions match ephemeris during retrograde periods
  - Document any known edge cases (e.g., Mercury retrograde dates)

- [ ] Handle high-latitude births (>66° N/S)
  - No special processing needed for this engine (handled by W2-ASTRO-002)
  - Document any precision concerns for polar regions

- [ ] Handle historical birth dates (pre-1900)
  - Test with 1800-01-01 birth date
  - Document any ephemeris limitations

- [ ] Handle future dates (post-2100)
  - Test with 2100-12-31 birth date
  - Document any precision degradation

### Phase 5: Integration & Documentation (T+5.0 → T+5.5)

- [ ] Create test suite (`tests/test_ephemeris.py`)
  ```python
  import unittest
  from src.ephemeris import EphemerisEngine

  class TestEphemerisEngine(unittest.TestCase):
      def setUp(self):
          self.engine = EphemerisEngine()

      def test_standard_birth(self):
          """Test Birth 1: Standard birth calculation"""
          positions = self.engine.calculate_all_planets(...)
          self.assertAlmostEqual(positions['sun'], expected_sun, places=2)
          # ... (assertions for all 10 planets)

      def test_epoch_boundary(self):
          """Test Birth 2: Epoch test (1970-01-01)"""
          # ...

      # ... (8 more test methods)
  ```

- [ ] Document API in `README.md` (this file)
  ```python
  # Example usage
  from src.ephemeris import EphemerisEngine

  engine = EphemerisEngine()
  positions = engine.calculate_all_planets(
      date="1985-03-21",
      time="14:30:00",
      timezone="America/New_York",
      location={"lat": 40.7128, "lon": -74.0060}
  )

  print(positions)
  # Output:
  # {
  #     "sun": {"lon": 0.48, "lat": 0.00, "ra": 23.04, "dec": -7.18},
  #     "moon": {"lon": 15.72, "lat": -4.45, "ra": 1.04, "dec": -8.66},
  #     ...
  # }
  ```

- [ ] Create output validation report
  ```
  W2-ASTRO-001 Validation Report
  ==============================

  Test Births: 10/10 PASSING
  PyEphem Agreement: ±0.05° (Sun/Moon), ±0.10° (outer planets)
  Timezone Handling: VERIFIED (UTC ↔ local)
  Checksum Protocol: IMPLEMENTED

  Edge Cases Tested:
  ✓ Retrograde stations (Mercury, Venus, Mars, Jupiter, Saturn)
  ✓ DST boundary (spring forward, fall back)
  ✓ Y2K boundary (1999-12-31 → 2000-01-01)
  ✓ Epoch boundary (1970-01-01)
  ✓ High-latitude births (>66° N/S)
  ✓ Historical dates (1800-01-01)
  ✓ Future dates (2100-12-31)

  Status: READY FOR INTEGRATION
  ```

- [ ] Commit to repository
  ```bash
  git add engines/W2-ASTRO-001/
  git commit -m "Implement W2-ASTRO-001: Swiss Ephemeris Engine (T+5.5)"
  ```

---

## API Specification

### `EphemerisEngine.calculate_all_planets(date, time, timezone, location=None)`

**Parameters:**
- `date` (str): YYYY-MM-DD format
- `time` (str): HH:MM:SS format (24-hour)
- `timezone` (str): IANA timezone (e.g., "America/New_York", "UTC")
- `location` (dict, optional): `{"lat": float, "lon": float}` (default: geocentric)

**Returns:**
```python
{
    "sun": {"lon": 0.48, "lat": 0.00, "ra": 23.04, "dec": -7.18, "distance": 0.9833},
    "moon": {"lon": 15.72, "lat": -4.45, "ra": 1.04, "dec": -8.66, "distance": 0.0026},
    "mercury": {...},
    "venus": {...},
    "mars": {...},
    "jupiter": {...},
    "saturn": {...},
    "uranus": {...},
    "neptune": {...},
    "pluto": {...},
    "checksum": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "timestamp_utc": "1985-03-21T18:30:00Z",
    "validation": {"status": "PASS", "max_error": 0.04}
}
```

**Fields:**
- `lon`: Ecliptic longitude (0-360°)
- `lat`: Ecliptic latitude (±90°)
- `ra`: Right ascension (0-360° or 0-24h)
- `dec`: Declination (±90°)
- `distance`: Distance in AU (astronomical units)

---

## Acceptance Criteria

✓ All 10 planets calculated for all test births
✓ PyEphem validation agreement: Sun/Moon ±0.05°, outer planets ±0.10°
✓ Timezone conversion: UTC ↔ local working correctly
✓ Checksum protocol implemented and validated
✓ Edge cases (retrograde, DST, epoch, Y2K, high-latitude) documented
✓ Test suite: 10/10 test births passing
✓ API documentation complete
✓ Code committed to `engines/W2-ASTRO-001/`

---

## Dependencies & Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `ephem` | 3.7.8.0 | Primary ephemeris engine (Swiss Ephemeris v2.10+) |
| `pytz` | 2024.1 | Timezone handling |
| `numpy` | 1.26.0 | Numerical calculations |
| `pandas` | 2.0.0 | Data handling & validation |
| `pytest` | 7.4.0 | Test suite execution |

---

## Integration with Wave 2

**Consumed by:**
- W2-ASTRO-002 (needs planet positions for house cusp calculation)
- W2-ASTRO-003 (needs planet positions for aspect detection)
- W2-ASTRO-004 (extends with nodes + Chiron via same ephemeris base)
- W2-CALC-001 (uses positions as evidence source for validation)

**Output Format:** JSON with planet positions + checksum (ready for downstream engines)

---

## Known Limitations & Fallbacks

- **High-precision historical dates (pre-1900):** Ephemeris accuracy degrades; documented in edge case report
- **Polar regions (>66° latitude):** W2-ASTRO-002 handles special house system logic; this engine reports standard positions
- **Chiron & extended planets:** Handled by W2-ASTRO-004; this engine covers 10 planets only

---

**Status:** Ready for T+3 Implementation Kickoff


