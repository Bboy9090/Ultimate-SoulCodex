#!/usr/bin/env python3
"""Builds federation/legion/soul-codex-verification.json — the Soul Codex Verification
Phase as a Legion task graph.

Every agent is grounded in the repository itself:
  * evidence_command  real gates, executed on a clean checkout of the exact commit
  * context_files     the tests and the source they assert against, read from that commit
  * test_command      (Code Agents) the repository's own tests judge the change

Run from the repository root:
    python3 federation/legion/build_verification_tasks.py          # write the task file
    python3 federation/legion/build_verification_tasks.py --check  # fail if it is out of date

The builder refuses to emit a task that references a file which does not exist.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).with_name("soul-codex-verification.json")


def T(*files: str) -> str:
    return "node --import tsx --test " + " ".join(files)


# Text audits quote repository source, which may legitimately contain these words.
AUDIT_ALLOW = ["placeholder wording", "TODO marker", "FIXME marker", "TBD marker", "unimplemented stub"]
# Code changes re-emit whole files; only lines the agent adds are scanned (see Legion's tester).
CODE_ALLOW = ["placeholder wording"]

AUDIT_INSTRUCTIONS = """You are the {role} for this scope in the Soul Codex Verification Phase.
Scope: {scope}

Work only from the EVIDENCE block (real output produced on a clean checkout of the exact commit)
and the context files. Git is not truth and neither is a test name: what counts is what the
evidence shows. A BLOCKED or unavailable result is correct behaviour, not a failure.

Deliver an audit report with these sections:
1. Gate status - each test file / audit in the evidence with its exact pass and fail counts,
   copied from the evidence (no rounding, no inference).
2. Failures - for every failing assertion: the test name, what it asserts, the source location it
   targets, and a classification with quoted evidence:
   PRODUCT DEFECT (code violates the contract/doctrine), STALE CONTRACT (the assertion encodes text
   or behaviour the doctrine no longer requires - prove it), TEST DEFECT (the test itself is
   broken), or ENVIRONMENT (the runner, not the product - e.g. module loading or missing service).
   If there are no failures, say so and state what the passing tests actually prove.
3. Evidence strength - which assertions exercise computed behaviour and which only regex-match
   source text; name any doctrine guarantee in scope that no test protects.
4. Doctrine risks - any path in scope where unknown or unverified data could manufacture
   precision, certainty or a fabricated value. Quote the code.
5. Remediation spec - for each defect: file, function, the exact change, and the test that will
   prove it; or "no remediation required".
Never claim anything the evidence does not show. Where the evidence is insufficient to decide,
write BLOCKED and state exactly what evidence is missing.
{extra}"""

AUDIT_ACCEPTANCE = ("Every count and quoted line matches the EVIDENCE block exactly; every failure is "
                    "classified with quoted evidence; nothing is asserted beyond the evidence; the "
                    "remediation spec is specific enough to implement without guessing.")

CODE_INSTRUCTIONS = """You are the Code Agent repairing: {scope}

Start from the approved audit(s) you depend on - they classify each failure. Rules:
- PRODUCT DEFECT: fix the production code path. Keep the fix minimal and on the canonical
  Foundation architecture (AGENTS.md); never resurrect legacy routes.
- STALE CONTRACT or TEST DEFECT: change the test only when the audit proved it, and state the
  proof in your rationale. Never delete, skip or loosen an assertion that exposes a real defect.
