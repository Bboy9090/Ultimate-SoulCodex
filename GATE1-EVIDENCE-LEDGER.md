# Gate 1: Evidence Ledger Integration

**Status:** Core trust paths implemented; hardening and exact-head validation in progress  
**Current hardening PR:** #358  
**Canonical design history:** `governance/release-audits/GATE-1-EVIDENCE-LEDGER-GAP-ANALYSIS.md`

> The older gap analysis remains useful as design history, but its “missing” inventory is no longer the current production state. This file records the live implementation boundary.

---

## Current Authority

Soul Codex now treats evidence as a promotion requirement, not decoration:

- a populated value is not automatically verified;
- a copied `verified` label is not sufficient;
- verified astrology requires source, engine, and a parseable calculation timestamp;
- verified Human Design requires the approved trust-record fields and verification receipt;
- deterministic numerology is recorded as calculated provenance, not external verification;
- unresolved or incomplete evidence fails closed instead of inheriting legacy aliases or generic defaults.

Canonical placement lifecycle and evidence types remain in `packages/core/placement/types.ts`.

---

## Implemented

### Astrology

- [x] Sun, Moon, Ascendant and supported planetary placements carry explicit verification state.
- [x] Independently verified placements carry provenance metadata.
- [x] Production consumers reject `verified` placements that lack evidence-complete provenance.
- [x] Canonical profile storage downgrades provenance-free `verified` labels.
- [x] Profile reconciliation rejects provenance-free remote `verified` labels before synthesis.
- [x] Deterministic horoscope and natal-report paths use evidence-gated placements.
- [x] Verified longitudes are normalized without IEEE-754 display drift.
- [x] Missing time/location remains explicit rather than fabricating Moon/Rising.

### Numerology

Evidence-backed wrappers exist in `packages/core/evidence-ledger/integrations.ts` for the canonical nine calculations:

- [x] Personal Day
- [x] Personal Year
- [x] Personal Month
- [x] Life Path
- [x] Birthday
- [x] Expression
- [x] Soul Urge
- [x] Personality
- [x] Maturity

Hardening now also guarantees:

- [x] Master Personal Years 11, 22 and 33 remain valid through Personal Month evidence.
- [x] Explicit zero/invalid Personal Year inputs fail closed instead of defaulting to the current year.
- [x] Numerology evidence uses calculated provenance language rather than claiming independent verification.
- [x] Core numerology evidence records the canonical `pythagorean-v2` engine version.
- [x] Name-based evidence uses the same Unicode normalization/transliteration path as the calculator.
- [x] Personal Year is explicitly a calendar-year cycle under Soul Codex policy.

### Human Design

- [x] Canonical calculation supports explicit unresolved state.
- [x] `calculateHumanDesignWithEvidence()` emits evidence entries for resolved calculations.
- [x] Production online verification produces an approved Human Design trust record.
- [x] A `verified` label without engine/source/timestamps/receipt/independent source is rejected.
- [x] Storage and reconciliation preserve verified Human Design only when the trust record is complete.
- [x] Deterministic fallback and natal-report consumers enforce the same trust boundary.
- [x] Calculated-unverified Human Design cannot drive verified synthesis.

### Profile Persistence

- [x] Canonical storage owns schema versioning and timestamps.
- [x] Astrology evidence survives save/load round trips.
- [x] Human Design evidence/trust metadata survives save/load round trips.
- [x] Provenance-free verification claims are downgraded during save.
- [x] Malformed evidence timestamps are rejected from verified state.
- [x] Reconciliation prevents untrusted remote snapshots from bypassing storage safeguards.
- [x] Legacy aliases cannot promote unresolved placements.

---

## Active Hardening / Remaining Gate Work

- [ ] Keep exact-head Diamond Way, store-candidate, and Xcode parity workflows green after every trust-boundary change.
- [ ] Continue replacing loose `any` profile evidence shapes with shared typed contracts where doing so does not break migration compatibility.
- [ ] Audit every remaining user-visible consumer for direct `status === "verified"` checks that do not also validate provenance.
- [ ] Consolidate repeated trust predicates into a shared cross-runtime contract after behavior is locked by regression tests.
- [ ] Keep historical audit documents clearly marked as historical when their gap inventories have been superseded.

---

## Regression Evidence

Current relevant regression coverage includes:

- `tests/active-profile-contract.test.ts`
- `tests/profile-verification-reconciliation.test.ts`
- `tests/deterministic-fallback-evidence-contract.test.ts`
- `tests/daily-horoscope-evidence-contract.test.ts`
- `tests/natal-report-contract.test.ts`
- `tests/primary-synthesis-system-policy.test.ts`
- `tests/verified-profile-differentiation.test.ts`
- `tests/verified-profile-differentiation-corpus.test.ts`
- `packages/core/evidence-ledger/__tests__/numerology-evidence.test.ts`
- `packages/astrology/__tests__/human-design-phase3.test.ts`

The release rule is simple: existence of data never upgrades trust. Promotion requires the evidence appropriate to that system, and exact-head CI remains the final merge gate.
