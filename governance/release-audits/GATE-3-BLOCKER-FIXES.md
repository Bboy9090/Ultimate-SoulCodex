# Gate 3 Blocker Fixes — Implementation Guide

**Status:** Fixes Required Before Foundation Release  
**Unblocking Criteria:** All fixes applied + Gate 3 audit re-signed  
**Branch:** `claude/soul-codex-mobile-overflow-ts04x5`  
**Target:** Complete fixes before proceeding to Gates 4-5

---

## Blocker 1: PosterPage Hardcoded Fallback Signs

**File:** `/client/src/pages/PosterPage.tsx`  
**Impact:** Users can export posters with fabricated Gemini/Pisces astrology  
**Severity:** CRITICAL

### Problem Code

**Line 82 — Hardcoded DEMO object:**
```typescript
const DEMO: PosterData = {
  sunSign: "Gemini",
  moonSign: "Pisces",
  risingSign: "Sagittarius"
};
```

**Lines 125-126 — Fallback chain:**
```typescript
sunSign:         astro.sun ?? p.sunSign ?? "Gemini",
moonSign:        astro.moon ?? p.moonSign ?? "Pisces",
```

### Fix Approach

Remove hardcoded fallback values. When astrology is unverified, render UI message instead of sign names.

### Implementation

#### Step 1: Remove hardcoded DEMO defaults

**Before:**
```typescript
const DEMO: PosterData = {
  sunSign: "Gemini",
  moonSign: "Pisces",
  risingSign: "Sagittarius"
};
```

**After:**
```typescript
const DEMO: PosterData = {
  sunSign: undefined,      // No fallback
  moonSign: undefined,
  risingSign: undefined
};
```

#### Step 2: Fix fallback chain (lines 125-126)

**Before:**
```typescript
sunSign:         astro.sun ?? p.sunSign ?? "Gemini",
moonSign:        astro.moon ?? p.moonSign ?? "Pisces",
```

**After:**
```typescript
sunSign:         astro.sun ?? p.sunSign,  // null if unverified
moonSign:        astro.moon ?? p.moonSign,
```

#### Step 3: Add UI guard for missing data

Find where poster renders and add check:

**Add after data loading:**
```typescript
const hasVerifiedAstrology = !!data.sunSign || !!data.moonSign || !!data.risingSign;

if (!hasVerifiedAstrology) {
  return (
    <div className="error-state">
      <p>Complete your birth time to generate a poster with your astrology chart.</p>
      <button onClick={() => navigate("/start")}>Add Birth Time</button>
    </div>
  );
}
```

### Verification

After fix, verify:
- [ ] Create profile with birth date only (no birth time)
- [ ] Navigate to Poster page
- [ ] Confirm error message appears (no sign names rendered)
- [ ] Confirm no "Gemini" or "Pisces" appears on page
- [ ] Confirm button to "Add Birth Time" present

### Commit Message

```
fix(trust): remove hardcoded fallback signs from PosterPage

PosterPage was silently rendering hardcoded Gemini/Pisces astrology
when user data was unverified, violating the trust model.

- Remove hardcoded DEMO object values
- Remove fallback chains that resolve to sign names
- Add UI guard to show message if astrology unavailable
- User must verify birth time to generate poster

Fixes Gate 3 blocker: silent data upgrade in poster generation
Relates to: ADR-001 (Verification is part of design)
```

---

## Blocker 2: OnboardingPage Approximate Sun Sign as Fallback

**File:** `/client/src/pages/OnboardingPage.tsx`  
**Impact:** Approximate sun sign cascades through entire app; used for horoscopes without user awareness  
**Severity:** CRITICAL

### Problem Code

**Lines 79-93 — Hardcoded sign boundaries:**
```typescript
const SIGN_BOUNDARIES = [
  { sign: "Capricorn", start: [12, 22], end: [1, 19] },
  { sign: "Aquarius", start: [1, 20], end: [2, 18] },
  // ... etc
];
```

**Lines 139-150 — Approximate calculation function:**
```typescript
function getApproxSunSign(birthDate: string): string {
  // Calculates sun sign from date boundaries only
  // NOT from real ephemeris data
  // NOT astronomically accurate
}
```

**Line 205 — Stored as profile value:**
```typescript
sunSign: earlySunSign  // Stores approximate as if verified
```

**Line 337 — Fallback in profile update:**
```typescript
const sunSign = astro.sunSign || result.sunSign || earlySunSign;
```

**Line 583 — Shown to user as real data:**
```typescript
"Background readings warming for {earlySunSign}"
```

### Root Cause

Approximate sun sign is calculated from date boundaries (which might be off by ~1 day) but stored as permanent profile value. Later pages treat it as verified astrology.

### Fix Approach

Keep approximate calculation for onboarding UI feedback, but **never store it as profile.sunSign**. Only store when independently verified by ephemeris.

### Implementation

#### Step 1: Keep calculation but don't store

**Before (Line 205):**
```typescript
sunSign: earlySunSign,  // Wrong: stores approximate
```

**After:**
```typescript
sunSign: undefined,  // Correct: only store if verified
```

