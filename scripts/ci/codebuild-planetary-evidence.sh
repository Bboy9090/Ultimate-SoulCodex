#!/usr/bin/env bash
set -euo pipefail

mkdir -p evidence/planetary evidence/codebuild
ACTUAL_SHA="$(git rev-parse HEAD)"
printf '%s\n' "$ACTUAL_SHA" | tee evidence/codebuild/planetary-source-sha.txt

if [[ -n "${CODEBUILD_RESOLVED_SOURCE_VERSION:-}" && "${CODEBUILD_RESOLVED_SOURCE_VERSION}" =~ ^[0-9a-f]{40}$ ]]; then
  test "$ACTUAL_SHA" = "$CODEBUILD_RESOLVED_SOURCE_VERSION"
fi

# Evidence must be regenerated whenever any of these implementation surfaces change.
SOURCE_CONTRACT=(
  "server/services/astronomy-engine-compat.ts"
  "server/services/planetary-verification.ts"
  "server/services/jpl-horizons-reference.ts"
  "server/services/planetary-evidence-matrix.ts"
  "server/services/planetary-tolerance-policy.ts"
  "scripts/run-live-planetary-evidence.ts"
)
printf '%s\n' "${SOURCE_CONTRACT[@]}" > evidence/codebuild/planetary-source-contract.txt

npm ci
node --import tsx --test tests/planetary-verification-contract.test.ts
npx tsx scripts/run-live-planetary-evidence.ts

test -s evidence/planetary/planetary-ephemeris-evidence.json
sha256sum evidence/planetary/planetary-ephemeris-evidence.json | tee evidence/planetary/planetary-ephemeris-evidence.sha256
printf 'PASS\n' > evidence/codebuild/planetary-evidence-result.txt
