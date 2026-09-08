# W2-ASTRO-002: Independent Validator Lane

**Status:** Ready for Implementation (T+3.5 Kickoff)
**Squad Lead:** TBD
**Team:** 1 agent
**Timeline:** T+3.5 → T+5.5
**Input Spec:** W2-ASTRO-001 planet positions + PyEphem reference database
**Dependencies:** W2-ASTRO-001 (requires partial completion, can start T+3.5)
**Feeds:** W2-CALC-001

---

## Mission

Implement an independent verification lane that:
- Cross-checks all 10 planet positions from W2-ASTRO-001 against PyEphem dual-path calculation
- Confirms precision tolerances (Sun/Moon ±0.05°, outer planets ±0.10°)
- Generates agreement reports (per-planet comparison, max error per test birth)
- Flags any unexplained discrepancies
- Produces approval gate: 100% agreement across all 10 planets for all test births

---

## Technical Approach

### Dual-Path Verification Protocol

**Path A (Primary):** W2-ASTRO-001 calculation engine output
**Path B (Independent):** PyEphem native calculation (fresh instance, no shared code)

**Comparison Methodology:**
1. Run W2-ASTRO-001 output through validator
2. For each planet, run PyEphem independently with identical birth data
3. Calculate difference (lon, lat, ra, dec, distance)
4. Check if difference ≤ precision tolerance
5. Flag if difference > tolerance OR if results diverge unexpectedly

### Precision Tolerances (Reference)
```
Sun:     ±0.05°
Moon:    ±0.05°
Mercury: ±0.05°
Venus:   ±0.05°
Mars:    ±0.10°
Jupiter: ±0.10°
Saturn:  ±0.10°
Uranus:  ±0.10°
Neptune: ±0.10°
Pluto:   ±0.10°
```

---

## Implementation Checklist

### Phase 1: Validator Setup (T+3.5 → T+4.0)

- [ ] Create module structure
  ```
  src/
  ├── validator.py         # Main validator engine
  ├── pyephem_checker.py   # PyEphem dual-path calculation
  ├── comparison_logic.py  # Diff calculation + flagging
  └── __init__.py
  ```

- [ ] Implement PyEphem reference calculator
  ```python
  def run_pyephem_reference(date_utc, timezone, location):
      """
      Independent PyEphem calculation for all 10 planets.

      Returns:
          Dict with planets and their positions (lon, lat, ra, dec, distance)
      """
  ```

- [ ] Implement comparison logic
  ```python
  def compare_positions(w2_astro001_output, pyephem_reference):
      """
      Compare W2-ASTRO-001 output vs. PyEphem reference.

      Returns:
          {
              "profile_id": str,
              "agreement_status": "PASS/FLAG",
              "planets": [
                  {
                      "planet": "Sun",
                      "w2_lon": float,
                      "ephem_lon": float,
                      "error": float,
                      "tolerance": float,
                      "status": "PASS/FAIL"
                  },
                  ...
              ],
              "max_error": float,
              "summary": str
          }
      """
  ```

### Phase 2: Test Birth Validation (T+4.0 → T+4.5)

- [ ] Load 10 test births from W2-ASTRO-001/tests/test_births.json
- [ ] Run W2-ASTRO-001 on all 10 births
- [ ] Run PyEphem independently on all 10 births
- [ ] Compare all 10 planets per birth
- [ ] Generate agreement report

**Target:** 10/10 births showing 100% agreement within tolerances

### Phase 3: Agreement Report Generation (T+4.5 → T+5.0)

- [ ] Create validation report template
  ```
  W2-ASTRO-002 Validation Report
  ==============================

  Test Births Validated: 10/10

  Agreement Summary:
  ✓ Sun:     10/10 births within ±0.05° (max error: 0.02°)
  ✓ Moon:    10/10 births within ±0.05° (max error: 0.03°)
  ✓ Mercury: 10/10 births within ±0.05° (max error: 0.04°)
  ... (all 10 planets)

  Overall Status: PASS (100% agreement)
  Max Error Across All Planets: 0.04°

  Validator Approval: W2-ASTRO-001 cleared for downstream use
  ```

- [ ] Identify any discrepancies and document reasoning
- [ ] If discrepancies found, report to W2-ASTRO-001 lead for investigation

### Phase 4: Continuous Validation (T+5.0 → T+5.5)

- [ ] As W2-ASTRO-001 produces new test results, validate immediately
- [ ] Maintain running agreement log
- [ ] Flag any new discrepancies in real-time
- [ ] Final approval gate at T+5.0: 100% agreement on 10/10 births

---

## API Specification

### `IndependentValidator.validate_birth(w2_astro001_output, birth_data)`

**Parameters:**
- `w2_astro001_output` (dict): Full output from W2-ASTRO-001
- `birth_data` (dict): Birth date, time, timezone, location

**Returns:**
```python
{
    "profile_id": "TEST-001",
    "agreement_status": "PASS",
    "planets": [
        {
            "planet": "Sun",
            "w2_lon": 0.48,
            "ephem_lon": 0.50,
            "error": 0.02,
            "tolerance": 0.05,
            "status": "PASS"
        },
        ...
    ],
    "max_error": 0.04,
    "max_error_planet": "Mars",
    "summary": "All 10 planets agree within precision tolerance. W2-ASTRO-001 APPROVED."
}
```

---

## Acceptance Criteria

✓ All 10/10 test births independently validated
✓ All 10 planets within precision tolerances for each birth
✓ 100% agreement rate (zero unexplained discrepancies)
✓ Agreement report generated and documented
✓ Approval gate: W2-ASTRO-001 cleared for downstream use
✓ Continuous validation during T+5.0 → T+5.5

---

## Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `ephem` | 3.7.8.0 | PyEphem independent calculations |
| `pytest` | 7.4.0 | Validation test suite |

---

## Integration with Wave 2

**Consumes:** W2-ASTRO-001 outputs (10 test births)
**Feeds:** W2-CALC-001 (only if validation passes)
**Approval Gate:** 100% agreement required before downstream use

---

**Status:** Ready for T+3.5 Implementation Kickoff

