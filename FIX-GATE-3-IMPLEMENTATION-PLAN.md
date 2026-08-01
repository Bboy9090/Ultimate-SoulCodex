# Gate 3 Blocker Fixes — Implementation Plan

**Branch:** `fix/gate-3-no-silent-upgrades`  
**Target:** Complete all 3 blockers, re-audit, achieve Gate 3 PASS  
**Philosophy:** Never return fake precision. Empty fields are honest. Unresolved states are valid.

---

## Priority Order (Correct Sequence)

### 1. BLOCKER 0: Backend Astrology Service (ROOT CAUSE)

**File:** `/server/services/astrology.ts`  
**Current Problem:** Returns approximate sun/moon/rising without verification context  
**Solution:** Return explicit unresolved states with verification metadata

**Current Flow (WRONG):**
```typescript
calculateSunSign(birthDate) → "Virgo"  // Approximate from date boundary
calculateMoonSign(...) → "Scorpio"      // Simplified formula
calculateRisingSign(...) → "Leo"        // Simplified formula

// Returns as verified astrology
return { sunSign: "Virgo", moonSign: "Scorpio", ... }
```

**Fixed Flow (CORRECT):**
```typescript
calculateAstrology(birthData) → {
  sun: {
    sign: null,
    status: "pending_ephemeris",
    reason: "Requires verified ephemeris engine",
    confidence: null,
    engine: null
  },
  moon: {
    sign: null,
    status: "requires_verified_birth_time",
    reason: "Birth time required for accurate calculation",
    confidence: null
  },
  rising: {
    sign: null,
    status: "requires_verified_birth_time",
    reason: "Birth time and location required",
    confidence: null
  },
  verification: {
    complete: false,
    missingData: ["verified_ephemeris_engine", "birth_time"],
    suggestions: "Provide complete birth time for accurate chart"
  }
}
```

**Implementation Steps:**

1. Rename `calculateAstrology()` to `calculateAstrologyApproximate()` temporarily
2. Create new `calculateAstrology()` that:
   - Checks prerequisites (birth time, location, etc.)
   - Returns `null` values with verification states for unmet prerequisites
   - Never returns approximate calculations as facts
   - Includes metadata: source, engine, confidence, limitations
3. Update response type to include verification fields
4. Audit every location that calls this service
5. Update clients to handle `null` astrology gracefully

**Acceptance Criteria:**
- [ ] No approximate sun/moon/rising returned without `status: "pending_*"`
- [ ] All `null` values have explicit reason
- [ ] Verification metadata included in every response
- [ ] Clients that receive `null` astrology show "Pending verification" not fallback signs
- [ ] No test fails when astrology is null

**Commits:**
```
fix(backend): replace approximate astrology with explicit unresolved states

- Remove date-boundary sun sign calculation from production flow
- Remove simplified moon/rising formulas from production flow
- Return null astrology with verification status
- Include metadata: reason, confidence, engine
- Update response schema to include verification layer

Fixes Blocker 0: Backend Astrology Service
Prevents: Silent delivery of approximate data as verified
Result: Downstream systems cannot receive unverified astrology
```

---

### 2. BLOCKER 2: OnboardingPage Provenance

**File:** `/client/src/pages/OnboardingPage.tsx`  
**Current Problem:** Stores approximate sun sign as profile.sunSign without provenance  
**Solution:** Store with verification state, never cache approximate calculations

**Current Flow (WRONG):**
```typescript
const earlySunSign = getApproxSunSign(birthDate);  // Approximate
profile.sunSign = earlySunSign;  // Stored as if verified
// No indication this is approximate, no provenance
```

**Fixed Flow (CORRECT):**
```typescript
const birthDateProvenance = {
  value: birthDate,
  source: "user_entered",
  verified: true
};

// NEVER store approximate calculation
profile.astrologyData = {
  sun: {
    sign: null,
    status: "pending_ephemeris",
    source: null
  },
  _provenance: {
    birthDate: birthDateProvenance,
    birthTime: birthTime ? { value, source: "user_entered", verified: true } : null,
    astrology: {
      status: "pending_verification",
      reason: birthTime ? "Awaiting ephemeris calculation" : "Birth time required"
    }
  }
};
```

**Implementation Steps:**

1. Stop storing `earlySunSign` in profile
2. Keep UI feedback about approximate sun (show it during onboarding only)
3. Add provenance layer to astrologyData
4. Profile saves with null astrology and provenance metadata
5. Remove all fallback chains that use earlySunSign

**Acceptance Criteria:**
- [ ] New profiles have `profile.astrologyData.sun.sign === null`
- [ ] Provenance metadata is stored for all data
- [ ] No `earlySunSign` persisted to profile
- [ ] UI shows "Approximate for feedback" during onboarding
- [ ] After save, shows "Pending verification" not a sign name
- [ ] Profiles created before fix migrate correctly (sun → null, add provenance)

**Commits:**
```
fix(onboarding): remove approximate sun from profile storage

- Stop caching approximate sun sign calculation
- Store with explicit verification state
- Add provenance metadata layer
- Show "Pending verification" after save instead of sign name
- Maintain UI feedback during onboarding process

Fixes Blocker 2: OnboardingPage Provenance
Prevents: Approximate data being cascaded as profile truth
Result: Profile reflects actual verification state
```

---

### 3. BLOCKER 1: PosterPage Fallback Signs

