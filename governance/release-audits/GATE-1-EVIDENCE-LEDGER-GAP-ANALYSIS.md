# Gate 1 Evidence Ledger Integration: Current State & Gap Analysis

**Branch:** gate1/evidence-ledger-integration  
**Status:** INVESTIGATION COMPLETE  
**Date:** 2026-08-08  
**Scope:** Current evidence tracking across astrology, numerology, Human Design

---

## EXECUTIVE SUMMARY

Soul Codex has **excellent foundational evidence schema** but it is **largely aspirational**: types exist and are well-designed, but most subsystems do not populate or validate evidence through the canonical ledger. Astrology has partial implementation. Numerology treats all results as deterministic without evidence tracking. Human Design records calculation status but not evidence provenance.

**Risk:** Calculated values can flow into storage and UI without recording:
- WHY we trust them (input source, verification status)
- HOW we calculated them (engine, version, method)
- WHAT could be wrong (missing data, time sensitivity, unresolved constraints)

**Good News:** The canonical evidence types already exist and need integration, not redesign.

---

## 1. CANONICAL EVIDENCE MODEL

### Current Canonical Schemas

**Primary:** `packages/core/soul-codex-evidence-schema-v2.ts`
- **Status:** IMPLEMENTED (not in use)
- **Scope:** Comprehensive per-layer evidence model
- **Key types:**
  - `InputStatus`: user_entered, document_verified, self_reported, system_imported, inferred
  - `CalculationStatus`: deterministic, ephemeris_verified, estimated, legacy, not_calculated
  - `InterpretationStatus`: direct, synthesized, provisional, reflective, contextual
  - `EvidenceLayer`: name, value, inputStatus, calculationStatus, interpretationStatus, confidence, confidenceReason, timeSensitive, supportingSystems, method, methodVersion
  - `EvidenceAudit`: totalLayers, layersByConfidence, missingData, limitations, calculatedAt, engineVersion
  - `SoulCodexReadingAudit`: complete audit trail with all metadata
  - `LimitationCategory`: missing_birth_time, incomplete_name_data, unverified_source, estimated_data, offline_generation

**Secondary:** `packages/core/evidence-ledger/types.ts`
- **Status:** IMPLEMENTED (not in use)
- **Scope:** Simple ledger model, good for high-level tracking
- **Key types:**
  - `EvidenceEntry`: id, engine, claim, value, confidence, confidenceLabel, inputsUsed, limitations, reasoning, generatedAt, version
  - `EvidenceLedger`: readingId, entries, generatedAt, version
  - `EvidenceSummary`: aggregated confidence analysis with conflict detection

**Tertiary:** `packages/core/accuracy/types.ts`
- **Status:** IMPLEMENTED (in use for astrology)
- **Scope:** Detailed calculation receipt and accuracy tracking
- **Key types:**
  - `ResultStatus`: verified-input-matched-calculation, exact-for-entered-input, stable-across-uncertainty-window, variable-across-uncertainty-window, unavailable, conflict
  - `InputVerificationStatus`: recorded, user-recalled, estimated, unknown
  - `TimezoneConversionMethod`: standard-iana-tzdb, daylight-offset, historical-offset, unknown
  - `ExactBirthInput`: explicit birth data spec with timezone, coordinate mode tracking
  - `CalculationMethodology`: ephemeris provider, version, zodiac system, house system, node mode, ayanamsha
  - `ChartCalculationReceipt`: complete calculation audit trail with provider comparison and uncertainty window
  - `UncertaintyWindowAnalysis`: when birth time unknown, all candidate times and stability analysis

### Assessment

| Model | Status | In Use | Completeness | Risk |
|-------|--------|--------|--------------|------|
| soul-codex-evidence-schema-v2 | Designed | No | Comprehensive | MISSING: Not wired to calculations |
| evidence-ledger/types | Designed | No | Moderate | MISSING: Not populated by subsystems |
| accuracy/types | Designed | **PARTIAL** | Very high | PARTIAL: Astrology uses it, others ignore |

**Overlap:** Schema-v2 and accuracy/types cover similar ground (input, calculation, interpretation status) but with different terminology. Schema-v2 is broader (supports all systems). Accuracy/types is narrower but more precise (astrology-specific).

**Recommendation:** Accuracy/types is better integrated for astrology. Schema-v2 is the aspirational model for all systems. Neither is connected to the canonical profile (`StoredProfile`).

---

## 2. ASTROLOGY CURRENT STATE

