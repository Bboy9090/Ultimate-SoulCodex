# Wave 2 Implementation Roadmap
**Status:** Ready for Squad Kickoff (T+3)
**Repository:** `federation/profile-differentiation`
**Timeline:** T+3 → T+6 (3-week execution)
**Release Gate:** All 7 engines pass acceptance criteria + 64 profiles QA approved

---

## Execution Model: 7 Parallel Squads + 1 Continuous Lane

### Squad Staffing (12 agents total)

| Engine | Squad Lead | Team Size | Dependencies | Integration |
|--------|-----------|-----------|--------------|-------------|
| **W2-ASTRO-001** | TBD | 2 agents | None | Feeds W2-ASTRO-002, -003, -004, W2-CALC-001 |
| **W2-ASTRO-002** | TBD | 2 agents | W2-ASTRO-001 | Feeds W2-ASTRO-003, W2-CALC-001 |
| **W2-ASTRO-003** | TBD | 2 agents | W2-ASTRO-001, -002 | Feeds W2-CALC-001 |
| **W2-ASTRO-004** | TBD | 1 agent | W2-ASTRO-001 | Feeds W2-ASTRO-003, W2-CALC-001 |
| **W2-NUMER-001** | TBD | 2 agents | None | Feeds W2-CALC-001 |
| **W2-HD-001** | TBD | 1 agent | None (runs T+0→T+3) | Gate decision T+3 |
| **W2-CALC-001** | TBD | 1 agent | All astrological + numerology | Feeds W3-SYNTH-001 |
| **W2-CORPUS-001** | TBD | 1 agent (continuous) | Wave 1 specs reference | Feeds W3-SYNTH-001 |

---

## Implementation Tiers

### Tier 1: Foundation Engines (No Dependencies)
**Start:** T+3
**Target Completion:** T+5.5

#### W2-ASTRO-001: Swiss Ephemeris Engine
- **Scope:** 10 planets + position calculation + timezone handling + precision validation
- **Primary Library:** PyEphem v3.7.8.0 (SwissEph backend)
- **Secondary Validator:** PyEphem native calculations
- **Deliverable:** Python module + 10 test births passing
- **Acceptance:** PyEphem agreement ±0.05° (Sun/Moon), ±0.10° (outer planets, Chiron)
- **Implementation Checklist:**
  - [ ] Setup Python environment (pyephem, pytz, numpy)
  - [ ] Implement planet position calculation for all 10 bodies
  - [ ] Implement timezone conversion (UTC ↔ local)
  - [ ] Build precision validator (compare vs. PyEphem)
  - [ ] Create SHA256 checksum validation protocol
  - [ ] Run 10 test births (spec reference)
  - [ ] Document any edge cases (retrograde stations, DST boundaries, Y2K)
  - [ ] Code committed to `engines/W2-ASTRO-001/`

#### W2-NUMER-001: Numerology Engine
- **Scope:** Pythagorean system, 10+ derived numbers, master number preservation
- **Deliverable:** Python/Node.js module + 10 test births + 50% independent verification
- **Acceptance:** All numbers calculated correctly, master numbers (11/22/33) NOT reduced
- **Implementation Checklist:**
  - [ ] Setup numerology calculation library (or write from spec)
  - [ ] Implement all 10+ number types (Life Path, Expression, Soul Urge, etc.)
  - [ ] Add master number preservation logic (11, 22, 33 flags)
  - [ ] Add karmic debt marker detection
  - [ ] Run 10 test births (JFK, Marilyn Monroe, Einstein, edge cases)
  - [ ] Independent re-verify 50% (5 births minimum)
  - [ ] Document any interpretation edge cases
  - [ ] Code committed to `engines/W2-NUMER-001/`

---

### Tier 2: Dependent Engines (Feed off Tier 1)
**Start:** T+3.5 (after Tier 1 partial readiness)
**Target Completion:** T+5.5

