# Phase 3: Human Design Evidence Integration - Inventory

## Established: Canonical Authority Selection

### Implementations Compared

#### `packages/astrology/human-design.ts` (789 lines) — CANONICAL CHOICE
**Advantages:**
- Package-level canonical location (packages/ directory structure)
- Birth time validation BEFORE astrology calculation (lines 531-542)
- Returns explicit unresolved marker when birth time missing
- Activations interface properly optional (with `?`)
- No silent UTC defaulting in initialization path
- Exported via `packages/astrology/index.ts` for public API

**Current Issues (to fix in Phase 3):**
- Still has UTC fallback at line 514 in `resolveHDTimezone()`
- Returns loose `HumanDesignData` (not discriminated union)
- No input validation before astrology (date, time format, coordinates, timezone)

#### `services/human-design.ts` (807 lines) — DUPLICATE (ACTIVE IN ROUTES)
**Problems:**
- Duplicate gate/channel/center definitions (identical to package version)
- Currently imported by `routes.ts` (primary active implementation)
- Calculates astrology BEFORE checking birth time (line 557)
- `normalizeHDTimezoneInput()` silently defaults to UTC (line 484)
- Activations interface has required fields (no `?`)
- Trust boundary failure: timezone substitution happens before birth data validation

### Decision: Establish Single Authority

**Action:** Make `packages/astrology/human-design.ts` canonical.
- Package location is proper separation of concerns
- Birth time check comes first (correct logic flow)
- Explicit unresolved semantics (better architecture)
- Convert server duplicate to adapter/wrapper
- Update all imports to use canonical package version

### Inventory of Consumers

| File | Imports | Purpose | Action |
|------|---------|---------|--------|
| `routes.ts` | `services/human-design` | Primary HD route handler | Update to `packages/astrology` |
| `gate1-foundation.test.ts` | `packages/astrology` | Test suite | Keep as-is (correct import) |
| `packages/astrology/index.ts` | Exports `packages/astrology/human-design` | Public API | Keep as-is (correct export) |
| `server/services/human-design-trust.ts` | (indirect via HD results) | Trust layer | Verify compatibility |

### Unresolved-Reason Matrix (Current State)

| Condition | Current Behavior | Required Fix |
|-----------|------------------|--------------|
| Missing birth time | Returns `type: "unresolved"` with string fields | ✓ CORRECT |
| Empty/null timezone | Silently falls back to UTC | ✗ MUST FAIL CLOSED |
| Malformed time format | Throws error (after astrology) | ✗ Must validate first |
| Invalid date (2023-02-30) | No validation | ✗ Must reject |
| Invalid coordinates | parseFloat() can return NaN | ✗ Must validate |
| Timezone lookup fails | Silent UTC fallback | ✗ Must return unresolved |

### 88° Design Calculation Provenance

**Current State:**
- `DESIGN_SOLAR_ARC = 87.975` (line 547 in package, line 562 in server)
- Comment: "Empirically calibrated to match official calculators"
- No formula ID, version, or golden fixtures

**Required Audit Trail:**
- [ ] Assign stable formula ID: `human-design.88-arc-solar`
- [ ] Assign version: `1.0.0` (current) 
- [ ] Document actual arc value computed
- [ ] Record iteration count/tolerance
- [ ] Create golden fixtures with known correct outputs
- [ ] Document external reference comparison method

### Evidence Ledger Integration Points

Formula metadata to record:
- `human-design.activations` — which planets/nodes in which gates/lines
- `human-design.type` — Manifestor/Generator/Generator-Reflector
- `human-design.strategy` — Respond/Initiate/Wait-To-Initiate/No-Strategy  
- `human-design.authority` — Emotional/Sacral/Solar-Plexus/G-Center/Self-Projected/Other-Authority
- `human-design.profile` — Investigator/Heretic/Opportunist/Hermit etc. (12 profiles)
- `human-design.definition` — Single/Split/Tripple (correct HD term spelling)
- `human-design.incarnation-cross` — determines life purpose theme
- `human-design.88-arc-solar` — design calculation basis

Evidence entry fields to populate:
- `formulaId` — e.g., "human-design.activations"
- `formulaVersion` — e.g., "1.0.0"
- `engine` — "human-design"
- `inputState` — derived from validation result
- `calculationStatus` — "resolved" | "unresolved"
- `calculatedAt` — ISO 8601 timestamp

### Timezone Resolution Policy

**Current Problem:**
- Line 514 (both versions): `return 'UTC'` when all else fails
- Silent substitution violates fail-closed principle
- User never knows timezone was guessed

**Required Fix:**
1. Valid IANA timezone supplied → Use it
2. Timezone lookup succeeds → Use resolved timezone, record source
3. Timezone lookup fails → Return unresolved with reason, do NOT calculate
4. Remove all silent UTC defaults

**Recording Requirement:**
- `evidence.inputState` → "valid" | "partial" | "missing" | "invalid"
- If derived from coordinates: `evidence.metadata.timezone_source = "geo-tz"`
- If supplied directly: `evidence.metadata.timezone_source = "user-provided"`
- If resolution failed: `evidence.calculationStatus = "unresolved"`

### Next Commits

1. **Establish Canonical Authority**
   - Convert `services/human-design.ts` to adapter
   - Update `routes.ts` to import from `packages/astrology`
   - Remove duplicate gate/channel/center definitions from server

2. **Fail-Closed Input Validation** (will require new code)
   - Date validation (real-calendar check, YYYY-MM-DD format)
   - Time validation (HH:MM format, 00:00-23:59 range, not empty)
   - Timezone validation (IANA format or coordinate-based resolution)
   - Coordinate validation (numeric, lat -90 to +90, lon -180 to +180)
   - Move all validation BEFORE astrology calculation

3. **Canonicalize Result Contract** (will require new types)
   - Replace `HumanDesignData` with discriminated union
   - Define `HumanDesignResolved` and `HumanDesignUnresolved`
   - Populate evidence entries with formula metadata

4. **Fix Trust Boundary Issues**
   - Remove silent timezone fallback
   - Add explicit unresolved reason when timezone fails
   - Record timezone resolution method in evidence

5. **Audit & Test**
   - Create golden fixtures for known HD charts
   - Test all fail-closed conditions
   - Verify 88° arc calculation matches external sources
   - Run full test suite

---

**Phase 3 Status:** Step 1 execution begins with canonical authority establishment.

**Repository Baseline:** `9f605a150f0a4b4d9e0d9aadea3cc877d85b3642` (Phase 2 merged)
