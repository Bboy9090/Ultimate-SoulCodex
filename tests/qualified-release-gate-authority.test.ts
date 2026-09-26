import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const diamond = readFileSync(
  ".github/workflows/diamond-way-synthesis-gate.yml",
  "utf8",
);
const store = readFileSync(
  ".github/workflows/store-4.0.0-release.yml",
  "utf8",
);
const runner = readFileSync(
  "scripts/ci/qualified-release-gates.sh",
  "utf8",
);

test("Diamond Way and Store Candidate use the same qualified release runner", () => {
  for (const [name, workflow] of [
    ["Diamond Way", diamond],
    ["Store Candidate", store],
  ] as const) {
    assert.match(
      workflow,
      /bash scripts\/ci\/qualified-release-gates\.sh/,
      `${name} must use the canonical qualified release suite`,
    );
  }
});

test("canonical qualified suite includes the high-value cross-domain gates", () => {
  for (const required of [
    "tests/angular-math-invariants.test.ts",
    "tests/numerology-math-invariants.test.ts",
    "tests/strict-civil-time.test.ts",
    "tests/equal-house-geographic-stress.test.ts",
    "tests/verified-profile-differentiation-corpus.test.ts",
    "tests/local-first-privacy-contract.test.ts",
    "tests/share-privacy-contract.test.ts",
    "tests/human-design-differential-contract.test.ts",
    "tests/synastry-input-validation.test.ts",
    "tests/system-registry-contract.test.ts",
    "tests/release-manifest-contract.test.ts",
  ]) {
    assert.match(runner, new RegExp(required.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&")));
  }
});

test("Store Candidate keeps platform release validation after the shared suite", () => {
  const sharedGateIndex = store.indexOf("bash scripts/ci/qualified-release-gates.sh");
  const androidIndex = store.indexOf("npm run mobile:validate:android");
  const iosIndex = store.indexOf("npm run mobile:validate:ios");

  assert.ok(sharedGateIndex >= 0);
  assert.ok(androidIndex > sharedGateIndex);
  assert.ok(iosIndex > sharedGateIndex);
});

test("Diamond Way keeps synthesis-specific fallback checks before the shared suite", () => {
  const fallbackIndex = diamond.indexOf("Reject hidden identity fallbacks");
  const sharedGateIndex = diamond.indexOf("bash scripts/ci/qualified-release-gates.sh");

  assert.ok(fallbackIndex >= 0);
  assert.ok(sharedGateIndex > fallbackIndex);
});
