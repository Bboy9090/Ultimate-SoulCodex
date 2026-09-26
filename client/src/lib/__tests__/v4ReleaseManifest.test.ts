import { describe, expect, it } from "vitest";
import {
  V4_RELEASE_MANIFEST,
  canDeclareV4NativeDistributableCandidate,
  canDeclareV4ReleaseCandidate,
} from "../v4ReleaseManifest";

const completeWebEvidence = {
  successfulWorkflows: V4_RELEASE_MANIFEST.requiredWorkflows,
  mobileVisualReceipt: true,
  offlineVisualReceipt: true,
  deploymentReceipt: true,
  backendContractReceipt: true,
  rollbackProcedure: true,
} as const;

describe("V4 release manifest", () => {
  it("locks the v4.0.1 release identity", () => {
    expect(V4_RELEASE_MANIFEST.releaseVersion).toBe("4.0.1");
    expect(V4_RELEASE_MANIFEST.classification).toBe("release-candidate");
    expect(V4_RELEASE_MANIFEST.releaseScope).toBe("foundation-web");
  });

  it("records the owner-authorized reopening of native distribution without upgrading web evidence", () => {
    expect(V4_RELEASE_MANIFEST.nativeDistribution.scopeReopenedByOwner).toBe(true);
    expect(V4_RELEASE_MANIFEST.nativeDistribution.scopeReopenedOn).toBe("2026-08-15");
    expect(V4_RELEASE_MANIFEST.nativeDistribution.requiresSignedAndroidAab).toBe(true);
    expect(V4_RELEASE_MANIFEST.nativeDistribution.requiresSignedIosArtifact).toBe(true);
  });

  it("locks every required same-SHA workflow", () => {
    expect(V4_RELEASE_MANIFEST.requiredWorkflows).toEqual([
      "Diamond Way Synthesis Gate",
      "Federation Human Design Differential Audit",
      "Soul Codex Store Candidate — Android 4.0.1 / iOS 4.0.2",
      "Xcode Cloud Bootstrap Parity",
    ]);
  });

  it("does not declare a web release candidate from CI alone", () => {
    expect(
      canDeclareV4ReleaseCandidate({
        ...completeWebEvidence,
        mobileVisualReceipt: false,
        offlineVisualReceipt: false,
        deploymentReceipt: false,
        rollbackProcedure: false,
      }),
    ).toBe(false);
  });

  it("requires every workflow and every web release receipt", () => {
    expect(canDeclareV4ReleaseCandidate(completeWebEvidence)).toBe(true);
  });

  it("fails closed without backend contract evidence", () => {
    expect(
      canDeclareV4ReleaseCandidate({
        ...completeWebEvidence,
        backendContractReceipt: false,
      }),
    ).toBe(false);
  });

  it("fails closed when one required workflow is absent", () => {
    expect(
      canDeclareV4ReleaseCandidate({
        ...completeWebEvidence,
        successfulWorkflows: V4_RELEASE_MANIFEST.requiredWorkflows.filter(
          (workflow) => workflow !== "Xcode Cloud Bootstrap Parity",
        ),
      }),
    ).toBe(false);
  });

  it("refuses native-distributable status without signed store artifacts", () => {
    expect(
      canDeclareV4NativeDistributableCandidate({
        ...completeWebEvidence,
        xcodeCloudArchive: true,
        signedIosArtifact: false,
        signedAndroidAab: false,
      }),
    ).toBe(false);
  });

  it("requires Xcode Cloud plus signed iOS and Android artifacts for native-distributable status", () => {
    expect(
      canDeclareV4NativeDistributableCandidate({
        ...completeWebEvidence,
        xcodeCloudArchive: true,
        signedIosArtifact: true,
        signedAndroidAab: true,
      }),
    ).toBe(true);
  });

  it("keeps trust, privacy, and journey contracts explicit", () => {
    expect(V4_RELEASE_MANIFEST.requiredTrustRules).toContain("unknown-time-remains-uncertain");
    expect(V4_RELEASE_MANIFEST.requiredTrustRules).toContain("missing-profile-refuses-fabrication");
    expect(V4_RELEASE_MANIFEST.requiredTrustRules).toContain("local-profile-verification-is-explicit-opt-in");
    expect(V4_RELEASE_MANIFEST.requiredTrustRules).toContain("no-simulated-premium-analysis-routes");
    expect(V4_RELEASE_MANIFEST.requiredJourney).toContain("inspect-evidence-and-limitations");
    expect(V4_RELEASE_MANIFEST.requiredJourney).toContain("inspect-system-governance");
    expect(V4_RELEASE_MANIFEST.requiredJourney).toContain("explore-astrology-atlas-without-promoting-unverified-data");
    expect(V4_RELEASE_MANIFEST.requiredRoutes).toContain("/systems");
    expect(V4_RELEASE_MANIFEST.requiredRoutes).toContain("/systems/atlas");
    expect(V4_RELEASE_MANIFEST.requiredTrustRules).toContain("system-governance-stays-inspectable");
    expect(V4_RELEASE_MANIFEST.requiredTrustRules).toContain("quarantined-systems-never-masquerade-as-active");
    expect(V4_RELEASE_MANIFEST.requiredJourney).toContain("open-compatibility-without-recreating-profile");
  });
});
