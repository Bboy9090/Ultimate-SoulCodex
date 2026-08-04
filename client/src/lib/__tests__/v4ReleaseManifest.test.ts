import { describe, expect, it } from "vitest";
import { V4_RELEASE_MANIFEST, canDeclareV4ReleaseCandidate } from "../v4ReleaseManifest";

describe("V4 release manifest", () => {
  it("locks all required same-SHA workflows", () => {
    expect(V4_RELEASE_MANIFEST.requiredWorkflows).toEqual([
      "Ultimate SoulCodex CI",
      "CI Tests",
      "Dependency Security Audit",
      "PWA Offline Browser Validation",
      "Railway Container Smoke",
      "Live Ephemeris Evidence",
    ]);
  });

  it("does not declare a release candidate from CI alone", () => {
    expect(
      canDeclareV4ReleaseCandidate({
        successfulWorkflows: V4_RELEASE_MANIFEST.requiredWorkflows,
        mobileVisualReceipt: false,
        offlineVisualReceipt: false,
        deploymentReceipt: false,
        rollbackProcedure: false,
      }),
    ).toBe(false);
  });

  it("requires every workflow and every manual release receipt", () => {
    expect(
      canDeclareV4ReleaseCandidate({
        successfulWorkflows: V4_RELEASE_MANIFEST.requiredWorkflows,
        mobileVisualReceipt: true,
        offlineVisualReceipt: true,
        deploymentReceipt: true,
        rollbackProcedure: true,
      }),
    ).toBe(true);
  });

  it("fails closed when one required workflow is absent", () => {
    expect(
      canDeclareV4ReleaseCandidate({
        successfulWorkflows: V4_RELEASE_MANIFEST.requiredWorkflows.filter(
          (workflow) => workflow !== "PWA Offline Browser Validation",
        ),
        mobileVisualReceipt: true,
        offlineVisualReceipt: true,
        deploymentReceipt: true,
        rollbackProcedure: true,
      }),
    ).toBe(false);
  });

  it("keeps trust and journey contracts explicit", () => {
    expect(V4_RELEASE_MANIFEST.requiredTrustRules).toContain("unknown-time-remains-uncertain");
    expect(V4_RELEASE_MANIFEST.requiredTrustRules).toContain("missing-profile-refuses-fabrication");
    expect(V4_RELEASE_MANIFEST.requiredJourney).toContain("inspect-evidence-and-limitations");
  });
});
