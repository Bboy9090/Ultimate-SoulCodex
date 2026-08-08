# Audit: Commit 46b38bf Evidence Architecture Conflicts

**Date**: 2026-08-08  
**Commit**: 46b38bf (Phase 1: Astrology evidence integration - populate evidence fields)  
**Status**: ❌ CONFLICTS DETECTED - Parallel evidence types + Missing verification states

---

## Executive Summary

Commit 46b38bf introduces **duplicate evidence type definitions** that conflict with three existing canonical evidence frameworks already deployed in the codebase. The implementation:

1. ❌ Created new `VerificationStatus`, `ConfidenceLevel`, `AstrologyPlacementEvidence`, `AstrologyEvidence` types
2. ❌ Ignored existing canonical verification contract in `client/src/lib/placementVerification.ts`
3. ❌ Lost critical verification states: `calculated`, `pending_ephemeris`, `requires_location`, `approximate`
4. ❌ Replaced numeric confidence with categorical levels without mapping
5. ❌ Incorrect unresolved reasoning (Sun should NOT require birth time)
6. ❌ Added astrology evidence test file but not to CI canonical test list

---

## Canonical Evidence Types Inventory

### 1. **Placement Verification Contract** (Client-facing, canonical)
**File**: `client/src/lib/placementVerification.ts`  
**Status**: DEPLOYED, actively used in `EvidenceDrawer.tsx`

```typescript
export type VerificationState =
  | "verified"                         // ✓ Independent verification complete
  | "calculated"                       // ✓ Calculated but not independently verified
  | "pending_independent_verification" // ✓ Waiting for external verification
  | "pending_ephemeris"                // ✓ Waiting for ephemeris provider
  | "requires_verified_birth_time"     // ✓ Cannot calculate without exact time
  | "requires_location"                // ✓ Cannot calculate without coordinates
  | "approximate"                      // ✓ Estimated/approximated result
  | "unresolved"                       // ✓ Insufficient information
  | "unknown";                         // ✓ State not determined

export interface PlacementEvidence {
  source?: string | null;              // Where did result come from
  engine?: string | null;              // Which calculator
  calculatedAt?: string | null;        // ISO timestamp
  comparisonSource?: string | null;    // Reference for verification
  confidence?: number | null;          // Numeric 0-100 (optional)
}
```

**Usage**: Strict verification boundary enforced by `getVerifiedPlacement()`:
- Only "verified" state + complete evidence (source + engine + timestamp) passes validation
- "Calculated" state explicitly rejected even with evidence
- Interpretation layer must not create verified placements

**Tests**: `client/src/lib/__tests__/placementVerification.test.ts` (6 tests, included in workspace)

---

### 2. **Comprehensive Evidence Layer Model** (System-wide schema)
**File**: `packages/core/soul-codex-evidence-schema-v2.ts`

```typescript
// Three orthogonal dimensions of uncertainty:
export type InputStatus =
  | "user_entered" | "document_verified" | "self_reported" 
  | "system_imported" | "inferred";

export type CalculationStatus =
  | "deterministic"      // Same input → same output (Sun sign)
  | "ephemeris_verified" // From reliable astronomy library
  | "estimated"          // From incomplete inputs
  | "legacy"             // Old/approximate formula
  | "not_calculated";    // Raw data

export type InterpretationStatus =
  | "direct"        // Fixed meaning (Sun in Virgo)
  | "synthesized"   // Combination of systems
  | "provisional"   // Applies if conditions change
  | "reflective"    // About patterns
  | "contextual";   // Depends on lived experience

export interface EvidenceLayer {
  name: string;
  value: string;
  inputStatus: InputStatus;
  inputRemark?: string;
  calculationStatus: CalculationStatus;
  calculationRemark?: string;
  calculationTrail?: string;
  interpretationStatus: InterpretationStatus;
  interpretationRemark?: string;
  confidence: "high" | "moderate" | "low";  // ← Categorical (matches 46b38bf!)
  confidenceReason?: string;
  timeSensitive?: boolean;
  supportingSystems?: string[];
  method?: string;
  methodVersion?: string;
}
```

**Usage**: Comprehensive audit framework for reading-level evidence aggregation  
**UI Component**: `EvidenceDrawer.tsx` renders evidence layers grouped by confidence

