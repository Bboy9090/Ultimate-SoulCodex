# W2-CALC-001: Evidence & QA Validator Engine

**Status:** Ready for Implementation (T+4 Kickoff)
**Squad Lead:** TBD
**Team:** 1 agent
**Timeline:** T+4 → T+5.5
**Input Spec:** `specs/EVIDENCE_QA_SCHEMA_SPEC.json`
**Dependencies:** W2-ASTRO-001, -002, -003, -004, W2-NUMER-001 (feeds from all engines)
**Feeds:** Wave 3 Synthesis (W3-SYNTH-001) — all 64 profiles must pass QA

---

## Mission

Implement a comprehensive QA validator that:
- Audits evidence traceability (≥1 source per claim, preferred ≥2)
- Detects contradictions (7 sample rules + custom logic)
- Flags semantic similarity (>0.80 requires evidence review, >0.90 template leakage)
- Audits generic phrase usage (>15% threshold = 10 profiles trigger audit)
- Detects Barnum statements (2+ qualifiers per sentence)
- Validates all 64 profiles before Wave 3 synthesis
- Generates comprehensive QA report with findings & recommendations

---

## Technical Approach

### Evidence Map (Source Traceability)
Each synthesis claim must reference ≥1 evidence source from:
- **Core Identity:** Sun placement, Life Path, Chart ruler, Dominant planet
- **Emotional Processing:** Moon, Water element count, Soul Urge number
- **Mental Style:** Mercury, Air element count, Personal Year number
- **Communication Style:** Mercury sign, Expression number, 3rd house placements
- **Love & Relationships:** Venus sign, 7th house, Soul Urge (emotional desire)
- **Conflict & Challenge:** Mars sign, square aspects, Challenge number
- **Ambition & Drive:** Saturn sign, 10th house, MC sign, Life Path
- **Social Presentation:** Ascendant, Chart ruler, Personality number

### Contradiction Detection (7 Sample Rules)

| Rule ID | Pattern | Example | Action |
|---------|---------|---------|--------|
| **CD-01** | Mars conjunction Saturn + claim "reckless, impulsive" | "Mars-Saturn person is highly impulsive" | FLAG: Contradiction (Mars-Saturn typically disciplined, not impulsive) |
| **CD-02** | Moon in Capricorn + claim "highly emotional, needs emotional validation" | "Capricorn Moon is very emotional" | FLAG: Contradiction (Cap Moon typically reserved, self-sufficient) |
| **CD-03** | Life Path 1 + claim "team player, dependent on others" | "LP 1 is a natural follower" | FLAG: Contradiction (LP 1 is independent leader) |
| **CD-04** | Venus in Fire + Mars in Water + claim "withdrawn, avoids conflict" | "This person avoids social situations" | FLAG: Contradiction (Fire Venus + Water Mars = emotional intensity) |
| **CD-05** | Multiple Water planets (3+) + claim "logical, rational" | "Water-heavy chart is highly analytical" | FLAG: Contradiction (Water = emotional, intuitive) |
| **CD-06** | Ascendant Leo + Life Path 3 + claim "invisible, hidden" | "This person hides from attention" | FLAG: Contradiction (Leo ASC + LP 3 = visible, expressive) |
| **CD-07** | Saturn retrograde + claim "external limitations only" | "Saturn retrograde faces only external limits" | FLAG: Contradiction (Retrograde = internalized, psychological) |

### Semantic Similarity Thresholds

```
0.0 - 0.50:  UNIQUE — No flag
0.50 - 0.80: ACCEPTABLE — Similar language, but evidence differs
>0.80:       FLAG FOR REVIEW — Same language + same/similar evidence
>0.90:       CRITICAL FLAG — Template leakage (identical or near-identical text)
```

**Example:**
```
Profile A: "Mars in Aries makes them assertive and action-oriented"
Profile B: "Mars in Aries makes them assertive and action-oriented"
Similarity: 1.00 (100%) → CRITICAL FLAG (identical text)

Profile C: "Mars in Leo gives them confident self-expression"
Profile D: "Mars in Leo makes them confidently expressive"
Similarity: 0.87 → FLAG FOR REVIEW (similar meaning, may share evidence sources)
```

