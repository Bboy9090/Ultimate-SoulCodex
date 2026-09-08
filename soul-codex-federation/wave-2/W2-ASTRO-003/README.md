# W2-ASTRO-003: Placidus Houses Engine

**Status:** Ready for Implementation (T+3.5 Kickoff)
**Squad Lead:** TBD
**Team:** 2 agents
**Timeline:** T+3.5 → T+5.5
**Input Spec:** `specs/HOUSE_SYSTEMS_SPEC.json`
**Dependencies:** W2-ASTRO-001 (requires planet positions)
**Feeds:** W2-ASTRO-005 (angular planet data), W2-CALC-001

---

## Mission

Implement Placidus house system calculations that:
- Calculate 12 Placidus house cusps (primary system)
- Derive Ascendant/Midheaven/Descendant/Imum Coeli correctly
- Identify angular planets (first 8° of houses 1/4/7/10)
- Detect high-latitude edge cases (>60° N/S) with intercepted/duplicated flags
- Pass 12 test births covering full latitude range (77°S to 78°N)

---

## Technical Approach

### Placidus House System
```python
# Placidus house system (most common in Western astrology)
# Based on division of time by prime vertical
# Requires:
#   - Latitude of birth location
#   - Tropical zodiac positions (from W2-ASTRO-001)
#   - Time of birth (UTC)
```

### High-Latitude Edge Cases
**Detection:** Latitude >60° N or S
**Issues:**
- Intercepted houses: A zodiac sign doesn't appear on any cusp
- Duplicated houses: A zodiac sign appears on multiple cusps

**Handling:** Flag in output, use Whole Sign (W2-ASTRO-004) as fallback, document limitations

---

## Implementation Checklist

### Phase 1: Placidus Calculation (T+3.5 → T+4.0)

- [ ] Create module structure: `src/house_systems.py`, `src/high_latitude_handler.py`, `src/angular_planets.py`
- [ ] Implement Placidus house calculation
  ```python
  def calculate_placidus_houses(date_utc, latitude, longitude, planet_positions):
      """Calculate Placidus house cusps (12 houses + angles)."""
  ```
- [ ] Validate ASC/MC/DSC/IC relationships

### Phase 2: High-Latitude Detection (T+4.0 → T+4.3)

- [ ] Implement high-latitude flag logic
  ```python
  def detect_high_latitude_edges(latitude, placidus_cusps):
      """Detect intercepted and duplicated signs at high latitudes."""
  ```
- [ ] Document interception examples for extreme latitudes

### Phase 3: Angular Planet Detection (T+4.3 → T+4.5)

- [ ] Implement angular planet identification
  ```python
  def identify_angular_planets(planet_positions, house_cusps):
      """Identify planets within 8° of angular house cusps."""
  ```

### Phase 4: Test Birth Data & Validation (T+4.5 → T+5.3)

- [ ] Load 12 test births from `tests/test_births.json` (77°S to 78°N)
- [ ] Run all 12 through engine
- [ ] Generate comparison with W2-ASTRO-004 (Whole Sign)

### Phase 5: Integration & Documentation (T+5.3 → T+5.5)

- [ ] Create test suite (`tests/test_house_systems.py`)
- [ ] Generate validation report
- [ ] Commit to repository

---

## Acceptance Criteria

✓ Placidus house cusps calculated correctly for all test births
✓ ASC/MC/DSC/IC derived correctly
✓ High-latitude detection working (>60° N/S flagged)
✓ Angular planets identified (within 8° of house cusps)
✓ 12 test births passing (77°S to 78°N)
✓ API documentation complete
✓ Code committed to `engines/W2-ASTRO-003/`

---

**Status:** Ready for T+3.5 Implementation Kickoff

