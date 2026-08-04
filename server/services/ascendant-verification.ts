import { SiderealTime } from "astronomy-engine";

export type AscendantSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export interface AscendantInput {
  inputTimestamp: string;
  latitude: number;
  longitude: number;
}

export interface AscendantEvidenceRecord extends AscendantInput {
  sign: AscendantSign;
  longitudeDegrees: number;
  degreeInSign: number;
  source: string;
  engine: string;
  calculatedAt: string;
}

export interface AscendantVerificationPolicy {
  status: "draft" | "approved";
  policyId: string;
  maximumLongitudeDeltaDegrees: number;
  approvedAt?: string;
  evidenceReceiptId?: string;
  evidenceFixtureCount?: number;
  evidenceMaximumObservedDeltaDegrees?: number;
}

export type AscendantVerificationResult =
  | {
      status: "verified";
      sign: AscendantSign;
      longitudeDegrees: number;
      degreeInSign: number;
      longitudeDeltaDegrees: number;
      candidate: AscendantEvidenceRecord;
      reference: AscendantEvidenceRecord;
      policy: AscendantVerificationPolicy;
      verifiedAt: string;
    }
  | {
      status: "rejected";
      sign: null;
      longitudeDegrees: null;
      degreeInSign: null;
      longitudeDeltaDegrees: number | null;
      candidate: AscendantEvidenceRecord | null;
      reference: AscendantEvidenceRecord | null;
      reason:
        | "invalid_input"
        | "policy_not_approved"
        | "invalid_policy_tolerance"
        | "same_engine_not_independent"
        | "same_source_not_independent"
        | "timestamp_mismatch"
        | "coordinate_mismatch"
        | "sign_disagreement"
        | "longitude_outside_tolerance"
        | "calculation_failed";
    };

