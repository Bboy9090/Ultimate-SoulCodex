# Wave 4 QA Infrastructure Specification

**Version:** 1.0.0  
**Status:** Active  
**Release Date:** 2026-01-01  
**Authority:** Quality Assurance Framework / Soul Codex Federation

---

## 1. Overview

Wave 4 establishes the comprehensive Quality Assurance infrastructure for the Soul Codex Federation. It operationalizes learnings from Wave 3 quality gates and creates a production-ready QA framework that validates:

- **Calculation Determinism:** All calculations produce identical results under identical inputs
- **Evidence Integrity:** Claims are traceable, supported, and free of generic phrases
- **Degradation Transparency:** Quality flags accurately reflect data limitations
- **Schema Compliance:** All output conforms to published specs
- **Performance Baselines:** Calculation times meet SLA targets
- **Error Handling:** Edge cases fail gracefully

---

## 2. QA Phases

### Phase 1: QA Infrastructure Buildout
- Formalize test harness and audit framework
- Establish baseline metrics from Wave 3
- Create performance benchmarks
- Define acceptance criteria

### Phase 2: Comprehensive Audit
- Run full corpus against QA gates (1,763 profiles)
- Generate detailed audit logs and reports
- Identify edge cases and failure modes
- Document remediation steps

### Phase 3: Performance Validation
- Measure calculation times per profile
- Identify performance outliers
- Establish SLA compliance metrics
- Optimize hot paths if needed

### Phase 4: Regression Prevention
- Create regression test suite
- Establish CI/CD hooks
- Document QA procedures
- Archive baseline metrics

### Phase 5: Production Readiness
- Final sanity checks
- Documentation review
- Team sign-off
- Promotion to production baseline

---

## 3. QA Gate Framework (Enhanced from Wave 3)

### Gate 1: Determinism Check
**Purpose:** Verify all calculations are deterministic (identical inputs → identical outputs)

**Procedure:**
- Run each profile through engine 3 times
- Compare results to ±0.001° precision
- Flag any variances

**Acceptance:** 100% determinism across all 1,763 profiles

**Metrics:**
- Profiles tested: N
- Deterministic: N/N (%)
- Failures: 0

---

### Gate 2: Collision Detection
**Purpose:** Identify profiles with unusual characteristic collisions

**Procedure:**
- Check for collisions in: birth time, coordinates, sign combos, life paths
- Flag high-collision profiles
- Verify they're intentional (test cases)

**Acceptance:** All collisions documented and intentional

**Metrics:**
- Total collisions: N
- Documented: N/N (%)
- Unexpected: 0

---

### Gate 3: Degradation Transparency
**Purpose:** Verify degradation flags accurately reflect limitations

**Procedure:**
- Unknown-time profiles: flag Ascendant/MC/Houses
- High-latitude profiles: flag Placidus reliability
- Aged ephemeris: flag precision limits

**Acceptance:** 100% of limited profiles properly flagged

**Metrics:**
- Profiles with degradation: N
- Properly flagged: N/N (%)
- False positives: 0

---

### Gate 4: Evidence Traceability
**Purpose:** Ensure all claims trace back to W2 engines

**Procedure:**
- Each claim has evidence_sources array
- Each source references W2 engine output
- Confidence scores are calibrated

**Acceptance:** 100% traceability, 0 orphaned claims

**Metrics:**
- Total claims: N
- With evidence: N/N (%)
- Orphaned: 0

---

### Gate 5: Generic Phrase Detection
**Purpose:** Eliminate generic/template phrases from claims

**Procedure:**
- Scan all claims against generic phrase registry
- Flag claims that match templates
- Manual review of flagged claims

**Acceptance:** 0 generic phrases detected

**Metrics:**
- Generic phrases found: 0
- High-risk claims: N
- False positives: N

---

### Gate 6: Unknown-Time Suppression
**Purpose:** Prevent Ascendant-dependent claims for unknown-birth-time profiles

**Procedure:**
- Identify unknown-time profiles (UT?)
- Verify no Ascendant claims generated
- Verify no MC/house claims generated
- Allow Sun/Moon/planets only

**Acceptance:** 100% suppression compliance

**Metrics:**
- Unknown-time profiles: N
- Properly suppressed: N/N (%)
- Violations: 0

---

### Gate 7: High-Latitude Graceful Fail
**Purpose:** Ensure Placidus failures degrade gracefully to alternatives

**Procedure:**
- High-latitude profiles (≥60°): check house system
- Verify fallback to Whole Sign or Equal House
- Verify flag for degraded reliability

**Acceptance:** All high-latitude births use robust house systems

**Metrics:**
- High-latitude profiles: N
- Using robust systems: N/N (%)
- Unflagged degradation: 0

---

### Gate 8: Schema Compliance (New)
**Purpose:** Verify all output matches published JSON schemas

**Procedure:**
- Validate each profile calculation JSON against schema
- Validate each evidence ledger JSON against schema
- Check required fields presence
- Type validation for all values

**Acceptance:** 100% schema compliance

**Metrics:**
- Profiles validated: N
- Compliant: N/N (%)
- Schema violations: 0

---

### Gate 9: Performance SLA (New)
**Purpose:** Verify calculation times meet performance targets

**Procedure:**
- Measure end-to-end calculation time per profile
- Target: <100ms per profile
- Target: <50ms for standard calculations
- Flag outliers