#### Step 2: Show UI message acknowledging it's approximate

**Find where onboarding displays "Background readings warming..."**

Update to clarify this is provisional:

**Before:**
```typescript
"Background readings warming for {earlySunSign}"
```

**After:**
```typescript
`Background readings approximate for ${earlySunSign} (pending birth time verification)`
```

Or better, use tooltip:
```typescript
<span title="This is an estimate based on your birth date. Verified astrology requires birth time.">
  Background readings warming for {earlySunSign}
</span>
```

#### Step 3: Verify profile structure

When profile is saved (line 205 area), ensure:

```typescript
// Save structure should be:
const profileToSave = {
  name: formData.name,
  birthDate: formData.birthDate,
  birthTime: formData.birthTime,
  birthLocation: formData.birthLocation,
  lifePathNumber: calcLifePath(formData.birthDate),
  sunSign: undefined,  // DON'T STORE APPROXIMATE
  moonSign: undefined,  // DON'T STORE UNVERIFIED
  risingSign: undefined,  // DON'T STORE UNVERIFIED
  astrologyData: {
    sun: {
      sign: undefined,
      status: "pending_independent_verification",
      reason: formData.birthTime ? "Awaiting ephemeris calculation" : "Need birth time for accurate calculation"
    },
    moon: {
      sign: undefined,
      status: "pending_independent_verification",
      reason: "Birth time required"
    }
  }
};
```

#### Step 4: Update fallback chain (Line 337)

**Before:**
```typescript
const sunSign = astro.sunSign || result.sunSign || earlySunSign;  // Uses approximate
```

**After:**
```typescript
const sunSign = astro.sunSign || result.sunSign;  // null if unverified
// Don't fall back to earlySunSign in production
```

### Verification

After fix, verify:
- [ ] Create profile with birth date only (no birth time)
- [ ] Check localStorage for profile: `sunSign` should be `undefined`
- [ ] Check astrologyData.sun.status should be `"pending_independent_verification"`
- [ ] Navigate to DailyHoroscope: Should show "Complete birth time" not a reading
- [ ] Navigate to TodayPage: Should not render sun sign in pattern
- [ ] Never see approximate sun sign used in horoscope generation

### Commit Message

```
fix(trust): stop storing approximate sun sign as profile value

OnboardingPage calculated an approximate sun sign from date boundaries
(not ephemeris) and stored it as profile.sunSign. This cascaded through
entire app—other pages used it for horoscopes without user awareness.

- Remove earlySunSign from profile storage
- Only store when independently verified by ephemeris
- Update UI to clarify approximate sun is provisional
- Store explicit verification status in astrologyData

Fixes Gate 3 blocker: silent data upgrade via approximate sun sign
Relates to: ADR-001 (Verification is part of design), PR #131 trust model
```

---

## Verification Checklist

After both fixes applied, run verification:

### Unit Tests
- [ ] Robert fixture loads with null astrology (unchanged)
- [ ] No regression tests fail
- [ ] Numerology calculations still pass

### Integration Checks
- [ ] Create new profile (birth date only)
- [ ] Profile.sunSign is undefined
- [ ] Navigate to each page:
  - [ ] PosterPage: Shows "Add birth time" message
  - [ ] DailyHoroscope: Shows "Complete profile" message
  - [ ] TodayPage: No sun sign in pattern
  - [ ] ProfilePage: Shows confidence badge as unverified
  - [ ] CodexReadingPage: Moon reading blocked with "Pending" label

### Storage Checks
- [ ] localStorage contains no hardcoded sign names
- [ ] astrologyData.sun.status = "pending_independent_verification"
- [ ] Serialization round-trip preserves null values

### Code Checks
- [ ] No remaining fallback chains to sign names
- [ ] No more `?? "Gemini"` or `?? "Pisces"` patterns
- [ ] All unverified data has labels or guards

---

## Re-Audit Steps

Once fixes are applied:

1. **Run automated scan:**
```bash
cd /home/user/Ultimate-SoulCodex

grep -r "Gemini\|Pisces" \
  --include="*.tsx" \
  client/src/pages/PosterPage.tsx \
  client/src/pages/OnboardingPage.tsx

# Should return ZERO results
```

2. **Check profile serialization:**
```bash
# Test that new profiles don't have hardcoded values
npm run test -- robert-gonzalez.regression.test.ts
```

3. **Manual browser test:**
- Create profile with birth date only
- Verify no astrology appears without "Pending" label
- Verify no fallback signs visible

4. **Re-run Gate 3 audit:**
- Execute full audit again
- Document findings in GATE-3-AUDIT-REPORT.md
- Sign off as PASSED

---

## Unblocking Timeline

**Estimated effort:**
- Blocker 1 (PosterPage): 30 minutes
- Blocker 2 (OnboardingPage): 45 minutes  
- Testing + verification: 30 minutes
- **Total:** ~2 hours

**After fixes → Re-test → Sign-off → Gate 4 ready**

---

**These fixes are binding for Foundation release. Do not release with known trust violations.**
