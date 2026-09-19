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
  verifyEqualHouse,
  type EqualHouseProductionPolicy,
} from "./house-production";
import {
  calculateHousePosition,
  type HouseInput,
} from "./house-verification";
import {
  calculateMajorAspects,
  type AspectPolicy,
  type VerifiedLongitudePlacement,
} from "./aspect-engine";
import type { VerifiableBody } from "./astrology-verification";

export type { AstrologyData, BirthData, PlacementVerification, VerifiedAstrologyOptions };
export { getTarotBirthCards };

export interface ProductionAstrologyOptions extends VerifiedAstrologyOptions {
  ascendantPolicy?: AscendantVerificationPolicy;
  housePolicy?: EqualHouseProductionPolicy;
  aspectPolicy?: AspectPolicy;
}

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

function appendVerificationIdentity(
  current: string | null,
  next: string | null | undefined,
): string | null {
  const parts = (current ?? "")
    .split(" + ")
    .map((part) => part.trim())
    .filter(Boolean);
  if (next && !parts.includes(next)) parts.push(next);
  return parts.length > 0 ? parts.join(" + ") : null;
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
          ? "All currently supported natal placements are independently verified."
          : `Verified placements may be interpreted. ${unresolvedBodies.join(", ")} remain paused until their stated requirements pass.`,
      policyId:
        rising.verificationStatus === "verified"
          ? appendVerificationIdentity(
              astrology.verification.policyId,
              rising.evidence?.policyId,
            )
          : astrology.verification.policyId,
      evidenceReceiptId:
        rising.verificationStatus === "verified"
          ? appendVerificationIdentity(
              astrology.verification.evidenceReceiptId,
              rising.evidence?.evidenceReceiptId,
            )
          : astrology.verification.evidenceReceiptId,
      lastUpdated: new Date().toISOString(),
    },
  };
}

const PLANET_ENTRIES = [
  ["Sun", "sun"],
  ["Moon", "moon"],
  ["Mercury", "mercury"],
  ["Venus", "venus"],
  ["Mars", "mars"],
  ["Jupiter", "jupiter"],
  ["Saturn", "saturn"],
  ["Uranus", "uranus"],
  ["Neptune", "neptune"],
  ["Pluto", "pluto"],
] as const satisfies readonly [VerifiableBody, keyof NonNullable<AstrologyData["planets"]>][];

/**
 * Add derived chart geometry only from already-verified astronomical facts.
 * Equal House/MC have their own governed policy; aspects consume verified
 * longitudes only. Any unresolved prerequisite stays withheld.
 */