#### W2-ASTRO-002: House Systems Engine
- **Dependencies:** W2-ASTRO-001 (needs planet positions)
- **Scope:** Placidus houses (primary) + Whole Sign (secondary), high-latitude edge case detection
- **Deliverable:** House cusps calculator + 12 test births (77°S to 78°N)
- **Acceptance:** ASC/MC/DSC/IC correctly derived, angular planet detection
- **Implementation Checklist:**
  - [ ] Integrate W2-ASTRO-001 output (planet positions)
  - [ ] Implement Placidus house calculation (SwissEph swe_houses)
  - [ ] Implement Whole Sign house calculation
  - [ ] Add high-latitude edge case detection (>60° N/S)
  - [ ] Implement angular planet detection (1st 8° of houses 1/4/7/10)
  - [ ] Run 12 test births covering full latitude range
  - [ ] Validate Ascendant/Midheaven/IC/Descendant derivation
  - [ ] Code committed to `engines/W2-ASTRO-002/`

#### W2-ASTRO-003: Aspects & Chart Analysis Engine
- **Dependencies:** W2-ASTRO-001 (planets), W2-ASTRO-002 (houses for angular detection)
- **Scope:** 5 major aspects, element/modality balance, chart ruler, dominant planet, retrograde detection
- **Deliverable:** Aspects calculator + chart analysis output + 10 test births
- **Acceptance:** All 5 aspects detected, aspect density scored, chart ruler identified
- **Implementation Checklist:**
  - [ ] Integrate W2-ASTRO-001 and W2-ASTRO-002 outputs
  - [ ] Implement 5 major aspect detection (conjunction, opposition, trine, square, sextile)
  - [ ] Implement orb calculation by planet pair
  - [ ] Calculate element balance (Fire/Earth/Air/Water)
  - [ ] Calculate modality balance (Cardinal/Fixed/Mutable)
  - [ ] Identify chart ruler via Ascendant sign
  - [ ] Calculate dominant planet (by aspect count or placement strength)
  - [ ] Flag retrograde planets
  - [ ] Run 10 test births
  - [ ] Code committed to `engines/W2-ASTRO-003/`

#### W2-ASTRO-004: Extended Planets Engine
- **Dependencies:** W2-ASTRO-001 (needs ephemeris base)
- **Scope:** 13 bodies (10 planets + 2 nodes + Chiron), Chiron validation ±0.10°
- **Deliverable:** Extended planetary set calculator + 6 test births
- **Acceptance:** All 13 bodies present, South Node = North Node ± 180°, Chiron validated vs. Skyfield
- **Implementation Checklist:**
  - [ ] Integrate W2-ASTRO-001 output
  - [ ] Add North Node calculation (via mean ascending node)
  - [ ] Derive South Node (North Node + 180°)
  - [ ] Implement Chiron calculation
  - [ ] Validate Chiron against PyEphem/Skyfield within ±0.10°
  - [ ] Flag North Node retrograde status (normal; always apparent retrograde motion)
  - [ ] Run 6 test births
  - [ ] Code committed to `engines/W2-ASTRO-004/`

---

### Tier 3: Synthesis & Validation (Integrates All Engines)
**Start:** T+4 (after Tier 1/2 partial readiness)
**Target Completion:** T+5.5

#### W2-CALC-001: Evidence & QA Validator
- **Dependencies:** W2-ASTRO-001, -002, -003, -004, W2-NUMER-001 (for evidence sources)
- **Scope:** Evidence traceability audit, contradiction detection, semantic similarity, generic phrase audit, Barnum density
- **Deliverable:** QA validator module + test suite + audit report
- **Acceptance:** 6 test profiles passing all QA criteria
- **Implementation Checklist:**
  - [ ] Integrate all 6 engine outputs
  - [ ] Implement evidence source validator (≥1 source per claim)
  - [ ] Implement contradiction detection (7 sample rules from spec)
  - [ ] Implement semantic similarity threshold (>0.80 flag, >0.90 critical)
  - [ ] Implement generic phrase registry audit (>15% threshold)
  - [ ] Implement Barnum density detection (2+ qualifiers per sentence)
  - [ ] Run 6 test profiles through full QA
  - [ ] Generate QA report with findings
  - [ ] Code committed to `engines/W2-CALC-001/`

