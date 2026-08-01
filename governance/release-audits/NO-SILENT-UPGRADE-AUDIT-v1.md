# No Silent Data Upgrade Audit v1

**TRUST BOUNDARY ENFORCEMENT FOR FOUNDATION RELEASE**

This audit ensures Soul Codex never secretly upgrades unverified data to "fact" status. It's the difference between a trustworthy system and one that silently lies.

---

## Philosophy

A user should be able to trace every claim the app makes back to:

1. **Source**: Where did this data come from? (Birth inputs, calculation, AI synthesis)
2. **Verification**: Has it been independently confirmed? (Yes/No/Pending)
3. **Confidence**: How certain are we? (High/Medium/Low/Pending)
4. **Visibility**: Does the user know all three things? (Yes/No)

If any step is missing or hidden, the app has broken trust.

---

## Audit Checklist

### 1. Astrology Module

#### Sun, Moon, Ascendant Placements

```bash
# Search for: hardcoded astrology values
grep -r "Virgo\|Scorpio\|Cancer\|Leo\|Taurus" \
  --include="*.ts" --include="*.tsx" \
  packages/core/src \
  | grep -v "test\|fixture\|expected\|comment"
```

| Check | Status | Evidence |
|-------|--------|----------|
| No hardcoded Sun placements | ⏳ | Search result: ... |
| No hardcoded Moon placements | ⏳ | Search result: ... |
| No hardcoded Ascendant placements | ⏳ | Search result: ... |
| Robert fixture has null for unverified | ✅ | `/packages/core/__tests__/fixtures/robert-gonzalez.ts` |
| Null values never coerced to fact | ⏳ | TimelinePage code review |

#### Verification State Labels

```bash
# Search for: places where verification status is set
grep -r "verificationStatus\|status.*verified\|verified.*true" \
  --include="*.ts" --include="*.tsx" \
  packages/core \
  | grep -v "pending\|test"
```

For each finding:
- Does it set status to "verified" without independent calculation?
- Is there an explanation for why it's marked verified?
- Could a future maintainer accidentally remove the explanation?

| Check | Status | Evidence |
|-------|--------|----------|
| No "verified" without calculation evidence | ⏳ | Code inspection |
| All "pending_verification" clearly labeled | ✅ | Robert fixture |
| No status inversions (unresolved → verified) | ⏳ | Code inspection |

---

### 2. Reading Experience (PR #131)

#### Unverified Data Rendering

```bash
# Search for: conditional rendering that might silently use fallback
grep -r "if.*sign\|if.*moon\|if.*ascendant" \
  --include="*.tsx" \
  client/src/pages/CodexReadingPage.tsx
```

| Check | Status | Evidence |
|-------|--------|----------|
| Moon reading only renders when verified | ✅ | PR #131 review + code |
| Ascendant reading only renders when verified | ✅ | PR #131 review + code |
| "Pending verification" UI shows for blocked readings | ✅ | PR #131 screenshot |
| No empty field confusion (field looks missing vs actually pending) | ⏳ | UI inspection |
| Display modes filter based on verification, not just presence | ✅ | ReadingElement.tsx |

#### Fallback Data Handling

```bash
# Search for: places where data might silently default
grep -r "||.*{}\|fallback\|default\|placeholder" \
  --include="*.tsx" \
  client/src/components/soul-codex/ \
  | grep -v "comment\|test"
```

For each match:
- Is there a label explaining this is not verified data?
- Does it appear in production or only in dev/testing?
- Could a user mistake it for real data?

| Check | Status | Evidence |
|-------|--------|----------|
| No fallback readings appear without label | ✅ | PR #131 review |
| Confidence bars never exceed 60% for unverified | ⏳ | Component inspection |
| "Example" / "Template" labels on sample data | ⏳ | Code review |

---

### 3. Numerology Engine

#### Life Path Calculation

```bash
# Verify life path is never hardcoded in calculation layer
grep -r "lifePathNumber.*=" \
  --include="*.ts" \
  packages/core/compute/ \
  | grep -E "= \d+"
```

| Check | Status | Evidence |
|-------|--------|----------|
| Life path only set from calculation | ✅ | Code inspection |
| No fallback life path (9 by default) | ✅ | Regression tests |
| Calculation always from birth inputs | ✅ | personal-numbers.ts |

#### Reduce to Single Digit

```typescript
// Should never have:
function reduceToSingleDigit(num) {
  return num || 5;  // ❌ FAIL: Silent fallback
}

// Should always have:
function reduceToSingleDigit(num) {
  if (!num) throw new Error("Calculation error");  // ✅ PASS: Explicit failure
  // ... calculation
}
```

