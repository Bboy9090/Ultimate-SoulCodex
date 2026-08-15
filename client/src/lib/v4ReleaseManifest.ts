export const V4_RELEASE_MANIFEST = {
  product: "Ultimate Soul Codex",
  releaseLine: "v4-clarity-first",
  releaseVersion: "4.0.0-rc.1",
  classification: "release-candidate",
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
    "/compatibility/compare",
    "/timeline",
  ],
  requiredTrustRules: [
    "verified-over-symbolic",
    "unknown-time-remains-uncertain",
    "deterministic-numerology-labelled",
    "missing-profile-refuses-fabrication",
    "lived-experience-is-correction-layer",
    "local-profile-verification-is-explicit-opt-in",
    "compatibility-minimizes-uploaded-profile-data",
    "no-simulated-premium-analysis-routes",
  ],
  requiredJourney: [
    "create-or-resume-profile",
    "open-clarity-reading",
    "inspect-evidence-and-limitations",
    "open-timeline-without-recreating-profile",
    "open-compatibility-without-recreating-profile",
    "return-to-full-profile",
    "reload-and-reopen-offline",
  ],
  releaseCandidateRequirements: {
    sameCommitWorkflowEvidence: true,
    mobileVisualReceipt: true,
    offlineVisualReceipt: true,
    deploymentReceipt: true,
    rollbackProcedure: true,
  },
} as const;

export type V4ReleaseManifest = typeof V4_RELEASE_MANIFEST;

export function canDeclareV4ReleaseCandidate(evidence: {
  successfulWorkflows: readonly string[];
  mobileVisualReceipt: boolean;
  offlineVisualReceipt: boolean;
  deploymentReceipt: boolean;
  rollbackProcedure: boolean;
}): boolean {
  const workflowsPass = V4_RELEASE_MANIFEST.requiredWorkflows.every((workflow) =>
    evidence.successfulWorkflows.includes(workflow),
  );

  return (
    workflowsPass &&
    evidence.mobileVisualReceipt &&
    evidence.offlineVisualReceipt &&
    evidence.deploymentReceipt &&
    evidence.rollbackProcedure
  );
}