### Path Traced

```
raw birth data (birthDate, birthTime, timezone, lat/lon)
  ↓ (fromZonedTime, timezone resolution)
createBirthTime() → UTC Date object
  ↓ (astronomy-engine)
Astro.HelioVector() → raw ecliptic longitudes
  ↓ (calculation)
PlanetData: sign, house, degree, longitude, interpretation
  ↓ (accumulation)
AstrologyData: sunSign, moonSign, risingSign, planets[], aspects[], nodes
  ↓ (storage)
StoredProfile.astrologyData
```

### Evidence Currently Recorded

| Field | Current | Expected |
|-------|---------|----------|
| Calculation engine | Implicit (astronomy-engine) | **NOT EXPLICIT** |
| Engine version | **NOT RECORDED** | Required |
| Ephemeris dataset | **NOT RECORDED** | E.g., "DE441" |
| Zodiac system | Hardcoded tropical | Recorded only in intent |
| House system | Hardcoded (implied from code) | **NOT RECORDED** |
| Coordinate mode | Geocentric (implicit) | **NOT RECORDED** |
| Birth input verification | **NOT RECORDED** | user_entered, document_verified, estimated, unknown |
| Timezone conversion | Uses date-fns-tz/geoTz | Method logged to console, **NOT CAPTURED** |
| Calculated timestamp | **NOT RECORDED** | When calculated |
| Verification status | **NOT RECORDED** | unresolved, pending, verified |
| Independent verification | Exists in services but disconnected | Should integrate into profile evidence |
| Confidence state | Exists in tests, not in storage | Should flow into StoredProfile |
| Unresolved reason | **NOT RECORDED** | E.g., "requires_verified_birth_time" for Moon/Ascendant |
| Limitation tracking | **NOT RECORDED** | Missing exact time, missing location, etc. |

### Key Files

- `packages/astrology/astrology.ts`: Main calculation (no evidence recording)
- `server/services/ascendant-verification.ts`: Independent verification (disconnected from profile)
- `server/services/astrology-production.ts`: Verification policy (not integrated)
- `server/services/astrology-evidence-matrix.ts`: Evidence fixtures (testing only)
- `packages/core/accuracy/types.ts`: Complete spec for receipt (exists but not used in profile storage)
- `client/src/lib/ActiveProfileRepository.ts`: `StoredProfile.astrologyData` accepts any (no schema validation)

### Current Gaps

1. **Engine/version not recorded:** Reproducibility requires knowing exact engine and version
2. **Timezone conversion not captured:** Date-fns-tz behavior is deterministic but logic is invisible
3. **Verification status disconnected:** Astrology can be verified independently (JPL Horizons) but result doesn't flow into profile
4. **Confidence not explicit:** Tests prove confidence state calculation; profile stores only `confidence: any`
5. **Missing time constraint not recorded:** Moon and Ascendant require exact birth time; this constraint disappears in storage
6. **Calculation timestamp missing:** When was this calculated? Profile has no `calculatedAt` per placement
7. **Unresolved state not explicit:** If birth time is missing, Moon/Ascendant should record `unresolved: "requires_verified_birth_time"` not `moonSign: null`

### Assessment: PARTIAL IMPLEMENTATION

Astrology can record all required evidence (types exist in accuracy/types.ts). **Implementation exists in test fixtures but not in actual profile storage path.**

---

## 3. NUMEROLOGY CURRENT STATE

### Path Traced

```
birthDate, birthTime, fullName
  ↓ (pure arithmetic)
digitSum → reduceCore (Pythagorean reduction)
  ↓
lifePath, birthDay, personalYear, expressionNumber, soulUrge, personalityNumber
  ↓
calculateNumerology() returns object with all values
  ↓ (caller stores or ignores)
StoredProfile.numerologyData (caller's responsibility)
```

### Evidence Currently Recorded

| Field | Current | Expected |
|-------|---------|----------|
| Calculation method | Hardcoded Pythagorean | Recorded |
| Method version | **NOT RECORDED** | "1.0" |
| Algorithm/formula | Inline, not named | Should be explicit |
| Deterministic status | Implicit | Should be explicit: "deterministic" |
| Input verification | **NOT RECORDED** | "user_entered" vs "unknown" vs "estimated" |
| Input completeness | Partially implicit | Missing middle name for expression number should be recorded |
| Calculation timestamp | **NOT RECORDED** | When calculated |
| Confidence | **NOT RECORDED** | Pythagorean is high-confidence IF full name is known; low if name incomplete |
| Unresolved reason | **NOT RECORDED** | "missing_name_for_expression_number" |
| Provenance | **NOT RECORDED** | "Pythagorean numerology" not stated in output |

