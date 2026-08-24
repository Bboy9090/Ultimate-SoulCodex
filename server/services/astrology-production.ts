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
import {
  calculatePlanetaryCandidatePlacements,
  calculateVerifiedPlanetaryPlacements,
  PLANETARY_BODIES,
  PLANETARY_KEY_BY_BODY,
  type PlanetaryPlacementMap,
} from "./planetary-verification";
import {
  APPROVED_PLANETARY_EVIDENCE,
  getApprovedPlanetaryPolicy,
} from "./planetary-tolerance-policy";

export type { AstrologyData, BirthData, PlacementVerification, VerifiedAstrologyOptions };
export { getTarotBirthCards };

export interface ProductionAstrologyOptions extends VerifiedAstrologyOptions {
  ascendantPolicy?: AscendantVerificationPolicy;
}

const PLANETARY_BODY_NAMES = new Set<string>(PLANETARY_BODIES);

function candidateRisingPlacement(birthData: BirthData): PlacementVerification {
  if (!birthData.birthTime || !birthData.timezone) {
    return {
      sign: null,
      verificationStatus: "requires_verified_birth_time",
      reason: "Verified birth time and timezone required for Rising sign calculation",
    };
  }

  if (birthData.latitude === undefined || birthData.longitude === undefined) {
    return {
      sign: null,
      verificationStatus: "requires_location",
      reason: "Precise birth coordinates required for Rising sign calculation",
    };
  }

  const base = calculateBaseAstrology(birthData);
  const timestamp = base.moon.internalCandidate?.inputTimestamp;
  if (!timestamp) {
    return {
      sign: null,
      verificationStatus: "pending_ephemeris",
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
      verificationStatus: "pending_independent_verification",
      evidence: {
        inputTimestamp: timestamp,
        candidateSource: candidate.source,
        candidateEngine: candidate.engine,
        candidateCalculatedAt: candidate.calculatedAt,
      },
      internalCandidate: {
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
      verificationStatus: "pending_ephemeris",
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
    !candidatePlacement.internalCandidate ||
    birthData.latitude === undefined ||
    birthData.longitude === undefined
  ) {
    return candidatePlacement;
  }

  const result = verifyAscendant(
    {
      inputTimestamp: candidatePlacement.internalCandidate.inputTimestamp,
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
    verificationStatus: "verified",
    evidence: {
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
      confidence: 1,
    },
    internalCandidate: candidatePlacement.internalCandidate,
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
    ...(rising.verificationStatus === "verified" ? (["Ascendant"] as const) : []),
  ];
  const unresolvedBodies = astrology.verification.unresolvedBodies.filter(
    (body) => body !== "Ascendant",
  );
  if (rising.verificationStatus !== "verified") unresolvedBodies.push("Ascendant");

  const missingData = astrology.verification.missingData.filter(
    (item) => item !== "validated_ascendant_engine",
  );
  if (rising.verificationStatus !== "verified") {
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
        rising.verificationStatus === "verified"
          ? "ASTRO-LONGITUDE-v1 + ASTRO-ASCENDANT-v1"
          : astrology.verification.policyId,
      evidenceReceiptId:
        rising.verificationStatus === "verified"
          ? `${astrology.verification.evidenceReceiptId ?? "ASTRO-LONGITUDE-v1"} + ASCENDANT-VERIFICATION-RECEIPT-v1`
          : astrology.verification.evidenceReceiptId,
      lastUpdated: new Date().toISOString(),
    },
  };
}

function withPlanetaryVerificationSummary(
  astrology: AstrologyData,
  planets: PlanetaryPlacementMap,
): AstrologyData {
  const verifiedPlanetBodies = PLANETARY_BODIES.filter(
    (body) => planets[PLANETARY_KEY_BY_BODY[body]].verificationStatus === "verified",
  );
  const unresolvedPlanetBodies = PLANETARY_BODIES.filter(
    (body) => planets[PLANETARY_KEY_BY_BODY[body]].verificationStatus !== "verified",
  );
  const coreUnresolved = astrology.verification.unresolvedBodies.filter(
    (body) => !PLANETARY_BODY_NAMES.has(String(body)),
  );
  const verifiedBodies = [
    ...astrology.verification.verifiedBodies,
    ...verifiedPlanetBodies,
  ];
  const unresolvedBodies = [
    ...coreUnresolved,
    ...unresolvedPlanetBodies,
  ];
  const missingData = astrology.verification.missingData.filter(
    (item) => item !== "independent_major_planet_verification",
  );
  if (unresolvedPlanetBodies.length > 0) {
    missingData.push("independent_major_planet_verification");
  }

  return {
    ...astrology,
    planets: planets as AstrologyData["planets"],
    verification: {
      ...astrology.verification,
      complete: unresolvedBodies.length === 0,
      verifiedBodies: [...new Set(verifiedBodies)] as AstrologyData["verification"]["verifiedBodies"],
      unresolvedBodies,
      missingData: [...new Set(missingData)],
      suggestions:
        unresolvedBodies.length === 0
          ? "Sun, Moon, Ascendant, and Mercury through Pluto are independently verified."
          : `Verified chart placements may be interpreted. ${unresolvedBodies.join(", ")} remain paused until their stated requirements pass.`,
      policyId:
        verifiedPlanetBodies.length > 0
          ? `${astrology.verification.policyId ?? "ASTRO-CORE"} + ASTRO-PLANETARY-LONGITUDE-v1`
          : astrology.verification.policyId,
      evidenceReceiptId:
        verifiedPlanetBodies.length > 0
          ? `${astrology.verification.evidenceReceiptId ?? "ASTRO-CORE"} + planetary-run-${APPROVED_PLANETARY_EVIDENCE.workflowRunId}`
          : astrology.verification.evidenceReceiptId,
      lastUpdated: new Date().toISOString(),
    },
  };
}

export function calculateAstrology(birthData: BirthData): AstrologyData {
  const base = calculateBaseAstrology(birthData);
  return withRisingVerificationSummary(base, candidateRisingPlacement(birthData));
}

export function calculateFullChartCandidates(birthData: BirthData): AstrologyData {
  const core = calculateAstrology(birthData);
  return {
    ...core,
    planets: calculatePlanetaryCandidatePlacements(birthData) as AstrologyData["planets"],
  };
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

export async function calculateVerifiedFullChartAstrology(
  birthData: BirthData,
  options: ProductionAstrologyOptions = {},
): Promise<AstrologyData> {
  const core = await calculateVerifiedAstrology(birthData, options);
  const planets = await calculateVerifiedPlanetaryPlacements(birthData, {
    policyForBody: getApprovedPlanetaryPolicy,
    evidenceReceiptId: `planetary-run-${APPROVED_PLANETARY_EVIDENCE.workflowRunId}`,
    evidenceArtifactId: APPROVED_PLANETARY_EVIDENCE.artifactId,
  });
  return withPlanetaryVerificationSummary(core, planets);
}
