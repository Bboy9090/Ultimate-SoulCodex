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
  tests/astrology-production-verification.test.ts \
  tests/ascendant-verification.test.ts \
  tests/ascendant-retry-contract.test.ts \
  tests/bobby-big-three-golden.test.ts \
  tests/human-design-trust.test.ts \
  tests/profile-verification-reconciliation.test.ts \
  tests/planetary-verification-contract.test.ts \
  tests/planetary-production-promotion.test.ts \
  tests/active-profile-contract.test.ts \
  tests/ui-backend-consistency-contract.test.ts \
  tests/compatibility-data-minimization.test.ts \
  tests/compatibility-profile-contract.test.ts \
  tests/compatibility-http-integration.test.ts \
  tests/release-identity.test.ts \
  tests/billing-security.test.ts \
  tests/local-first-privacy-contract.test.ts \
  tests/location-resolution-contract.test.ts \
  tests/system-visibility-contract.test.ts \
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
