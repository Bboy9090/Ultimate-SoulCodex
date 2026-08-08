# Gate 1 PR #180 Test Report

## Summary

PR #180 is **merge-ready** subject to the conditions below.

## Test Results by Suite

### 1. Gate 1 Foundation Regression Suite ✅ **39/39 PASS**

All Gate 1 tests pass cleanly:
- Birth date normalization (4 tests)
- Birth time handling (3 tests)
- Timezone handling with exact UTC verification (4 tests)
- Latitude/longitude validation (7 tests)
- Unresolved state propagation (3 tests)
- Numerology determinism (5 tests)
- Human Design calculation (3 tests)
- Verification state accuracy (1 test)
- No silent data upgrades (2 tests)
- Repeatability guarantee (2 tests)
- ESM/CJS compatibility (1 test)
- **Profile Persistence & Real Canonical Storage (3 tests)** ✅

### 2. Workspace Test Suite ✅ **385/385 PASS**

Full test suite across all packages passes without regressions.

### 3. Trust-Boundary CI Suite ⚠️ **80/95 PASS, 15 FAIL (Pre-existing)**

The 15 failures in trust-boundary tests are **not caused by this PR**. They are pre-existing issues in:

**Ascendant Verification (3 failures)**
- `SiderealTime is not a function` (astronomy-engine import issue)
- Ascendant candidate generation failures
- Policy enforcement issues

**Astrology Candidate Tests (2 failures)**
- Status should be `calculated_pending_independent_verification`, getting `pending_ephemeris`
- Suggests ephemeris data loading or candidate promotion logic issues

**Astrology Evidence Matrix (2 failures)**
- Missing Sun candidate for fixture
- Longitude data type assertion failure

**Astrology Production Verification (6 failures)**
- Placements not reaching `verified` status when expected
- Policy approval issues
- Various verification state mismatches

**Bobby Big Three Golden (1 failure)**
- Placements not reaching `verified` status

**Root Cause**: These failures appear to be related to:
1. Astronomy engine module import/initialization
2. Ephemeris data loading or reference verification
3. Policy state management

**None of these failures are in Gate 1 or caused by Gate 1 changes.**

## PR Changes Summary

### Files Modified
- `server/tests/gate1-foundation.test.ts` (Primary)

### Key Improvements
1. **Profile Persistence Tests** - Now use actual `ActiveProfileRepository` functions
2. **Timezone Tests** - Assert exact UTC instants, not just repeatability
3. **DST Ambiguity Policy** - Locked to EDT first-occurrence (05:30 UTC for fall-back)

### Test Count Update
- Old: 31/31 PASS (stale)
- New: 39/39 PASS (actual)
- **+8 new tests** covering profile persistence and timezone edge cases

### PR Description Updated
- 31/31 → 39/39 test count
- Added details on timezone correctness evidence
- Documented profile persistence layer testing
- Locked DST fall-back policy explicit

## Merge Readiness

### ✅ Ready to Merge
- Gate 1: 39/39 PASS
- Workspace: 385/385 PASS
- No regressions introduced
- Profile persistence uses real canonical layer
- Timezone tests assert exact correctness
- DST policy explicitly locked

### ⚠️ Trust-Boundary Status
The 15 trust-boundary failures are pre-existing and outside this PR's scope.
**Recommend**: Merge this PR and track trust-boundary failures as separate issue.

## Files Analyzed
- `server/tests/gate1-foundation.test.ts` - All changes verified and working
- `client/src/lib/profileStorage.ts` - Real storage layer used correctly
- PR #180 description - Updated and accurate

---

Generated: 2026-08-08
Claude Code Session
