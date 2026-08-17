export const V4_RELEASE_MANIFEST = {
  product: "Ultimate Soul Codex",
  releaseLine: "v4-clarity-first",
  releaseVersion: "4.0.0-rc.3",
  classification: "release-candidate",
  releaseScope: "foundation-web",
  apiContract: "foundation-v4",
  compatibilityFormulaVersion: "foundation-compatibility-v2",
  nativeDistribution: {
    scopeReopenedByOwner: true,
    scopeReopenedOn: "2026-08-15",
    requiresXcodeCloudArchive: true,
    requiresSignedIosArtifact: true,
    requiresSignedAndroidAab: true,
  },
  requiredWorkflows: [
    "Ultimate SoulCodex CI",
    "CI Tests",
    "Foundation Doctrine Gate",
    "Gate 4 Lifecycle Validation",
    "PWA Offline Browser Validation",
    "Mobile Native Smoke",
    "Dependency Security Audit",
    "Railway Container Smoke",
    "Live Ephemeris Evidence",
  ],
  requiredRoutes: [
    "/",
    "/create",
    "/profile/:id",
    "/reading/:id",
    "/compatibility",
    "/compatibility/explorer",
    "/compatibility/compare",
    "/timeline",
    "/settings",
    "/diagnostics",
  ],
  requiredTrustRules: [
    "verified-over-symbolic",
    "unknown-time-remains-uncertain",
    "deterministic-numerology-labelled",
    "master-life-paths-preserved",
    "missing-profile-refuses-fabrication",
    "lived-experience-is-correction-layer",
    "local-profile-verification-is-explicit-opt-in",
    "compatibility-minimizes-uploaded-profile-data",
    "compatibility-has-no-universal-overall-score",
    "backend-release-identity-is-inspectable",
    "no-simulated-premium-analysis-routes",
  ],
  requiredJourney: [
    "create-or-resume-profile",
    "open-clarity-reading",
    "inspect-evidence-and-limitations",
    "open-timeline-without-recreating-profile",
    "open-compatibility-without-recreating-profile",
    "compare-a-person-with-bounded-inputs",
    "inspect-release-diagnostics",
    "return-to-full-profile",
    "reload-and-reopen-offline",
  ],
  releaseCandidateRequirements: {
    sameCommitWorkflowEvidence: true,
    mobileVisualReceipt: true,
    offlineVisualReceipt: true,
    deploymentReceipt: true,
    backendContractReceipt: true,
    rollbackProcedure: true,
  },
} as const;

export type V4ReleaseManifest = typeof V4_RELEASE_MANIFEST;

export type V4ReleaseEvidence = {
  successfulWorkflows: readonly string[];
  mobileVisualReceipt: boolean;
  offlineVisualReceipt: boolean;
  deploymentReceipt: boolean;
  backendContractReceipt: boolean;
  rollbackProcedure: boolean;
};

export function canDeclareV4ReleaseCandidate(evidence: V4ReleaseEvidence): boolean {
  const workflowsPass = V4_RELEASE_MANIFEST.requiredWorkflows.every((workflow) =>
    evidence.successfulWorkflows.includes(workflow),
  );

  return (
    workflowsPass &&
    evidence.mobileVisualReceipt &&
    evidence.offlineVisualReceipt &&
    evidence.deploymentReceipt &&
    evidence.backendContractReceipt &&
    evidence.rollbackProcedure
  );
}

export function canDeclareV4NativeDistributableCandidate(
  evidence: V4ReleaseEvidence & {
    xcodeCloudArchive: boolean;
    signedIosArtifact: boolean;
    signedAndroidAab: boolean;
  },
): boolean {
  return (
    V4_RELEASE_MANIFEST.nativeDistribution.scopeReopenedByOwner &&
    canDeclareV4ReleaseCandidate(evidence) &&
    evidence.xcodeCloudArchive &&
    evidence.signedIosArtifact &&
    evidence.signedAndroidAab
  );
}