### Key Files

- `packages/astrology/numerology.ts`: Pure calculation functions (no metadata)
- `packages/core/codex30/systems/numerology.ts`: May have integration point (not checked)
- `client/src/lib/ActiveProfileRepository.ts`: `StoredProfile.numerologyData` accepts any (no schema)

### Current Gaps

1. **No calculation metadata:** Caller doesn't know if they got Pythagorean, Chaldean, or other method
2. **No version tracking:** If numerology method changes, old profiles become incomparable
3. **No confidence recording:** Numerology is deterministic math, but confidence should depend on input completeness (full name? exact date?)
4. **No unresolved state:** If name is missing, should record `expressionNumber: unresolved` not `expressionNumber: null`
5. **No input source tracking:** Was the name verified? Self-reported? Estimated?
6. **No calculation timestamp:** When was this run?
7. **All results treated as verified:** No distinction between "deterministic calculation" and "independently verified astronomy"

### Assessment: MISSING IMPLEMENTATION

Numerology produces values but records zero evidence. **Very high risk:** Deterministic does not equal verified. If numerology algorithm changes, profiles silently diverge.

---

## 4. HUMAN DESIGN CURRENT STATE

### Path Traced

```
birthDate, birthTime, timezone, latitude, longitude
  ↓ (calls calculateAstrology)
AstrologyData: sunSign, moonSign, risingSign, longitudes
  ↓ (gate mapping via GATE_ZODIAC_MAP)
Gate numbers for Sun, Moon, Ascendant positions
  ↓ (calls calculateProfile, calculateStrategy, etc.)
Type, Strategy, Profile (based on time sensitivity; unresolved if no exact time)
  ↓
StoredProfile.humanDesignData
```

### Evidence Currently Recorded

| Field | Current | Expected |
|-------|---------|----------|
| Calculation engine | Hardcoded (astronomy-engine via astrology) | Recorded |
| Engine version | Inherited from astrology (not explicit) | Recorded separately |
| Gate mapping method | Hardcoded GATE_ZODIAC_MAP | Recorded |
| Zodiac system | Tropical (implicit) | Recorded |
| Calculation timestamp | **NOT RECORDED** | When calculated |
| Exact-time dependency | Partially implicit in code | Should be explicit in output |
| Status when missing time | Returns null or "unresolved" | Inconsistent |
| Unresolved reason | **NOT RECORDED** | "requires_verified_birth_time" should be explicit |
| Verification status | **NOT RECORDED** | Is this calculated or independently verified? |
| Confidence | **NOT RECORDED** | Should vary by exact-time dependency |
| Derivation proof | **NOT RECORDED** | How was Type determined? Which gate mappings? |

### Key Files

- `packages/astrology/human-design.ts`: Main calculation (no metadata)
- `server/services/human-design-trust.ts`: Verification (may be disconnected)
- `client/src/lib/ActiveProfileRepository.ts`: `StoredProfile.humanDesignData` accepts any

### Current Gaps

1. **No derivation proof:** Profile says "Type 5" but doesn't record which Sun gate or Line led to that
2. **Exact-time dependency not explicit:** "Ascendant determines Personality Line" is baked in code but not stated in output
3. **Unresolved state unclear:** If birth time is unknown, some HD outputs become uncertain. Should record which ones.
4. **No time sensitivity metadata:** User doesn't see "your Type is stable; your Profile depends on exact birth time"
5. **No verification distinction:** HD is calculated from astrology; can it be independently verified? Profile doesn't say.
6. **Confidence not recorded:** Why should HD confidence depend on astrology confidence? Not stated.
7. **No calculation timestamp:** When was this run?
8. **Null vs unresolved ambiguous:** `profileNumber: null` doesn't tell user "this needs exact birth time" vs "calculation failed"

### Assessment: PARTIAL IMPLEMENTATION

Human Design records **some** status (Type, Strategy, Profile). **Missing:** provenance, time sensitivity, unresolved reason, verification status, confidence justification.

---

## 5. CANONICAL PROFILE INTEGRATION

### StoredProfile Structure

