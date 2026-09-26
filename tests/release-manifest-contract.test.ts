import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  V4_RELEASE_MANIFEST,
  canDeclareV4ReleaseCandidate,
} from "../client/src/lib/v4ReleaseManifest";

const app = readFileSync("client/src/App.tsx", "utf8");

test("release manifest matches the active v4.0.1 foundation line", () => {
  assert.equal(V4_RELEASE_MANIFEST.releaseVersion, "4.0.1");
  assert.equal(V4_RELEASE_MANIFEST.apiContract, "foundation-v4");
  assert.equal(V4_RELEASE_MANIFEST.classification, "release-candidate");
});

test("required transparency routes are both mounted and release-gated", () => {
  for (const route of ["/systems", "/systems/atlas", "/diagnostics"]) {
    assert.ok(
      V4_RELEASE_MANIFEST.requiredRoutes.includes(route as never),
      `${route} missing from release manifest`,
    );
    assert.match(app, new RegExp(`path=["']${route.replace("/", "\\/")}["']`));
  }

  assert.ok(
    V4_RELEASE_MANIFEST.requiredJourney.includes("inspect-system-governance"),
  );
  assert.ok(
    V4_RELEASE_MANIFEST.requiredJourney.includes(
      "explore-astrology-atlas-without-promoting-unverified-data",
    ),
  );
});

test("release trust contract keeps quarantined systems visible but inactive", () => {
  assert.ok(
    V4_RELEASE_MANIFEST.requiredTrustRules.includes(
      "system-governance-stays-inspectable",
    ),
  );
  assert.ok(
    V4_RELEASE_MANIFEST.requiredTrustRules.includes(
      "quarantined-systems-never-masquerade-as-active",
    ),
  );
});

test("release declaration fails closed without backend contract evidence", () => {
  const fullEvidence = {
    successfulWorkflows: V4_RELEASE_MANIFEST.requiredWorkflows,
    mobileVisualReceipt: true,
    offlineVisualReceipt: true,
    deploymentReceipt: true,
    backendContractReceipt: true,
    rollbackProcedure: true,
  } as const;

  assert.equal(canDeclareV4ReleaseCandidate(fullEvidence), true);
  assert.equal(
    canDeclareV4ReleaseCandidate({
      ...fullEvidence,
      backendContractReceipt: false,
    }),
    false,
  );
});

test("release declaration fails closed when any required workflow is absent", () => {
  const missingWorkflow = V4_RELEASE_MANIFEST.requiredWorkflows[0];
  const evidence = {
    successfulWorkflows: V4_RELEASE_MANIFEST.requiredWorkflows.filter(
      (workflow) => workflow !== missingWorkflow,
    ),
    mobileVisualReceipt: true,
    offlineVisualReceipt: true,
    deploymentReceipt: true,
    backendContractReceipt: true,
    rollbackProcedure: true,
  };

  assert.equal(canDeclareV4ReleaseCandidate(evidence), false);
});