| Check | Status | Evidence |
|-------|--------|----------|
| No silent defaults in reduce function | ✅ | personal-numbers.ts review |
| Invalid inputs cause explicit errors | ✅ | Unit tests |
| Edge cases (0, negative) documented | ⏳ | Code inspection |

---

### 4. Synthesis/AI Layer (Not in v1, but documented for future)

#### No Unverified-to-Verified Upgrade

This applies when AI generates readings from unverified inputs:

```typescript
// ❌ FAIL: Synthesis invents confidence
if (!profile.moonSign) {
  return generateAISynthesis(profile);  // AI "fills in" unverified data
}

// ✅ PASS: Synthesis acknowledges uncertainty
if (!profile.moonSign) {
  return {
    synthesis: null,
    note: "AI synthesis unavailable without verified Moon"
  };
}
```

| Check | Status | Evidence |
|-------|--------|----------|
| AI synthesis respects verification state | ⏳ | Not implemented yet |
| No AI-invented confidence for unverified | ⏳ | Not implemented yet |
| Synthesis clearly labeled when speculative | ⏳ | Not implemented yet |

---

### 5. UI Transparency

#### Confidence Badges

```bash
# Search for: confidence displays
grep -r "confidence\|Confidence" \
  --include="*.tsx" \
  client/src/components/soul-codex/
```

For each confidence display:
- Is the source visible? (calculated? estimated? AI?)
- Is the method transparent? (how was this number derived?)
- Can the user click to see calculation details?

| Check | Status | Evidence |
|-------|--------|----------|
| Confidence badges show source | ✅ | ReadingElement.tsx |
| Confidence colors consistent (gold/stone/red) | ✅ | PR #131 |
| Evidence drawer available for inspection | ✅ | PR #131 |
| No confidence percentage without justification | ⏳ | Code inspection |

#### Data Quality Labels

```bash
# Search for: limitations/caveats
grep -r "Limitations\|limitations\|pending\|unresolved" \
  --include="*.tsx" \
  client/src/components/soul-codex/
```

| Check | Status | Evidence |
|-------|--------|----------|
| LimitationsPanel shown when data incomplete | ✅ | PR #131 |
| Birth time missing → marked clearly | ✅ | LimitationsPanel.tsx |
| Birth location missing → marked clearly | ✅ | LimitationsPanel.tsx |
| No "optional" that secretly means "unreliable" | ⏳ | UX review |

---

### 6. Storage & Persistence

#### localStorage Integrity

```bash
# Verify profile structure never adds "verified" without cause
grep -r "soulcodex.activeProfile" \
  --include="*.ts" --include="*.tsx" \
  client/src/ \
  | grep -v test
```

| Check | Status | Evidence |
|-------|--------|----------|
| Profile storage schema matches expectations | ✅ | profileStorage.ts |
| No extra fields added without migration | ⏳ | Storage schema review |
| Persistence doesn't upgrade unverified data | ✅ | Serialization test |
| No silent schema changes between versions | ⏳ | Migration strategy (v2 concern) |

---

### 7. Configuration & Defaults

#### Feature Flags & Overrides

```bash
# Search for: feature flags that might enable unverified features
grep -r "FEATURE_\|FLAG_\|OVERRIDE_\|DEBUG_" \
  --include="*.ts" --include="*.tsx" \
  packages/core client/src \
  | grep -i "moon\|ascendant\|unverified\|pending"
```

| Check | Status | Evidence |
|-------|--------|----------|
| No feature flags that bypass verification | ✅ | Code inspection |
| Debug modes clearly labeled in UI | ⏳ | Runtime behavior |
| No production use of test/mock data | ✅ | Build verified |

---

### 8. API Responses

#### Server-Side Calculations

```bash
# Search for: places where server might return unverified data
grep -r "@soulcodex/core\|calcPersonalYear\|calcPersonalMonth" \
  --include="*.ts" \
  server/ routes.ts \
  | head -20
```

| Check | Status | Evidence |
|-------|--------|----------|
| API never sends unverified astrology as fact | ⏳ | API inspection |
| Verification status included in responses | ⏳ | Response schema review |
| No confidential info leaked in error messages | ✅ | Error handling review |

---

## Failure Cases (Would FAIL Audit)

These are examples of "silent data upgrades" the audit must catch:

### Example 1: Hardcoded Expected Value