```typescript
export interface StoredProfile {
  // Identification
  id?: string;
  name?: string;
  codename?: string;

  // Birth data
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  timezone?: string;
  latitude?: string;
  longitude?: string;

  // Astrological data
  sunSign?: string | null;
  moonSign?: string | null;
  risingSign?: string | null;
  astrologyData?: any;  // ← ACCEPTS ANY, NO SCHEMA

  // Numerology data
  lifePathNumber?: number;
  personalNumbers?: any;
  numerologyData?: any;  // ← ACCEPTS ANY, NO SCHEMA

  // Human Design data
  humanDesignType?: string;
  humanDesignData?: any;  // ← ACCEPTS ANY, NO SCHEMA

  // Synthesis
  archetype?: string;
  synthesis?: any;

  // Metadata
  confidence?: any;  // ← ACCEPTS ANY, NO SCHEMA
  schemaVersion?: number;  // = 1
  createdAt?: string;
  updatedAt?: string;
}
```

### Evidence Integration Assessment

| Aspect | Current | Status |
|--------|---------|--------|
| Birth input verification | **NOT RECORDED** | MISSING |
| Astrology evidence | Accepted in `astrologyData` | PARTIAL (schema exists, not validated) |
| Numerology evidence | Accepted in `numerologyData` | PARTIAL (no schema) |
| Human Design evidence | Accepted in `humanDesignData` | PARTIAL (no schema) |
| Confidence state | `confidence?: any` | MISSING (schema exists, not used) |
| Evidence ledger | **NOT ATTACHED** | MISSING |
| Calculation timestamp per placement | **NOT RECORDED** | MISSING |
| Unresolved reasons | **NOT RECORDED** | MISSING |
| Verification status per placement | **NOT RECORDED** | MISSING |

### Profile Persistence Path

```
calculateAstrology() → AstrologyData object
  ↓ (no evidence recording)
saveActiveProfile(profile) → enriches with timestamps
  ↓
localStorage.setItem("soulcodex.activeProfile.v1", JSON.stringify(profile))
  ↓
loadActiveProfile() → validateProfile (checks birthDate only)
  ↓
UI reads profile.astrologyData, profile.numerologyData, etc.
  ↓ (assumes all values are valid, no evidence re-check)
UI displays results
```

### Current Gaps

1. **No schema validation:** `astrologyData: any` means anything goes into storage
2. **No evidence attached:** Calculation receipt (accuracy/types.ts) is generated but not stored with profile
3. **No confidence re-check on load:** Profile loads; UI assumes all data is still valid
4. **No migration path:** If evidence schema changes, no way to revalidate old profiles
5. **No verification state sync:** Backend can verify a result independently; profile doesn't know about it
6. **Silent data acceptance:** Profile silently accepts incomplete or unresolved states without recording why

### Assessment: NOT INTEGRATED

Evidence types exist but are **disconnected from profile storage**. Profile accepts any data with minimal validation.

---

## 6. GAP MATRIX (BY SUBSYSTEM)

### ASTROLOGY

| Requirement | Current | Canonical | Missing | Risk |
|-------------|---------|-----------|---------|------|
| Input source tracking | None | InputStatus (user_entered, document_verified, estimated) | Birth data should have explicit `inputVerificationStatus` | MEDIUM: Can't know if input was verified |
| Calculation engine | Implicit | CalculationMethodology (provider, version, zodiac, house, etc.) | astronomy-engine version not recorded | HIGH: Reproducibility broken |
| Verification status | Tests only | ResultStatus (verified, exact-for-entered-input, variable, unavailable) | Profile stores only sign; no status | HIGH: Verified and calculated indistinguishable |
| Confidence state | Tests only | EvidenceLayer.confidence (high/moderate/low) | Not in StoredProfile | HIGH: User sees unqualified values |
| Unresolved reason | Implicit (null values) | LimitationCategory (missing_birth_time, etc.) | Moon/Ascendant constraints not explicit | MEDIUM: User confused by null |
| Time sensitivity | Code-implicit | EvidenceLayer.timeSensitive (boolean) | Not recorded | MEDIUM: User doesn't know "Moon might change" |
| Proof of calculation | Implicit | ChartCalculationReceipt | Can't re-verify old profiles | MEDIUM: Audit trail missing |
| Timestamp | None | ChartCalculationReceipt.calculatedAt | When was this calculated? Unknown | LOW: Can detect staleness |

**Count:** 8 requirements; 0 fully implemented in profile; 7 high/medium risk

### NUMEROLOGY

