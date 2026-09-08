# W2-ASTRO-005: Aspects & Chart Analysis Engine

**Status:** Ready for Implementation (T+3.5 Kickoff)
**Squad Lead:** TBD
**Team:** 2 agents
**Timeline:** T+3.5 → T+5.5
**Input Spec:** `specs/ASPECTS_SPEC.json`
**Dependencies:** W2-ASTRO-001 (planet positions), W2-ASTRO-003 (house positions)
**Feeds:** W2-CALC-001

---

## Mission

Implement aspect detection and chart analysis that:
- Calculate 5 major aspects (conjunction, opposition, trine, square, sextile)
- Analyze element balance (Fire, Earth, Air, Water)
- Analyze modality balance (Cardinal, Fixed, Mutable)
- Identify chart ruler and dominant planet
- Pass 10 test births with varying aspect densities

---

## Technical Approach

### 5 Major Aspects (Orbs)
```
Conjunction:  0° ±8°
Opposition:   180° ±8°
Trine:        120° ±8°
Square:       90° ±8°
Sextile:      60° ±6°
```

### Element & Modality Counting
```
Elements: Fire (Aries, Leo, Sagittarius), Earth (Taurus, Virgo, Capricorn),
          Air (Gemini, Libra, Aquarius), Water (Cancer, Scorpio, Pisces)

Modalities: Cardinal (0°, 90°, 180°, 270°), Fixed (30°, 120°, 210°, 300°),
            Mutable (60°, 150°, 240°, 330°)
```

---

## Implementation Checklist

### Phase 1: Aspect Detection (T+3.5 → T+4.0)

- [ ] Create module: `src/aspects.py`
- [ ] Implement aspect detection
  ```python
  def detect_aspects(planet_positions):
      """Calculate all 5 major aspects between planet pairs."""
  ```

### Phase 2: Chart Analysis (T+4.0 → T+4.5)

- [ ] Implement element & modality counting
  ```python
  def analyze_chart_patterns(planet_positions):
      """Count elements, modalities, identify chart ruler & dominant planet."""
  ```

### Phase 3: Test Birth Validation (T+4.5 → T+5.0)

- [ ] Load 10 test births from `tests/test_births.json` (varying aspect densities)
- [ ] Run all 10 through engine
- [ ] Validate results against known reference births

### Phase 4: Integration & Documentation (T+5.0 → T+5.5)

- [ ] Create test suite
- [ ] Generate chart analysis report
- [ ] Commit to repository

---

## Acceptance Criteria

✓ All 5 major aspects detected correctly
✓ Element & modality counts accurate
✓ Chart ruler & dominant planet identified
✓ 10 test births passing
✓ API documentation complete

---

**Status:** Ready for T+3.5 Implementation Kickoff

