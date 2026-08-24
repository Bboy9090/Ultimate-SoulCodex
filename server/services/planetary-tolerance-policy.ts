import type { VerificationPolicy } from "./astrology-verification";
import {
  PLANETARY_BODIES,
  type PlanetaryBody,
} from "./planetary-verification";

export const APPROVED_PLANETARY_EVIDENCE = Object.freeze({
  workflowRunId: "32544861761",
  workflowHeadSha: "f3b42f7b37934340d4339052c507648b41285f3d",
  artifactId: "9468182741",
  artifactName: "planetary-ephemeris-evidence-32544861761",
  artifactZipSha256: "760636c10f8f089271603f764bb42d3749c5d25bede694b4e4ba64764cebf8fe",
  receiptSha256: "6d48b7fdd1c994d5e1e24ec8b30fe745bbd67aad75745f97ee5b5d79de39da77",
  totalRows: 80,
  rowsPerBody: 10,
  signDisagreements: 0,
  observedMaximumLongitudeDeltaDegrees: 0.0033421484949371916,
  observedMaximumByBody: Object.freeze({
    Mercury: 0.0014508334155607372,
    Venus: 0.0006052638971141278,
    Mars: 0.0010895629015408304,
    Jupiter: 0.0015015139203029548,
    Saturn: 0.0030349310078534586,
    Uranus: 0.0030141932339802224,
    Neptune: 0.0033421484949371916,
    Pluto: 0.0006748000997447434,
  } satisfies Record<PlanetaryBody, number>),
  approvedAt: "2026-08-22T02:02:00.000Z",
  approvedBy: "Bboy9090",
  coordinateContract:
    "Astronomy Engine geocentric true-ecliptic-of-date longitude compared with NASA/JPL Horizons geocentric apparent ecliptic-of-date observer quantity 31 at the exact same UTC timestamp.",
});

export const APPROVED_PLANETARY_POLICY: VerificationPolicy = Object.freeze({
  status: "approved",
  policyId: "ASTRO-PLANETARY-LONGITUDE-v1",
  maximumLongitudeDeltaDegrees: 0.005,
  approvedAt: APPROVED_PLANETARY_EVIDENCE.approvedAt,
});

export function getApprovedPlanetaryPolicy(body: PlanetaryBody): VerificationPolicy {
  if (!PLANETARY_BODIES.includes(body)) {
    throw new Error("planetary_body_not_approved");
  }
  if (APPROVED_PLANETARY_EVIDENCE.signDisagreements !== 0) {
    throw new Error("planetary_policy_sign_disagreement_present");
  }
  if (APPROVED_PLANETARY_EVIDENCE.totalRows !== 80 || APPROVED_PLANETARY_EVIDENCE.rowsPerBody !== 10) {
    throw new Error("planetary_policy_evidence_incomplete");
  }
  if (
    APPROVED_PLANETARY_EVIDENCE.observedMaximumLongitudeDeltaDegrees >=
    APPROVED_PLANETARY_POLICY.maximumLongitudeDeltaDegrees
  ) {
    throw new Error("planetary_policy_tolerance_not_above_observed_maximum");
  }
  return APPROVED_PLANETARY_POLICY;
}