**File:** `/client/src/pages/PosterPage.tsx`  
**Current Problem:** Renders hardcoded fallback signs ("Gemini"/"Pisces") when astrology unavailable  
**Solution:** Show honest "unavailable" state instead of invented data

**Current Flow (WRONG):**
```typescript
const DEMO = {
  sunSign: "Gemini",      // Hardcoded fallback
  moonSign: "Pisces",     // Never happened
  risingSign: "Sagittarius"
};

sunSign: astro.sun ?? p.sunSign ?? "Gemini"  // Silently invents
```

**Fixed Flow (CORRECT):**
```typescript
if (!astro?.sun?.sign && !profile?.sunSign) {
  return (
    <div className="unavailable-state">
      <p>Astrology chart unavailable</p>
      <p>Complete your birth time to generate a personalized poster</p>
      <button onClick={() => navigate("/start")}>Add Birth Time</button>
    </div>
  );
}

// Only render if data exists and is verified
if (profile.astrologyData?.sun?.status !== "verified") {
  return <PendingVerificationState />;
}

// Safe to render with real data
const poster = <BirthChartPosterSVG data={profile} />;
```

**Implementation Steps:**

1. Remove hardcoded DEMO object
2. Remove fallback chains (`?? "Gemini"`)
3. Add guard before rendering: check verification status
4. Show "unavailable" UI if astrology is null
5. Show "pending" UI if astrology status is not "verified"

**Acceptance Criteria:**
- [ ] No hardcoded sign names remain in PosterPage
- [ ] No fallback chains to sign names
- [ ] Profile with null astrology shows "unavailable" message
- [ ] Profile with pending astrology shows "pending" message
- [ ] Only verified astrology renders actual chart
- [ ] DEMO object removed completely

**Commits:**
```
fix(poster): remove hardcoded fallback signs

- Remove DEMO object with hardcoded astrology
- Remove fallback chains that resolve to sign names
- Add verification guards before rendering
- Show "unavailable" and "pending" states honestly

Fixes Blocker 1: PosterPage Hardcoded Fallbacks
Prevents: Users seeing fabricated charts
Result: Chart only renders with real verified data
```

---

## Regression Tests (Critical)

After fixes, add tests that FAIL if silent upgrades reappear:

**Test: No Unverified Astrology in Production Profiles**
```typescript
test("ProfilePage rejects null sun sign without verification label", () => {
  const profileWithNullAstro = {
    ...testProfile,
    astrologyData: { sun: { sign: null, status: "pending_ephemeris" } }
  };
  
  const { container } = render(<ProfilePage profile={profileWithNullAstro} />);
  
  // Must NOT contain sign name
  expect(container.textContent).not.toMatch(/Virgo|Scorpio|Gemini/);
  
  // Must contain verification message
  expect(container.textContent).toMatch(/Pending verification|Awaiting/);
});

test("PosterPage refuses null astrology", () => {
  const profileWithNullAstro = {
    ...testProfile,
    astrologyData: { sun: { sign: null, status: "pending_ephemeris" } }
  };
  
  const { container } = render(<PosterPage profile={profileWithNullAstro} />);
  
  // Must show unavailable state, not a chart
  expect(container.textContent).toMatch(/unavailable|complete.*birth/i);
  expect(container.querySelector("svg")).toBeNull();  // No chart rendered
});

test("Backend never returns approximate astrology as verified", async () => {
  const birthData = { birthDate: "2000-01-15" };  // No time
  const result = await calculateAstrology(birthData);
  
  // Must return null, not approximation
  expect(result.sun.sign).toBeNull();
  expect(result.sun.status).toBe("pending_ephemeris");
  expect(result.verification.complete).toBe(false);
});
```

---

## Audit Re-Run Protocol

After all fixes committed:

1. **Automated Scan:**
   ```bash
   grep -r "Virgo\|Scorpio\|Gemini\|Leo\|Capricorn\|Pisces\|Taurus\|Cancer" \
     --include="*.ts" --include="*.tsx" \
     packages/core client/src server \
     | grep -v test | grep -v fixture | grep -v comment
   ```
   Expected: Only in test fixtures, comments, or documentation

2. **Verification State Audit:**
   - Every `sunSign`, `moonSign`, `risingSign` must have `status` field
   - Every rendering must check status before display
   - Every null value must have explicit reason

3. **Flow Trace:**
   - Birth data → Backend calculation → Verification state → Storage → UI rendering
   - At each step, verify state is preserved and honored

4. **Gate 3 Re-Submission:**
   - All regression tests pass
   - Automated scan returns zero violations
   - Manual review confirms honest uncertainty states
   - Sign-off with corrected acceptance criteria

---

## Timeline

- Blocker 0 (Backend): ~4 hours (complex, affects whole system)
- Blocker 2 (Onboarding): ~2 hours (refactor provenance)
- Blocker 1 (Poster): ~1 hour (simplest fix)
- Regression tests: ~2 hours
- Re-audit: ~1 hour
- **Total: ~10 hours work**

---

## Success Criteria

Gate 3 passes when:

✅ No astrology placement renders without verification context  
✅ Backend returns only verified or explicitly unresolved data  
✅ Profile stores provenance with all data  
✅ UI shows "pending" not fallback values  
✅ Regression tests prove silent upgrades fail  
✅ Re-audit returns zero violations  

This is the discipline that prevents Foundation v0.1.0 from shipping with fake precision.