function withVerifiedDerivedChart(
  astrology: AstrologyData,
  birthData: BirthData,
  options: ProductionAstrologyOptions,
): AstrologyData {
  if (
    !birthData.birthTime ||
    !birthData.timezone ||
    birthData.latitude === undefined ||
    birthData.longitude === undefined ||
    astrology.rising.verificationStatus !== "verified" ||
    !astrology.planets
  ) {
    return {
      ...astrology,
      houseSystem: undefined,
      houses: undefined,
      midheaven: undefined,
      planetaryHouses: undefined,
      aspects: undefined,
    };
  }

  const timestamp = astrology.moon.internalCandidate?.inputTimestamp;
  if (!timestamp) return astrology;

  const houseInput: HouseInput = {
    inputTimestamp: timestamp,
    latitude: birthData.latitude,
    longitude: birthData.longitude,
  };
  const houses = verifyEqualHouse(houseInput, {
    ...(options.housePolicy ? { policy: options.housePolicy } : {}),
    ...(options.ascendantPolicy ? { ascendantPolicy: options.ascendantPolicy } : {}),
  });
  if (houses.status !== "verified") {
    return {
      ...astrology,
      houseSystem: undefined,
      houses: undefined,
      midheaven: undefined,
      planetaryHouses: undefined,
      aspects: undefined,
      verification: {
        ...astrology.verification,
        complete: false,
        unresolvedBodies: [
          ...new Set([...astrology.verification.unresolvedBodies, "Midheaven", "Houses"]),
        ],
        missingData: [
          ...new Set([...astrology.verification.missingData, `equal_house_verification:${houses.reason}`]),
        ],
        suggestions:
          "Verified planetary placements remain available, but MC and house-derived interpretation stay paused until the house verification contract passes.",
      },
    };
  }

  const planetLongitudes: VerifiedLongitudePlacement[] = [];
  const planetaryHouses: NonNullable<AstrologyData["planetaryHouses"]> = {};

  for (const [body, key] of PLANET_ENTRIES) {
    const placement = astrology.planets[key];
    if (
      placement.verificationStatus !== "verified" ||
      !placement.internalCandidate ||
      !Number.isFinite(placement.internalCandidate.longitude)
    ) {
      continue;
    }
    planetLongitudes.push({
      body,
      longitudeDegrees: placement.internalCandidate.longitude,
      verificationStatus: "verified",
    });
    planetaryHouses[key] = calculateHousePosition(
      placement.internalCandidate.longitude,
      houses.cusps,
    );
  }

  const aspects =
    planetLongitudes.length >= 2
      ? calculateMajorAspects(planetLongitudes, options.aspectPolicy)
      : [];

  const unresolvedDerived: string[] = [];
  if (planetLongitudes.length !== PLANET_ENTRIES.length) {
    unresolvedDerived.push("PlanetaryHouseAssignments", "Aspects");
  }

  return {
    ...astrology,
    houseSystem: "equal",
    houses: houses.cusps.map((cusp) => ({
      house: cusp.house,
      sign: cusp.sign,
      degree: cusp.degreeInSign,
      longitude: cusp.longitudeDegrees,
      verificationStatus: "verified" as const,
      policyId: cusp.policyId,
      evidenceArtifactId: cusp.evidenceArtifactId,
    })),
    midheaven: {
      sign: houses.midheaven.sign,
      degree: houses.midheaven.degreeInSign,
      longitude: houses.midheaven.longitudeDegrees,
      verificationStatus: "verified",
      policyId: houses.midheaven.policyId,
      longitudeDeltaDegrees: houses.midheaven.longitudeDeltaDegrees,
      evidenceArtifactId: houses.evidence.artifactId,
    },
    planetaryHouses,
    aspects: aspects.map((aspect) => ({
      planet1: aspect.bodyA.toLowerCase(),
      planet2: aspect.bodyB.toLowerCase(),
      aspect: aspect.aspect,
      orb: aspect.orbDegrees,
      separationDegrees: aspect.separationDegrees,
      targetAngleDegrees: aspect.targetAngleDegrees,
      policyId: aspect.policyId,
    })),
    verification: {
      ...astrology.verification,
      complete:
        astrology.verification.unresolvedBodies.length === 0 &&
        unresolvedDerived.length === 0,
      unresolvedBodies: [
        ...new Set([...astrology.verification.unresolvedBodies, ...unresolvedDerived]),
      ],
      missingData: [
        ...new Set([
          ...astrology.verification.missingData,
          ...(unresolvedDerived.length > 0 ? ["verified_longitudes_for_all_derived_chart_facts"] : []),
        ]),
      ],
      suggestions:
        astrology.verification.unresolvedBodies.length === 0 &&
        unresolvedDerived.length === 0
          ? "All currently supported natal planets, Ascendant, Midheaven, Equal House cusps, planetary house assignments, and major aspects are verified or deterministically derived from verified inputs."
          : astrology.verification.suggestions,
      policyId: appendVerificationIdentity(
        appendVerificationIdentity(astrology.verification.policyId, houses.midheaven.policyId),
        aspects[0]?.policyId,
      ),
      evidenceReceiptId: appendVerificationIdentity(
        astrology.verification.evidenceReceiptId,
        houses.evidence.runId,
      ),
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
  const { ascendantPolicy, housePolicy, aspectPolicy, ...baseOptions } = options;
  const base = await calculateBaseVerifiedAstrology(birthData, baseOptions);
  const rising = verifiedRisingPlacement(
    birthData,
    ascendantPolicy ?? APPROVED_ASCENDANT_POLICY,
  );
  const withRising = withRisingVerificationSummary(base, rising);
  return withVerifiedDerivedChart(withRising, birthData, {
    ...options,
    ascendantPolicy,
    housePolicy,
    aspectPolicy,
  });
}