---

### 3. **Detailed Accuracy & Provenance Model** (Calculation receipts)
**File**: `packages/core/accuracy/types.ts`

```typescript
export type ResultStatus =
  | 'verified-input-matched-calculation'   // Input verified + provider agreement
  | 'exact-for-entered-input'              // Calculation deterministic
  | 'stable-across-uncertainty-window'     // Result unchanged if time varies
  | 'variable-across-uncertainty-window'   // Result changes if time varies
  | 'unavailable'                          // Required input missing
  | 'conflict';                            // Providers disagree

export interface ExactBirthInput { ... }           // Audit trail of input processing
export interface CalculationMethodology { ... }   // Pinned versions, ephemeris spec
export interface NormalizedUTCTimestamp { ... }   // Conversion steps documented
export interface ProviderComparison { ... }       // Cross-calculator agreement
export interface ChartCalculationReceipt { ... }  // Complete calculation audit
export interface UncertaintyWindowAnalysis { ... }// Time sensitivity analysis
```

**Usage**: Machine-readable calculation audit for reproducibility and verification  
**Tests**: `server/tests/gate1-foundation.test.ts` (110 tests, CI-required)

---

## Duplicates Introduced by 46b38bf

### Type Conflict #1: VerificationStatus

**46b38bf defines** (in `packages/astrology/astrology.ts`):
```typescript
type VerificationStatus = 'unresolved' | 'pending_independent_verification' | 'verified';
```

**Conflicts with**:
- `client/src/lib/placementVerification.ts`: `VerificationState` (9 states, deployed)
- `packages/core/accuracy/types.ts`: `ResultStatus` (6 states, detailed)

**Missing states** (causes silent behavior loss):
- ❌ `"calculated"` - needed to distinguish repeatable but unverified results
- ❌ `"pending_ephemeris"` - specific wait state for external calculation
- ❌ `"requires_location"` - specific unresolved reason (different from time)
- ❌ `"approximate"` - for estimated results

---

### Type Conflict #2: ConfidenceLevel (Categorical)

**46b38bf introduces**:
```typescript
type ConfidenceLevel = 'high' | 'moderate' | 'low';
```

**Conflicts with**:
- `client/src/lib/placementVerification.ts`: `confidence?: number` (numeric 0-100, optional)
- `packages/core/soul-codex-evidence-schema-v2.ts`: `confidence: "high" | "moderate" | "low"` (mandatory)

**Problem**: Two confidence semantics in same codebase
- 46b38bf categorical confidence is MANDATORY per placement
- Existing PlacementEvidence.confidence is OPTIONAL numeric
- No canonical mapping between 0-100 and high/moderate/low

---

### Type Conflict #3: PlacementEvidence Structure

**46b38bf defines** (as `AstrologyPlacementEvidence`):
```typescript
interface AstrologyPlacementEvidence {
  sign: string | null;
  verificationStatus: VerificationStatus;
  calculationStatus: 'deterministic' | 'ephemeris_verified' | 'estimated' | 'unavailable';
  evidence?: {
    source: string;
    engine: string;
    engineVersion?: string;
    calculatedAt: string;
    unresolvedReason?: string;
  };
  timeSensitive?: boolean;
  confidence?: ConfidenceLevel;
}
```

**Canonical** (`client/src/lib/placementVerification.ts`):
```typescript
interface PlacementEvidence {
  source?: string | null;
  engine?: string | null;
  calculatedAt?: string | null;
  comparisonSource?: string | null;
  confidence?: number | null;
}
```

**Misalignments**:
- New structure nests metadata under `evidence` sub-object (breaking existing contracts)
- Missing `comparisonSource` field (used for independent verification tracking)
- Adds `unresolvedReason` but canonical contract uses specific states
- Confidence type mismatch (mandatory categorical vs. optional numeric)

---

### Type Conflict #4: Calculation Status

**46b38bf**:
```typescript
calculationStatus: 'deterministic' | 'ephemeris_verified' | 'estimated' | 'unavailable';
```

**Canonical** (`soul-codex-evidence-schema-v2.ts`):
```typescript
CalculationStatus = 'deterministic' | 'ephemeris_verified' | 'estimated' | 'legacy' | 'not_calculated';
```