### Generic Phrase Registry (15 Monitored Phrases)

```
1. "is a natural"
2. "has a strong tendency to"
3. "is likely to"
4. "tends to be"
5. "is known for"
6. "can be very"
7. "is often seen as"
8. "has a gift for"
9. "is drawn to"
10. "possesses a deep"
11. "makes them [adjective]"
12. "allows them to"
13. "drives them to"
14. "compels them to"
15. "is a natural fit for"
```

**Threshold:** If >15% of 64 profiles (≥10 profiles) use >2 of these phrases without evidence justification → Audit triggered.

### Barnum Effect Detection

```
Barnum Qualifier Count:
- "may", "can", "often", "tend to", "usually", "sometimes", "likely", "might"

Flag Rule: If 2+ qualifiers in one sentence → Barnum statement detected
```

**Example:**
```
"Mars in Aries may tend to often be assertive"  ← 3 qualifiers (may, tend, often) → FLAG
"Mars in Aries creates assertiveness"           ← 0 qualifiers → NO FLAG
"Mars in Aries may create assertive tendencies" ← 2 qualifiers (may) → FLAG
```

---

## Implementation Checklist

### Phase 1: Evidence Validator (T+4.0 → T+4.3)

- [ ] Create module structure
  ```
  src/
  ├── evidence_validator.py       # ≥1 source per claim audit
  ├── contradiction_detector.py   # 7 sample rules + custom logic
  ├── semantic_similarity.py      # >0.80 flag detection
  ├── generic_phrase_audit.py     # >15% threshold scan
  ├── barnum_detector.py          # 2+ qualifiers detection
  ├── qa_report_generator.py      # Comprehensive report
  └── __init__.py
  ```

- [ ] Implement evidence source validator
  ```python
  def validate_evidence_sources(synthesis_claim, evidence_sources_list):
      """
      Validate that claim has ≥1 evidence source.

      Args:
          synthesis_claim: str (e.g., "Mars in Aries creates assertiveness")
          evidence_sources_list: list (e.g., ["Mars in Aries", "Fire element"])

      Returns:
          {
              "claim": "Mars in Aries creates assertiveness",
              "evidence_count": 2,
              "sources": ["Mars in Aries", "Fire element"],
              "status": "PASS",  # or "FAIL" if count < 1
              "confidence": 1.0  # 0.5 if 1 source, 1.0 if 2+
          }
      """
  ```

- [ ] Implement for all 8 synthesis dimensions
  ```python
  synthesis_dimensions = [
      "core_identity",
      "emotional_processing",
      "mental_style",
      "communication_style",
      "love_and_relationships",
      "conflict_and_challenge",
      "ambition_and_drive",
      "social_presentation"
  ]
  ```

### Phase 2: Contradiction Detector (T+4.3 → T+4.6)

- [ ] Implement 7 sample contradiction rules
  ```python
  def detect_contradictions(profile_data):
      """
      Scan profile against 7 contradiction rules.

      Returns:
          {
              "contradictions_found": [
                  {
                      "rule_id": "CD-01",
                      "pattern": "Mars conjunction Saturn + claim reckless",
                      "profile_claim": "This person is impulsive",
                      "severity": "HIGH",
                      "recommendation": "Review Mars-Saturn interpretation"
                  }
              ],
              "total_flags": 1,
              "status": "PASS" if total_flags == 0 else "NEEDS_REVIEW"
          }
      """

  # Pseudo-code for CD-01
  if profile_has_aspect("Mars", "Saturn", "conjunction") and \
     profile_has_claim("reckless") or profile_has_claim("impulsive"):
      flag_contradiction("CD-01", high_severity)
  ```

- [ ] Add 5 custom contradiction rules (customizable per project)
  ```python
  # Example custom rule:
  if multiple_water_planets(count >= 3) and profile_has_claim("logical", "analytical"):
      flag_contradiction("CUSTOM-01", medium_severity)
  ```

