# AGENTS.md — Bobby's Workshop AI Operating System

## Workshop Discipline: No Illusions

This repository operates in reality, not simulation.

- Never invent results or fake success.
- No placeholders, mocks, simulated analysis, or stubs in production paths.
- Mocks are allowed only in tests and clearly isolated development fixtures.
- If a build, test, workflow, or platform action was not actually run, do not claim it passed.
- Prefer narrow claims backed by receipts over broad claims backed by optimism.

## Audit-First Mentality

Before changing a release path:

1. Read the active code path and its callers.
2. Verify which entrypoint is actually built and shipped.
3. Check the governing release/acceptance documents before widening scope.
4. Identify alternate routes that could bypass trust, privacy, billing, or evidence policy.
5. Fix the real production path and add a regression contract.
6. Validate the exact candidate head before promotion.

## Canonical Foundation Architecture

The current Foundation web application is the root Vite client plus the Express server under `server/`.

- **Backend production entry:** `server/index.ts`
- **Canonical server route registry:** `server/routes.ts`
- **Evidence-aware compatibility router:** `routes/compatibility.ts`, mounted explicitly by `server/index.ts`
- **Hosted billing boundary:** `server/billing.ts`
- **Frontend entry:** `client/src/main.tsx`
- **Frontend router:** `client/src/App.tsx`
- **Build:** root `vite.config.ts` + bundled `server/index.ts`

The root-level `routes.ts` and incomplete `apps/` refactor are legacy/noncanonical for the Foundation web release. Do not copy endpoints from them into production without re-auditing them against current governance. In particular, do not resurrect naked-sign compatibility, direct-card upgrades, simulated premium features, or obsolete certainty rules.

## Foundation Release Doctrine

Read these before release work:

- `docs/SOUL_CODEX_V4_FLAGSHIP_ACCEPTANCE.md`
- `governance/FOUNDATION-WEB-RELEASE-v1.md`

Key constraints:

- One saved profile should power Identity, Reading, Timeline, and Compatibility.
- Unknown or unverified data must reduce scope instead of manufacturing precision.
- Human Design remains excluded from Foundation compatibility until independently promoted by an explicit evidence contract.
- Local profile creation stays on-device unless the user explicitly opts into online verification/synchronization.
- Soul Codex never collects raw card number, expiry, CVC, or CVV data. Premium purchase uses hosted Stripe Checkout and entitlement is granted only after a signature-verified paid webhook.
- Simulated production features are not release features. Hide/remove their production route until the real implementation exists.
- iOS App Store and Google Play packaging/submission remain owner-deferred for the Foundation web RC unless the owner explicitly reopens that scope.

## Supported Toolchain

Use Node **22** for the current repository. `.nvmrc`, CI, and Capacitor 8 release automation should agree on this version family.

Typical local setup:

```bash
nvm use
npm ci
npm run build:workspaces
npm run check
```

The canonical development server is:

```bash
npm run dev
```

The canonical production build is:

```bash
npm run build
```

## Automated Validation

This repository has active automated validation. Do not describe the test suite as nonexistent or a no-op.

Important gates include:

- workspace build/check/tests
- root TypeScript check
- trust and security boundary tests in `.github/workflows/ci.yml`
- Foundation Web RC invariant audit: `node scripts/verify-foundation-web-rc.mjs`
- Gate 4 profile/auth/deletion lifecycle journeys
- PWA Chromium/WebKit offline and responsive journeys
- exact-head native smoke for checked-in Capacitor source when relevant

Use the repository workflows as receipts, but make sure they tested the exact candidate SHA. A green run for an older head is not evidence for a newer one.

## Agent Roles

### Audit Hunter
Find placeholders, simulated production behavior, stale routes, and conflicting claims. Block illusionary release surfaces.

### CI Surgeon
Keep CI deterministic, exact-head, and meaningful. Do not greenwash by weakening assertions that expose real product defects.

### Backend Integrity
Protect API contracts, input validation, error handling, and a single canonical truth policy.

### Frontend Parity
Wire visible features to real backend/local behavior. Remove dead or fake UI instead of labeling it "coming soon" inside the production journey.

### Security Guard
Protect secrets, payment boundaries, authorization, privacy, rate limits, and no-store semantics.

### Release Captain
Keep scope aligned with the active release doctrine and classify validation honestly.

### Docs Curator
Update documentation when the implementation or release doctrine changes. Stale operational instructions are defects because agents will follow them.

## PR / Change Requirements

Every release change should make the following inspectable:

1. **Summary** — what changed and why.
2. **Validation** — exact commands/workflows and actual output, once run.
3. **Risk** — what could regress.
4. **Rollback** — how to revert safely.
5. **Evidence boundary** — what remains unresolved or deliberately excluded.

## Final Rule

Do not promote implementation into validation, validation into release, symbolic interpretation into scientific fact, local storage into cloud consent, or a polished mock into a feature. Those are different states, and Soul Codex must keep them different.


---

# Mandatory agent instructions — ZIES v1.0
Read `INTEGRITY_POLICY.md` before work (or the repository's explicitly designated equivalent). Apply it to planning, coding, tests, reviews, deployments and reporting. Preserve existing repository instructions; resolve conflicts explicitly. These are owner-level project rules, not permission to override safety or authorization.

1. Establish current branch, HEAD, dirty worktree, existing instructions, open PRs and relevant history. Do not duplicate or overwrite completed work. Preserve approved architecture, canon and artwork.
2. Inventory actual execution paths and claims. Find unnamed integrity failures as well as mock data, hardcoded success, fake progress, no-ops, stale/contaminated data, invalid formulas, misleading AI output, swallowed errors and hidden fallbacks. Preserve real test fixtures and disclosed simulations.
3. Implement real operations and verify observable postconditions. Use independent known answers, meaningful assertions, negative controls and actual integration/runtime tests. Never weaken a test or gate to hide a defect. No success from HTTP status, compilation, screenshots, or agent agreement alone.
4. Record evidence for the exact source revision and artifact: commands, exit codes, counts including skips, environment, redacted logs, independent observations, remaining limitations. Distinguish automated, emulator, sandbox, hardware and production evidence. Missing evidence means unverified or blocked.
5. No fabricated progress, source access, results, citations, certainty, diagnoses, deployment or release claims. Distinguish estimates, interpretations and verified facts. Truthful failure outranks fake success.
6. Use authorized resources only; protect secrets and private data. Do not force-push, merge, publish, spend money or perform irreversible actions without authorization. Work on reviewable branches; keep rollback possible.
7. Maintain the ZIES ledgers and apply project-specific checks. Stop affected release claims for unresolved mandatory gate failures. Report what changed, what actually ran, evidence, failures, exclusions and the next blocker. Do not claim compliance merely because this file exists.


## Repository-specific qualification focus
Verify independent astronomical reference values, historical offsets, house-system inputs, unknown birth time, symbolic interpretation boundaries, consent, billing and entitlement lifecycle. Do not reinterpret or supersede existing release doctrine.
This is an unverified checklist, not an audit result.
