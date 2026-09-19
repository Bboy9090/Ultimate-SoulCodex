import type { VerifiableBody, VerificationPolicy } from "./astrology-verification";

export interface EphemerisEvidenceSummary {
  totalRows: number;
  signDisagreements: number;
  maximumLongitudeDeltaDegrees: number;
  sunMaximumDeltaDegrees: number;
  moonMaximumDeltaDegrees: number;
}

export interface TolerancePolicyProposal {
  policy: VerificationPolicy;
  evidence: {
    receiptRunId: string;
    totalRows: number;
    signDisagreements: number;
    observedMaximumDeltaDegrees: number;
    safetyMultiplier: number;
  };
  promotionAllowed: false;
  rationale: string;
}

export interface ApprovedToleranceEvidence {
  receiptRunId: string;
  artifactId: string;
  artifactSha256: string;
  candidateSha?: string;
  totalRows: number;
  signDisagreements: number;
  maximumLongitudeDeltaDegrees: number;
  sunMaximumDeltaDegrees?: number;
  moonMaximumDeltaDegrees?: number;
  bodyMaximumDeltaDegrees?: Partial<Record<VerifiableBody, number>>;
  approvedAt: string;
  approvedBy: string;
  approvedBodies: readonly VerifiableBody[];
  coordinateContract: string;
}

const MINIMUM_EVIDENCE_ROWS = 40;
const SAFETY_MULTIPLIER = 1.25;
const ROUNDING_INCREMENT_DEGREES = 0.001;
const SUN_MOON_TOLERANCE_DEGREES = 0.001;
const PLANETARY_TOLERANCE_DEGREES = 0.005;