**Acceptance:** 95%+ of profiles under 100ms

**Metrics:**
- Profiles measured: N
- <50ms: N (%)
- 50-100ms: N (%)
- >100ms: N (%)
- P95 latency: Xms
- P99 latency: Xms

---

## 4. Test Data Strategy

### Golden Corpus (64 profiles)
**Purpose:** Hand-curated coverage of dimensional space

**Coverage:**
- All 12 sun signs
- All 12 moon signs
- All 12 rising signs
- All 8 elements
- All 12 life paths
- All 4 HD types
- Edge cases (high latitude, ancient births, future births)

**Use Cases:**
- Dimension coverage validation
- Regression testing
- Documentation examples

### Synthetic Corpus (1,699 profiles)
**Purpose:** Stress testing and edge case validation

**Distribution:**
- Time-based variation: 200 profiles
- Location-based variation: 300 profiles
- Numerological collision: 150 profiles
- Astrological collision: 250 profiles
- Chart pattern analysis: 300 profiles
- Differentiation pairs: 499 profiles

**Use Cases:**
- Determinism verification
- Collision detection
- Degradation flag accuracy
- Performance measurement

---

## 5. Audit Output Format

### Per-Profile Audit Record

```json
{
  "profile_id": "GC-001",
  "audit_metadata": {
    "timestamp": "2026-01-01T00:00:00Z",
    "qa_version": "4.0.0",
    "qa_phase": 2
  },
  "gate_results": [
    {
      "gate_number": 1,
      "gate_name": "Determinism Check",
      "status": "PASS",
      "details": "3 runs produced identical results to ±0.001°",
      "metrics": {
        "runs": 3,
        "variance_max": 0.0001,
        "variance_avg": 0.00001
      }
    },
    {
      "gate_number": 2,
      "gate_name": "Collision Detection",
      "status": "PASS",
      "details": "No unexpected collisions detected",
      "metrics": {
        "total_collisions": 0,
        "documented": 0
      }
    }
  ],
  "quality_flags": {
    "unknown_birth_time": false,
    "high_latitude": false,
    "aged_ephemeris": false,
    "generic_phrases_found": 0,
    "schema_violations": 0,
    "performance_sla_violated": false
  },
  "evidence_summary": {
    "total_claims": 127,
    "with_traceability": 127,
    "orphaned": 0,
    "average_confidence": 0.87
  },
  "performance_metrics": {
    "calculation_time_ms": 42.3,
    "sla_target_ms": 100,
    "sla_status": "PASS"
  },
  "audit_status": "PASS"
}
```

### Aggregated Audit Report

```json
{
  "report_metadata": {
    "timestamp": "2026-01-01T00:00:00Z",
    "qa_version": "4.0.0",
    "qa_phase": 2,
    "profiles_tested": 1763
  },
  "gate_summary": [
    {
      "gate_number": 1,
      "gate_name": "Determinism Check",
      "pass_count": 1763,
      "fail_count": 0,
      "status": "PASS",
      "pass_rate": 1.0
    }
  ],
  "overall_metrics": {
    "total_profiles": 1763,
    "all_gates_pass": 1763,
    "at_least_one_fail": 0,
    "pass_rate": 1.0,
    "total_claims_validated": 9015,
    "claims_with_violations": 0,
    "average_calculation_time_ms": 45.2,
    "p95_calculation_time_ms": 87.3,
    "p99_calculation_time_ms": 98.1,
    "sla_violation_count": 0,
    "sla_compliance": 1.0
  },
  "recommendations": [
    "All gates passed",
    "Ready for production promotion"
  ]
}
```

---

## 6. Acceptance Criteria

### All Profiles Must Pass

1. **Determinism:** 100% - No variance >±0.001°
2. **Collision Detection:** 100% - All collisions documented
3. **Degradation Transparency:** 100% - Proper flagging
4. **Evidence Traceability:** 100% - All claims traced
5. **Generic Phrase Detection:** 0 phrases found
6. **Unknown-Time Suppression:** 100% compliance
7. **High-Latitude Graceful Fail:** 100% compliance
8. **Schema Compliance:** 100% validation pass
9. **Performance SLA:** 95%+ under 100ms

### Overall QA Status
- **PASS:** All 9 gates pass for all 1,763 profiles
- **WARN:** 1-2 gates warn or minor issues detected; remediation required
- **FAIL:** Any gate fails; stop and investigate

---

## 7. Timeline

| Phase | Target Date | Deliverable |
|-------|-------------|------------|
| 1 | 2026-01-01 | QA Framework & test harness |
| 2 | 2026-01-02 | Complete audit (1,763 profiles) |
| 3 | 2026-01-03 | Performance validation report |
| 4 | 2026-01-04 | Regression test suite & CI hooks |
| 5 | 2026-01-05 | Production readiness sign-off |

---

## 8. Success Metrics

✓ **Framework:** 9-gate QA system fully operational
✓ **Coverage:** 1,763/1,763 profiles passing
✓ **Evidence:** 9,015/9,015 claims validated
✓ **Performance:** P95 latency <90ms
✓ **Quality:** 0 generic phrases, 0 orphaned claims
✓ **Transparency:** 100% degradation flags correct
✓ **Determinism:** 100% result reproducibility

---

**Next Step:** Build QA test harness and launch comprehensive audit
