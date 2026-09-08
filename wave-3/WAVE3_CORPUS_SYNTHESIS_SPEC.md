# Wave 3: Corpus + Synthesis Execution Specification

**Baseline**: Wave 2 locked at SHA aa974dcc0662235e48171bb67583eed2fafbba84  
**Branch**: wave-3/corpus-synthesis  
**Execution Start**: 2026-09-08  

---

## Objective

Build the permanent golden corpus (64 hand-curated profiles) and generate a 500–2000 synthetic stress population with controlled edge cases. Run locked Wave 2 calculation engines on all profiles, redesign synthesis claims around evidence-backed dimensions, and emit complete evidence maps.

---

## Phase 1: Golden Corpus Curation (64 Profiles)

### Profile Selection Criteria

**Dimensional Coverage (8 profiles per bucket):**

1. **Sun Signs** (12 profiles)
   - Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces
   - 1 profile per sign, verified diversity of rising/moon

2. **Moon Signs** (12 profiles)
   - Full zodiac coverage (same 12)
   - Intentional contrast to sun sign in 6 profiles

3. **Rising Signs** (12 profiles)
   - Full zodiac coverage
   - Mixed with known sun/moon combinations

4. **Dominant Element** (8 profiles)
   - Fire-dominant, Earth-dominant, Air-dominant, Water-dominant
   - 2 profiles per element

5. **Life Path Numbers** (12 profiles)
   - Life Paths 1–9, Master Numbers 11, 22, 33
   - Distribution across sun/moon/rising combinations

6. **Human Design Types** (if verification gate passes)
   - Manifestor, Generator, Generator Manifesto, Reflector
   - 16 profiles across 4 types

7. **Edge Cases & Boundary Conditions** (6 profiles)
   - High-latitude birth (70°N or higher)
   - Unknown birth time
   - DST boundary (birth within 1 hour of DST shift)
   - Twins or similar birth time
   - Pre-1900 birth (historical archive)
   - Twilight zone edge (near sunrise/sunset)

### Golden Profile Schema

```json
{
  "profile_id": "golden-001",
  "name": "Profile Name",
  "birth": {
    "date": "YYYY-MM-DD",
    "time": "HH:MM:SS or unknown",
    "timezone": "IANA/Timezone or UTC±HH:MM",
    "location": {
      "latitude": 0.0,
      "longitude": 0.0,
      "city": "City, Country"
    },
    "notes": "Edge case description if applicable"
  },
  "classification": {
    "sun_sign": "Zodiac Sign",
    "moon_sign": "Zodiac Sign",
    "rising_sign": "Zodiac Sign",
    "life_path": "Number (1-33)",
    "hd_type": "Type or null",
    "element_dominant": "Fire|Earth|Air|Water"
  },
  "verification": {
    "source": "Historical record / Public archive / Verified reference",
    "reliability": "high | medium | low",
    "notes": "Verification details"
  }
}
```

---

## Phase 2: Synthetic Population Generation (500–2000 Profiles)

### Stress Test Categories

**1. Time-Based Edge Cases (200 profiles)**
- Unknown birth time (suppresses Ascendant, MC, houses)
- Birth within DST transition window
- Pre-1900 (ephemeris reliability test)
- Millisecond twins (time precision)

**2. Location-Based Edge Cases (200 profiles)**
- High-latitude births (60°N+ or 60°S+)
- Equatorial births (near 0° latitude)
- Dateline crossings (±180° longitude)
- Polar regions (verified house system degradation)

**3. Numerological Stress (150 profiles)**
- Life Path collision pairs (different births, same path)
- Master number clustering
- Karmic debt numbers
- Name variation impact

**4. Astrological Collision Pairs (200 profiles)**
- Same big three, different aspects
- Aspect orb boundaries (0°, exact vs +2°, +4°)
- Retrograde boundary cases (within 1° of retrograde station)
- Nodes in exact aspect to personal planets

**5. Chart Pattern Extremes (150 profiles)**
- Stellium concentration (4+ planets in one sign/house)
- Singleton dominants (only planet in element)
- Bucket chart (all planets in 180° span)
- Bivalent (planets split in two oppositions)

**6. Synthesis Differentiation Pairs (100–200 profiles)**
- Deliberately similar profiles (same big three, close times)
- Same exact birth time, different locations
- Intentional Barnum/generic-phrase triggers
- Claims that should differentiate but fail

### Generation Parameters

```python
SYNTHETIC_GENERATION_CONFIG = {
    "base_population": 1000,  # Minimum viable
    "stress_test_population": 500,  # Additional edge cases
    "total_target": 1500,  # Flexible to 2000
    
    "date_range": ("1900-01-01", "2026-09-08"),
    "location_coverage": {
        "high_latitude": 0.15,  # 15% of population
        "equatorial": 0.10,     # 10%
        "edge_longitude": 0.10, # 10%
        "normal": 0.65          # 65% standard
    },
    
    "time_unknown_rate": 0.20,  # 20% unknown birth time
    "dst_transition_rate": 0.05,  # 5% near DST
    
    "collision_pairs": 100,  # 100 intentional duplicates
    "synthesis_test_pairs": 150  # 150 differentiation tests
}
```

---

## Phase 3: Engine Integration

### Locked Engine Execution

