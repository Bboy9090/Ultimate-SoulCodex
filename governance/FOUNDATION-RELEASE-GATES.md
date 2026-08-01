# Foundation Release Gates

**SOUL CODEX v0.1.0: RELEASE READINESS FRAMEWORK**

This document defines the gates that must pass before Foundation release. No new features. Only core systems and trust validation.

---

## Release Gate Architecture

```
Foundation Release
    ↓
Five Sequential Gates
    ↓
Each Gate has Evidence Receipt
    ↓
No Gate Skipping
    ↓
Release Approval
```

---

## Gate 1: Core Systems Verified ✅

**Status:** PASSED

**What:** Numerology engine, reading experience, trust boundaries work correctly.

**Evidence:**
- `/packages/core/__tests__/robert-gonzalez.regression.test.ts` — 20 tests passing
- `/client/src/components/soul-codex/ReadingElement.tsx` — PR #131 merged
- `/governance/ADRs/ADR-001-VERIFICATION-IS-PART-OF-DESIGN.md` — Architecture documented

**Proof Points:**
- ✅ Numerology calculations verified
- ✅ Moon/Ascendant refusal enforced
- ✅ Unverified data visibly labeled
- ✅ Trust boundaries unidirectional

**Next:** → Gate 2

---

## Gate 2: Timeline Lifecycle Proof ⏳

**Status:** PENDING EXECUTION

**What:** A real user can create a profile, navigate Timeline, refresh browser, restart app, and use it offline.

**Evidence Document:**
`/docs/release-receipts/TIMELINE-LIFECYCLE-VALIDATION-v1.md`

**Tests Required:**

| Test | Execution | Evidence |
|------|-----------|----------|
| Test 1: New User Creation | Manual browser | Screenshot + UUID |
| Test 2: Refresh Recovery | Manual browser | Before/after comparison |
| Test 3: Restart Recovery | Manual browser | localStorage restoration proof |
| Test 4: Offline Mode | Manual browser + DevTools | Network offline + Timeline rendered |

**Sign-Off:** Tester name + date after all 4 tests pass

**Success Criteria:**
- ✅ All 4 tests passing
- ✅ No errors in console
- ✅ No fallback data used
- ✅ Correct calculations (PY=9, PM=8 for fixture)

**Next:** After signed receipt → Gate 3

---

## Gate 3: No Silent Data Upgrade ❌

**Status:** BLOCKED — 2 Critical Violations Found

**What:** Codebase scan to verify no unverified data is rendered as fact.

**Evidence Document:**
`/governance/release-audits/NO-SILENT-UPGRADE-AUDIT-v1.md`

**Audit Process:**

1. **Automated Scanning**
   ```bash
   grep -r "verified.*true\|= 'verified'" packages/core client/src
   grep -r "Virgo\|Scorpio" packages/core/src | grep -v test
   grep -r "fallback\|default.*||" client/src
   ```

2. **Manual Code Review**
   - For each finding, verify source attribution
   - Confirm no hardcoded astrology
   - Check that fallbacks are labeled
   - Verify unverified data not rendered

3. **UI Spot Check**
   - Create profile with minimal data
   - Verify no readings for unverified placements
   - Confirm "Pending verification" appears

**Success Criteria:**
- ✅ Zero hardcoded astrology values
- ✅ Zero unverified data rendered as fact
- ✅ All fallbacks explicitly labeled
- ✅ All confidence scores have sources
- ✅ Robert fixture null values never coerced to sign

**Sign-Off:** Auditor name + date + PASS/FAIL

**Next:** After signed audit → Gate 4

---

## Gate 4: Mobile Validation ⏳

**Status:** PENDING TESTING

**What:** App works correctly on iOS and Android devices, including offline.

**Evidence Document:**
`/docs/release-receipts/MOBILE-VALIDATION-v1.md` (to be created)

**Tests Required:**

| Device | Test | Evidence |
|--------|------|----------|
| iPhone 12+ | Timeline rendering | Screenshot |
| iPhone 12+ | Refresh persistence | Before/after |
| iPhone 12+ | Offline mode | Network toggle |
| Android | Timeline rendering | Screenshot |
| Android | Refresh persistence | Before/after |
| Android | Offline mode | Network toggle |

**Success Criteria:**
- ✅ Timeline renders correctly on mobile
- ✅ Touch interactions work
- ✅ Safe areas (notches) handled
- ✅ Offline works on mobile
- ✅ No console errors

**Sign-Off:** Tester name + devices + date

**Next:** After signed receipt → Gate 5

---

## Gate 5: Release Package ⏳

**Status:** PENDING DOCUMENTATION

**What:** All documentation, release notes, and deployment artifacts prepared.

**Evidence Document:**
`/FOUNDATION-RELEASE-v0.1.0/` (new directory after all gates pass)

**Contents:**
- `CHANGELOG.md` — Feature summary
- `ARCHITECTURE.md` — System overview
- `TRUST-MODEL.md` — How verification works
- `API-DOCS.md` — Endpoint documentation
- `DEPLOYMENT-GUIDE.md` — How to run
- `KNOWN-LIMITATIONS.md` — Honest scope limits