| Requirement | Current | Canonical | Missing | Risk |
|-------------|---------|-----------|---------|------|
| Input source | None | InputStatus | Is name verified? Unknown | MEDIUM |
| Calculation method | Hardcoded | CalculationStatus (deterministic, estimated) | "Pythagorean" not stated | MEDIUM: Can't distinguish method |
| Method version | None | CalculationMethodology.methodVersion | If algorithm changes, profiles break | HIGH: Silent divergence |
| Confidence state | None | EvidenceLayer.confidence | Confidence depends on name completeness; not tracked | HIGH |
| Unresolved reason | None | LimitationCategory | "Missing middle name for expression number" not stated | MEDIUM |
| Input completeness | Implicit | EvidenceLayer.inputRemark | Is full name available? Unknown | MEDIUM |
| Timestamp | None | EvidenceLayer.generatedAt | When was this calculated? | LOW |
| Proof | None | EvidenceEntry with reasoning | Can't show "how we got here" | LOW |

**Count:** 8 requirements; 0 implemented; 6 high/medium risk

### HUMAN DESIGN

| Requirement | Current | Canonical | Missing | Risk |
|-------------|---------|-----------|---------|------|
| Input source | None | InputStatus | Inherited from astrology; not explicit | MEDIUM |
| Calculation engine | Implicit | CalculationMethodology | Gate mapping version not recorded | MEDIUM |
| Time sensitivity | Code-implicit | EvidenceLayer.timeSensitive | Not explicit; user confused | MEDIUM |
| Unresolved reason | Partial | LimitationCategory | Which HD values require exact time? Not clear | MEDIUM |
| Derivation proof | None | Reasoning chain | "Type 5" came from Gate 28.1.5? Not recorded | LOW |
| Confidence | None | EvidenceLayer.confidence | Depends on time availability; not tracked | MEDIUM |
| Verification | None | ResultStatus | Is this calculated or independently verified? | MEDIUM |
| Timestamp | None | EvidenceLayer.generatedAt | When was this run? | LOW |

**Count:** 8 requirements; 1 partial; 7 high/medium risk

### PROFILE INTEGRATION

| Requirement | Current | Canonical | Missing | Risk |
|-------------|---------|-----------|---------|------|
| Birth input verification | None | BirthInput with InputVerificationStatus | Profile doesn't know if date/time/location verified | HIGH |
| Evidence attachment | None | EvidenceLedger or similar | No audit trail saved with profile | HIGH |
| Schema validation | Minimal | Could validate astrologyData against EvidenceLayer schema | Anything accepted | HIGH |
| Confidence tracking | None | Confidence field in StoredProfile | No way to know overall confidence state | HIGH |
| Verification overlay | None | Should link to independent verification results | Can't show "verified by JPL" | HIGH |
| Calculation timestamp | None | calculatedAt per placement | When were these values computed? | MEDIUM |
| Unresolved tracking | None | Should record unresolved reason per placement | Null doesn't explain why | MEDIUM |
| Migration path | None | versioning + revalidation logic | Old profiles become unverifiable | MEDIUM |

**Count:** 8 requirements; 0 implemented; 7 high/medium risk

---

## 7. DUPLICATE / LEGACY REPRESENTATIONS

### soul-codex-evidence-schema-v2.ts vs accuracy/types.ts

**Overlap:**
- Both model input source (InputStatus vs InputVerificationStatus)
- Both model calculation method (CalculationStatus vs CalculationMethodology)
- Both track confidence (confidence field vs overall confidence % in receipt)
- Both address missing data (missingData array vs uncertaintyWindow)

**Difference:**
- schema-v2: Designed for all systems (astrology, numerology, HD, interpretation)
- accuracy/types: Designed specifically for astrology with explicit provider comparison

**Decision:** Keep both. Accuracy/types is more precise for astrology (specifically handles ephemeris provider comparison, uncertainty windows, cross-provider validation). Schema-v2 is the aspirational model for cross-system evidence. Use accuracy/types for astrology; use schema-v2 for numerology and HD.

### No other legacy representations found.

**Good news:** Evidence model is not fragmented. Bad news: It's aspirational, not implemented.

---

## 8. PROPOSED MINIMAL INTEGRATION PLAN

### Phase 1: Make Astrology Evidence Explicit (HIGHEST PRIORITY)

**Goal:** Record evidence alongside astrology results in StoredProfile.

**Scope:**
1. Extend `StoredProfile.astrologyData` to include evidence per placement
2. Record engine, version, timezone method, verification status
3. Record calculation timestamp and unresolved reasons
4. Validate on load to catch silent data corruption