```typescript
// ❌ FAIL
export const ROBERT_NATAL_CHART = {
  sun: {
    sign: "Virgo",  // Expected from offline reference
    verificationStatus: "calculated"  // Marked as calculated but actually hardcoded
  }
};
```

**Why it fails:** Masquerades as calculated when it's really just a guess.

### Example 2: Fallback Silently Used

```typescript
// ❌ FAIL
const py = calcPersonalYear(birth) || 5;
render(<Timeline year={py} />);
```

**Why it fails:** If calculation fails, renders Year 5 without explaining it's a fallback.

### Example 3: Unverified Rendered as Fact

```typescript
// ❌ FAIL
if (profile.moon) {
  return <MoonReading sign={profile.moon.sign} />;
}
// If moon.sign is null but object exists, still renders
```

**Why it fails:** Renders "null Moon" as a reading instead of showing "Pending verification."

### Example 4: Confidence Invented

```typescript
// ❌ FAIL
return {
  reading: generateAISynthesis(profile),
  confidence: 0.85  // Where did 85% come from?
};
```

**Why it fails:** Confidence percentage has no justification.

### Example 5: Verification Status Inverted

```typescript
// ❌ FAIL
const verification = {
  status: "verified",
  reason: "Has not been independently confirmed yet"
};
```

**Why it fails:** Contradiction on its face.

---

## Audit Execution

### Step 1: Automated Scanning

```bash
# Run comprehensive grep searches
cd /home/user/Ultimate-SoulCodex

grep -r "verified.*true\|= 'verified'\|status.*verified" \
  --include="*.ts" --include="*.tsx" \
  packages/core client/src server \
  | tee audit-verified-search.log

grep -r "Virgo\|Scorpio\|Cancer\|Leo\|Taurus\|Gemini" \
  --include="*.ts" --include="*.tsx" \
  packages/core/src \
  | grep -v test | grep -v comment \
  | tee audit-hardcoded-search.log

grep -r "fallback\|default.*||" \
  --include="*.ts" --include="*.tsx" \
  client/src \
  | tee audit-fallback-search.log
```

### Step 2: Manual Code Review

For each finding from Step 1:
1. Read surrounding context (10 lines before/after)
2. Ask: "Is this data verified or speculative?"
3. Ask: "Can a user tell the difference?"
4. Mark as ✅ PASS or ❌ FAIL

### Step 3: UI Spot Check

1. Open app in browser
2. Create profile with minimal data (birth date only)
3. Navigate each page
4. Verify no readings appear for unverified data
5. Verify "Pending" messages appear appropriately

### Step 4: Documentation

Record findings in audit report (see template below).

---

## Audit Report Template

**No Silent Data Upgrade Audit Report v1**

```markdown
# Findings

## PASS: Core Engine Verified
- Numerology calculations verified
- All hardcoded values removed from calculation layer
- Robert fixture correctly uses null for unverified astrology

## FAIL: [Finding 1]
- File: path/to/file.ts
- Line: 123
- Issue: Hardcoded value appears as calculated
- Evidence: [Screenshot/code snippet]
- Fix: Remove hardcoded value, return null for unverified

## WARN: [Finding 2]
- File: path/to/file.tsx
- Line: 456
- Issue: Fallback used, but not labeled
- Evidence: [Code snippet]
- Fix: Add explicit error instead of silent fallback

## Summary
- Total findings: N
- PASS: N
- FAIL: N (must be 0 to release)
- WARN: N (should be 0)

## Sign-off
Auditor: 
Date: 
Approval: ✅ / ❌
```

---

## Current Status

| Phase | Status | Notes |
|-------|--------|-------|
| Automated scanning | ⏳ Pending | Grep commands ready to run |
| Manual code review | ⏳ Pending | Review protocol defined |
| UI spot check | ⏳ Pending | After Timeline lifecycle passes |
| Report generation | ⏳ Pending | Template ready |

---

## Success Criteria

This audit passes when:

- ✅ Zero hardcoded astrology values in calculation code
- ✅ Zero unverified data rendered as fact in UI
- ✅ All confidence scores have documented sources
- ✅ All unverified data labeled visibly to user
- ✅ Fallback behavior never silent (always explicit error or label)
- ✅ Verification states survive through all layers (calc → storage → UI)

---

## Next: Execute Audit

After Timeline Lifecycle Receipt is signed:

1. Run automated scanning (grep commands above)
2. Conduct manual code review for each finding
3. Document findings in report template
4. Generate audit sign-off
5. Update Foundation Audit (gate 3) with results

This audit becomes part of the release evidence. No features ship until this passes.

