#!/usr/bin/env bash
set -euo pipefail

mkdir -p evidence/codebuild
ACTUAL_SHA="$(git rev-parse HEAD)"
printf '%s\n' "$ACTUAL_SHA" | tee evidence/codebuild/source-sha.txt

if [[ -n "${CODEBUILD_RESOLVED_SOURCE_VERSION:-}" && "${CODEBUILD_RESOLVED_SOURCE_VERSION}" =~ ^[0-9a-f]{40}$ ]]; then
  test "$ACTUAL_SHA" = "$CODEBUILD_RESOLVED_SOURCE_VERSION"
fi

trap 'npm audit --json > evidence/codebuild/npm-audit.json || true' EXIT

npm ci
npm run build:workspaces
npm run check:workspaces
npm run check
npm test

node --import tsx --test \
  server/tests/gate1-foundation.test.ts \
  server/services/galactic-code/__tests__/galactic-code.test.ts \
  packages/astrology/__tests__/astrology-evidence.test.ts \
  tests/astrology-candidate.test.ts \
  tests/astrology-independent-verification.test.ts \
  tests/jpl-horizons-reference.test.ts \
  tests/astrology-evidence-matrix.test.ts \
  tests/astrology-tolerance-policy.test.ts \
  tests/angular-math.test.ts \
  tests/angular-authority-contract.test.ts \
  tests/astrology-sign-boundary-verification.test.ts \
  tests/planetary-boundary-integrity.test.ts \
  tests/aspect-engine.test.ts \
  tests/astrology-production-verification.test.ts \
  tests/offline-ephemeris-accuracy.test.ts \
  tests/strict-civil-time.test.ts \
  tests/civil-time-authority-contract.test.ts \
  tests/zoned-instant.test.ts \
  tests/timeline-cycle-reduction.test.ts \
  tests/numerology-cycle-authority-contract.test.ts \
  tests/daily-template-system-mix.test.ts \
  tests/daily-guidance-authority.test.ts \
  tests/ascendant-verification.test.ts \
  tests/ascendant-retry-contract.test.ts \
  tests/house-production.test.ts \
  tests/equal-house-math-invariants.test.ts \
  tests/equal-house-geographic-stress.test.ts \
  tests/lunar-node-production.test.ts \
  tests/lunar-node-math-invariants.test.ts \
  tests/chiron-production.test.ts \
  tests/bobby-big-three-golden.test.ts \
  tests/human-design-trust.test.ts \
  tests/human-design-gate-boundaries.test.ts \
  packages/astrology/__tests__/human-design-phase3.test.ts \
  tests/profile-verification-reconciliation.test.ts \
  tests/active-profile-contract.test.ts \
  tests/ui-backend-consistency-contract.test.ts \
  tests/verified-system-method-summary.test.ts \
  tests/verified-systems-panel-contract.test.ts \
  tests/technical-appendix-truth.test.ts \
  tests/systems-details-registry-ui.test.ts \
  tests/evidence-drawer-language.test.ts \
  tests/codex-header-evidence-language.test.ts \
  tests/codex-header-generated-at.test.ts \
  tests/compatibility-data-minimization.test.ts \
  tests/compatibility-profile-contract.test.ts \
  tests/compatibility-http-integration.test.ts \
  tests/synastry-input-validation.test.ts \
  tests/release-identity.test.ts \
  tests/billing-security.test.ts \
  tests/local-first-privacy-contract.test.ts \
  tests/share-privacy-contract.test.ts \
  tests/location-resolution-contract.test.ts \
  tests/geocoding-ambiguity.test.ts \
  tests/birth-location-consistency.test.ts \
  tests/system-visibility-contract.test.ts \
  tests/assessment-source-boundary.test.ts \
  tests/assessment-interpretation-boundary.test.ts \
  tests/readme-system-truth.test.ts \
  tests/changelog-current-truth.test.ts \
  tests/canonical-doctrine-contract.test.ts \
  tests/primary-synthesis-system-policy.test.ts \
  tests/server-profile-ownership.test.ts \
  tests/natal-report-contract.test.ts \
  tests/pdf-production-path-contract.test.ts \
  tests/codex-tools-production-contract.test.ts \
  tests/active-consumer-auth.test.ts \
  tests/native-api-routing.test.ts \
  tests/unknown-time-input-contract.test.ts \
  tests/foundation-local-astronomy-boundary.test.ts \
  tests/profile-verification-boundary.test.ts \
  tests/no-simulated-release-routes.test.ts \
  tests/production-route-quarantine.test.ts \
  tests/generative-evidence-boundary.test.ts \
  tests/profile-birth-date-json.test.ts

node scripts/verify-foundation-codebuild.mjs
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
npm run build

test -d dist/public
test -f dist/index.js
printf 'PASS\n' > evidence/codebuild/core-ci-result.txt