---

### Tier 4: Verification & Corpus (Parallel to Tiers 2–3)
**Start:** T+0 (immediately, runs in parallel)
**Target Completion:** T+3 (HD Gate 9), T+6 (corpus)

#### W2-HD-001: Human Design Gate 9 Verification
- **No dependencies** (runs independently)
- **Scope:** Binary verification gate — 100% agreement on Type/Strategy/Authority/Profile/Definition
- **Timeline:** T+0 → T+3 (parallel to all other tracks)
- **Gate Decision:** T+3 (Chief Architect authority)
- **Fallback:** If FAIL → mark HD as "secondary_lane" (does NOT block release)
- **Implementation Checklist:**
  - [ ] Identify primary HD validator (priority: open-source library → astro.com API → manual reference)
  - [ ] Select 3 test charts by T+2.7
  - [ ] Run 100% agreement test across all 5 HD dimensions
  - [ ] Document any discrepancies
  - [ ] Chief Architect decision by T+3 (PASS → integrate full HD engine; FAIL → mark secondary)

#### W2-CORPUS-001: 64 Golden Profiles Design & Evidence Mapping
- **No calculation dependencies** (uses Wave 1 specs for reference)
- **Scope:** Design, source, and map evidence for 64 diverse profiles across 8 archetypes
- **Timeline:** T+3 → T+6 (continuous; 1 profile per ~1.6 days)
- **Deliverable:** 64 complete profile JSON templates with:
  - Birth data (date/time/location/timezone/coordinates)
  - Astrological signatures (Sun/Moon/Ascendant/chart ruler/dominant planet/element balance/modality/retrogrades/aspects/nodes/Chiron)
  - Numerological signatures (10+ numbers, master number preservation, karmic debt markers)
  - HD signatures (if Gate 9 passes)
  - Narrative summary (50-100 words archetype description)
  - Evidence mapping (all 8 synthesis dimensions with ≥1 source per claim)
- **Implementation Checklist:**
  - [ ] Research & source birth data for all 64 profiles
  - [ ] Map profiles to 8 archetypes (8 profiles each)
  - [ ] Ensure numerological variety (LP 1-9 + master numbers)
  - [ ] Ensure astrological variety (all elements/modalities/retrogrades/nodes/Chiron)
  - [ ] Fill evidence sources for all 8 synthesis dimensions
  - [ ] Run W2-CALC-001 validator on all 64 profiles
  - [ ] Iterate: fix weak evidence, remove generic phrases, resolve contradictions
  - [ ] Final QA pass before Wave 3 Synthesis
  - [ ] Code committed to `profiles/golden-64/`

---

## Repository Structure (Wave 2)