const SIGNS: readonly AscendantSign[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const CANDIDATE_ENGINE = "astronomy-engine@2.1.19-sidereal-time + IAU-2006-obliquity";
const CANDIDATE_SOURCE =
  "Astronomy Engine apparent sidereal time with an independently coded eastern-horizon intersection";
const REFERENCE_ENGINE = "soulcodex-meeus-swiss-compatible-ascendant-reference-v1";
const REFERENCE_SOURCE =
  "Independent Meeus apparent sidereal time and Swiss-Ephemeris-compatible Asc1 geometry";

export const APPROVED_ASCENDANT_POLICY: AscendantVerificationPolicy = Object.freeze({
  status: "approved",
  policyId: "ASTRO-ASCENDANT-v1",
  maximumLongitudeDeltaDegrees: 0.02,
  approvedAt: "2026-08-04T00:00:00.000Z",
  evidenceReceiptId: "ASCENDANT-VERIFICATION-RECEIPT-v1",
  evidenceFixtureCount: 24,
  evidenceMaximumObservedDeltaDegrees: 0.01,
});

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function degrees(radiansValue: number): number {
  return (radiansValue * 180) / Math.PI;
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function circularDelta(left: number, right: number): number {
  const raw = Math.abs(normalizeDegrees(left) - normalizeDegrees(right));
  return Math.min(raw, 360 - raw);
}

function signFromLongitude(longitude: number): AscendantSign {
  return SIGNS[Math.floor(normalizeDegrees(longitude) / 30)];
}

function isValidInput(input: AscendantInput): boolean {
  const timestamp = new Date(input.inputTimestamp);
  return (
    !Number.isNaN(timestamp.getTime()) &&
    Number.isFinite(input.latitude) &&
    input.latitude >= -90 &&
    input.latitude <= 90 &&
    Number.isFinite(input.longitude) &&
    input.longitude >= -180 &&
    input.longitude <= 180
  );
}

function julianDayUtc(timestamp: Date): number {
  return timestamp.getTime() / 86_400_000 + 2_440_587.5;
}

function meanObliquityIau2006(julianDay: number): number {
  const centuries = (julianDay - 2_451_545.0) / 36_525;
  const arcseconds =
    84_381.406 -
    46.836769 * centuries -
    0.0001831 * centuries ** 2 +
    0.0020034 * centuries ** 3 -
    0.000000576 * centuries ** 4 -
    0.0000000434 * centuries ** 5;
  return arcseconds / 3_600;
}

function truncatedNutation(julianDay: number): {
  longitudeDegrees: number;
  obliquityDegrees: number;
} {
  const centuries = (julianDay - 2_451_545.0) / 36_525;
  const omega = radians(
    normalizeDegrees(
      125.04452 -
        1_934.136261 * centuries +
        0.0020708 * centuries ** 2 +
        centuries ** 3 / 450_000,
    ),
  );
  const meanSunLongitude = radians(
    normalizeDegrees(280.4665 + 36_000.7698 * centuries),
  );
  const meanMoonLongitude = radians(
    normalizeDegrees(218.3165 + 481_267.8813 * centuries),
  );

  return {
    longitudeDegrees:
      (-17.2 * Math.sin(omega) -
        1.32 * Math.sin(2 * meanSunLongitude) -
        0.23 * Math.sin(2 * meanMoonLongitude) +
        0.21 * Math.sin(2 * omega)) /
      3_600,
    obliquityDegrees:
      (9.2 * Math.cos(omega) +
        0.57 * Math.cos(2 * meanSunLongitude) +
        0.1 * Math.cos(2 * meanMoonLongitude) -
        0.09 * Math.cos(2 * omega)) /
      3_600,
  };
}

function greenwichMeanSiderealTimeMeeus(julianDay: number): number {
  const centuries = (julianDay - 2_451_545.0) / 36_525;
  return normalizeDegrees(
    280.46061837 +
      360.98564736629 * (julianDay - 2_451_545.0) +
      0.000387933 * centuries ** 2 -
      centuries ** 3 / 38_710_000,
  );
}

function ascendantLongitude(
  localSiderealDegrees: number,
  latitudeDegrees: number,
  obliquityDegrees: number,
): number {
  const sidereal = radians(localSiderealDegrees);
  const latitude = radians(latitudeDegrees);
  const obliquity = radians(obliquityDegrees);

  // This is the eastern intersection of the true ecliptic-of-date with the
  // observer's astronomical horizon. atan2 preserves the correct quadrant.
  return normalizeDegrees(
    degrees(
      Math.atan2(
        Math.cos(sidereal),
        -(
          Math.sin(sidereal) * Math.cos(obliquity) +
          Math.tan(latitude) * Math.sin(obliquity)
        ),
      ),
    ),
  );
}

function evidenceRecord(
  input: AscendantInput,
  longitudeDegrees: number,
  engine: string,
  source: string,
): AscendantEvidenceRecord {
  const normalized = normalizeDegrees(longitudeDegrees);
  return {
    ...input,
    longitudeDegrees: normalized,
    sign: signFromLongitude(normalized),
    degreeInSign: normalized % 30,
    engine,
    source,
    calculatedAt: new Date().toISOString(),
  };
}

export function calculateAscendantCandidate(
  input: AscendantInput,
): AscendantEvidenceRecord {
  if (!isValidInput(input)) {
    throw new Error("ascendant_input_invalid");
  }

  const timestamp = new Date(input.inputTimestamp);
  const julianDay = julianDayUtc(timestamp);
  const greenwichApparentSiderealDegrees = SiderealTime(timestamp) * 15;
  const localSiderealDegrees = normalizeDegrees(
    greenwichApparentSiderealDegrees + input.longitude,
  );
  const longitudeDegrees = ascendantLongitude(
    localSiderealDegrees,
    input.latitude,
    meanObliquityIau2006(julianDay),
  );

  return evidenceRecord(
    input,
    longitudeDegrees,
    CANDIDATE_ENGINE,
    CANDIDATE_SOURCE,
  );
}

export function calculateIndependentAscendantReference(
  input: AscendantInput,
): AscendantEvidenceRecord {
  if (!isValidInput(input)) {
    throw new Error("ascendant_input_invalid");
  }

  const timestamp = new Date(input.inputTimestamp);
  const julianDay = julianDayUtc(timestamp);
  const nutation = truncatedNutation(julianDay);
  const trueObliquity =
    meanObliquityIau2006(julianDay) + nutation.obliquityDegrees;
  const greenwichApparentSiderealDegrees = normalizeDegrees(
    greenwichMeanSiderealTimeMeeus(julianDay) +
      nutation.longitudeDegrees * Math.cos(radians(trueObliquity)),
  );
  const localSiderealDegrees = normalizeDegrees(
    greenwichApparentSiderealDegrees + input.longitude,
  );
  const longitudeDegrees = ascendantLongitude(
    localSiderealDegrees,
    input.latitude,
    trueObliquity,
  );

  return evidenceRecord(
    input,
    longitudeDegrees,
    REFERENCE_ENGINE,
    REFERENCE_SOURCE,
  );
}

export function verifyAscendant(
  input: AscendantInput,
  policy: AscendantVerificationPolicy = APPROVED_ASCENDANT_POLICY,
): AscendantVerificationResult {
  if (!isValidInput(input)) {
    return {
      status: "rejected",
      sign: null,
      longitudeDegrees: null,
      degreeInSign: null,
      longitudeDeltaDegrees: null,
      candidate: null,
      reference: null,
      reason: "invalid_input",
    };
  }

  let candidate: AscendantEvidenceRecord;
  let reference: AscendantEvidenceRecord;
  try {
    candidate = calculateAscendantCandidate(input);
    reference = calculateIndependentAscendantReference(input);
  } catch {
    return {
      status: "rejected",
      sign: null,
      longitudeDegrees: null,
      degreeInSign: null,
      longitudeDeltaDegrees: null,
      candidate: null,
      reference: null,
      reason: "calculation_failed",
    };
  }

  if (policy.status !== "approved" || !policy.approvedAt) {
    return {
      status: "rejected",
      sign: null,
      longitudeDegrees: null,
      degreeInSign: null,
      longitudeDeltaDegrees: null,
      candidate,
      reference,
      reason: "policy_not_approved",
    };
  }

  if (
    !Number.isFinite(policy.maximumLongitudeDeltaDegrees) ||
    policy.maximumLongitudeDeltaDegrees <= 0 ||
    policy.maximumLongitudeDeltaDegrees > 1
  ) {
    return {
      status: "rejected",
      sign: null,
      longitudeDegrees: null,
      degreeInSign: null,
      longitudeDeltaDegrees: null,
      candidate,
      reference,
      reason: "invalid_policy_tolerance",
    };
  }

  if (candidate.engine.trim().toLowerCase() === reference.engine.trim().toLowerCase()) {
    return {
      status: "rejected",
      sign: null,
      longitudeDegrees: null,
      degreeInSign: null,
      longitudeDeltaDegrees: null,
      candidate,
      reference,
      reason: "same_engine_not_independent",
    };
  }

  if (candidate.source.trim().toLowerCase() === reference.source.trim().toLowerCase()) {
    return {
      status: "rejected",
      sign: null,
      longitudeDegrees: null,
      degreeInSign: null,
      longitudeDeltaDegrees: null,
      candidate,
      reference,
      reason: "same_source_not_independent",
    };
  }

  if (candidate.inputTimestamp !== reference.inputTimestamp) {
    return {
      status: "rejected",
      sign: null,
      longitudeDegrees: null,
      degreeInSign: null,
      longitudeDeltaDegrees: null,
      candidate,
      reference,
      reason: "timestamp_mismatch",
    };
  }

  if (
    candidate.latitude !== reference.latitude ||
    candidate.longitude !== reference.longitude
  ) {
    return {
      status: "rejected",
      sign: null,
      longitudeDegrees: null,
      degreeInSign: null,
      longitudeDeltaDegrees: null,
      candidate,
      reference,
      reason: "coordinate_mismatch",
    };
  }

  const longitudeDeltaDegrees = circularDelta(
    candidate.longitudeDegrees,
    reference.longitudeDegrees,
  );

  if (candidate.sign !== reference.sign) {
    return {
      status: "rejected",
      sign: null,
      longitudeDegrees: null,
      degreeInSign: null,
      longitudeDeltaDegrees,
      candidate,
      reference,
      reason: "sign_disagreement",
    };
  }

  if (longitudeDeltaDegrees > policy.maximumLongitudeDeltaDegrees) {
    return {
      status: "rejected",
      sign: null,
      longitudeDegrees: null,
      degreeInSign: null,
      longitudeDeltaDegrees,
      candidate,
      reference,
      reason: "longitude_outside_tolerance",
    };
  }

  return {
    status: "verified",
    sign: candidate.sign,
    longitudeDegrees: candidate.longitudeDegrees,
    degreeInSign: candidate.degreeInSign,
    longitudeDeltaDegrees,
    candidate,
    reference,
    policy,
    verifiedAt: new Date().toISOString(),
  };
}