**Success Criteria:**
- ✅ CHANGELOG documents Foundation features
- ✅ ARCHITECTURE explains core systems
- ✅ TRUST-MODEL explains verification approach
- ✅ DEPLOYMENT-GUIDE is complete
- ✅ README points to all docs
- ✅ Version bumped to 0.1.0
- ✅ Git tag created

**Sign-Off:** Release manager + QA + date

**Next:** After signed package → Foundation Release Approved

---

## Release Timeline

```
Gate 1: Core Systems           ✅ PASSED (immediate)
         ↓
Gate 2: Timeline Lifecycle     ⏳ Days 1-2 (manual testing)
         ↓
Gate 3: Silent Upgrade Audit   ⏳ Days 2-3 (code scan + review)
         ↓
Gate 4: Mobile Validation      ⏳ Days 3-4 (device testing)
         ↓
Gate 5: Release Package        ⏳ Days 4-5 (documentation)
         ↓
Foundation Release Approved    ✅ Ready

Estimated Timeline: 5 calendar days (if no blockers)
```

---

## What Happens If a Gate Fails?

**If Gate 2 (Timeline) fails:**
- Stop. Don't proceed to Gates 3-5.
- Fix the failure (refesh doesn't persist, offline doesn't work, etc.)
- Re-run the failed test.
- Document the fix + re-test in receipt.
- Proceed to Gate 3 only after Gate 2 passes.

**If Gate 3 (Silent Upgrade) finds issues:**
- Stop. Don't proceed to Gates 4-5.
- Fix each finding (remove hardcoded values, add labels, etc.).
- Re-scan codebase.
- Commit fixes with message: "fix(trust): remove silent data upgrade [finding description]"
- Re-run audit.
- Proceed to Gate 4 only after audit passes.

**If Gate 4 (Mobile) fails:**
- Stop. Don't proceed to Gate 5.
- Fix responsive/mobile issues.
- Re-test on both iOS and Android.
- Proceed to Gate 5 only after all mobile tests pass.

**Pattern:** Gates are not advisory. They are absolute. Failure → fix → retry.

---

## Evidence Receipts Checklist

Before Foundation Release is approved, verify:

```
Timeline Lifecycle Validation v1
├── ✅ Test 1 PASSED: New user creation (screenshot + UUID)
├── ✅ Test 2 PASSED: Refresh recovery (before/after)
├── ✅ Test 3 PASSED: Restart recovery (storage proof)
├── ✅ Test 4 PASSED: Offline mode (network toggle)
└── ✅ Signed by tester

No Silent Data Upgrade Audit v1
├── ✅ Automated scan complete
├── ✅ Manual review complete (0 failures)
├── ✅ UI spot check complete
├── ✅ All findings documented
└── ✅ Signed by auditor

Mobile Validation v1
├── ✅ iOS 12+: Timeline, refresh, offline
├── ✅ Android 11+: Timeline, refresh, offline
├── ✅ All screenshots captured
└── ✅ Signed by mobile tester

Release Package
├── ✅ CHANGELOG written
├── ✅ ARCHITECTURE documented
├── ✅ TRUST-MODEL documented
├── ✅ API docs completed
├── ✅ README updated
├── ✅ Version bumped to 0.1.0
├── ✅ Git tag created
└── ✅ Signed by release manager
```

---

## Who Signs Off

- **Gate 1:** Architecture review (automated + code review) — ✅ Done
- **Gate 2:** QA tester (manual browser testing)
- **Gate 3:** Security/trust reviewer (codebase audit)
- **Gate 4:** QA tester (mobile testing)
- **Gate 5:** Release manager (documentation + versioning)

Each sign-off is a commitment: "I have verified this gate and confirm it passes."

---

## No Feature Backlog During Gates

**CRITICAL RULE:** While release gates are executing:

- ❌ Do NOT start new features
- ❌ Do NOT add new intelligence modules
- ❌ Do NOT merge unrelated PRs
- ✅ DO fix issues discovered during gates
- ✅ DO document findings
- ✅ DO prepare release package

This discipline prevents shipping a foundation with the second floor already partially built on top of it.

---

## Post-Release Roadmap

After Foundation (0.1.0) ships:

**Next Phase: Intelligence v1**
- Real ephemeris engine (beyond astronomy-engine)
- Transits system
- Composite charts
- Relationship patterns
- etc.

**But not before Foundation passes all gates.**

---

## Document Links

| Document | Purpose | Status |
|----------|---------|--------|
| `/docs/release-receipts/TIMELINE-LIFECYCLE-VALIDATION-v1.md` | Gate 2 evidence | ⏳ Template ready |
| `/governance/release-audits/FOUNDATION-AUDIT-v1.md` | Master audit tracking | ⏳ Template ready |
| `/governance/release-audits/NO-SILENT-UPGRADE-AUDIT-v1.md` | Gate 3 protocol | ⏳ Template ready |
| `/docs/release-receipts/MOBILE-VALIDATION-v1.md` | Gate 4 evidence | ⏳ To be created |
| `/FOUNDATION-RELEASE-v0.1.0/` | Gate 5 package | ⏳ To be created |

---

## Next Immediate Action

Execute **Gate 2: Timeline Lifecycle Proof**

→ Open `/docs/release-receipts/TIMELINE-LIFECYCLE-VALIDATION-v1.md`

→ Follow the 4 tests in order

→ Sign the receipt when complete

Then proceed to Gate 3.