**Missing**:
- ❌ `"legacy"` - for deprecated/approximate formulas
- ❌ `"not_calculated"` - for raw data without computation

---

## Semantic Errors in Evidence Population

### Error #1: Sun's Unresolved Reason

**Code in 46b38bf**:
```typescript
const hasExactTime = birthData.birthTime && birthData.birthTime !== '12:00';
...
if (!hasExactTime && hasLocation) {
  confidenceLevel = 'moderate';
  unresolvedReason = 'requires_verified_birth_time';  // ❌ WRONG
}
```

**Problem**: Sun sign does NOT require exact birth time
- Sun moves ~1°/day → changes zodiac sign ~every 30 days
- Birth time precision needed: years, not hours
- Unresolved reason should NEVER be set for Sun when date is available

**Should be**:
```typescript
// Sun: no time dependency for sign calculation
if (placement === 'sun') {
  unresolvedReason = undefined;  // Sun is always resolvable from date alone
}
// Moon/Rising: time-dependent
if (placement === 'moon' || placement === 'rising') {
  if (!hasExactTime) {
    unresolvedReason = 'requires_verified_birth_time';
  }
}
```

---

### Error #2: Incorrect "Deterministic" Label

**Code**:
```typescript
calculationStatus: 'deterministic'
```

**Problem**: Repeatable calculation ≠ deterministic in canonical semantics

**Canonical definition** (`accuracy/types.ts`):
- `exact-for-entered-input`: Calculation matches declared inputs (repeatable)
- `verified-input-matched-calculation`: Input independently verified + provider agreement
- `deterministic`: Only when calculation always produces same result for same inputs (no variation)

**Fix needed**:
```typescript
// Astronomy calculations ARE repeatable but not independently verified
calculationStatus: 'exact-for-entered-input';  // Not yet "deterministic" or "verified"
```

---

### Error #3: Location Not Captured

**Issue**: Moon and Rising are calculated from:
1. Birth date (for solar position)
2. Birth time (for Earth rotation → local sky)
3. Birth location (for local horizon)

**46b38bf captures time sensitivity** but not location sensitivity:
```typescript
// Missing:
// Rising requires location because local horizon depends on observer position
// Moon requires exact location for precise calculation
```

**Should record**:
```typescript
if (placement === 'rising') {
  if (!birthData.latitude || !birthData.longitude) {
    unresolvedReason = 'requires_location';
  }
}
```

---

## Test Execution Evidence

### Before 46b38bf
```
npm test workspace count: 367 tests
- @soulcodex/core: 110 tests (gate1-foundation.test.ts + others)
- @soulcodex/astrology: 0 test files
- Other packages: 257 tests
```

### After 46b38bf
```
npm test workspace count: 385 tests
- @soulcodex/astrology: +18 new tests (astrology-evidence.test.ts)
  * Evidence Population: 4 tests
  * Time Sensitivity: 3 tests
  * Confidence Levels: 3 tests
  * Unresolved Reasons: 2 tests
  * Engine Metadata: 3 tests
  * Determinism: 3 tests

Test script added to packages/astrology/package.json:
"test": "node --import tsx --test __tests__/**/*.test.ts"
```

### CI Integration
**NOT integrated into canonical CI test list**:
- `.github/workflows/ci.yml` line 35: `npm test` runs all workspace tests (✓ includes new file)
- BUT: No dedicated entry in "Run Trust And Security Boundary Tests" section
- New tests ARE executed by CI, but not explicitly listed

**Recommendation**: Add to CI explicit test list:
```yaml
  - name: Run Trust And Security Boundary Tests
    run: >-
      node --import tsx --test
      server/tests/gate1-foundation.test.ts
      tests/astrology-evidence-matrix.test.ts
      packages/astrology/__tests__/astrology-evidence.test.ts  # ← ADD HERE
      # ... other tests ...
```

---

## Fields to Keep / Remove / Reuse

### Keep (Canonical)
✓ `VerificationState` from `placementVerification.ts` (9 states, deployed, tested)  
✓ `PlacementEvidence` structure (5 optional fields, flexible)  
✓ `EvidenceLayer` from `soul-codex-evidence-schema-v2.ts` (comprehensive 3D model)  
✓ `ChartCalculationReceipt` from `accuracy/types.ts` (audit trail)  
✓ Categorical confidence `"high" | "moderate" | "low"` (from schema-v2)  