### Phase 3: Semantic Similarity Detector (T+4.6 → T+5.0)

- [ ] Implement similarity scoring
  ```python
  from sklearn.feature_extraction.text import TfidfVectorizer
  from sklearn.metrics.pairwise import cosine_similarity

  def calculate_semantic_similarity(text1, text2):
      """
      Calculate cosine similarity between two claims.

      Args:
          text1: str (claim from profile A)
          text2: str (claim from profile B)

      Returns:
          {
              "similarity_score": 0.87,  # 0.0 to 1.0
              "severity": "REVIEW",      # None, "REVIEW", "CRITICAL"
              "recommendation": "Check if evidence differs"
          }
      """
  ```

- [ ] Scan all 64 profiles for pairwise similarity
  ```python
  for i in range(64):
      for j in range(i+1, 64):
          for dimension in synthesis_dimensions:
              score = calculate_similarity(
                  profiles[i][dimension]['claim'],
                  profiles[j][dimension]['claim']
              )
              if score > 0.80:
                  flag_similarity_issue(i, j, dimension, score)
  ```

### Phase 4: Generic Phrase Audit (T+5.0 → T+5.2)

- [ ] Implement phrase registry scan
  ```python
  generic_phrases = [
      "is a natural",
      "has a strong tendency to",
      # ... (15 total)
  ]

  def scan_generic_phrases(profile_text):
      """
      Count generic phrases in profile.

      Returns:
          {
              "phrase_count": 3,
              "phrases_found": ["is a natural", "can be very"],
              "percentage_of_sentences": 0.25,  # 25% of sentences use generic phrases
              "status": "PASS" if percentage < 0.15 else "FLAG"
          }
      """
  ```

- [ ] Aggregate across all 64 profiles
  ```python
  # After scanning all 64 profiles:
  total_profiles_with_high_generic = 0
  for profile in profiles_64:
      if profile.generic_phrase_percentage > 0.15:
          total_profiles_with_high_generic += 1

  if total_profiles_with_high_generic > 10:  # >15% of 64
      flag_generic_phrase_audit()
  ```

### Phase 5: Barnum Detector (T+5.2 → T+5.4)

- [ ] Implement qualifier counting
  ```python
  barnum_qualifiers = [
      "may", "can", "often", "tend to", "usually",
      "sometimes", "likely", "might", "possibly"
  ]

  def detect_barnum_statements(claim_text):
      """
      Count qualifiers per sentence; flag if ≥2.

      Returns:
          {
              "sentences": [
                  {
                      "text": "Mars in Aries may tend to be assertive",
                      "qualifier_count": 2,
                      "qualifiers": ["may", "tend"],
                      "is_barnum": True
                  }
              ],
              "barnum_percentage": 0.10,  # 10% of sentences are Barnum
              "status": "PASS" if percentage < 0.20 else "FLAG"
          }
      """
  ```

### Phase 6: Test Profile Validation (T+5.4 → T+5.5)

- [ ] Run 6 test profiles through full QA pipeline
  ```json
  [
      {
          "profile_id": "TEST-001",
          "evidence_coverage": "PASS",
          "contradictions": "PASS",
          "semantic_similarity": "PASS",
          "generic_phrases": "PASS",
          "barnum_statements": "PASS",
          "overall_status": "APPROVED"
      },
      // ... (5 more test profiles)
  ]
  ```

- [ ] Validate QA criteria
  ```
  6/6 Test Profiles Passing:
  ✓ Evidence coverage (≥1 source per claim)
  ✓ Contradiction detection (no critical flags)
  ✓ Semantic similarity (<0.80 for unique profiles)
  ✓ Generic phrase audit (<15% threshold)
  ✓ Barnum detection (<20% of sentences)
  ```

### Phase 7: QA Report Generation (T+5.5)

