# Gate 1: Evidence Ledger Integration

**Status:** In Development  
**Branch:** gate1/evidence-ledger-integration  
**Depends on:** PR #180 (merged)  

**Canonical Reference:** See `governance/release-audits/GATE-1-EVIDENCE-LEDGER-GAP-ANALYSIS.md` for comprehensive current-state analysis and technical requirements.

---

## Phase 1 Final Seam: Canonical Placement Types Extraction (COMPLETED)

**Objective:** Eliminate local type duplication by moving canonical placement verification types to single source.

**Completed Work:**
- [x] Created `packages/core/placement/types.ts` with canonical types:
  - `VerificationState`: placement lifecycle (unresolved → calculated → verified)
  - `PlacementEvidence`: source + engine + timestamps metadata
  - `PlacementLike`: placement that may not yet be verified
  - `VerifiedPlacement`: placement passing all checks
- [x] Exported through `packages/core/index.ts`
- [x] Updated `client/src/lib/placementVerification.ts` to import (not declare)
- [x] Updated `packages/astrology/astrology.ts` to import (not declare)
- [x] Removed local type duplicates
- [x] All tests pass (385/385)

**Impact:** Authority over placement types now centralized. Subsystems (astrology, numerology, human design) can import canonical types without declaring local versions.

---

## Gate 1 Evidence Ledger Integration: Full Scope

**Requirement:** Complete tracking and validation of verification evidence across all foundational calculation systems (astrology, numerology, Human Design).

### Evidence Systems to Integrate

**Astrology:**
- Sun placement verification evidence (source, engine, calculatedAt) ✓ Partial
- Moon placement verification evidence (source, engine, calculatedAt) ✓ Partial
- Ascendant verification evidence (source, engine, calculatedAt) ✓ Partial
- Independent verification integration with ledger (PENDING)
- Evidence state transitions (pending → verified) (PENDING)

**Numerology:**
- Life Path calculation provenance (PENDING)
- Personal Day calculation provenance (PENDING)
- Birthday number and other core numerologies (PENDING)
- Evidence metadata capture in ledger (PENDING)

**Human Design:**
- Type/Strategy calculation derivation (PENDING)
- Profile/Line calculation evidence (PENDING)
- Gate activation evidence (PENDING)
- Evidence linking to foundational birth data (PENDING)

**Profile Persistence:**
- Schema version tracking with evidence (PENDING)
- Evidence metadata in storage and recovery (PENDING)
- Deterministic recalculation with evidence validation (PENDING)
- Migration path for profiles lacking evidence (PENDING)

## Definition of Done

- [ ] Evidence ledger captures verification metadata for all systems covered by Gate 1
- [ ] Astrology verification evidence flows into ledger (source, engine, calculatedAt)
- [ ] Numerology calculation provenance tracked in ledger
- [ ] Human Design derivation evidence tracked in ledger
- [ ] Profile persistence round-trip includes complete evidence metadata
- [ ] Dedicated test suite validates ledger completeness
- [ ] No evidence silently dropped or upgraded
- [ ] All workspace tests pass (385/385) ✓ PHASE 1 DONE
- [ ] Typecheck passes ✓ PHASE 1 DONE
- [ ] Build passes ✓ PHASE 1 DONE

## Files to Examine/Modify

- packages/core/placement/types.ts (canonical types) ✓ CREATED
- packages/astrology/* (verification evidence)
- packages/numerology/* (calculation provenance)
- packages/human-design/* (derivation evidence)
- client/src/lib/ActiveProfileRepository.ts (evidence persistence)
- server/tests/gate1-foundation.test.ts (evidence validation)

## Testing Strategy

- Verify evidence metadata round-trips through storage
- Verify evidence state transitions are tracked
- Verify no evidence is silently dropped or promoted
- Verify numerology and Human Design provenances are captured