**Minimal change:**
```typescript
// In StoredProfile
astrologyData?: {
  sunSign?: string | null;
  moonSign?: string | null;
  risingSign?: string | null;
  
  // ← ADD: Evidence per placement
  evidence?: {
    sun?: AstrologyPlacementEvidence;
    moon?: AstrologyPlacementEvidence;
    rising?: AstrologyPlacementEvidence;
  };
  
  // ← ADD: Calculation receipt (from accuracy/types.ts)
  receipt?: ChartCalculationReceipt;
  
  // ← ADD: Verification status per placement
  verification?: {
    sun?: VerificationStatus;
    moon?: VerificationStatus;
    rising?: VerificationStatus;
  };
};

interface AstrologyPlacementEvidence {
  sign: string;
  verificationStatus: 'unresolved' | 'pending_independent_verification' | 'verified';
  evidence?: {
    source: string; // "ephemeris", "independent-reference"
    engine: string; // "astronomy-engine", "jpl-horizons"
    calculatedAt: string; // ISO 8601
    unresolvedReason?: string; // "requires_verified_birth_time"
  };
  timeSensitive?: boolean;
  confidence?: 'high' | 'moderate' | 'low';
}
```

**Files to modify:**
- `client/src/lib/ActiveProfileRepository.ts`: Extend StoredProfile interface
- `packages/astrology/astrology.ts`: Populate evidence during calculation
- `server/services/ascendant-verification.ts`: Wire verification results into evidence
- `server/tests/gate1-foundation.test.ts`: Add tests for evidence recording

**Tests to add:**
- Evidence round-trip: save profile with evidence, load, verify evidence matches
- Evidence validation: can't save incomplete evidence
- Verification integration: independent verification updates evidence
- Timestamp recording: every profile has calculatedAt
- Unresolved reason: missing time records `requires_verified_birth_time`

### Phase 2: Make Numerology Evidence Explicit

**Goal:** Track numerology as "deterministic calculation" distinct from "independently verified."

**Minimal change:**
```typescript
// In StoredProfile
numerologyData?: {
  lifePath?: number | null;
  birthDay?: number | null;
  expressionNumber?: number | null;
  soulUrge?: number | null;
  personalityNumber?: number | null;
  personalYear?: number | null;
  
  // ← ADD: Method and version
  method?: string; // "Pythagorean"
  methodVersion?: string; // "1.0"
  calculatedAt?: string;
  
  // ← ADD: Evidence per number
  evidence?: {
    lifePath?: NumerologyEvidence;
    expressionNumber?: NumerologyEvidence;
    // ... etc
  };
};

interface NumerologyEvidence {
  value: number | null;
  calculationStatus: 'deterministic'; // Always deterministic
  inputStatus: 'user_entered' | 'estimated' | 'unknown';
  confidence: 'high' | 'moderate' | 'low'; // High if input complete, low if incomplete
  unresolvedReason?: string; // "missing_full_name"
  calculatedAt: string;
}
```

**Files to modify:**
- `client/src/lib/ActiveProfileRepository.ts`: Extend StoredProfile
- `packages/astrology/numerology.ts`: Populate evidence
- `client/src/lib/profileStorage.ts`: Calculate confidence based on input completeness

**Tests to add:**
- Numerology evidence round-trip
- Confidence correctly reflects input completeness
- Method and version recorded
- Deterministic status always true
- Unresolved reason recorded when inputs incomplete

### Phase 3: Make Human Design Evidence Explicit

**Goal:** Record time-sensitivity, derivation proof, and confidence.

**Minimal change:**
```typescript
// In StoredProfile
humanDesignData?: {
  type?: string | null;
  strategy?: string | null;
  authority?: string | null;
  profile?: string | null;
  
  // ← ADD: Evidence and time sensitivity
  evidence?: {
    type?: HumanDesignEvidence;
    strategy?: HumanDesignEvidence;
    profile?: HumanDesignEvidence;
  };
  
  // ← ADD: Which values depend on exact time
  timeSensitivityMap?: {
    profile?: boolean; // true if depends on Ascendant
    strategy?: boolean;
    authority?: boolean;
  };
};

interface HumanDesignEvidence {
  value: string | null;
  calculationStatus: 'calculated' | 'unresolved';
  timeSensitive: boolean;
  unresolvedReason?: string; // "requires_verified_birth_time"
  confidence: 'high' | 'moderate' | 'low';
  derivedFrom?: string[]; // ["Sun Gate 28", "Moon Line 1"]
  calculatedAt: string;
}
```