- ENVIRONMENT: make the code work under both the tsx/node:test runner and the production build.
- Unknown or unverified data must reduce scope, never manufacture precision (doctrine).
Then explain: root cause, what changed, why it is correct, and residual risk.
{extra}"""

CODE_ACCEPTANCE = ("The repository's own tests in test_command pass on the exact commit plus this change; "
                   "no assertion was weakened without proof from the audit; the change is minimal and "
                   "consistent with AGENTS.md and the Foundation release doctrine.")

DOCTRINE = ["AGENTS.md"]


def audit(tid, role, title, scope, evidence, context, weight=3, extra="", depends_on=()):
    return {
        "id": tid, "role": role, "title": title, "kind": "text", "weight": weight,
        "depends_on": list(depends_on),
        "instructions": AUDIT_INSTRUCTIONS.format(role=role, scope=scope, extra=extra),
        "acceptance": AUDIT_ACCEPTANCE,
        "evidence_command": evidence,
        "context_files": list(context),
        "allow_patterns": AUDIT_ALLOW,
    }


def code(tid, title, scope, depends_on, test_command, context, weight=6, extra=""):
    return {
        "id": tid, "role": "Code Agent", "title": title, "kind": "code", "weight": weight,
        "depends_on": list(depends_on),
        "instructions": CODE_INSTRUCTIONS.format(scope=scope, extra=extra),
        "acceptance": CODE_ACCEPTANCE,
        "test_command": test_command,
        "context_files": list(context),
        "allow_patterns": CODE_ALLOW,
    }


TASKS: list[dict] = []
add = TASKS.append

# --------------------------------------------------------------- Calculation Agents
CAL = "Calculation Agent"
add(audit("cal-planets", CAL, "Planetary longitude evidence",
          "planetary longitudes and their independent-verification evidence matrix",
          T("tests/astrology-independent-verification.test.ts", "tests/astrology-planetary-evidence-matrix.test.ts",
            "tests/astrology-planetary-candidates.test.ts", "tests/astrology-evidence-matrix.test.ts",
            "packages/astrology/__tests__/astrology-evidence.test.ts"),
          ["tests/astrology-independent-verification.test.ts", "tests/astrology-planetary-evidence-matrix.test.ts",
           "governance/release-audits/PLANETARY-LONGITUDE-VERIFICATION-RECEIPT-v1.md"]))
add(audit("cal-ascendant", CAL, "Ascendant and angle accuracy",
          "Ascendant, polar-latitude angles and retry behaviour",
          T("tests/ascendant-verification.test.ts", "tests/ascendant-retry-contract.test.ts",
            "tests/polar-angle-accuracy.test.ts"),
          ["tests/ascendant-verification.test.ts", "tests/polar-angle-accuracy.test.ts",
           "server/services/ascendant-verification.ts",
           "governance/release-audits/ASCENDANT-VERIFICATION-RECEIPT-v1.md"]))
add(audit("cal-houses", CAL, "Houses and Midheaven",
          "equal-house cusps, Midheaven and house production policy",
          T("tests/house-evidence.test.ts", "tests/house-production.test.ts"),
          ["tests/house-evidence.test.ts", "tests/house-production.test.ts", "server/services/house-verification.ts",
           "governance/release-audits/EQUAL-HOUSE-PRODUCTION-VERIFICATION-RECEIPT-v1.md"]))
add(audit("cal-nodes-chiron", CAL, "Lunar nodes and Chiron",
          "mean lunar nodes and Chiron against JPL Horizons references",
          T("tests/lunar-node-evidence.test.ts", "tests/lunar-node-production.test.ts", "tests/chiron-production.test.ts",
            "tests/chiron-horizons-reference.test.ts", "tests/jpl-horizons-reference.test.ts"),
          ["tests/lunar-node-evidence.test.ts", "tests/chiron-production.test.ts",
           "governance/release-audits/MEAN-NODE-PRODUCTION-VERIFICATION-RECEIPT-v1.md",
           "governance/release-audits/CHIRON-PRODUCTION-VERIFICATION-RECEIPT-v1.md"]))
add(audit("cal-tolerance", CAL, "Tolerance policy, aspects and engine compatibility",
          "astrology tolerance policy, production verification, aspect engine and astronomy-engine loading",
          T("tests/astrology-tolerance-policy.test.ts", "tests/astrology-production-verification.test.ts",
            "tests/astronomy-engine-compat.test.ts", "tests/aspect-engine.test.ts"),
          ["tests/astrology-tolerance-policy.test.ts", "tests/astronomy-engine-compat.test.ts",
           "server/services/astronomy-engine-compat.ts"]))
add(audit("cal-numerology", CAL, "Numerology",
          "numerology (full birth name, personal year, date-only numbers, evidence ledger)",
          T("tests/server-full-birth-name-numerology-contract.test.ts",
            "tests/foundation-canonical-personal-year-contract.test.ts", "packages/core/__tests__/personal-numbers.test.ts",
            "packages/core/__tests__/numerology-date-only.test.ts", "server/__tests__/numerology-core-contract.test.ts",
            "packages/core/evidence-ledger/__tests__/numerology-evidence.test.ts"),
          ["tests/server-full-birth-name-numerology-contract.test.ts", "packages/core/__tests__/numerology-date-only.test.ts",
           "numerology.ts"]))
add(audit("cal-human-design", CAL, "Human Design mechanics vs independent verifier",
          "Human Design gates, lines, channels, centers, type and authority - including the 20-profile "
          "differential audit against the pinned independent verifier free-human-design@1.0.1",
          T("tests/human-design-differential-contract.test.ts", "tests/human-design-complete-input-matrix.test.ts",
            "tests/server-profile-human-design-parity.test.ts", "packages/astrology/__tests__/human-design-phase3.test.ts")
          + " ; node --import tsx scripts/audit-human-design-differential.ts hd-differential-receipt.json",
          ["scripts/audit-human-design-differential.ts", "tests/human-design-differential-contract.test.ts",
           "governance/release-audits/HUMAN-DESIGN-CORE-VERIFICATION-RECEIPT-v1.md"],
          weight=5,
          extra="Report every agreement ratio from the differential audit exactly, list which profiles "
                "disagree on authority, profile, centers or channels, and decide whether each "
                "disagreement is an engine defect or a verifier difference - with evidence."))
add(audit("cal-offline-astronomy", CAL, "Offline and local astronomy (failing on HEAD)",
          "the offline/local Sun, offline codex generator and birth-date exploration - these four files "
          "FAIL on the base commit",
          T("tests/offline-ephemeris-accuracy.test.ts", "tests/foundation-local-astronomy-boundary.test.ts",
            "packages/core/offline-codex/__tests__/offline-codex.test.ts", "tests/birth-date-exploration.test.ts",
            "tests/astronomy-engine-compat.test.ts")
          + " ; node --import tsx -e \"import('./packages/core/index.ts').then(m => console.log('resolveOfflineSun probe:', "
            "JSON.stringify(m.resolveOfflineSun('1990-09-17', '11:11', 'America/New_York'))))\""
          + " ; node --import tsx -e \"import * as A from 'astronomy-engine'; console.log('tsx namespace keys:', "
            "Object.keys(A).length, 'SunPosition:', typeof A.SunPosition, 'default.SunPosition:', typeof A.default?.SunPosition)\"",
          ["packages/core/compute/offline-sun.ts", "server/services/astronomy-engine-compat.ts",
           "tests/offline-ephemeris-accuracy.test.ts", "tests/foundation-local-astronomy-boundary.test.ts",
           "tests/birth-date-exploration.test.ts", "client/src/lib/birthDateExploration.ts",
           "packages/core/offline-codex/__tests__/offline-codex.test.ts"],
          weight=6,
          extra="Determine whether the failures share one root cause. The evidence includes a direct probe of "
                "resolveOfflineSun and of how astronomy-engine loads under tsx; the repository already has an "
                "adapter for this loading problem (server/services/astronomy-engine-compat.ts). State whether "
                "the production Vite build is affected, and if the evidence cannot show it, say BLOCKED for "
                "that question."))

# --------------------------------------------------------------- Corpus Agents
COR = "Corpus Agent"
add(audit("cor-verified-corpus", COR, "Verified differentiation corpus construction",
          "how the 96-profile verified differentiation corpus is generated and whether its variation is "
          "realistic enough for its metrics to mean anything",
          T("tests/verified-profile-differentiation-corpus.test.ts"),
          ["tests/fixtures/verified-differentiation-corpus.ts", "tests/verified-profile-differentiation-corpus.test.ts",
           "scripts/audit-verified-profile-differentiation.ts"],
          extra="Pay attention to fixed values in makeChart (for example the Sun sign) and to index arithmetic "
                "that could correlate placements; say what the corpus can and cannot prove."))
add(audit("cor-golden-fixtures", COR, "Golden regression fixtures and provenance",
          "golden regression fixtures, their provenance metadata and the claims in REGRESSION_REPORT.md",
          T("packages/core/regression-fixtures/__tests__/regression-fixtures.test.ts",
            "packages/core/regression-fixtures/__tests__/engine-integration.test.ts"),
          ["packages/core/regression-fixtures/fixtures.ts", "packages/core/regression-fixtures/PROVENANCE.md",
           "packages/core/regression-fixtures/REGRESSION_REPORT.md", "packages/core/regression-fixtures/provenance.ts"],
          extra="Flag any document wording that promotes regression consistency into historical verification."))
add(audit("cor-named-goldens", COR, "Named golden charts (golden validator failing on HEAD)",
          "named golden charts: Robert Gonzalez regression, Bobby big-three golden, and the strict golden "
          "astrology fixture validator - which FAILS on the base commit (Carl Jung Moon 12.42 degrees off)",
          T("packages/core/__tests__/robert-gonzalez.regression.test.ts", "tests/bobby-big-three-golden.test.ts")
          + " ; node --import tsx scripts/validate-astrology-fixtures.ts",
          ["scripts/validate-astrology-fixtures.ts", "tests/golden/astrology-fixtures.json",
           "packages/core/__tests__/robert-gonzalez.regression.test.ts", "tests/bobby-big-three-golden.test.ts"],
          weight=5,
          extra="The Moon moves about 0.55 degrees per hour, so a 12.42 degree error is roughly 22 hours. Work out "
                "from the fixture and the validator code whether the fixture's date, time or zone handling "
                "(including pre-standard local mean time) or the engine is wrong. You cannot consult outside "
                "sources: if the evidence cannot settle it, say BLOCKED and state the authoritative datum needed."))
add(audit("cor-daily-corpus", COR, "Daily guidance corpus",
          "daily guidance differentiation corpus, daily context authority and insight eligibility",
          T("tests/daily-guidance-differentiation-corpus.test.ts", "tests/daily-context-authority.test.ts",
            "tests/daily-insight-system-eligibility.test.ts"),
          ["tests/daily-guidance-differentiation-corpus.test.ts", "tests/daily-context-authority.test.ts"]))
add(audit("cor-cross-engine", COR, "Cross-engine validation and data integrity",
          "cross-engine validation, phase-1 data integrity and accuracy reconciliation",
          T("packages/core/cross-engine-validation/__tests__/cross-engine-validation.test.ts",
            "packages/core/__tests__/phase-1-data-integrity.test.ts", "tests/accuracy-reconciliation-v2.test.ts"),
          ["packages/core/cross-engine-validation/__tests__/cross-engine-validation.test.ts",
           "tests/accuracy-reconciliation-v2.test.ts"]))

# --------------------------------------------------------------- Interpretation Agents
INT = "Interpretation Agent"
add(audit("int-depth-core", INT, "Depth interpretation core",
          "the core depth-interpretation package: quality scoring, synthesis and quality regression",
          T("packages/core/depth-interpretation/__tests__/quality.test.ts",
            "packages/core/depth-interpretation/__tests__/depth-interpretation.test.ts",
            "packages/core/depth-interpretation/__tests__/synthesize.test.ts",
            "packages/core/depth-interpretation/__tests__/quality-regression.test.ts"),
          ["packages/core/depth-interpretation/SYNTHESIS.md", "packages/core/depth-interpretation/synthesis-types.ts",
           "packages/core/depth-interpretation/__tests__/quality-regression.test.ts"]))
add(audit("int-diamond", INT, "Diamond depth engine and experience architecture",
          "diamond depth engine and experience architecture",
          T("tests/diamond-depth-engine.test.ts", "tests/diamond-experience-architecture.test.ts"),
          ["tests/diamond-depth-engine.test.ts", "tests/diamond-experience-architecture.test.ts"]))
add(audit("int-synthesis-policy", INT, "Ultimate synthesis and system policy",
          "ultimate codex synthesis and the primary synthesis system policy",
          T("tests/ultimate-codex-synthesis.test.ts", "tests/primary-synthesis-system-policy.test.ts"),
          ["tests/ultimate-codex-synthesis.test.ts", "tests/primary-synthesis-system-policy.test.ts",
           "client/src/lib/ultimateCodexSynthesis.ts"]))
add(audit("int-clarity-evidence", INT, "Clarity reading model evidence (failing on HEAD)",
          "evidence admission into the clarity reading model - FAILS on the base commit (midheaven)",
          T("tests/clarity-reading-model-evidence.test.ts"),
          ["tests/clarity-reading-model-evidence.test.ts", "client/src/lib/clarityReadingModel.ts"] + DOCTRINE))
add(audit("int-hd-surfaces", INT, "Human Design lived-behaviour surfaces (failing on HEAD)",
          "Human Design specialty surfaces and how they describe limits - FAILS on the base commit",
          T("tests/human-depth-specialty-surfaces.test.ts"),
          ["tests/human-depth-specialty-surfaces.test.ts", "packages/core/codex30/systems/humanDesign.ts",
           "client/src/lib/soul-codex/utils/cleanCodexLine.ts"] + DOCTRINE))
add(audit("int-behavioral", INT, "Behavioural evidence and resynthesis",
          "behavioural evidence admission, personality-assessment resynthesis and the reflection lens",
          T("tests/soul-profile-behavioral-evidence-contract.test.ts",
            "tests/personality-assessment-resynthesis-contract.test.ts", "tests/reflection-lens.test.ts"),
          ["tests/soul-profile-behavioral-evidence-contract.test.ts",
           "tests/personality-assessment-resynthesis-contract.test.ts"]))
add(audit("int-soul-guide", INT, "Soul Guide and v1 engine explanations",
          "Soul Guide depth view model and the soulcodex-v1 engine and explanation library",
          T("packages/core/soul-guide/__tests__/soul-guide.test.ts", "packages/core/soul-guide/__tests__/depth-view-model.test.ts",
            "packages/core/soul-guide/__tests__/depth-ui-source-contract.test.ts",
            "packages/core/soul-guide/__tests__/depth-soul-guide.test.ts", "packages/core/soulcodex-v1/__tests__/engine.test.ts",
            "packages/core/soulcodex-v1/__tests__/explanation-library.test.ts", "packages/core/soulcodex-v1/tests/canonical.test.ts"),
          ["packages/core/soul-guide/__tests__/depth-soul-guide.test.ts",
           "packages/core/soulcodex-v1/__tests__/explanation-library.test.ts"]))
add(audit("int-natal-report", INT, "Natal report Human Design exposure (failing on HEAD)",
          "the natal report contract and Human Design display/summary - natal-report-contract FAILS on the "
          "base commit (3 assertions, including a ReferenceError inside the test)",
          T("tests/natal-report-contract.test.ts", "tests/human-design-display-contract.test.ts",
            "tests/profile-human-design-summary-contract.test.ts"),
          ["tests/natal-report-contract.test.ts", "server/lib/natal-report-contract.ts",
           "client/src/components/NatalReportDownloadButton.tsx"] + DOCTRINE, weight=4))
add(audit("int-vocabulary", INT, "Symbolic vocabulary, labels and fallbacks",
          "canonical symbolic vocabulary, profile label explanations, aspect interpretation and symbolic fallbacks",
          T("tests/canonical-symbolic-vocabulary-contract.test.ts", "tests/profile-label-explanation.test.ts",
            "tests/aspect-interpretation-fallback-contract.test.ts", "tests/server-symbolic-fallback.test.ts"),
          ["tests/canonical-symbolic-vocabulary-contract.test.ts", "tests/aspect-interpretation-fallback-contract.test.ts"]))
add(audit("int-timeline", INT, "Timeline, transits and pattern engine",
          "timeline, timeline intelligence, today card, transit notification authority and the pattern engine",
          T("packages/core/timeline/__tests__/timeline.test.ts",
            "packages/core/timeline-intelligence/__tests__/timeline-intelligence.test.ts",
            "tests/timeline-today-card.test.ts", "tests/transit-notification-authority.test.ts",
            "packages/core/pattern-engine/__tests__/pattern-engine.test.ts"),
          ["tests/transit-notification-authority.test.ts", "tests/timeline-today-card.test.ts"]))

# --------------------------------------------------------------- Similarity Agents
SIM = "Similarity Agent"
add(audit("sim-verified-metrics", SIM, "Verified-profile differentiation metrics (96 profiles)",
          "the 96-profile verified differentiation audit and its release-gate thresholds",
          "node --import tsx scripts/audit-verified-profile-differentiation.ts verified-differentiation-receipt.json",
          ["scripts/audit-verified-profile-differentiation.ts", "tests/fixtures/verified-differentiation-corpus.ts",
           "governance/release-audits/SYNTHESIS-DIFFERENTIATION-VERIFICATION-RECEIPT-v1.md"],
          weight=4,
          extra="Compare every metric to its threshold in the script, report the margin, and name the most "
                "similar pairs as the places template leakage is most likely."))
add(audit("sim-profile-metrics", SIM, "Profile differentiation audit (failing on HEAD)",
          "the profile differentiation audit - it EXITS NON-ZERO on the base commit",
          "node --import tsx scripts/audit-profile-differentiation.ts profile-differentiation-receipt.json",
          ["scripts/audit-profile-differentiation.ts"], weight=5,
          extra="Explain exactly which threshold(s) fail and by how much, what 'action-lacks-observable-verb' "
                "measures, and which generator code produces the failing text."))
add(audit("sim-depth-nonrepetition", SIM, "Depth reading non-repetition (failing on HEAD)",
          "depth reading non-repetition - the contract FAILS on the base commit",
          T("tests/depth-reading-nonrepetition-contract.test.ts"),
          ["tests/depth-reading-nonrepetition-contract.test.ts", "client/src/lib/depthEngine.ts"]))
add(audit("sim-structure", SIM, "AI structure repetition and reading calibration",
          "AI output structure repetition and reading quality calibration",
          T("tests/ai-structure-repetition.test.ts", "tests/reading-quality-calibration-contract.test.ts"),
          ["tests/ai-structure-repetition.test.ts", "tests/reading-quality-calibration-contract.test.ts"]))
add(audit("sim-reconciliation", SIM, "Verified differentiation and reconciliation contracts",
          "verified profile differentiation and verification reconciliation contracts",
          T("tests/verified-profile-differentiation.test.ts", "tests/profile-verification-reconciliation.test.ts"),
          ["tests/verified-profile-differentiation.test.ts", "tests/profile-verification-reconciliation.test.ts"]))

# --------------------------------------------------------------- Adversarial Agents
ADV = "Adversarial Agent"
add(audit("adv-unknown-time", ADV, "Unknown birth time (failing on HEAD)",
          "unknown-birth-time handling end to end - permanent-uncertainty-contract FAILS on the base commit",
          T("tests/permanent-uncertainty-contract.test.ts", "tests/unknown-time-input-contract.test.ts",
            "tests/unknown-time-evidence-ui-contract.test.ts"),
          ["tests/permanent-uncertainty-contract.test.ts", "server/services/unknown-time-range.ts",
           "server/routes/profile-verification.ts", "governance/ADRs/ADR-002-Uncertainty-Is-A-First-Class-State.md"]
          + DOCTRINE, weight=5,
          extra="Decide for each failing assertion whether the product fabricates certainty (e.g. a default "
                "birthplace) or the contract text is stale."))
add(audit("adv-certainty", ADV, "Uncertainty model and provider certainty",
          "the uncertainty evidence model, local provider certainty and deterministic fallbacks",
          T("tests/uncertainty-evidence-model.test.ts", "tests/local-astro-provider-certainty.test.ts",
            "tests/deterministic-fallback-evidence-contract.test.ts"),
          ["tests/uncertainty-evidence-model.test.ts", "tests/deterministic-fallback-evidence-contract.test.ts"]))
add(audit("adv-verification-truth", ADV, "Verification failure truth",
          "verification failure handling, verification boundaries and stored-profile verification",
          T("tests/local-first-verification-failure-truth.test.ts", "tests/profile-verification-boundary.test.ts",
            "tests/known-time-profile-verification-http.test.ts", "tests/stored-profile-system-verification.test.ts"),
          ["tests/local-first-verification-failure-truth.test.ts", "tests/profile-verification-boundary.test.ts"]))
add(audit("adv-location", ADV, "Location and timezone substitution (failing on HEAD)",
          "birthplace and timezone resolution - location-resolution-contract FAILS on the base commit",
          T("tests/location-resolution-contract.test.ts", "tests/synastry-input-validation.test.ts"),
          ["tests/location-resolution-contract.test.ts", "client/src/pages/local-first-input-form.tsx",
           "server/routes/location-resolution.ts"] + DOCTRINE, weight=4))
add(audit("adv-injection", ADV, "Prompt sanitisation and trust boundaries",
          "prompt sanitisation and the galactic-code trust boundary",
          T("tests/prompt-sanitization-evidence-contract.test.ts", "tests/galactic-code-trust-boundary.test.ts",
            "server/services/galactic-code/__tests__/galactic-code.test.ts"),
          ["tests/prompt-sanitization-evidence-contract.test.ts", "tests/galactic-code-trust-boundary.test.ts"]))
add(audit("adv-simulated", ADV, "Simulated release surfaces",
          "simulated release routes, consumer truth UI, product promise coverage and UI/backend consistency",
          T("tests/no-simulated-release-routes.test.ts", "tests/consumer-truth-ui.test.ts",
            "tests/product-promise-coverage.test.ts", "tests/ui-backend-consistency-contract.test.ts"),
          ["tests/no-simulated-release-routes.test.ts", "tests/product-promise-coverage.test.ts"] + DOCTRINE))
add(audit("adv-compatibility", ADV, "Compatibility evidence boundary",
          "compatibility evidence authority and boundary (Human Design must stay excluded per doctrine)",
          T("tests/compatibility-evidence-boundary.test.ts", "tests/compatibility-evidence-authority.test.ts",
            "tests/compatibility-profile-contract.test.ts", "tests/compatibility-data-minimization.test.ts"),
          ["tests/compatibility-evidence-boundary.test.ts", "tests/compatibility-evidence-authority.test.ts"]
          + DOCTRINE))

# --------------------------------------------------------------- Privacy / App Store Agents
PRI = "Privacy/App Store Agent"
add(audit("pri-local-first", PRI, "Local-first privacy",
          "local-first privacy, on-device truth invariants, lazy chart loading and local deletion",
          T("tests/local-first-privacy-contract.test.ts", "tests/foundation-local-truth-invariants.test.ts",
            "tests/offline-profile-lazy-chart-contract.test.ts", "tests/account-deletion-local-cleanup-truth.test.ts"),
          ["tests/local-first-privacy-contract.test.ts", "tests/foundation-local-truth-invariants.test.ts"]))
add(audit("pri-sharing", PRI, "Public sharing privacy",
          "public profile sharing, projection, share deletion and public API error privacy",
          T("tests/privacy-public-share-truth.test.ts", "tests/public-profile-projection.test.ts",
            "tests/storage-public-share-deletion.test.ts", "tests/share-privacy-accessibility-contract.test.ts",
            "tests/public-api-error-privacy.test.ts"),
          ["tests/privacy-public-share-truth.test.ts", "server/lib/public-profile-projection.ts"]))
add(audit("pri-billing", PRI, "Billing boundary",
          "the hosted billing boundary - no raw card data, signature-verified entitlement",
          T("tests/auth-billing-privacy-contract.test.ts", "tests/billing-retention-privacy-contract.test.ts",
            "tests/billing-security.test.ts", "tests/canonical-billing-path-contract.test.ts",
            "tests/web-checkout-pricing-contract.test.ts", "tests/native-billing-server-verification-contract.test.ts"),
          ["tests/billing-security.test.ts", "tests/canonical-billing-path-contract.test.ts"] + DOCTRINE))
add(audit("pri-store", PRI, "Store disclosures",
          "store privacy/billing disclosures, release-candidate and catalog handoff contracts (submission "
          "itself is owner-deferred per AGENTS.md: audit only)",
          T("tests/store-privacy-billing-disclosure-contract.test.ts", "tests/store-release-candidate-contract.test.ts",
            "tests/store-catalog-handoff-contract.test.ts"),
          ["tests/store-privacy-billing-disclosure-contract.test.ts", "tests/store-release-candidate-contract.test.ts"]))

# --------------------------------------------------------------- CI Surgeon (from AGENTS.md roles)
COVERAGE_CMD = (
    "for f in $(ls tests/*.test.ts; find packages server -name '*.test.ts' -not -path '*/node_modules/*'); do "
    "b=$(basename $f); if grep -q \"$b\" .github/workflows/*.yml; then echo \"COVERED $f\"; else echo \"UNCOVERED $f\"; fi; "
    "done | sort | awk '{print} /^COVERED/{c++} /^UNCOVERED/{u++} END{print \"covered=\" c \" uncovered=\" u}'; "
    "echo '--- vitest imports with no vitest dependency:'; grep -rl --include=*.ts \"from ['\\\"]vitest['\\\"]\" tests server packages "
    "| grep -v node_modules; grep -c '\"vitest\"' package.json || true; "
    "echo '--- workflow files referenced in AGENTS.md:'; grep -o '\\.github/workflows/[a-z0-9._-]*' AGENTS.md | sort -u | "
    "while read w; do [ -f \"$w\" ] && echo \"exists $w\" || echo \"MISSING $w\"; done"
)
add(audit("ci-coverage", "CI Surgeon", "CI coverage of the test suite",
          "which test files any GitHub workflow actually runs, dead vitest suites, and stale workflow "
          "references in AGENTS.md",
          COVERAGE_CMD, ["AGENTS.md", ".github/workflows/federation-verified-differentiation.yml",
                         ".github/workflows/federation-subsystem-gate.yml"], weight=3,
          extra="Rank the uncovered tests by doctrine risk (truth, privacy, billing, evidence first)."))

# --------------------------------------------------------------- Code Agents
OFFLINE_FILES = ["tests/offline-ephemeris-accuracy.test.ts", "tests/foundation-local-astronomy-boundary.test.ts",
                 "packages/core/offline-codex/__tests__/offline-codex.test.ts", "tests/birth-date-exploration.test.ts"]
add(code("fix-offline-astronomy", "Repair offline/local astronomy",
         "the four failing offline/local astronomy test files (offline Sun, local astronomy boundary, offline "
         "codex generator, birth-date exploration)",
         ["cal-offline-astronomy"],
         T(*OFFLINE_FILES, "tests/astronomy-engine-compat.test.ts", "tests/foundation-local-truth-invariants.test.ts",
           "tests/verified-profile-differentiation.test.ts"),
         ["packages/core/compute/offline-sun.ts", "server/services/astronomy-engine-compat.ts",
          "client/src/lib/birthDateExploration.ts", "tests/offline-ephemeris-accuracy.test.ts",
          "tests/birth-date-exploration.test.ts"], weight=8))
add(code("fix-clarity-evidence", "Repair clarity evidence admission",
         "tests/clarity-reading-model-evidence.test.ts (midheaven evidence does not reach the clarity inspector)",
         ["int-clarity-evidence"], T("tests/clarity-reading-model-evidence.test.ts", "tests/clarity-reading-route-contract.test.ts"),
         ["client/src/lib/clarityReadingModel.ts", "tests/clarity-reading-model-evidence.test.ts"]))
add(code("fix-hd-surfaces", "Repair Human Design limits wording",
         "tests/human-depth-specialty-surfaces.test.ts (Human Design output must explain its limits)",
         ["int-hd-surfaces"], T("tests/human-depth-specialty-surfaces.test.ts"),
         ["packages/core/codex30/systems/humanDesign.ts", "tests/human-depth-specialty-surfaces.test.ts"], weight=4))
add(code("fix-natal-report", "Repair natal report Human Design contract",
         "tests/natal-report-contract.test.ts (3 failing assertions, one a ReferenceError inside the test)",
         ["int-natal-report"], T("tests/natal-report-contract.test.ts", "tests/human-design-display-contract.test.ts"),
         ["tests/natal-report-contract.test.ts", "server/lib/natal-report-contract.ts"]))
add(code("fix-depth-nonrepetition", "Repair depth chapter repetition",
         "tests/depth-reading-nonrepetition-contract.test.ts (depth chapters reopen strength/cost blocks with "
         "the full supplied sentence)",
         ["sim-depth-nonrepetition"], T("tests/depth-reading-nonrepetition-contract.test.ts"),
         ["client/src/lib/depthEngine.ts", "tests/depth-reading-nonrepetition-contract.test.ts"]))
add(code("fix-profile-differentiation", "Repair profile differentiation audit failure",
         "scripts/audit-profile-differentiation.ts exits non-zero: cross-signature similarity and "
         "'action-lacks-observable-verb' quality errors",
         ["sim-profile-metrics"],
         "node --import tsx scripts/audit-profile-differentiation.ts profile-differentiation-receipt.json && "
         + T("tests/verified-profile-differentiation.test.ts", "tests/depth-reading-nonrepetition-contract.test.ts"),
         ["scripts/audit-profile-differentiation.ts"], weight=8,
         extra="Fix the generator, not the thresholds. Lowering a threshold is greenwashing (AGENTS.md: CI Surgeon)."))
add(code("fix-unknown-time", "Repair unknown-time contracts",
         "tests/permanent-uncertainty-contract.test.ts (minute sweeps wording and 'default birthplace')",
         ["adv-unknown-time"], T("tests/permanent-uncertainty-contract.test.ts", "tests/unknown-time-input-contract.test.ts",
                                 "tests/profile-verification-boundary.test.ts"),
         ["server/services/unknown-time-range.ts", "server/routes/profile-verification.ts",
          "tests/permanent-uncertainty-contract.test.ts"], weight=7))
add(code("fix-location", "Repair timezone substitution contract",
         "tests/location-resolution-contract.test.ts (create flow must never substitute the device timezone)",
         ["adv-location"], T("tests/location-resolution-contract.test.ts"),
         ["client/src/pages/local-first-input-form.tsx", "tests/location-resolution-contract.test.ts"]))
add(code("fix-golden-fixture", "Repair golden fixture validation (Carl Jung Moon)",
         "scripts/validate-astrology-fixtures.ts fails: Carl Jung Moon longitude 12.42 degrees beyond the 0.5 degree "
         "tolerance", ["cor-named-goldens"],
         "node --import tsx scripts/validate-astrology-fixtures.ts && "
         + T("tests/bobby-big-three-golden.test.ts", "tests/astrology-independent-verification.test.ts"),
         ["tests/golden/astrology-fixtures.json", "scripts/validate-astrology-fixtures.ts"], weight=5,
         extra="Change a fixture's expected values or birth data only if the audit proved, from evidence, that "
               "the fixture itself is wrong; never widen the tolerance. If the audit is BLOCKED on an external "
               "datum, deliver no workaround - the task should fail honestly."))
add(code("fix-integration-config-test", "Repair broken integration-config test import",
         "tests/integration-config.test.ts imports '../../server/lib/integration-config', which resolves "
         "outside the repository",
         ["ci-coverage"], T("tests/integration-config.test.ts"),
         ["tests/integration-config.test.ts", "server/lib/integration-config.ts"], weight=1))

PORT_RULES = ("Port each file from vitest to node:test + node:assert/strict, the repository's standard runner "
              "(vitest is not a dependency, so these suites have never run in this tree). Preserve every "
              "assertion's meaning one-for-one; replace vi.mock with explicit dependency injection or "
              "module-free checks only where the original intent is preserved. If a faithfully ported "
              "assertion fails, fix the product defect it exposes inside the same files' scope, or report it.")
PORT_GROUPS = {
    "port-vitest-depth": ["tests/codex30-evidence-admission.test.ts", "tests/codex30-synthesis-weighting.test.ts",
                          "tests/depth-engine.test.ts", "tests/human-depth.test.ts"],
    "port-vitest-diamond": ["tests/diamond-clarity-contract.test.ts", "tests/diamond-runtime-firewall.test.ts",
                            "tests/v4-recording-regressions.test.ts", "tests/clarity-reading-route-contract.test.ts"],
    "port-vitest-surfaces": ["tests/human-depth-surfaces.test.ts", "tests/compatibility-claims-contract.test.ts",
                             "server/lib/__tests__/verified-astrology.test.ts"],
}
for tid, files in PORT_GROUPS.items():
    add(code(tid, f"Port dead vitest suites ({tid.split('-')[-1]})", ", ".join(files), ["ci-coverage"], T(*files),
             files, weight=5, extra=PORT_RULES))

DOCS_CHECK = ("node -e \"const fs=require('fs');const t=fs.readFileSync('AGENTS.md','utf8');"
              "const refs=[...new Set(t.match(/\\.github\\/workflows\\/[a-z0-9._-]+/g)||[])];"
              "const missing=refs.filter(r=>!fs.existsSync(r));"
              "if(missing.length){console.error('missing:',missing);process.exit(1)}"
              "console.log('all',refs.length,'workflow references exist')\"")
add(code("fix-agents-doc", "Correct stale workflow references in AGENTS.md",
         "AGENTS.md cites workflow files that do not exist (Docs Curator: stale operational instructions are defects)",
         ["ci-coverage"], DOCS_CHECK, ["AGENTS.md"], weight=1,
         extra="Point each reference at the workflow that really runs those gates, per the ci-coverage audit. "
               "Do not invent workflows."))

# --------------------------------------------------------------- Final Auditor
all_ids = [t["id"] for t in TASKS]
add({
    "id": "final-auditor", "role": "Final Auditor", "title": "Final audit of the Verification Phase",
    # "after", not "depends_on": the Final Auditor must report on failed and blocked work too.
    "kind": "text", "weight": 6, "depends_on": [], "after": all_ids,
    "instructions": (
        "You are the Final Auditor. Every audit and code change of the Verification Phase is in your "
        "dependency outputs; the EVIDENCE block is the full gate run on the base commit. Produce the release "
        "record AGENTS.md requires: 1. Summary - what the federation found and changed, per role. "
        "2. Validation - the exact gates and their real results on the base commit; for changes, only what "
        "the Master Tester actually executed (the integration gate result is recorded separately by Legion). "
        "3. Risk - what could regress. 4. Rollback - how to revert each change safely. 5. Evidence boundary - "
        "what remains unresolved, BLOCKED or deliberately excluded (including the Postgres-only tests and "
        "owner-deferred store submission). Do not promote implementation into validation or validation into "
        "release."),
    "acceptance": ("Every claim traces to a dependency output or the evidence; unresolved items are named, not "
                   "smoothed over; nothing is called released or verified beyond what was executed."),
    "evidence_command": "node federation/legion/gates.mjs --jobs 4",
    "context_files": ["AGENTS.md", "governance/FOUNDATION-WEB-RELEASE-v1.md"],
    "allow_patterns": AUDIT_ALLOW,
})

CONFIG = {
    "goal": ("Soul Codex Verification Phase: audit calculation accuracy, corpus integrity, interpretation "
             "specificity, template leakage, adversarial edge cases and privacy boundaries against the "
             "repository's real gates; repair every failing gate with minimal, doctrine-compliant changes; "
             "and produce an evidence-bounded release record."),
    "workspace_setup": "npm run build:workspaces --silent",
    "final_gate": "node federation/legion/gates.mjs --jobs 4",
    "reviewers": 3,
    "judges": 3,
    "max_review_rounds": 2,
    "max_retrials": 1,
    "pass_threshold": 7.5,
    "test_timeout": 900,
    "evidence_timeout": 1800,
    "dep_context_chars": 160000,
}


def validate() -> list[str]:
    problems = []
    seen = set()
    for t in TASKS:
        if t["id"] in seen:
            problems.append(f"duplicate id {t['id']}")
        seen.add(t["id"])
        for f in t.get("context_files", []):
            if not (ROOT / f).is_file():
                problems.append(f"{t['id']}: context file missing: {f}")
        for cmd in (t.get("evidence_command"), t.get("test_command")):
            if not cmd:
                continue
            for token in cmd.replace(";", " ").replace("&&", " ").split():
                if "*" in token or "$" in token or token.startswith(("'", '"', "(")):
                    continue
                if token.endswith((".test.ts", ".mjs")) or (token.startswith("scripts/") and token.endswith(".ts")):
                    if not (ROOT / token).is_file():
                        problems.append(f"{t['id']}: referenced file missing: {token}")
    owners: dict[str, str] = {}
    for t in TASKS:
        if t["kind"] != "code":
            continue
        for f in t["context_files"]:
            if f.startswith("tests/") or "__tests__" in f:
                if f in owners and owners[f] != t["id"]:
                    problems.append(f"test file {f} owned by both {owners[f]} and {t['id']}")
                owners[f] = t["id"]
    return problems


def render() -> str:
    return json.dumps({"config": CONFIG, "tasks": TASKS}, indent=2) + "\n"


def main() -> int:
    problems = validate()
    if problems:
        print("\n".join(problems), file=sys.stderr)
        return 1
    text = render()
    if "--check" in sys.argv:
        if not OUT.exists() or OUT.read_text() != text:
            print(f"{OUT.relative_to(ROOT)} is out of date; run this script", file=sys.stderr)
            return 1
        print(f"{OUT.relative_to(ROOT)} is up to date ({len(TASKS)} tasks)")
        return 0
    OUT.write_text(text)
    roles: dict[str, int] = {}
    for t in TASKS:
        roles[t["role"]] = roles.get(t["role"], 0) + 1
    print(f"wrote {OUT.relative_to(ROOT)}: {len(TASKS)} tasks - " + ", ".join(f"{r} {n}" for r, n in roles.items()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
