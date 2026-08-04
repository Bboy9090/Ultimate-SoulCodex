import {
  calculateAstrology as calculateBaseAstrology,
  calculateVerifiedAstrology as calculateBaseVerifiedAstrology,
  getTarotBirthCards,
  type AstrologyData,
  type BirthData,
  type PlacementVerification,
  type VerifiedAstrologyOptions,
} from "./astrology";
import {
  APPROVED_ASCENDANT_POLICY,
  calculateAscendantCandidate,
  verifyAscendant,
  type AscendantVerificationPolicy,
} from "./ascendant-verification";

export type { AstrologyData, BirthData, PlacementVerification, VerifiedAstrologyOptions };
export { getTarotBirthCards };

export interface ProductionAstrologyOptions extends VerifiedAstrologyOptions {
  ascendantPolicy?: AscendantVerificationPolicy;
}

function candidateRisingPlacement(birthData: BirthData): PlacementVerification {
  if (!birthData.birthTime || !birthData.timezone) {
    return {
      sign: null,
      status: "requires_verified_birth_time",
      confidence: null,
      source: null,
      reason: "Verified birth time and timezone required for Rising sign calculation",
    };
  }

  if (birthData.latitude === undefined || birthData.longitude === undefined) {
    return {
      sign: null,
      status: "requires_location",
      confidence: null,
      source: null,
      reason: "Precise birth coordinates required for Rising sign calculation",
    };
  }

  const base = calculateBaseAstrology(birthData);
  const timestamp = base.moon.candidate?.inputTimestamp;
  if (!timestamp) {
    return {
      sign: null,
      status: "pending_ephemeris",
      confidence: null,
      source: null,
      reason: "Birth date, time, or timezone could not be converted safely",
    };
  }

  try {
    const candidate = calculateAscendantCandidate({
      inputTimestamp: timestamp,
      latitude: birthData.latitude,
      longitude: birthData.longitude,
    });
    return {
      sign: null,
      status: "calculated_pending_independent_verification",
      confidence: null,
      source: null,
      candidate: {
        sign: candidate.sign,
        longitude: candidate.longitudeDegrees,
        source: candidate.source,
        engine: candidate.engine,
        calculatedAt: candidate.calculatedAt,
        inputTimestamp: candidate.inputTimestamp,
      },
      reason:
        "Ascendant candidate calculated; independent reference agreement is required before interpretation",
    };
  } catch {
    return {
      sign: null,
      status: "pending_ephemeris",
      confidence: null,
      source: null,
      reason: "Ascendant calculation failed safely; no placement was promoted",
    };
  }
}

function verifiedRisingPlacement(
  birthData: BirthData,
  policy: AscendantVerificationPolicy,
): PlacementVerification {
  const candidatePlacement = candidateRisingPlacement(birthData);
  if (
    !candidatePlacement.candidate ||
    birthData.latitude === undefined ||
    birthData.longitude === undefined
  ) {
    return candidatePlacement;
  }

  const result = verifyAscendant(
    {
      inputTimestamp: candidatePlacement.candidate.inputTimestamp,
      latitude: birthData.latitude,
      longitude: birthData.longitude,
    },
    policy,
  );

  if (result.status !== "verified") {
    return {
      ...candidatePlacement,
      reason: `Independent Ascendant verification rejected the candidate: ${result.reason}`,
      verificationFailure: {
        reason: result.reason,
        attemptedAt: new Date().toISOString(),
      },
    };
  }

  const source = `${result.candidate.source}; independently confirmed by ${result.reference.source}`;
  const engine = `${result.candidate.engine} + ${result.reference.engine}`;
  return {
    sign: result.sign,
    status: "verified",
    confidence: 1,
    source,
    candidate: candidatePlacement.candidate,
    provenance: {
      source,
      engine,
      calculatedAt: result.verifiedAt,
      inputTimestamp: result.candidate.inputTimestamp,
      candidateSource: result.candidate.source,
      candidateEngine: result.candidate.engine,
      candidateCalculatedAt: result.candidate.calculatedAt,
      referenceSource: result.reference.source,
      referenceEngine: result.reference.engine,
      referenceCalculatedAt: result.reference.calculatedAt,
      policyId: result.policy.policyId,
      evidenceReceiptId:
        result.policy.evidenceReceiptId ?? "ASCENDANT-VERIFICATION-RECEIPT-v1",
      evidenceArtifactId: "swiss-ephemeris-2.10.03-24-fixture-matrix",
      longitudeDeltaDegrees: result.longitudeDeltaDegrees,
    },
    reason:
      "Ascendant longitude and sign agreed across independent engines within the approved tolerance",
  };
}

function withRisingVerificationSummary(
  astrology: AstrologyData,
  rising: PlacementVerification,
): AstrologyData {
  const verifiedBodies = [
    ...astrology.verification.verifiedBodies,
    ...(rising.status === "verified" ? (["Ascendant"] as const) : []),
  ];
  const unresolvedBodies = astrology.verification.unresolvedBodies.filter(
    (body) => body !== "Ascendant",
  );
  if (rising.status !== "verified") unresolvedBodies.push("Ascendant");

  const missingData = astrology.verification.missingData.filter(
    (item) => item !== "validated_ascendant_engine",
  );
  if (rising.status !== "verified") {
    missingData.push("independent_ascendant_verification");
  }

  return {
    ...astrology,
    rising,
    verification: {
      ...astrology.verification,
      complete: unresolvedBodies.length === 0,
      verifiedBodies: verifiedBodies as AstrologyData["verification"]["verifiedBodies"],
      unresolvedBodies,
      missingData: [...new Set(missingData)],
      suggestions:
        unresolvedBodies.length === 0
          ? "Sun, Moon, and Ascendant are independently verified."
          : `Verified placements may be interpreted. ${unresolvedBodies.join(", ")} remain paused until their stated requirements pass.`,
      policyId:
        rising.status === "verified"
          ? "ASTRO-LONGITUDE-v1 + ASTRO-ASCENDANT-v1"
          : astrology.verification.policyId,
      evidenceReceiptId:
        rising.status === "verified"
          ? `${astrology.verification.evidenceReceiptId ?? "ASTRO-LONGITUDE-v1"} + ASCENDANT-VERIFICATION-RECEIPT-v1`
          : astrology.verification.evidenceReceiptId,
      lastUpdated: new Date().toISOString(),
    },
  };
}

export function calculateAstrology(birthData: BirthData): AstrologyData {
  const base = calculateBaseAstrology(birthData);
  return withRisingVerificationSummary(base, candidateRisingPlacement(birthData));
}

export async function calculateVerifiedAstrology(
  birthData: BirthData,
  options: ProductionAstrologyOptions = {},
): Promise<AstrologyData> {
  const { ascendantPolicy, ...baseOptions } = options;
  const base = await calculateBaseVerifiedAstrology(birthData, baseOptions);
  const rising = verifiedRisingPlacement(
    birthData,
    ascendantPolicy ?? APPROVED_ASCENDANT_POLICY,
  );
  return withRisingVerificationSummary(base, rising);
}