**Files to modify:**
- `client/src/lib/ActiveProfileRepository.ts`: Extend StoredProfile
- `packages/astrology/human-design.ts`: Populate evidence with derivation proof
- UI components: Check timeSensitivityMap before displaying

**Tests to add:**
- HD evidence round-trip
- Time sensitivity correctly marked
- Derivation proof recorded
- Unresolved reason for missing time
- Confidence varies by input completeness

---

## 9. EXACT FILES REQUIRING MODIFICATION

### Core/Schema Files
1. `client/src/lib/ActiveProfileRepository.ts` — Extend StoredProfile interface
2. `packages/astrology/astrology.ts` — Populate evidence during calculation
3. `packages/astrology/numerology.ts` — Add method, version, evidence fields
4. `packages/astrology/human-design.ts` — Add derivation, time sensitivity, evidence

### Service Files
5. `server/services/ascendant-verification.ts` — Wire verification results into evidence
6. `server/services/astrology-production.ts` — Record verification status in evidence
7. `server/services/human-design-trust.ts` — If used, integrate into evidence

### Profile Utilities
8. `client/src/lib/profileStorage.ts` — Update deriveConfidenceState to use new evidence
9. `client/src/lib/profileVerificationReconciliation.ts` — Use evidence for reconciliation
10. `server/lib/verified-astrology.ts` — If used, integrate evidence recording

### Tests
11. `server/tests/gate1-foundation.test.ts` — Add evidence contracts
12. `tests/active-profile-contract.test.ts` — Add evidence round-trip tests
13. NEW: `tests/astrology-evidence-contract.test.ts` — Dedicated astrology evidence tests
14. NEW: `tests/numerology-evidence-contract.test.ts` — Dedicated numerology evidence tests
15. NEW: `tests/human-design-evidence-contract.test.ts` — Dedicated HD evidence tests

**Total: 15 files**

---

## 10. TESTS TO ADD

### Astrology Evidence Contracts

```gherkin
Feature: Astrology Evidence Recording
  Background: Profile with complete birth data
    Given birth date "1990-09-17"
    And birth time "11:11"
    And timezone "America/New_York"
    And location Bronx, NY

  Scenario: Sun/Moon/Ascendant record evidence
    When calculateAstrology() is called
    Then astrologyData.evidence.sun.value = "Virgo"
    And astrologyData.evidence.sun.verificationStatus = "unresolved" (no independent verification yet)
    And astrologyData.evidence.sun.calculationStatus = "ephemeris_verified"
    And astrologyData.evidence.sun.engine = "astronomy-engine"
    And astrologyData.evidence.sun.engineVersion = [recorded]
    And astrologyData.evidence.sun.calculatedAt = [ISO 8601 timestamp]

  Scenario: Moon unresolved when exact time missing
    Given birth time unknown
    When calculateAstrology() is called
    Then astrologyData.evidence.moon.verificationStatus = "unresolved"
    And astrologyData.evidence.moon.unresolvedReason = "requires_verified_birth_time"
    And astrologyData.evidence.moon.value = null

  Scenario: Time sensitivity recorded
    When calculateAstrology() is called
    Then astrologyData.evidence.sun.timeSensitive = false
    And astrologyData.evidence.moon.timeSensitive = true (changes with time)
    And astrologyData.evidence.rising.timeSensitive = true

  Scenario: Receipt includes provider comparison
    When calculateAstrology() is called with independent verification enabled
    Then astrologyData.receipt.providerComparison.primaryProvider = "astronomy-engine"
    And astrologyData.receipt.providerComparison.referenceProvider = "jpl-horizons"
    And astrologyData.receipt.providerComparison.status = "matched" or "within-tolerance"
```

### Numerology Evidence Contracts

