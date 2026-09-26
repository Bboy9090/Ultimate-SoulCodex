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

bash scripts/ci/qualified-release-gates.sh

node --import tsx --test \
  server/tests/gate1-foundation.test.ts \
  server/services/galactic-code/__tests__/galactic-code.test.ts \
  packages/astrology/__tests__/astrology-evidence.test.ts \
  tests/astrology-candidate.test.ts \
  tests/astrology-independent-verification.test.ts \
  tests/astrology-tolerance-policy.test.ts \
  tests/angular-authority-contract.test.ts \
  tests/astrology-sign-boundary-verification.test.ts \
  tests/aspect-policy-authority.test.ts \
  tests/offline-ephemeris-accuracy.test.ts \
  tests/civil-time-authority-contract.test.ts \
  tests/zoned-instant.test.ts \
  tests/daily-guidance-authority.test.ts \
  tests/profile-narrative-authority.test.ts \
  tests/verified-synthesis-contract-authority.test.ts \
  packages/astrology/__tests__/human-design-phase3.test.ts \
  tests/active-profile-contract.test.ts \
  tests/ui-backend-consistency-contract.test.ts \
  tests/offline-profile-hd-verification-ui.test.ts \
  tests/technical-appendix-truth.test.ts \
  tests/systems-details-registry-ui.test.ts \
  tests/evidence-drawer-language.test.ts \
  tests/evidence-status-labels.test.ts \
  tests/codex-header-evidence-language.test.ts \
  tests/codex-header-generated-at.test.ts \
  tests/release-identity.test.ts \
  tests/billing-security.test.ts \
  tests/system-visibility-contract.test.ts \
  tests/verified-profile-differentiation-corpus.test.ts \
  tests/daily-template-system-mix.test.ts \
  tests/verified-system-method-summary.test.ts \
  tests/share-privacy-contract.test.ts \
  tests/synastry-input-validation.test.ts \
  tests/assessment-source-boundary.test.ts \
  tests/assessment-interpretation-boundary.test.ts \
  tests/readme-system-truth.test.ts \
  tests/changelog-current-truth.test.ts \
  tests/canonical-doctrine-contract.test.ts \
  tests/server-profile-ownership.test.ts \
  tests/natal-report-contract.test.ts \
  tests/pdf-production-path-contract.test.ts \
  tests/codex-tools-production-contract.test.ts \
  tests/active-consumer-auth.test.ts \
  tests/native-api-routing.test.ts \
  tests/unknown-time-input-contract.test.ts \
  tests/foundation-local-astronomy-boundary.test.ts \
  tests/profile-verification-boundary.test.ts \
  tests/no-simulated-release-routes.test.ts

node scripts/verify-foundation-codebuild.mjs
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
npm run build

test -d dist/public
test -f dist/index.js
printf 'PASS\n' > evidence/codebuild/core-ci-result.txt