### Remove (Conflicts)
❌ `AstrologyPlacementEvidence` (duplicate of PlacementEvidence + PlacementLike)  
❌ `AstrologyEvidence` wrapper (use EvidenceLayer aggregation instead)  
❌ `VerificationStatus` (use canonical VerificationState)  
❌ Custom `ConfidenceLevel` (use schema-v2's categorical type)  

### Fix
🔧 Unresolved reasons per placement (add location dependency)  
🔧 Calculation status semantics (not "deterministic", use "exact-for-entered-input")  
🔧 Confidence semantics (use optional numeric OR mandatory categorical, not both)  

---

## Corrected Minimal Architecture

### Step 1: Reuse Existing Canonical Types

```typescript
// client/src/lib/placementVerification.ts (CANONICAL)
export type VerificationState = /* 9 states */;
export interface PlacementEvidence { /* 5 optional fields */ };
export interface PlacementLike { /* flexible structure */ };

// packages/core/soul-codex-evidence-schema-v2.ts (CANONICAL)
export interface EvidenceLayer {
  // 3 orthogonal dimensions:
  inputStatus: InputStatus;
  calculationStatus: CalculationStatus;
  interpretationStatus: InterpretationStatus;
  confidence: "high" | "moderate" | "low";
  timeSensitive?: boolean;
  /* audit trail fields */
};

// packages/core/accuracy/types.ts (CANONICAL)
export interface ChartCalculationReceipt {
  // Complete provenance for reproducibility
};
```

### Step 2: Extend for Astrology (Don't Duplicate)

```typescript
// packages/astrology/astrology.ts (NO NEW TYPES)
// Instead: return calculated values + optional audit context
// Let ActiveProfileRepository combine with PlacementLike structure

export function calculateAstrology(birthData: BirthData): AstrologyData {
  // Calculate signs/houses/aspects
  const sunSign = /* ... */;
  const moonSign = /* ... */;
  const risingSign = /* ... */;

  // Build placement evidence using CANONICAL PlacementLike structure
  const sunPlacement: PlacementLike = {
    sign: sunSign,
    verificationStatus: determinePlacementStatus(birthData, 'sun'),
    evidence: buildPlacementEvidence(birthData, 'sun'),
  };

  // Return AstrologyData with minimal evidence wrapper
  return {
    sunSign,
    moonSign,
    risingSign,
    // ... planets, houses, aspects ...
    placements?: {
      sun: sunPlacement,
      moon: moonPlacement,
      rising: risingPlacement,
    },
  };
}

function determinePlacementStatus(
  birthData: BirthData,
  placement: 'sun' | 'moon' | 'rising'
): VerificationState {
  // Sun: never requires time
  if (placement === 'sun') {
    return 'calculated';  // Repeatable but not yet verified
  }

  // Moon/Rising: require both time AND location
  const hasTime = birthData.birthTime && birthData.birthTime !== '12:00';
  const hasLocation = birthData.latitude != null && birthData.longitude != null;

  if (!hasTime && !hasLocation) return 'requires_verified_birth_time';
  if (!hasTime) return 'requires_verified_birth_time';
  if (!hasLocation && placement === 'rising') return 'requires_location';

  return 'calculated';  // Repeatable but not yet verified
}

function buildPlacementEvidence(
  birthData: BirthData,
  placement: 'sun' | 'moon' | 'rising'
): PlacementEvidence {
  return {
    source: 'user-provided-birth-data',
    engine: 'astronomy-engine',
    calculatedAt: new Date().toISOString(),
    // confidence: can be optional per canonical type
  };
}
```

### Step 3: Profile Storage Integration

```typescript
// client/src/lib/ActiveProfileRepository.ts
export interface StoredProfile {
  // ... existing fields ...
  astrologyData?: any & {
    placements?: {
      sun?: PlacementLike;
      moon?: PlacementLike;
      rising?: PlacementLike;
    };
  };
}
```

### Step 4: Tests Use Canonical Structures

```typescript
// packages/astrology/__tests__/astrology-evidence.test.ts
import { getVerifiedPlacement, type VerificationState } from '../../../client/src/lib/placementVerification';

test('sun is calculated but not verified', () => {
  const result = calculateAstrology(birthData);
  const sunPlacement = result.placements?.sun;

  assert.equal(sunPlacement?.verificationStatus, 'calculated');
  assert.ok(!getVerifiedPlacement(sunPlacement), 'Should reject sun as verified until independent verification');
});

test('moon requires verified birth time', () => {
  const birthDataNoTime = { ...birthData, birthTime: undefined };
  const result = calculateAstrology(birthDataNoTime);
  const moonPlacement = result.placements?.moon;

  assert.equal(moonPlacement?.verificationStatus, 'requires_verified_birth_time');
});

test('rising requires both time and location', () => {
  const birthDataNoLocation = { ...birthData, latitude: undefined, longitude: undefined };
  const result = calculateAstrology(birthDataNoLocation);
  const risingPlacement = result.placements?.rising;

  assert.equal(risingPlacement?.verificationStatus, 'requires_location');
});
```

---

## Recommendations

### Immediate (Pre-merge)

1. **Revert type definitions**
   - Remove `VerificationStatus`, `ConfidenceLevel`, `AstrologyPlacementEvidence`, `AstrologyEvidence` from astrology.ts
   - Import canonical `VerificationState`, `PlacementEvidence`, `PlacementLike` instead

2. **Fix verification logic**
   - Sun: never requires time (deterministic from date alone)
   - Moon: requires time + location
   - Rising: requires time + location
   - Use canonical state names: `"calculated"` instead of custom logic

3. **Update test expectations**
   - Change tests to assert `VerificationState` values
   - Test against canonical `getVerifiedPlacement()` boundary
   - Verify placement status logic per body

4. **Add CI explicit test**
   - List `packages/astrology/__tests__/astrology-evidence.test.ts` in `.github/workflows/ci.yml`

### Follow-up (Phase 2)

1. **EvidenceLayer integration**
   - When populating EvidenceLayers for reading audit, include astrology placements
   - Use canonical InputStatus/CalculationStatus/InterpretationStatus

2. **Numerology evidence** (Phase 2)
   - Follow same pattern: use canonical types
   - Do NOT create parallel ConfidenceLevel, NumerologyPlacementEvidence, etc.

3. **UI/Backend consistency contract**
   - Define how VerificationState flows from calculation → storage → UI
   - Enforce `getVerifiedPlacement()` boundary at interpretation layer
   - Document confidence mapping (if numeric needed)

---

## Approval Gate

**This commit should NOT merge until**:

- [ ] Type definitions refactored to use canonical types only
- [ ] Verification state logic corrected (Sun/Moon/Rising dependencies)
- [ ] Tests rewritten to assert canonical VerificationState values
- [ ] CI workflow updated to explicitly list new test file
- [ ] No duplicate type definitions remain in codebase

**Estimated effort to fix**: 2-3 hours  
**Risk of proceeding without fix**: Silent verification semantics loss, parallel evidence frameworks, interpretation layer confusion

---

## Appendix: Canonical Type Locations

| Type | File | Status | Usage |
|------|------|--------|-------|
| VerificationState | `client/src/lib/placementVerification.ts` | DEPLOYED | PlacementLike.verificationStatus |
| PlacementEvidence | `client/src/lib/placementVerification.ts` | DEPLOYED | PlacementLike.provenance/evidence |
| ResultStatus | `packages/core/accuracy/types.ts` | DESIGNED | ChartCalculationReceipt.status |
| InputStatus | `packages/core/soul-codex-evidence-schema-v2.ts` | DESIGNED | EvidenceLayer.inputStatus |
| CalculationStatus | `packages/core/soul-codex-evidence-schema-v2.ts` | DESIGNED | EvidenceLayer.calculationStatus |
| InterpretationStatus | `packages/core/soul-codex-evidence-schema-v2.ts` | DESIGNED | EvidenceLayer.interpretationStatus |
| EvidenceLayer | `packages/core/soul-codex-evidence-schema-v2.ts` | DESIGNED | SoulCodexReadingAudit.evidenceLayers |
| ChartCalculationReceipt | `packages/core/accuracy/types.ts` | DESIGNED | Calculation audit trail |

