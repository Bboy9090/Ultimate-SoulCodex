export const V4_RELEASE_MANIFEST = {
  product: "Ultimate Soul Codex",
  releaseLine: "v4-clarity-first",
  releaseVersion: "4.0.0-rc.3",
  classification: "release-candidate",
  releaseScope: "foundation-web",
  nativeDistribution: {
    scopeReopenedByOwner: true,
    scopeReopenedOn: "2026-08-15",
    requiresXcodeCloudArchive: true,
    requiresSignedIosArtifact: true,
    requiresSignedAndroidAab: true,
  },
  apiContract: "foundation-v4",
  compatibilityFormula: "foundation-compatibility-v1",
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
    "missing-profile-refuses-fabrication",
    "lived-experience-is-correction-layer",
    "local-profile-verification-is-explicit-opt-in",
    "compatibility-minimizes-uploaded-profile-data",
    "compatibility-master-numbers-preserved",
    "client-backend-api-contract-visible",
    "no-simulated-premium-analysis-routes",
  ],
  requiredJourney: [
    "create-or-resume-profile",
    "open-clarity-reading",
    "inspect-evidence-and-limitations",
    "open-timeline-without-recreating-profile",
    "open-compatibility-without-recreating-profile",
    "compare-specific-person-without-recreating-profile",
    "inspect-release-diagnostics",
    "return-to-full-profile",
    "reload-and-reopen-offline",
  ],
  releaseCandidateRequirements: {
    sameCommitWorkflowEvidence: true,
    mobileVisualReceipt: true,
    offlineVisualReceipt: true,
    deploymentReceipt: true,
    rollbackProcedure: true,
    exactBackendReleaseIdentity: true,
  },
} as const;

export type V4ReleaseManifest = typeof V4_RELEASE_MANIFEST;

export type V4ReleaseEvidence = {
  successfulWorkflows: readonly string[];
  mobileVisualReceipt: boolean;
  offlineVisualReceipt: boolean;
  deploymentReceipt: boolean;
  rollbackProcedure: boolean;
  exactBackendReleaseIdentity: boolean;
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
    evidence.rollbackProcedure &&
    evidence.exactBackendReleaseIdentity
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