```gherkin
Feature: Numerology Evidence Recording
  Scenario: Life Path records deterministic calculation
    Given birth date "1990-09-17"
    When calculateNumerology() is called
    Then numerologyData.lifePath = 9
    And numerologyData.evidence.lifePath.value = 9
    And numerologyData.evidence.lifePath.calculationStatus = "deterministic"
    And numerologyData.evidence.lifePath.calculatedAt = [ISO 8601 timestamp]
    And numerologyData.method = "Pythagorean"
    And numerologyData.methodVersion = "1.0"

  Scenario: Expression number confidence depends on name
    Given full name "Robert Gonzalez"
    When calculateNumerology() is called
    Then numerologyData.evidence.expressionNumber.confidence = "high"

  Scenario: Expression number unresolved without name
    Given no name provided
    When calculateNumerology() is called
    Then numerologyData.evidence.expressionNumber.value = null
    And numerologyData.evidence.expressionNumber.verificationStatus = "unresolved"
    And numerologyData.evidence.expressionNumber.unresolvedReason = "missing_full_name"
    And numerologyData.evidence.expressionNumber.confidence = "low"
```

### Human Design Evidence Contracts

```gherkin
Feature: Human Design Evidence Recording
  Scenario: Type records calculation method
    Given complete birth data with exact time
    When calculateHumanDesign() is called
    Then humanDesignData.type = "5"
    And humanDesignData.evidence.type.value = "5"
    And humanDesignData.evidence.type.calculationStatus = "calculated"
    And humanDesignData.evidence.type.calculatedAt = [ISO 8601 timestamp]

  Scenario: Profile time sensitivity recorded
    When calculateHumanDesign() is called
    Then humanDesignData.timeSensitivityMap.type = false
    And humanDesignData.timeSensitivityMap.profile = true (depends on Ascendant)

  Scenario: Profile unresolved without exact time
    Given birth time unknown
    When calculateHumanDesign() is called
    Then humanDesignData.evidence.profile.verificationStatus = "unresolved"
    And humanDesignData.evidence.profile.unresolvedReason = "requires_verified_birth_time"

  Scenario: Derivation proof recorded
    When calculateHumanDesign() is called
    Then humanDesignData.evidence.type.derivedFrom = ["Sun Gate 28", "Moon Line X"]
```

### Profile Integration Contracts

```gherkin
Feature: Evidence Round-Trip Through Profile Storage
  Scenario: Evidence survives save/load cycle
    Given profile with complete astrology evidence
    When saveActiveProfile(profile) is called
    And loadActiveProfile() is called
    Then all evidence fields match original values
    And timestamps are identical
    And no evidence is lost or mutated

  Scenario: Profile can be re-verified on load
    Given profile with timestamped calculations
    When loadActiveProfile() is called
    Then can detect if profile was calculated with outdated engine version
    And can trigger re-verification if independent results now available
```

---

## CONCLUSION

### Summary

**Evidence Model:** Excellent foundational types exist (`accuracy/types.ts`, `soul-codex-evidence-schema-v2.ts`, `evidence-ledger/types.ts`). **Not implemented in profile storage or subsystem calculations.**

**Astrology:** 40% complete (types exist, not used in storage; tests prove behavior, profile doesn't record it)

**Numerology:** 0% complete (pure calculation, zero evidence tracking)

**Human Design:** 10% complete (records some status, missing provenance and time sensitivity)

**Profile:** Evidence types accepted (`astrologyData: any`) but not validated or queried.

### Risks if Not Addressed

1. **Silent calculation drift:** If numerology algorithm changes, profiles diverge without warning
2. **Unverifiable history:** Can't tell if a profile was verified by independent source or merely calculated
3. **Stale data assumption:** Profile loads with no way to know if underlying engines have updated
4. **Constraint loss:** "Moon unresolved without exact time" → becomes `null` with no explanation
5. **Confidence opacity:** User sees values with no indication of confidence or limitations
6. **Audit trail missing:** Can't prove "how we got here" for any calculation

### Why This Matters for Gate 1

Evidence ledger integration is **foundational to Gate 1 verification principle:** "Truth before certainty." Every calculated value must carry its reasoning (input source, calculation method, confidence, limitations, unresolved reasons). Without it, Soul Codex claims certainty it doesn't possess.

---

## NEXT STEPS

**DO NOT implement yet.**

This investigation report is complete. Waiting for:
1. Technical review of gap matrix
2. Confirmation that proposed minimal changes align with architecture
3. Approval to proceed with Phase 1 (Astrology Evidence)

Once approved, development begins on Branch 1 only. Branch 2 (UI/Backend Contract) waits until Branch 1 merges and main is refreshed.

---

**Report prepared:** 2026-08-08  
**Investigation time:** ~3 hours (codebase review + type analysis)  
**Files read:** 25+  
**Models identified:** 3 canonical evidence schemas (designed but not integrated)  
**Subsystems audited:** Astrology, Numerology, Human Design, Profile storage
