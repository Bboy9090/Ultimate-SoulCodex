# Gate 1: UI/Backend Verification & Confidence Consistency Contract

**Status:** In Development
**Branch:** gate1/ui-backend-verification-contract
**Depends on:** PR #180 (merged)

## Requirement

Dedicated test suite validating that UI and backend maintain consistent representation of verification status, confidence state, and evidence across all profile transitions.

## Scope

### Backend State Representation

- **Verification status:** unresolved, pending_independent_verification, verified
- **Confidence state:** unverified, partial, verified
- **Evidence metadata:** source, engine, calculatedAt
- **State transitions:** validity and consistency

### UI/Backend Contract Tests

- Profile load: UI displays correct verification status from backend
- Confidence state display: unverified/partial/verified rendered correctly
- Evidence display: source/engine/time shown when verified
- State transitions: UI reflects backend changes (pending → verified)
- Profile refresh: UI updates correctly after recalculation
- Empty state: Unresolved placements handled correctly in UI
- Partial confidence: Weak signals downplayed correctly in UI

### Verification State Transitions

- Draft policy → no status change in UI
- Independent verification pending → "pending_independent_verification" in UI
- Independent verification complete → "verified" + evidence shown
- Birth time missing → "requires_verified_birth_time" constraint enforced

### Confidence State Consistency

- Unverified (no birth date): no confidence badge, no placements
- Partial (birth date, no verified evidence): "partial" label, calculated placements shown with caveat
- Verified (3 placements with evidence): "verified" badge, all placements shown
- UI reflects correct confidence level at every transition

### Edge Cases

- Profile with mixed verification states (1 verified, 2 pending)
- Profile missing birth time (Moon/Ascendant constraints)
- Offline-first profile with later independent verification
- Profile migration preserving or recovering evidence

## Definition of Done

- [ ] Dedicated test suite for UI/backend verification contracts
- [ ] Tests validate verification status consistency
- [ ] Tests validate confidence state display consistency
- [ ] Tests validate evidence display consistency
- [ ] Tests cover state transitions (all paths)
- [ ] Tests cover edge cases and mixed states
- [ ] UI correctly reflects backend confidence state
- [ ] No silent state upgrades or downgrades
- [ ] All workspace tests pass (385/385)
- [ ] Typecheck passes
- [ ] Build passes

## Files to Examine/Create

- client/src/lib/profileStorage.ts (deriveConfidenceState, state queries)
- client/src/* (UI components reflecting verification state)
- tests/ui-backend-verification-contract.test.ts (NEW: dedicated test suite)
- tests/active-profile-contract.test.ts (may need updates)
- server/tests/gate1-foundation.test.ts (reference for edge cases)

## Testing Strategy

- Component-level tests for verification status display
- Integration tests for profile load → UI state
- State transition tests (calculate → verify → display)
- Edge case tests (mixed states, missing data)
- Regression tests ensuring no regressions from Gate 1 changes

## Success Criteria

- All verification state transitions render correctly
- All confidence states render correctly
- Evidence display aligns with backend verification status
- No hidden state inconsistencies between UI and backend
- Profile refresh updates UI state correctly
