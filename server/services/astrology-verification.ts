import {
  circularDegreesDelta,
  distanceToNearestThirtyDegreeBoundary,
  tropicalSignFromLongitude,
} from "./angular-math";

export type VerifiableBody =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export interface EphemerisCandidate {
  body: VerifiableBody;
  sign: string;
  longitude: number;
  source: string;
  engine: string;
  calculatedAt: string;
  inputTimestamp: string;
}

export interface IndependentEphemerisReference {
  body: VerifiableBody;
  sign: string;
  longitude: number;
  source: string;
  engine: string;
  calculatedAt: string;
  inputTimestamp: string;
}

export interface VerificationPolicy {
  status: "draft" | "approved";
  policyId: string;
  maximumLongitudeDeltaDegrees: number;
  approvedAt?: string;
}

export type IndependentVerificationResult =
  | {
      status: "verified";
      body: VerifiableBody;
      sign: string;
      longitudeDeltaDegrees: number;
      candidate: EphemerisCandidate;
      reference: IndependentEphemerisReference;
      policyId: string;
      verifiedAt: string;
    }
  | {
      status: "rejected";
      sign: null;
      reason:
        | "policy_not_approved"
        | "invalid_policy_tolerance"
        | "body_mismatch"
        | "same_engine_not_independent"
        | "same_source_not_independent"
        | "invalid_timestamp"
        | "timestamp_mismatch"
        | "sign_longitude_mismatch"
        | "sign_disagreement"
        | "longitude_outside_tolerance"
        | "sign_boundary_within_tolerance"
        | "invalid_longitude";
      longitudeDeltaDegrees: number | null;
    };

function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value < 360;
}


export function distanceToNearestSignBoundary(longitude: number): number {
  return distanceToNearestThirtyDegreeBoundary(longitude);
}

function normalizedIdentity(value: string): string {
  return value.trim().toLowerCase();
}

function isExplicitUtcTimestamp(value: string): boolean {
  return (
    typeof value === "string" &&
    /Z$/i.test(value.trim()) &&
    !Number.isNaN(new Date(value).getTime())
  );
}

export function verifyAgainstIndependentReference(
  candidate: EphemerisCandidate,
  reference: IndependentEphemerisReference,
  policy: VerificationPolicy,
): IndependentVerificationResult {
  if (policy.status !== "approved" || !policy.approvedAt) {
    return { status: "rejected", sign: null, reason: "policy_not_approved", longitudeDeltaDegrees: null };
  }

  if (!Number.isFinite(policy.maximumLongitudeDeltaDegrees)
    || policy.maximumLongitudeDeltaDegrees <= 0
    || policy.maximumLongitudeDeltaDegrees > 1) {
    return { status: "rejected", sign: null, reason: "invalid_policy_tolerance", longitudeDeltaDegrees: null };
  }

  if (!isValidLongitude(candidate.longitude) || !isValidLongitude(reference.longitude)) {
    return { status: "rejected", sign: null, reason: "invalid_longitude", longitudeDeltaDegrees: null };
  }

  if (candidate.body !== reference.body) {
    return { status: "rejected", sign: null, reason: "body_mismatch", longitudeDeltaDegrees: null };
  }

  if (normalizedIdentity(candidate.engine) === normalizedIdentity(reference.engine)) {
    return { status: "rejected", sign: null, reason: "same_engine_not_independent", longitudeDeltaDegrees: null };
  }

  if (normalizedIdentity(candidate.source) === normalizedIdentity(reference.source)) {
    return { status: "rejected", sign: null, reason: "same_source_not_independent", longitudeDeltaDegrees: null };
  }

  if (
    !isExplicitUtcTimestamp(candidate.inputTimestamp) ||
    !isExplicitUtcTimestamp(reference.inputTimestamp)
  ) {
    return { status: "rejected", sign: null, reason: "invalid_timestamp", longitudeDeltaDegrees: null };
  }

  if (candidate.inputTimestamp !== reference.inputTimestamp) {
    return { status: "rejected", sign: null, reason: "timestamp_mismatch", longitudeDeltaDegrees: null };
  }

  if (
    candidate.sign !== tropicalSignFromLongitude(candidate.longitude) ||
    reference.sign !== tropicalSignFromLongitude(reference.longitude)
  ) {
    return {
      status: "rejected",
      sign: null,
      reason: "sign_longitude_mismatch",
      longitudeDeltaDegrees: null,
    };
  }

  const longitudeDeltaDegrees = circularDegreesDelta(candidate.longitude, reference.longitude);

  if (candidate.sign !== reference.sign) {
    return { status: "rejected", sign: null, reason: "sign_disagreement", longitudeDeltaDegrees };
  }

  if (longitudeDeltaDegrees > policy.maximumLongitudeDeltaDegrees) {
    return { status: "rejected", sign: null, reason: "longitude_outside_tolerance", longitudeDeltaDegrees };
  }

  const boundaryDistance = Math.min(
    distanceToNearestSignBoundary(candidate.longitude),
    distanceToNearestSignBoundary(reference.longitude),
  );
  if (boundaryDistance <= policy.maximumLongitudeDeltaDegrees) {
    return {
      status: "rejected",
      sign: null,
      reason: "sign_boundary_within_tolerance",
      longitudeDeltaDegrees,
    };
  }

  return {
    status: "verified",
    body: candidate.body,
    sign: candidate.sign,
    longitudeDeltaDegrees,
    candidate,
    reference,
    policyId: policy.policyId,
    verifiedAt: new Date().toISOString(),
  };
}
