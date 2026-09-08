# W2-ASTRO-006: Extended Planets (Nodes/Chiron/Angles)

**Status:** Ready for Implementation (T+3.5 Kickoff)
**Squad Lead:** TBD
**Team:** 1 agent
**Timeline:** T+3.5 → T+5.5
**Input Spec:** `specs/PLANETARY_SET_SPEC.json`
**Dependencies:** W2-ASTRO-001 (base ephemeris)
**Feeds:** W2-CALC-001

---

## Mission

Implement extended planets engine that:
- Calculate North & South lunar nodes
- Calculate Chiron (comet, ±0.10° precision)
- Validate South Node = North Node ± 180°
- Return 13 bodies total (10 planets + 2 nodes + Chiron)
- Pass 6 test births with precision validation

---

## Technical Approach

### 13 Total Bodies
```
10 planets: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
2 nodes:    North Node (True), South Node (180° opposite)
1 comet:    Chiron (Mean or True, ±0.10° tolerance)
```

### Chiron Validation
```
Chiron position must match ephemeris within ±0.10° (tighter than outer planets)
South Node = North Node ± 180° (validation rule)
```

---

## Implementation Checklist

### Phase 1: Nodes & Chiron Calculation (T+3.5 → T+4.0)

- [ ] Create module: `src/extended_planets.py`
- [ ] Implement North/South Node calculation
  ```python
  def calculate_lunar_nodes(date_utc):
      """Calculate True/Mean lunar nodes."""
  ```
- [ ] Implement Chiron calculation
  ```python
  def calculate_chiron(date_utc):
      """Calculate Chiron position (Mean or True)."""
  ```

### Phase 2: Validation (T+4.0 → T+4.5)

- [ ] Implement validation checks
  ```python
  def validate_extended_planets(north_node, south_node, chiron):
      """Verify SN = NN ± 180°; Chiron within ±0.10°."""
  ```

### Phase 3: Test Birth Validation (T+4.5 → T+5.0)

- [ ] Load 6 test births from `tests/test_births.json`
- [ ] Run all 6 through engine
- [ ] Generate validation report

### Phase 4: Integration & Documentation (T+5.0 → T+5.5)

- [ ] Create test suite
- [ ] Generate validation report
- [ ] Commit to repository

---

## Acceptance Criteria

✓ North/South nodes calculated correctly
✓ Chiron positions within ±0.10° precision
✓ SN = NN ± 180° validation passed
✓ 6 test births passing
✓ API documentation complete

---

**Status:** Ready for T+3.5 Implementation Kickoff