```
soul-codex-federation/
├── specs/
│   ├── ASTROLOGY_CALCULATION_SPEC.json      (W1-ASTRO-001)
│   ├── HOUSE_SYSTEMS_SPEC.json              (W1-ASTRO-002)
│   ├── ASPECTS_SPEC.json                    (W1-ASTRO-003)
│   ├── PLANETARY_SET_SPEC.json              (W1-ASTRO-004)
│   ├── NUMEROLOGY_SPEC.json                 (W1-NUMER-001)
│   ├── HD_VERIFICATION_PLAN.json            (W1-HD-001)
│   └── EVIDENCE_QA_SCHEMA_SPEC.json         (W1-QA-001)
├── engines/
│   ├── W2-ASTRO-001/
│   │   ├── src/
│   │   │   ├── ephemeris.py
│   │   │   ├── validators.py
│   │   │   └── __init__.py
│   │   ├── tests/
│   │   │   ├── test_births.json
│   │   │   └── test_ephemeris.py
│   │   └── README.md
│   ├── W2-ASTRO-002/
│   │   ├── src/
│   │   │   ├── house_systems.py
│   │   │   ├── high_latitude_edge_cases.py
│   │   │   └── __init__.py
│   │   ├── tests/
│   │   │   └── test_house_systems.py
│   │   └── README.md
│   ├── W2-ASTRO-003/
│   │   ├── src/
│   │   │   ├── aspects.py
│   │   │   ├── chart_analysis.py
│   │   │   └── __init__.py
│   │   ├── tests/
│   │   │   └── test_aspects.py
│   │   └── README.md
│   ├── W2-ASTRO-004/
│   │   ├── src/
│   │   │   ├── extended_planets.py
│   │   │   └── __init__.py
│   │   ├── tests/
│   │   │   └── test_extended_planets.py
│   │   └── README.md
│   ├── W2-NUMER-001/
│   │   ├── src/
│   │   │   ├── numerology.py
│   │   │   ├── validators.py
│   │   │   └── __init__.py
│   │   ├── tests/
│   │   │   ├── test_births.json
│   │   │   └── test_numerology.py
│   │   └── README.md
│   ├── W2-CALC-001/
│   │   ├── src/
│   │   │   ├── evidence_validator.py
│   │   │   ├── contradiction_detector.py
│   │   │   ├── semantic_similarity.py
│   │   │   ├── generic_phrase_audit.py
│   │   │   ├── barnum_detector.py
│   │   │   └── __init__.py
│   │   ├── tests/
│   │   │   ├── test_profiles.json
│   │   │   └── test_qa_validator.py
│   │   └── README.md
│   └── W2-HD-001/
│       ├── GATE_9_VERIFICATION_PLAN.md
│       └── RESULTS.md
├── profiles/
│   ├── golden-64/
│   │   ├── GP-001.json
│   │   ├── GP-002.json
│   │   ├── ... (GP-064.json)
│   │   └── CORPUS_QA_REPORT.md
├── WAVE_2_TASK_BREAKDOWN.md
├── WAVE_2_ENGINE_CONTRACTS.md
├── WAVE_2_IMPLEMENTATION_ROADMAP.md
└── 64_GOLDEN_PROFILES_OUTLINE.md
```

---

## Milestone Timeline (T+3 to T+6)

### Week 1 (T+3.0 → T+3.5)
- [ ] All 7 squad leads assigned and confirmed
- [ ] Roster sizes confirmed (12 agents total)
- [ ] W2-ASTRO-001 kicks off: setup, planet position logic, first 5 test births running
- [ ] W2-NUMER-001 kicks off: setup, Life Path + Expression number logic, first 5 test births running
- [ ] W2-HD-001 begins: identify validator, select test charts
- [ ] Repository structure created; `engines/` directory scaffolded

**Gate:** No blockers identified

### Week 1.5 (T+3.5 → T+4.0)
- [ ] W2-ASTRO-001: 10/10 test births passing, PyEphem validation checksum protocol live
- [ ] W2-NUMER-001: 10/10 test births passing, 50% independent verification initiated
- [ ] W2-ASTRO-002 kicks off: integrate W2-ASTRO-001, Placidus house calc logic
- [ ] W2-ASTRO-003 kicks off: integrate W2-ASTRO-001 + W2-ASTRO-002, aspect detection logic
- [ ] W2-ASTRO-004 kicks off: extend W2-ASTRO-001, Chiron calc, North Node, South Node
- [ ] W2-HD-001: 3 test charts selected; verification protocol ready
- [ ] W2-CORPUS-001 begins: outline 64 profiles, start birth data research

**Gate:** W2-HD-001 decision readiness check

