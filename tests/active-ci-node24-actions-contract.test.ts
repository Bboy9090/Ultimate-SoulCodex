import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const activeWorkflows = [
  ".github/workflows/store-4.0.0-release.yml",
  ".github/workflows/browser-experience-smoke.yml",
  ".github/workflows/navigation-planetary-browser-acceptance.yml",
  ".github/workflows/accessibility-device-acceptance-gate.yml",
  ".github/workflows/device-security-data-integrity-gate.yml",
  ".github/workflows/diamond-way-synthesis-gate.yml",
  ".github/workflows/xcode-cloud-bootstrap-parity.yml",
  ".github/workflows/ios-billing-qualification-parity.yml",
];

test("active qualification workflows avoid Node 20 action majors", () => {
  for (const path of activeWorkflows) {
    const workflow = readFileSync(path, "utf8");
    assert.doesNotMatch(workflow, /actions\/checkout@v4/);
    assert.match(workflow, /actions\/setup-node@v7/);
    assert.doesNotMatch(workflow, /actions\/setup-node@v[45]/);
    assert.doesNotMatch(workflow, /actions\/upload-artifact@v4/);
  }
});
