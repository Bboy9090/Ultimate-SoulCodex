export const V4_RELEASE_MANIFEST = {
  product: "Ultimate Soul Codex",
  releaseLine: "v4-clarity-first",
  classification: "integrated",
  requiredWorkflows: [
    "Ultimate SoulCodex CI",
    "CI Tests",
    "Dependency Security Audit",
    "PWA Offline Browser Validation",
    "Railway Container Smoke",
    "Live Ephemeris Evidence",
  ],
  requiredRoutes: ["/", "/create", "/profile/:id", "/reading/:id", "/compatibility", "/timeline"],
  requiredTrustRules: [
    "verified-over-symbolic",
    "unknown-time-remains-uncertain",
    "deterministic-numerology-labelled",
    "missing-profile-refuses-fabrication",
    "lived-experience-is-correction-layer",
  ],
  requiredJourney: [
    "create-or-resume-profile",
    "open-clarity-reading",
    "inspect-evidence-and-limitations",
    "return-to-full-profile",
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
