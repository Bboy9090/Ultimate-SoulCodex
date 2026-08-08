# Gate 1: Evidence Ledger Integration

**Status:** In Development
**Branch:** gate1/evidence-ledger-integration
**Depends on:** PR #180 (merged)

## Requirement

Complete tracking and validation of verification evidence across all foundational calculation systems (astrology, numerology, Human Design).

## Scope

### Evidence Systems

**Astrology:**
- Sun placement verification evidence (source, engine, calculatedAt)
- Moon placement verification evidence (source, engine, calculatedAt)
- Ascendant verification evidence (source, engine, calculatedAt)
- Independent verification integration with ledger
- Evidence state transitions (pending → verified)

**Numerology:**
- Life Path calculation provenance
- Personal Day calculation provenance
- Birthday number and other core numerologies
- Evidence metadata capture in ledger

**Human Design:**
- Type/Strategy calculation derivation
- Profile/Line calculation evidence
- Gate activation evidence
- Evidence linking to foundational birth data

**Profile Persistence:**
- Schema version tracking with evidence
- Evidence metadata in storage and recovery
- Deterministic recalculation with evidence validation
- Migration path for profiles lacking evidence

## Definition of Done

- [ ] Evidence ledger captures verification metadata for all systems covered by Gate 1
- [ ] Astrology verification evidence flows into ledger (source, engine, calculatedAt)
- [ ] Numerology calculation provenance tracked in ledger
- [ ] Human Design derivation evidence tracked in ledger
- [ ] Profile persistence round-trip includes complete evidence metadata
- [ ] Dedicated test suite validates ledger completeness
- [ ] No evidence silently dropped or upgraded
- [ ] All workspace tests pass (385/385)
- [ ] Typecheck passes
- [ ] Build passes

## Files to Examine/Modify

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