### Week 2 (T+4.0 → T+4.5)
- [ ] W2-ASTRO-002: 6/12 high-latitude tests passing, angular planet detection working
- [ ] W2-ASTRO-003: 5/10 test births passing, aspect density scoring live
- [ ] W2-ASTRO-004: Chiron validated ±0.10° vs. Skyfield; 6 test births running
- [ ] W2-NUMER-001: 50% independent verification complete (5/10 births); edge cases documented
- [ ] W2-CALC-001 kicks off: integrate all 5 engines, evidence validator logic
- [ ] W2-HD-001: Gate 9 decision made (PASS or FAIL documented)
- [ ] W2-CORPUS-001: 16/64 profiles outlined + evidence mapped

**Gate:** HD Gate 9 decision locked (Chief Architect approval)

### Week 2.5 (T+4.5 → T+5.0)
- [ ] W2-ASTRO-002: 12/12 high-latitude tests passing, ASC/MC/DSC/IC derivation validated
- [ ] W2-ASTRO-003: 10/10 test births passing, chart analysis metrics live
- [ ] W2-ASTRO-004: All 6 test births passing; extended planets output finalized
- [ ] W2-CALC-001: evidence validator, contradiction detector, semantic similarity thresholds running
- [ ] W2-CORPUS-001: 32/64 profiles outlined + evidence mapped

**Gate:** All Tier 1 engines complete; Tier 2 on track

### Week 3 (T+5.0 → T+5.5)
- [ ] W2-CALC-001: 6/6 test profiles passing full QA suite
- [ ] W2-CORPUS-001: 64/64 profiles outlined + evidence validated
- [ ] All 7 engines passing acceptance criteria (100% test pass rate)
- [ ] All engines integrated into single validation pipeline
- [ ] Integration Lead review of all engines + corpus
- [ ] QA report generated (contradiction detection, semantic similarity audit, generic phrase audit, Barnum density)

**Gate:** T+5.5 Integration Gate — all engines + corpus ready for merge

### Week 3.5 (T+5.5 → T+6.0)
- [ ] Final QA pass on all 64 profiles
- [ ] Code review + approval
- [ ] All engines merged to `federation/profile-differentiation`
- [ ] Release branch tagged: `wave-2-v1.0`
- [ ] Release notes documented (any deviations, secondary lanes, fallbacks)
- [ ] GitHub Issues #251-276 (Wave 2 child contracts) marked COMPLETED

**Gate:** T+6 Release Gate — Wave 2 COMPLETE

---

## Success Criteria (T+6)

✓ All 7 engines passing 100% acceptance criteria
✓ PyEphem agreement within ±0.05° (ephemeris) and ±0.10° (outer planets/Chiron)
✓ Numerology independent verification 50% (5/10 births)
✓ HD Gate 9 decision made (PASS or documented FAIL)
✓ W2-CALC-001 audit report reviewed + approved
✓ 64 profiles QA passed (evidence coverage, contradiction detection, semantic similarity, generic phrase audit)
✓ All code committed to `federation/profile-differentiation`
✓ Release notes + tag `wave-2-v1.0`
✓ Wave 2 branch ready for Wave 3 Synthesis kickoff

---

## Squad Coordination Points

**T+3 Kickoff:** All squads receive contracts, codebase access, test birth data
**T+3.5:** Tier 1 engines report progress; Tier 2 begins integration prep
**T+4:** Tier 1 engines COMPLETE; Tier 2 ramp-up; W2-CALC-001 begins integration planning
**T+4.5:** HD Gate 9 decision communicated; W2-HD-CALC-001 conditional kickoff (if PASS)
**T+5:** All Tier 2/3 engines reporting completion readiness
**T+5.5 Integration Gate:** All squads present status; Integration Lead approves merge readiness
**T+6:** Release + Wave 3 Synthesis handoff

---

**Status:** Ready for squad assignment and T+3 kickoff.


