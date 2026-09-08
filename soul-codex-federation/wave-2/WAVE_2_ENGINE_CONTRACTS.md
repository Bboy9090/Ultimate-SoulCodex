# Wave 2: 12-Track Engine Contracts

**Scope:** Technical specifications, input/output schemas, test suites, and acceptance criteria for all 12 calculation/validation/corpus tracks.

**Status:** LOCKED (2026-09-08)

---

## W2-ASTRO-001: Swiss Ephemeris Primary Engine

**Responsibility:** Calculate 10-planet ephemeris positions (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
**Team:** 2 agents
**Timeline:** T+3.0 → T+5.5
**Dependencies:** None (Tier 1)
**Feeds:** W2-ASTRO-002, W2-ASTRO-003, W2-ASTRO-004, W2-ASTRO-005, W2-ASTRO-006, W2-CALC-001

**Input Schema:**
```json
{
  "date": "YYYY-MM-DD",
  "time": "HH:MM:SS",
  "timezone": "IANA timezone string",
  "location": {"lat": float, "lon": float}
}
```

**Output Schema:**
```json
{
  "date_utc": "ISO8601",
  "planets": {
    "sun": {"lon": float, "lat": float, "ra": float, "dec": float, "distance": float},
    "moon": {...},
    "mercury": {...},
    ...
  },
  "checksum": "SHA256 hex",
  "validation": {"status": "PASS/FAIL", "max_error": float}
}
```

**Acceptance Criteria:**
- ✓ 10/10 test births passing
- ✓ PyEphem agreement: Sun/Moon ±0.05°, outer planets ±0.10°
- ✓ Timezone conversion (UTC ↔ local) verified
- ✓ Checksum generation & reproducibility
- ✓ Edge cases: retrograde, DST, epoch, Y2K, historical, future

---

## W2-ASTRO-002: Independent Validator Lane

**Responsibility:** Cross-check W2-ASTRO-001 outputs against PyEphem; dual-path verification protocol
**Team:** 1 agent
**Timeline:** T+3.5 → T+5.5
**Dependencies:** W2-ASTRO-001 (partial completion sufficient)
**Feeds:** W2-CALC-001

**Validation Protocol:**
- Run W2-ASTRO-001 planet positions through independent PyEphem calculation
- Flag any discrepancy >precision tolerance
- Generate agreement report (% agreement per planet, max error per birth)
- Approval gate: 100% agreement within tolerances for all 10 planets across all test births

**Acceptance Criteria:**
- ✓ 10/10 W2-ASTRO-001 outputs independently validated
- ✓ Agreement report: all planets within tolerance
- ✓ Cross-check methodology documented
- ✓ Zero unexplained discrepancies

---

## W2-ASTRO-003: Placidus Houses

**Responsibility:** Calculate Placidus house cusps and angular planet detection
**Team:** 2 agents
**Timeline:** T+3.5 → T+5.5
**Dependencies:** W2-ASTRO-001 (planet positions)
**Feeds:** W2-ASTRO-005, W2-CALC-001

**Output Schema:**
```json
{
  "system": "Placidus",
  "asc": float,
  "mc": float,
  "dsc": float,
  "ic": float,
  "house_cusps": [float, ...],
  "high_latitude_flag": boolean,
  "intercepted_houses": [...],
  "duplicated_signs": [...],
  "angular_planets": [{"planet": str, "house": int, "distance": float}, ...]
}
```

**Acceptance Criteria:**
- ✓ 12/12 test births passing (77°S to 78°N latitude range)
- ✓ ASC/MC/DSC/IC relationships verified (dsc = asc + 180°, ic = mc + 180°)
- ✓ High-latitude edge cases flagged (>60° N/S)
- ✓ Interception/duplication detected and documented
- ✓ Angular planets identified (within 8° of cusp)

---

## W2-ASTRO-004: Whole Sign Houses

**Responsibility:** Calculate Whole Sign house cusps as secondary system comparison
**Team:** 1 agent
**Timeline:** T+3.5 → T+5.5
**Dependencies:** W2-ASTRO-001 (Ascendant)
**Feeds:** W2-CALC-001

**Output Schema:**
```json
{
  "system": "Whole Sign",
  "house_cusps": [float, ...],
  "divergence_from_placidus": [float, ...],
  "comparison_notes": str
}
```

**Acceptance Criteria:**
- ✓ 12/12 test births Whole Sign cusps calculated
- ✓ Divergence from Placidus documented (cases where >5° difference)
- ✓ High-latitude fallback reasoning provided

---

## W2-ASTRO-005: Aspects & Chart Analysis

**Responsibility:** Calculate 5 major aspects, chart patterns (element/modality balance, chart ruler, dominant planet)
**Team:** 2 agents
**Timeline:** T+3.5 → T+5.5
**Dependencies:** W2-ASTRO-001, W2-ASTRO-003
**Feeds:** W2-CALC-001

**Output Schema:**
```json
{
  "aspects": [
    {"planet1": str, "planet2": str, "type": str, "orb": float, "applying": boolean},
    ...
  ],
  "chart_analysis": {
    "element_balance": {"fire": int, "earth": int, "air": int, "water": int},
    "modality_balance": {"cardinal": int, "fixed": int, "mutable": int},
    "chart_ruler": str,
    "dominant_planet": str
  }
}
```

**Acceptance Criteria:**
- ✓ 10/10 test births passing
- ✓ All 5 major aspects detected (conjunction ±8°, opposition ±8°, trine ±8°, square ±8°, sextile ±6°)
- ✓ Element & modality counts accurate
- ✓ Chart ruler & dominant planet methodology documented
- ✓ Aspect interpretation consistent

---

## W2-ASTRO-006: Nodes/Chiron/Angles

**Responsibility:** Calculate 13 bodies total (10 planets + North/South nodes + Chiron with ±0.10° validation)
**Team:** 1 agent
**Timeline:** T+3.5 → T+5.5
**Dependencies:** W2-ASTRO-001
**Feeds:** W2-CALC-001

**Output Schema:**
```json
{
  "nodes": {
    "north_node": float,
    "south_node": float,
    "validation": "south = north ± 180° ✓"
  },
  "chiron": {"lon": float, "lat": float, "validation_error": float},
  "angles": {"asc": float, "mc": float, "dsc": float, "ic": float}
}
```

**Acceptance Criteria:**
- ✓ 6/6 test births passing
- ✓ Chiron positions within ±0.10° of reference
- ✓ South Node = North Node ± 180° rule verified
- ✓ All 13 bodies accounted for in profile

---

## W2-NUMER-001: Pythagorean Numerology Engine

**Responsibility:** Calculate 10+ derived numbers (Life Path, Expression, Soul Urge, Personality, Maturity, Personal Year/Month/Day, Pinnacles, Challenges)
**Team:** 2 agents
**Timeline:** T+3.0 → T+5.5
**Dependencies:** None (Tier 1, parallel to astrology)
**Feeds:** W2-CALC-001

**Output Schema:**
```json
{
  "life_path": int,
  "expression": int,
  "soul_urge": int,
  "personality": int,
  "birthday": int,
  "maturity": int,
  "personal_year": int,
  "personal_month": int,
  "personal_day": int,
  "pinnacles": [{"number": int, "start_age": int, "end_age": int}, ...],
  "challenges": [{"number": int, "start_age": int, "end_age": int}, ...],
  "master_numbers": [int, ...],
  "karmic_debt_markers": [int, ...],
  "verification_status": "COMPLETE"
}
```

**Acceptance Criteria:**
- ✓ 10/10 test births passing
- ✓ Master numbers (11, 22, 33) preserved (NOT reduced to 2, 4, 6)
- ✓ Karmic debt markers (13, 14, 16, 19) detected
- ✓ 50% independent verification (5/10 births cross-checked)
- ✓ Edge cases: accented names, Asian transliteration, special characters

---

## W2-CALC-001: Precision Validator

**Responsibility:** Validate evidence traceability, detect contradictions, flag semantic similarity, audit generic phrases, detect Barnum statements
**Team:** 1 agent
**Timeline:** T+4.0 → T+5.5
**Dependencies:** W2-ASTRO-001 → 006, W2-NUMER-001
**Feeds:** Wave 3 Synthesis

**Output Schema (per profile):**
```json
{
  "profile_id": str,
  "validation_status": "APPROVED/NEEDS_REVIEW/FAILED",
  "evidence_coverage": {"status": str, "claims": int, "with_evidence": int, "avg_sources": float},
  "contradictions": {"status": str, "critical": int, "issues": [...]},
  "semantic_similarity": {"status": str, "similar_profiles": [...]},
  "generic_phrases": {"status": str, "count": int, "percentage": float},
  "barnum_statements": {"status": str, "percentage": float, "flagged": int}
}
```

**Acceptance Criteria:**
- ✓ 6/6 test profiles passing all checks
- ✓ Evidence validator: ≥1 source per claim (preferred ≥2)
- ✓ Contradiction detector: 7 sample rules + custom logic
- ✓ Semantic similarity: >0.80 flagged, >0.90 critical
- ✓ Generic phrase audit: >15% threshold triggers corpus-wide review
- ✓ Barnum detection: 2+ qualifiers per sentence flagged
- ✓ Comprehensive audit reports generated

---

## W2-CALC-002: Degradation Harness

**Responsibility:** Test precision floor under unknown-time, high-latitude, retrograde edge conditions
**Team:** 1 agent
**Timeline:** T+4.5 → T+5.5
**Dependencies:** W2-ASTRO-001 → 006, W2-NUMER-001, W2-CALC-001
**Feeds:** Wave 3 Synthesis

**Test Scenarios:**
- Unknown time births (set time to 12:00 noon, flag as "unknown")
- High-latitude extremes (77°S, 78°N Ascendant/MC precision)
- Retrograde stations (Venus, Mercury retrograde boundaries)
- DST boundaries (spring forward, fall back edge cases)
- Polar regions (66°+ latitude, Whole Sign fallback protocol)

**Output Schema:**
```json
{
  "scenario": str,
  "precision_degradation": {"asc": float, "mc": float, "planets": float},
  "recommendations": str,
  "fallback_protocol": str
}
```

**Acceptance Criteria:**
- ✓ Degradation thresholds identified for each scenario
- ✓ Fallback protocols documented (when to use Whole Sign, when to flag "unknown time")
- ✓ Stress test results: >500 synthetic births processed
- ✓ No unhandled exceptions under edge conditions

---

## W2-HD-001: HD Gate 9 Verification

**Responsibility:** Binary decision on HD Type/Strategy/Authority/Profile/Definition (PASS/FAIL gate for synthesis)
**Team:** 1 agent (parallel track)
**Timeline:** T+0 → T+3 (decision gate at T+3)
**Dependencies:** None
**Feeds:** Wave 3 Synthesis (blocks if FAIL)

**Verification Protocol:**
- Select 3 test charts for HD analysis
- Cross-check against open-source HD library or astro.com API
- Validate Type, Strategy, Authority, Profile, Definition agreement
- Report PASS (100% agreement) or FAIL (discrepancies found)

**Acceptance Criteria:**
- ✓ 3 test charts analyzed
- ✓ 100% agreement on all 5 HD dimensions or clear reason for variance
- ✓ Decision rendered by T+3
- ✓ Fallback documented (secondary lane if FAIL; does NOT block release, only synthesis start)

---

## W2-CORPUS-001: Golden 64 Birth Design

**Responsibility:** Collect, structure, evidence-map 64 archetypal profiles (8 archetypes × 8 profiles each)
**Team:** 2 agents (parallel track)
**Timeline:** T+3 → T+5.5
**Dependencies:** None (data collection parallel to engines)
**Feeds:** W2-CALC-001, Wave 3 Synthesis

**Profile Structure (per birth):**
```json
{
  "profile_id": "GP-001",
  "archetype": "The Pioneer",
  "birth": {"name": str, "date": "YYYY-MM-DD", "time": "HH:MM:SS", "timezone": str, "location": str},
  "numerology": {...},
  "astrology": {...},
  "hd_signatures": {...},
  "evidence_mapping": {
    "core_identity": [{"claim": str, "sources": [str]}],
    ...
  }
}
```

**Acceptance Criteria:**
- ✓ 64/64 profiles complete (8 archetypes, 8 per archetype)
- ✓ Numerological variety: LP 1–9 + master numbers (11, 22, 33)
- ✓ Astrological variety: all elements, modalities, retrogrades, nodes, Chiron
- ✓ Evidence mapping: all 8 synthesis dimensions covered per profile
- ✓ Birth data verified (public figures, verified births, ages 0–100+)

---

## W2-CORPUS-002: Synthetic Population Generator

**Responsibility:** Generate 500–2000 synthetic births for stress-testing calculation engines
**Team:** 1 agent (depends on W2-CORPUS-001 structure)
**Timeline:** T+5.0 → T+5.5
**Dependencies:** W2-CORPUS-001 structure finalized
**Feeds:** Stress testing (not Wave 3, QA only)

**Generation Criteria:**
- Randomize birth dates (1800–2100)
- Randomize locations (all lat/lon ranges)
- Randomize times (0:00:00–23:59:59)
- Include edge cases: polar latitudes, retrograde stations, DST boundaries
- Target: 500–2000 births for throughput testing

**Acceptance Criteria:**
- ✓ 500–2000 synthetic births generated
- ✓ All births parseable by W2-ASTRO-001 → 006, W2-NUMER-001
- ✓ Zero calculation engine crashes under synthetic data
- ✓ Performance metrics documented (avg calc time per birth)

---

## Integration & Handoff Points

**T+3.5:** Tier 1 outputs → W2-ASTRO-002 validation
**T+4.0:** W2-ASTRO-002 validation ✓ → W2-ASTRO-003/004/005/006 feed
**T+4.5:** Tier 2 partial outputs → W2-CALC-001 Phase 1–2
**T+5.0:** Tier 2 complete → W2-CALC-001 Phase 3–5, W2-CORPUS-001 complete
**T+5.5:** All 12 tracks complete → Ready for merge + Wave 3 synthesis (if W2-HD-001 = PASS)

---

**Status:** LOCKED (2026-09-08)
**Next:** Create 12 engine README files + Python skeleton code

Generated: 2026-09-08
By: Claude Haiku 4.5 (claude-haiku-4-5-20251001)