**Run on all 1500–2000 profiles:**

```
W2-ASTRO-001   ← Swiss Ephemeris (locked)
  ↓
W2-ASTRO-002   ← Independent validator (cross-check)
  ↓
W2-ASTRO-003,004,005,006   ← House systems + aspects
  ↓
W2-NUMER-001   ← Numerology (locked)
  ↓
W2-CALC-001    ← Cross-engine validator
  ↓
W2-CALC-002    ← Unknown-time/high-latitude degradation
  ↓
Output: Structured calculation JSON for each profile
```

**Output Schema per Profile:**

```json
{
  "profile_id": "synthetic-001",
  "calculations": {
    "ephemeris": { ... },
    "houses_placidus": { ... },
    "houses_whole_sign": { ... },
    "aspects": { ... },
    "chart_patterns": { ... },
    "numerology": { ... },
    "degradation_flags": {
      "unknown_time": true/false,
      "high_latitude": true/false,
      "ephemeris_age": "historical"
    }
  },
  "validation": {
    "ephemeris_cross_check": "PASS",
    "engine_consistency": "PASS",
    "tolerance_compliance": "PASS"
  }
}
```

---

## Phase 4: Synthesis Redesign

### Evidence-Backed Dimensions Framework

**Old Approach:** Generic archetypes + placements  
**New Approach:** Claim → Evidence map (traceability)

**Claim Types:**

1. **Placement Claims** (e.g., "Moon in Pisces")
   - Source: W2-ASTRO-001 (ephemeris)
   - Evidence: Exact sign/degree/house, time accuracy flag

2. **Pattern Claims** (e.g., "Fire-dominant chart")
   - Source: W2-ASTRO-005 (chart analysis)
   - Evidence: Element distribution (%), element rulers in strength

3. **Numerology Claims** (e.g., "Life Path 7")
   - Source: W2-NUMER-001
   - Evidence: Birth date calculation, confirmed via independent math

4. **Synthesis Claims** (e.g., "Intuitive dreamer archetype")
   - Source: **Combination of above** (must cite 2+ evidence sources)
   - Evidence: Moon sign + Water element + Life Path correlation

**Claim Validation Rules:**

- No synthesis claim without 2+ independent calculation sources
- Each claim must cite its evidence dimension
- Barnum phrases flagged if >15% of diverse profiles match
- Unknown-time profiles suppress Ascendant-dependent claims
- High-latitude profiles degrade house system claims transparently

---

## Phase 5: Evidence Ledger Construction

### Per-Profile Evidence Map

```json
{
  "profile_id": "golden-001",
  "evidence_ledger": [
    {
      "claim": "Moon in Pisces",
      "claim_type": "placement",
      "evidence_sources": ["W2-ASTRO-001"],
      "evidence_strength": "deterministic",
      "calculation_hash": "sha256:abc123...",
      "confidence": 1.0
    },
    {
      "claim": "Intuitive communicator",
      "claim_type": "synthesis",
      "evidence_sources": ["W2-ASTRO-001", "W2-ASTRO-005"],
      "evidence_chain": [
        { "source": "W2-ASTRO-001", "detail": "Gemini Rising" },
        { "source": "W2-ASTRO-005", "detail": "Air-dominant chart" }
      ],
      "confidence": 0.85,
      "notes": "Supported by placement + element, not by time"
    }
  ],
  "synthesis_quality_flags": {
    "unknown_time_suppressed_claims": 3,
    "high_latitude_degraded_claims": 0,
    "generic_phrase_count": 2,
    "unique_claim_ratio": 0.87
  }
}
```

---

## Quality Gates (Phase 3 → Phase 4 transition)

**All gates must pass before synthesis redesign begins:**

1. **Engine Determinism**: Same profile run 3× → identical output
2. **Collision Detection**: Duplicate births caught and marked
3. **Degradation Transparency**: Unknown-time + high-latitude flags correct
4. **Evidence Traceability**: Every claim traceable to calculation hash
5. **Generic Phrase Detection**: Barnum content <15% even distribution
6. **Unknown-Time Suppression**: Ascendant/MC/house claims missing for suppressed profiles
7. **High-Latitude Graceful Fail**: House system outputs `degraded: true` not `null`

---

## Deliverables (End of Wave 3)

- [ ] 64 hand-curated golden profiles (wave-3/golden-corpus/)
- [ ] 1500–2000 synthetic profiles with edge-case distribution (wave-3/synthetic-population/)
- [ ] Calculation JSON for all 1564–2064 profiles
- [ ] Evidence ledger per profile (wave-3/evidence-ledger/)
- [ ] Quality gate audit report (all 7 gates pass)
- [ ] Synthesis redesign specification (claims → evidence maps)
- [ ] Regression test suite (100 determinism checks minimum)
- [ ] Branch merge-ready for Wave 4 QA

---

## Success Criteria

- ✅ 64 golden profiles curated and locked
- ✅ 1500+ synthetic profiles generated with controlled stress distribution
- ✅ All profiles processed through locked Wave 2 engines
- ✅ 100% claim traceability to calculation source
- ✅ <15% generic phrase domination in any profile cluster
- ✅ Unknown-time and high-latitude degradation correct
- ✅ Determinism verified (3 runs = identical output)
- ✅ Evidence ledger complete and auditable

