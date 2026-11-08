import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const accessibility = readFileSync(new URL("../.github/workflows/accessibility-device-acceptance-gate.yml", import.meta.url), "utf8");
const security = readFileSync(new URL("../.github/workflows/device-security-data-integrity-gate.yml", import.meta.url), "utf8");
const codebuild = readFileSync(new URL("../scripts/ci/codebuild-core.sh", import.meta.url), "utf8");
const verifier = readFileSync(new URL("../scripts/verify-foundation-codebuild.mjs", import.meta.url), "utf8");

for (const [name, source] of [
  ["accessibility", accessibility],
  ["security", security],
  ["codebuild", codebuild],
] as const) {
  test(`${name} rejects moderate-or-higher production dependency vulnerabilities`, () => {
    assert.match(source, /npm audit --omit=dev --audit-level=moderate/);
    assert.doesNotMatch(source, /npm audit --omit=dev --audit-level=high/);
  });
}

test("CodeBuild invariant audit requires the moderate production threshold", () => {
  assert.match(verifier, /npm audit --omit=dev --audit-level=moderate/);
});