const PLANETARY_BODIES = Object.freeze([
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const satisfies readonly VerifiableBody[]);

export const APPROVED_LONGITUDE_TOLERANCE_EVIDENCE: ApprovedToleranceEvidence = Object.freeze({
  receiptRunId: "30803626991",
  artifactId: "8851843885",
  artifactSha256: "bc23e71ebffe3bb7532b2c511999e2da3ac5ba4af394092dd55c454e40f52d8d",
  totalRows: 40,
  signDisagreements: 0,
  maximumLongitudeDeltaDegrees: 0.0008717338064343494,
  sunMaximumDeltaDegrees: 0.00027293851550780346,
  moonMaximumDeltaDegrees: 0.0008717338064343494,
  approvedAt: "2026-08-03T11:26:00.000Z",
  approvedBy: "Bboy9090",
  approvedBodies: Object.freeze(["Sun", "Moon"] as const),
  coordinateContract:
    "Astronomy Engine geocentric true-ecliptic-of-date longitude compared with NASA/JPL Horizons geocentric apparent ecliptic-of-date observer quantity 31 at the exact same UTC timestamp.",
});

export const APPROVED_PLANETARY_LONGITUDE_TOLERANCE_EVIDENCE: ApprovedToleranceEvidence =
  Object.freeze({
    receiptRunId: "35449041012",
    artifactId: "10586208293",
    artifactSha256: "45f5294e2498555ea3491eaadf9a15b110b9005c035e788c90135e4f515dfbac",
    candidateSha: "e6ee3bc2919aee8c29c137d09ac3d2364b7fbbc6",
    totalRows: 200,
    signDisagreements: 0,
    maximumLongitudeDeltaDegrees: 0.003351773269912428,
    bodyMaximumDeltaDegrees: Object.freeze({
      Sun: 0.00027293851550780346,
      Moon: 0.0008717338064343494,
      Mercury: 0.0017285373195612408,
      Venus: 0.0007320591801089904,
      Mars: 0.0010895629015408304,
      Jupiter: 0.0015015139203029548,
      Saturn: 0.0030349310078534586,
      Uranus: 0.0031340335349909765,
      Neptune: 0.003351773269912428,
      Pluto: 0.0010113966908704697,
    }),
    approvedAt: "2026-09-19T14:40:27.000Z",
    approvedBy: "Bboy9090",
    approvedBodies: PLANETARY_BODIES,
    coordinateContract:
      "Astronomy Engine geocentric true-ecliptic-of-date longitude compared with NASA/JPL Horizons geocentric apparent ecliptic-of-date observer quantity 31 at the exact same UTC timestamp across 20 adversarial fixtures and all ten supported natal bodies.",
  });

function roundUpToIncrement(value: number, increment: number): number {
  return Math.ceil(value / increment) * increment;
}

function assertApprovedEvidence(
  evidence: ApprovedToleranceEvidence,
  maximumPolicyToleranceDegrees: number,
  requiredBodies: readonly VerifiableBody[],
): void {
  if (!evidence.receiptRunId.trim() || !evidence.artifactId.trim() || !evidence.artifactSha256.trim()) {
    throw new Error("approved_policy_evidence_identity_missing");
  }
  if (!Number.isInteger(evidence.totalRows) || evidence.totalRows < MINIMUM_EVIDENCE_ROWS) {
    throw new Error("approved_policy_evidence_rows_insufficient");
  }
  if (evidence.signDisagreements !== 0) {
    throw new Error("approved_policy_sign_disagreement_present");
  }
  if (
    !Number.isFinite(evidence.maximumLongitudeDeltaDegrees) ||
    evidence.maximumLongitudeDeltaDegrees < 0 ||
    evidence.maximumLongitudeDeltaDegrees > maximumPolicyToleranceDegrees
  ) {
    throw new Error("approved_policy_observed_delta_invalid");
  }
  if (!evidence.approvedAt.trim() || Number.isNaN(new Date(evidence.approvedAt).getTime())) {
    throw new Error("approved_policy_timestamp_invalid");
  }
  if (!evidence.approvedBy.trim()) {
    throw new Error("approved_policy_approver_missing");
  }
  if (requiredBodies.some((body) => !evidence.approvedBodies.includes(body))) {
    throw new Error("approved_policy_body_scope_invalid");
  }
}

export function getApprovedLongitudeToleranceEvidence(
  body: VerifiableBody,
): ApprovedToleranceEvidence {
  if (body === "Sun" || body === "Moon") {
    assertApprovedEvidence(
      APPROVED_LONGITUDE_TOLERANCE_EVIDENCE,
      SUN_MOON_TOLERANCE_DEGREES,
      ["Sun", "Moon"],
    );
    return APPROVED_LONGITUDE_TOLERANCE_EVIDENCE;
  }

  assertApprovedEvidence(
    APPROVED_PLANETARY_LONGITUDE_TOLERANCE_EVIDENCE,
    PLANETARY_TOLERANCE_DEGREES,
    PLANETARY_BODIES,
  );
  if (!APPROVED_PLANETARY_LONGITUDE_TOLERANCE_EVIDENCE.approvedBodies.includes(body)) {
    throw new Error("body_not_approved_for_longitude_verification");
  }
  return APPROVED_PLANETARY_LONGITUDE_TOLERANCE_EVIDENCE;
}

export function getApprovedLongitudeTolerancePolicy(
  body: VerifiableBody,
): VerificationPolicy {
  const evidence = getApprovedLongitudeToleranceEvidence(body);
  const isCoreLuminary = body === "Sun" || body === "Moon";

  if (!evidence.approvedBodies.includes(body)) {
    throw new Error("body_not_approved_for_longitude_verification");
  }

  return {
    status: "approved",
    policyId: isCoreLuminary ? "ASTRO-LONGITUDE-v1" : "ASTRO-PLANET-LONGITUDE-v1",
    maximumLongitudeDeltaDegrees:
      isCoreLuminary ? SUN_MOON_TOLERANCE_DEGREES : PLANETARY_TOLERANCE_DEGREES,
    approvedAt: evidence.approvedAt,
  };
}

export function proposeLongitudeTolerancePolicy(
  summary: EphemerisEvidenceSummary,
  receiptRunId: string,
): TolerancePolicyProposal {
  if (!receiptRunId.trim()) {
    throw new Error("evidence_receipt_id_required");
  }

  if (!Number.isInteger(summary.totalRows) || summary.totalRows < MINIMUM_EVIDENCE_ROWS) {
    throw new Error("insufficient_evidence_rows");
  }

  if (summary.signDisagreements !== 0) {
    throw new Error("sign_disagreement_present");
  }

  const deltas = [
    summary.maximumLongitudeDeltaDegrees,
    summary.sunMaximumDeltaDegrees,
    summary.moonMaximumDeltaDegrees,
  ];

  if (deltas.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
    throw new Error("invalid_evidence_delta");
  }

  const measuredMaximum = Math.max(...deltas);
  const proposedTolerance = roundUpToIncrement(
    measuredMaximum * SAFETY_MULTIPLIER,
    ROUNDING_INCREMENT_DEGREES,
  );

  if (proposedTolerance <= 0 || proposedTolerance > 1) {
    throw new Error("invalid_proposed_tolerance");
  }

  return {
    policy: {
      status: "draft",
      policyId: "ASTRO-LONGITUDE-v1-draft",
      maximumLongitudeDeltaDegrees: proposedTolerance,
    },
    evidence: {
      receiptRunId,
      totalRows: summary.totalRows,
      signDisagreements: summary.signDisagreements,
      observedMaximumDeltaDegrees: measuredMaximum,
      safetyMultiplier: SAFETY_MULTIPLIER,
    },
    promotionAllowed: false,
    rationale:
      "A generated proposal remains draft-only. Production promotion uses the separately governed approved policy and its immutable evidence receipt.",
  };
}
