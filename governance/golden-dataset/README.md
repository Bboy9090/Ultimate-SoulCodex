# Soul Codex Golden Dataset

The Golden Dataset is the regression testing suite for Soul Codex. It contains 100+ verified birth charts with known correct outputs across all systems.

## Purpose

Every Soul Codex release is tested against the Golden Dataset. If any output changes unexpectedly, the release is halted until the change is understood and approved.

**Why this matters**: Silent personality drift is the death of trust. Users need to know that their readings are consistent, that the platform doesn't change without notice, and that interpretations are reproducible.

## Structure

```
golden-dataset/
├── README.md (this file)
├── MANIFEST.json (metadata: count, last updated, schema version)
├── SCHEMA.json (the expected format for each entry)
├── charts/
│   ├── robert_gonzalez_virgo.json
│   ├── maribel_1985_scorpio.json
│   ├── ...
│   └── [100+ entries]
└── release-tests/
    ├── 2026-08-01-v1.0-Foundation-test-report.md
    ├── 2026-09-15-v2.0-Intelligence-test-report.md
    └── [test reports after each release]
```

## Entry Schema

Each entry in the Golden Dataset follows this structure:

```json
{
  "id": "golden_001",
  "name": "Robert Gonzalez",
  "version": "1.0",
  "lastUpdated": "2026-08-01",
  "birthData": {
    "date": "1990-09-17",
    "time": "11:11",
    "location": "Bronx, NY",
    "timezone": "EST",
    "timeAccuracy": "exact"
  },
  "expectedCalculations": {
    "astrology": {
      "sunSign": "Virgo",
      "moonSign": "Scorpio",
      "risingSign": "Capricorn",
      "sunDegree": "23.45",
      "mercurySign": "Virgo",
      "venusSign": "Scorpio",
      "marsSign": "Scorpio"
    },
    "numerology": {
      "lifePathNumber": 9,
      "lifePath9Theme": "Completion, Reflection, Universal Service",
      "personalYearNumber": 9,
      "personalYear9Theme": "Completion cycle (2026)",
      "birthNumberReduction": "9+1+7+1+9+9+0"
    },
    "humanDesign": {
      "type": "Reflector",
      "authority": "Emotional",
      "strategy": "Wait for lunar month",
      "definition": "Open"
    }
  },
  "expectedInterpretations": {
    "coreArchetype": "Systems Architect",
    "corePatterns": [
      "Systems Diagnosis",
      "Pattern Recognition",
      "Completion Cycles"
    ],
    "dominantEnergy": "Analytical Leadership"
  },
  "expectedConfidence": {
    "astrology": 0.98,
    "numerology": 1.0,
    "humanDesign": 0.95
  },
  "notes": "Exact birth time from birth certificate. All calculations are definitive."
}
```

## How to Add a New Chart

1. **Collect verified birth data**
   - Get exact birth date, time, location
   - Verify against birth certificate or hospital record
   - Record source (birth cert, parent memory, estimated window, etc.)

2. **Calculate expected outputs manually**
   - Use ephemeris software to verify Sun/Moon/Rising/planets
   - Calculate numerology by hand (don't rely on app)
   - Determine Human Design type from authoritative sources
   - Double-check all calculations

3. **Document the entry**
   - Follow the schema above
   - Add comprehensive notes
   - Record who verified this data and when
   - Assign a unique ID (golden_XXX format)

4. **Add to repository**
   ```
   governance/golden-dataset/charts/[name]_[sun_sign].json
   ```

5. **Update MANIFEST.json**
   - Increment count
   - Update lastUpdated
   - List new entry

## Running the Golden Dataset Test

```bash
# Test current release against Golden Dataset
npm run test:golden-dataset

# Output format:
# ✅ PASS: 100/100 charts match expected outputs
# ⚠️ WARNING: 1 chart shows minor variation (confidence changed)
# ❌ FAIL: 3 charts show unexpected changes
```

## Expected Test Results

### PASS
All 100 charts produce identical output to known-good baseline.

**Action**: Proceed with release.

### WARNING
1-5 charts show minor variations that are expected (e.g., confidence recalculated):

```
Chart: robert_gonzalez_virgo.json
Expected: confidence 0.98
Actual: confidence 0.97
Reason: Numerology calculation updated in v2.0
Status: Expected, documented
```

**Action**: Review warning, update baseline if change is approved, proceed with release.

### FAIL
5+ charts show unexpected changes OR changes weren't documented:

```
Chart: maribel_1985_scorpio.json
Expected: Moon Sign = Scorpio
Actual: Moon Sign = Libra
Reason: Unknown
Status: UNEXPECTED
```

**Action**: Halt release. Investigate. File incident report. Do not proceed until understood.

## Incident Report Format

If a test fails, file a report:

```markdown
# Golden Dataset Regression Report

**Date**: 2026-08-15
**Release**: v2.0 Intelligence
**Test**: Pre-release Golden Dataset

## Failures
- Chart: robert_gonzalez_virgo.json
  - Expected: Life Path 9
  - Actual: Life Path 8
  - Calculation: 9+1+7+1+9+9+0 = 36 → 3+6 = 9 (should be 9)
  - Status: Calculation bug found in reducer

## Root Cause
Numerology reducer had off-by-one error in digit sum loop

## Resolution
Fixed in commit abc1234

## Test Results After Fix
✅ PASS: 100/100 charts match

## Lesson
Numerology edge cases need dedicated test suite
```

## Maintenance Schedule

### Weekly
- No automated maintenance needed (tests run pre-release)

### Monthly
- Review test results from all releases
- Add new validated charts to dataset (3-5/month goal)
- Update documentation if schema changes

### Quarterly
- Audit dataset for quality/accuracy
- Consider re-verifying older entries
- Plan dataset expansion (aim for 150+ by end of year)

### Annually
- Full dataset audit
- Major version bump if significant changes made
- Public documentation of dataset size and coverage

## Future Goals

**v1.0 (Now)**: 100 verified charts, basic regression testing

**v2.0**: 150+ charts, distributed across:
- All zodiac signs (12 examples each minimum)
- Various birth time accuracies (exact, estimated, unknown)
- Multiple countries/timezones
- Various Human Design types

**v5.0**: 300+ charts, with organizational/team data:
- Team charts (groups of 3-10)
- Family charts (parents + children)
- Business organization charts
- Organizational compatibility matrices

## What This Prevents

✅ Silent personality drift (we catch output changes)  
✅ Calculation bugs (we compare against known-good)  
✅ Prompt changes that alter meaning (regressions would show)  
✅ Version skew (every release is tested)  
✅ Losing institutional knowledge (verified data is documented)

## What This Cannot Do

❌ Prove interpretation is correct (only verifies consistency)  
❌ Validate against real-world outcomes (only checks calculations)  
❌ Guarantee future accuracy (assumes current calculation is correct)

---

**The Golden Dataset is the backbone of Soul Codex trustworthiness. Maintain it religiously.**
