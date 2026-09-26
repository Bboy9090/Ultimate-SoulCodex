import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
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


test("every required manifest route is mounted in the live router", () => {
  for (const route of V4_RELEASE_MANIFEST.requiredRoutes) {
    const escaped = route
      .replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&")
      .replace(/:id/g, "[^/]+");
    const matcher = new RegExp(`path=["']${escaped}["']`);
    assert.match(app, matcher, route);
  }
});

test("legal, support, and deletion surfaces are release-critical", () => {
  for (const route of [
    "/privacy",
    "/terms",
    "/support",
    "/delete-account",
  ] as const) {
    assert.ok(
      V4_RELEASE_MANIFEST.requiredRoutes.includes(route),
      route,
    );
  }
  assert.ok(
    V4_RELEASE_MANIFEST.requiredTrustRules.includes(
      "legal-support-and-deletion-routes-remain-mounted",
    ),
  );
});


test("every required workflow name belongs to an active GitHub workflow", () => {
  const activeWorkflowNames = new Set(
    readdirSync(".github/workflows")
      .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
      .map((file) => readFileSync(`.github/workflows/${file}`, "utf8"))
      .map((source) => source.match(/^name:\s*(.+)$/m)?.[1]?.trim())
      .filter((name): name is string => Boolean(name)),
  );

  for (const workflow of V4_RELEASE_MANIFEST.requiredWorkflows) {
    assert.ok(
      activeWorkflowNames.has(workflow),
      `required release workflow is not active: ${workflow}`,
    );
  }
});

test("archived workflow names cannot remain release requirements", () => {
  for (const archived of [
    "Ultimate SoulCodex CI",
    "CI Tests",
    "Foundation Doctrine Gate",
    "Dependency Security Audit",
    "Railway Container Smoke",
    "Live Ephemeris Evidence",
  ]) {
    assert.equal(
      V4_RELEASE_MANIFEST.requiredWorkflows.includes(archived as never),
      false,
      archived,
    );
  }
});


test("release trust contract requires a high-severity runtime dependency audit", () => {
  assert.ok(
    V4_RELEASE_MANIFEST.requiredTrustRules.includes(
      "runtime-dependencies-pass-high-severity-audit",
    ),
  );
});


test("pricing and billing trust are release-critical", () => {
  assert.ok(V4_RELEASE_MANIFEST.requiredRoutes.includes("/pricing"));
  assert.ok(
    V4_RELEASE_MANIFEST.requiredJourney.includes(
      "inspect-pricing-before-purchase",
    ),
  );
  assert.ok(
    V4_RELEASE_MANIFEST.requiredTrustRules.includes(
      "checkout-never-collects-raw-card-data",
    ),
  );
  assert.ok(
    V4_RELEASE_MANIFEST.requiredTrustRules.includes(
      "premium-entitlement-requires-persistent-server-state",
    ),
  );
});