- [ ] Create comprehensive audit report
  ```
  W2-CALC-001 QA Validation Report
  ================================

  Test Profiles: 6/6 PASSING
  Status: READY FOR GOLDEN PROFILE AUDIT

  Evidence Coverage:
  ✓ All claims have ≥1 evidence source
  ✓ 67% of claims have ≥2 sources (preferred)
  ✓ No orphaned claims (evidence-less)

  Contradiction Detection:
  ✓ 0 critical contradictions
  ✓ 0 rule-based conflicts
  ✓ All cross-validations passed

  Semantic Similarity:
  ✓ 0 profiles >0.80 similarity without evidence justification
  ✓ 0 template leakage detected (>0.90)
  ✓ All profiles linguistically unique within tolerance

  Generic Phrase Audit:
  ✓ 1/6 test profiles exceed 15% threshold (1 flag)
  ✓ Audit recommendation: review Profile 3 for vague language
  ✓ No corpus-wide audit triggered (10/64 threshold not met)

  Barnum Statement Detection:
  ✓ 0.12 average Barnum percentage (threshold: 0.20)
  ✓ 1 sentence flagged in Profile 2 for excessive qualifiers
  ✓ Recommendation: rephrase "may tend to often"

  Next Steps:
  1. Apply QA validator to all 64 golden profiles (T+5.5→T+6)
  2. Generate corpus-wide audit report
  3. Iterate until all profiles pass criteria
  4. Ready for Wave 3 Synthesis
  ```

- [ ] Commit to repository
  ```bash
  git add engines/W2-CALC-001/
  git commit -m "Implement W2-CALC-001: Evidence & QA Validator Engine (T+5.5)"
  ```

---

## API Specification

### `QAValidator.validate_profile(profile_json)`

**Parameters:**
- `profile_json` (dict): Complete profile from 64_GOLDEN_PROFILES_OUTLINE.json

**Returns:**
```python
{
    "profile_id": "GP-001",
    "validation_status": "APPROVED",  # or "NEEDS_REVIEW", "FAILED"
    "evidence_coverage": {
        "status": "PASS",
        "total_claims": 8,
        "claims_with_evidence": 8,
        "claims_with_2_sources": 6,
        "average_sources_per_claim": 1.75
    },
    "contradictions": {
        "status": "PASS",
        "critical_flags": 0,
        "review_flags": 0,
        "issues": []
    },
    "semantic_similarity": {
        "status": "PASS",
        "similar_profiles": [],
        "average_similarity": 0.32
    },
    "generic_phrases": {
        "status": "PASS",
        "phrase_count": 1,
        "percentage": 0.05,
        "phrases": ["is a natural"]
    },
    "barnum_statements": {
        "status": "PASS",
        "barnum_percentage": 0.08,
        "flagged_sentences": []
    },
    "recommendation": "Profile approved for synthesis. Strong evidence coverage with unique language.",
    "timestamp": "2026-09-15T10:30:00Z"
}
```

---

## Acceptance Criteria

✓ Evidence validator implemented (≥1 source per claim)
✓ Contradiction detector with 7+ sample rules
✓ Semantic similarity thresholds (>0.80 flag, >0.90 critical)
✓ Generic phrase audit (>15% threshold = 10/64 profiles)
✓ Barnum effect detection (2+ qualifiers per sentence)
✓ 6 test profiles passing all QA criteria
✓ Comprehensive audit report generation
✓ Corpus-wide scanning capability
✓ API documentation complete
✓ Code committed to `engines/W2-CALC-001/`

---

## Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `scikit-learn` | 1.3.0 | Semantic similarity (TF-IDF, cosine) |
| `nltk` | 3.8.1 | NLP utilities (tokenization, lemmatization) |
| `numpy` | 1.26.0 | Numerical operations |
| `pandas` | 2.0.0 | Report generation |
| `pytest` | 7.4.0 | Test suite |

---

## Integration with Wave 2

**Consumes:** All 6 upstream engines (W2-ASTRO-001 through W2-NUMER-001) + 64 profile templates
**Feeds:** Wave 3 Synthesis (W3-SYNTH-001) — profiles must pass QA before synthesis
**Output Format:** Audit report + validated profiles JSON

---

**Status:** Ready for T+4 Implementation Kickoff


