# W2-ASTRO-004: Whole Sign Houses Engine

**Status:** Ready for Implementation (T+3.5 Kickoff)
**Squad Lead:** TBD
**Team:** 1 agent
**Timeline:** T+3.5 → T+5.5
**Input Spec:** W2-ASTRO-001 (Ascendant degree)
**Dependencies:** W2-ASTRO-001
**Feeds:** W2-CALC-001 (for comparison vs. Placidus)

---

## Mission

Implement Whole Sign house system as secondary comparison that:
- Calculate Whole Sign house cusps (30° per house, sign-based)
- Compare against Placidus (W2-ASTRO-003) to identify divergence
- Document cases where Placidus/Whole Sign differ >5°
- Provide fallback system for high-latitude births

---

## Technical Approach

### Whole Sign Houses
```python
# Whole Sign: each house occupies one complete zodiac sign
# House 1 starts at Ascendant degree in that sign
# House 2 = next zodiac sign (30° increment)
# Simpler; useful for high-latitude comparison
```

---

## Implementation Checklist

### Phase 1: Whole Sign Calculation (T+3.5 → T+4.0)

- [ ] Create module: `src/whole_sign_calculator.py`
- [ ] Implement Whole Sign house calculation
  ```python
  def calculate_whole_sign_houses(ascendant_degree):
      """Calculate Whole Sign house cusps based on Ascendant."""
  ```

### Phase 2: Divergence Analysis (T+4.0 → T+4.5)

- [ ] Compare Placidus vs. Whole Sign outputs
- [ ] Identify cases where divergence >5°
- [ ] Document reasoning

### Phase 3: Test Birth Validation (T+4.5 → T+5.0)

- [ ] Load 12 test births (same as W2-ASTRO-003)
- [ ] Generate comparison report

### Phase 4: Integration & Documentation (T+5.0 → T+5.5)

- [ ] Create test suite
- [ ] Generate divergence report
- [ ] Commit to repository

---

## Acceptance Criteria

✓ Whole Sign houses calculated correctly for all test births
✓ Divergence from Placidus documented
✓ 12 test births passing
✓ API documentation complete

---

**Status:** Ready for T+3.5 Implementation Kickoff

