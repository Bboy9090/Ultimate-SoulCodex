import { Body, Ecliptic, GeoVector } from "./astronomy-engine-compat";
import { fromZonedTime } from "date-fns-tz";
import type {
  VerificationState,
  PlacementEvidence,
  PlacementLike,
} from "@soulcodex/core";
import {
  fetchHorizonsReference,
  type SupportedHorizonsBody,
} from "./jpl-horizons-reference";
import {
  verifyAgainstIndependentReference,
  type EphemerisCandidate,
  type IndependentEphemerisReference,
  type VerificationPolicy,
  type VerifiableBody,
} from "./astrology-verification";
import {
  APPROVED_LONGITUDE_TOLERANCE_EVIDENCE,
  getApprovedLongitudeTolerancePolicy,
} from "./astrology-tolerance-policy";

export interface BirthData {
  birthDate: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

// Internal-only candidate representation during calculation
interface InternalCandidate {
  sign: string;
  longitude: number;
  source: string;
  engine: string;
  calculatedAt: string;
  inputTimestamp: string;
}

// Server-side placement verification using canonical types
export interface PlacementVerification extends PlacementLike {
  sign: string | null;
  verificationStatus: VerificationState;
  evidence?: PlacementEvidence | null;
  reason?: string;
  internalCandidate?: InternalCandidate;
  verificationFailure?: {
    reason: string;
    attemptedAt: string;
  };
}

export interface AstrologyData {
  sun: PlacementVerification;
  moon: PlacementVerification;
  rising: PlacementVerification;
  planets?: {
    sun?: { sign?: string; house?: number; degree?: number };
    moon?: { sign?: string; house?: number; degree?: number };
    [key: string]: unknown;
  };
  houses?: Array<{ sign?: string; degree?: number }>;
  aspects?: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>;
  northNode?: { sign?: string; house?: number; degree?: number };
  southNode?: { sign?: string; house?: number; degree?: number };
  chiron?: { sign?: string; house?: number; degree?: number };
  verification: {
    complete: boolean;
    verifiedBodies: VerifiableBody[];
    unresolvedBodies: string[];
    missingData: string[];
    suggestions: string;
    policyId: string | null;
    evidenceReceiptId: string | null;
    lastUpdated: string;
  };
}

export type IndependentReferenceFetcher = (
  body: SupportedHorizonsBody,
  inputTimestamp: string,
) => Promise<IndependentEphemerisReference>;

export interface VerifiedAstrologyOptions {
  referenceFetcher?: IndependentReferenceFetcher;
  policyForBody?: (body: VerifiableBody) => VerificationPolicy;
}

const ZODIAC_SIGNS = [
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
] as const;

const EPHEMERIS_ENGINE = "astronomy-engine@2.1.19";
const EPHEMERIS_SOURCE = "Astronomy Engine geocentric true-ecliptic-of-date calculation";

function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

function signFromLongitude(longitude: number): string {
  return ZODIAC_SIGNS[Math.floor(normalizeLongitude(longitude) / 30)];
}

function buildUtcBirthTimestamp(birthData: BirthData, requiresTime: boolean): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthData.birthDate)) return null;

  const birthTime = birthData.birthTime?.trim();
  if (requiresTime && !birthTime) return null;

  const time = birthTime && /^\d{2}:\d{2}$/.test(birthTime) ? birthTime : "12:00";
  const localTimestamp = `${birthData.birthDate}T${time}:00`;

  if (birthData.timezone) {
    const zoned = fromZonedTime(localTimestamp, birthData.timezone);
    return Number.isNaN(zoned.getTime()) ? null : zoned;
  }

  // Date-only Sun candidates remain useful for evidence collection, but the
  // production verifier will not promote them without an explicit time zone.
  if (requiresTime) return null;
  const utc = new Date(`${localTimestamp}Z`);
  return Number.isNaN(utc.getTime()) ? null : utc;
}

function calculateCandidate(body: Body, timestamp: Date): InternalCandidate {
  const vector = GeoVector(body as any, timestamp, true);
  const longitude = normalizeLongitude(Ecliptic(vector).elon);

  return {
    sign: signFromLongitude(longitude),
    longitude,
    source: EPHEMERIS_SOURCE,
    engine: EPHEMERIS_ENGINE,
    calculatedAt: new Date().toISOString(),
    inputTimestamp: timestamp.toISOString(),
  };
}

function pendingCandidatePlacement(candidate: InternalCandidate): PlacementVerification {
  return {
    sign: null,
    verificationStatus: "pending_independent_verification",
    evidence: {
      inputTimestamp: candidate.inputTimestamp,
      candidateSource: candidate.source,
      candidateEngine: candidate.engine,
      candidateCalculatedAt: candidate.calculatedAt,
    },
    internalCandidate: candidate,
    reason:
      "Calculated by one trusted ephemeris engine; independent comparison is still required before interpretation",
  };
}

function getSunPlacement(birthData: BirthData): PlacementVerification {
  const timestamp = buildUtcBirthTimestamp(birthData, false);
  if (!timestamp) {
    return {
      sign: null,
      verificationStatus: "pending_ephemeris",
      reason: "A valid birth date is required for ephemeris calculation",
    };
  }

  try {
    return pendingCandidatePlacement(calculateCandidate(Body.Sun as any, timestamp));
  } catch {
    return {
      sign: null,
      verificationStatus: "pending_ephemeris",
      reason: "Ephemeris calculation failed safely; no placement was promoted",
    };
  }
}

function getMoonPlacement(birthData: BirthData): PlacementVerification {
  if (!birthData.birthTime) {
    return {
      sign: null,
      verificationStatus: "requires_verified_birth_time",
      reason: "Birth time required for Moon sign calculation",
    };
  }

  if (!birthData.timezone) {
    return {
      sign: null,
      verificationStatus: "requires_verified_birth_time",
      reason: "Timezone required to convert the entered birth time to UTC",
    };
  }

  const timestamp = buildUtcBirthTimestamp(birthData, true);
  if (!timestamp) {
    return {
      sign: null,
      verificationStatus: "pending_ephemeris",
      reason: "Birth date, time, or timezone could not be converted safely",
    };
  }

  try {
    return pendingCandidatePlacement(calculateCandidate(Body.Moon as any, timestamp));
  } catch {
    return {
      sign: null,
      verificationStatus: "pending_ephemeris",
      reason: "Ephemeris calculation failed safely; no placement was promoted",
    };
  }
}

function getRisingPlacement(birthData: BirthData): PlacementVerification {
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

  return {
    sign: null,
    verificationStatus: "pending_ephemeris",
    reason:
      "Ascendant calculation remains intentionally blocked until its formula and independent reference suite are validated",
  };
}

function candidateForBody(
  body: VerifiableBody,
  placement: PlacementVerification,
): EphemerisCandidate | null {
  if (!placement.internalCandidate) return null;
  return {
    body,
    ...placement.internalCandidate,
  };
}

function verifiedPlacement(
  candidate: EphemerisCandidate,
  reference: IndependentEphemerisReference,
  result: Extract<ReturnType<typeof verifyAgainstIndependentReference>, { status: "verified" }>,
): PlacementVerification {
  const source = `${candidate.source}; independently confirmed by ${reference.source}`;
  const engine = `${candidate.engine} + ${reference.engine}`;

  return {
    sign: result.sign,
    verificationStatus: "verified",
    evidence: {
      source,
      engine,
      calculatedAt: result.verifiedAt,
      inputTimestamp: candidate.inputTimestamp,
      candidateSource: candidate.source,
      candidateEngine: candidate.engine,
      candidateCalculatedAt: candidate.calculatedAt,
      referenceSource: reference.source,
      referenceEngine: reference.engine,
      referenceCalculatedAt: reference.calculatedAt,
      policyId: result.policyId,
      evidenceReceiptId: APPROVED_LONGITUDE_TOLERANCE_EVIDENCE.receiptRunId,
      evidenceArtifactId: APPROVED_LONGITUDE_TOLERANCE_EVIDENCE.artifactId,
      longitudeDeltaDegrees: result.longitudeDeltaDegrees,
      confidence: 1,
    },
    internalCandidate: {
      sign: candidate.sign,
      longitude: candidate.longitude,
      source: candidate.source,
      engine: candidate.engine,
      calculatedAt: candidate.calculatedAt,
      inputTimestamp: candidate.inputTimestamp,
    },
    reason:
      "Astronomical longitude and zodiac sign independently agreed within the approved production tolerance",
  };
}

async function verifyPlacement(
  body: VerifiableBody,
  placement: PlacementVerification,
  options: Required<VerifiedAstrologyOptions>,
): Promise<PlacementVerification> {
  const candidate = candidateForBody(body, placement);
  if (!candidate) return placement;

  try {
    const reference = await options.referenceFetcher(body, candidate.inputTimestamp);
    const policy = options.policyForBody(body);
    const result = verifyAgainstIndependentReference(candidate, reference, policy);

    if (result.status === "verified") {
      return verifiedPlacement(candidate, reference, result);
    }

    return {
      ...placement,
      reason: `Independent verification rejected the candidate: ${result.reason}`,
      verificationFailure: {
        reason: result.reason,
        attemptedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "independent_reference_failed";
    return {
      ...placement,
      reason:
        "Independent verification was unavailable or invalid; the candidate remains withheld from interpretation",
      verificationFailure: {
        reason,
        attemptedAt: new Date().toISOString(),
      },
    };
  }
}

function buildVerificationSummary(
  sun: PlacementVerification,
  moon: PlacementVerification,
  rising: PlacementVerification,
  birthData: BirthData,
): AstrologyData["verification"] {
  const verifiedBodies: VerifiableBody[] = [];
  if (sun.verificationStatus === "verified") verifiedBodies.push("Sun");
  if (moon.verificationStatus === "verified") verifiedBodies.push("Moon");

  const unresolvedBodies = [
    sun.verificationStatus !== "verified" ? "Sun" : null,
    moon.verificationStatus !== "verified" ? "Moon" : null,
    rising.verificationStatus !== "verified" ? "Ascendant" : null,
  ].filter((value): value is string => Boolean(value));

  const missingData: string[] = [];
  if (!birthData.birthTime) missingData.push("verified_birth_time");
  if (!birthData.timezone) missingData.push("timezone");
  if (birthData.latitude === undefined || birthData.longitude === undefined) {
    missingData.push("precise_location");
  }
  if (sun.verificationStatus !== "verified") missingData.push("independent_sun_verification");
  if (moon.verificationStatus !== "verified") missingData.push("independent_moon_verification");
  if (rising.verificationStatus !== "verified") missingData.push("validated_ascendant_engine");

  return {
    complete: unresolvedBodies.length === 0,
    verifiedBodies,
    unresolvedBodies,
    missingData: [...new Set(missingData)],
    suggestions:
      unresolvedBodies.length === 0
        ? "All currently supported placements are verified."
        : `Verified placements may be interpreted. ${unresolvedBodies.join(", ")} remain paused until their stated requirements pass.`,
    policyId:
      verifiedBodies.length > 0 ? "ASTRO-LONGITUDE-v1" : null,
    evidenceReceiptId:
      verifiedBodies.length > 0
        ? APPROVED_LONGITUDE_TOLERANCE_EVIDENCE.receiptRunId
        : null,
    lastUpdated: new Date().toISOString(),
  };
}

export function calculateAstrology(birthData: BirthData): AstrologyData {
  const sun = getSunPlacement(birthData);
  const moon = getMoonPlacement(birthData);
  const rising = getRisingPlacement(birthData);

  return {
    sun,
    moon,
    rising,
    planets: undefined,
    houses: undefined,
    aspects: undefined,
    northNode: undefined,
    southNode: undefined,
    chiron: undefined,
    verification: buildVerificationSummary(sun, moon, rising, birthData),
  };
}

export async function calculateVerifiedAstrology(
  birthData: BirthData,
  suppliedOptions: VerifiedAstrologyOptions = {},
): Promise<AstrologyData> {
  const candidateData = calculateAstrology(birthData);

  // A date-only noon candidate is useful internally, but it cannot become a
  // production fact without the user's explicit birth time and timezone.
  const canVerifyTimedPlacements = Boolean(birthData.birthTime && birthData.timezone);
  if (!canVerifyTimedPlacements) {
    return {
      ...candidateData,
      sun: candidateData.sun.internalCandidate
        ? {
            ...candidateData.sun,
            reason:
              "A candidate exists, but explicit birth time and timezone are required before production verification",
          }
        : candidateData.sun,
    };
  }

  const options: Required<VerifiedAstrologyOptions> = {
    referenceFetcher:
      suppliedOptions.referenceFetcher ??
      ((body, inputTimestamp) =>
        fetchHorizonsReference(body, inputTimestamp, { timeoutMs: 5_000 })),
    policyForBody:
      suppliedOptions.policyForBody ?? getApprovedLongitudeTolerancePolicy,
  };

  const [sun, moon] = await Promise.all([
    verifyPlacement("Sun", candidateData.sun, options),
    verifyPlacement("Moon", candidateData.moon, options),
  ]);
  const rising = candidateData.rising;

  return {
    ...candidateData,
    sun,
    moon,
    rising,
    verification: buildVerificationSummary(sun, moon, rising, birthData),
  };
}

export function getTarotBirthCards(
  birthDate: string,
): { card1: string; card2: string; interpretation: string } {
  const date = new Date(birthDate);
  const sum = date.getDate() + (date.getMonth() + 1) + date.getFullYear();
  const digitalRoot = sum
    .toString()
    .split("")
    .reduce((acc, digit) => acc + Number.parseInt(digit, 10), 0);
  const finalSum =
    digitalRoot > 9
      ? digitalRoot
          .toString()
          .split("")
          .reduce((acc, digit) => acc + Number.parseInt(digit, 10), 0)
      : digitalRoot;

  const tarotCards = [
    {
      card1: "The Fool",
      card2: "The World",
      interpretation: "Journey of infinite potential and cosmic completion",
    },
    {
      card1: "The Magician",
      card2: "The High Priestess",
      interpretation: "Balance of conscious will and intuitive wisdom",
    },
    {
      card1: "The Empress",
      card2: "The Emperor",
      interpretation: "Creative nurturing paired with structured authority",
    },
    {
      card1: "The Hierophant",
      card2: "The Lovers",
      interpretation: "Traditional wisdom meets heart-centered choices",
    },
    {
      card1: "The Chariot",
      card2: "Strength",
      interpretation: "Directed willpower flowing through inner courage",
    },
    {
      card1: "The Hermit",
      card2: "Wheel of Fortune",
      interpretation: "Inner guidance navigating life's cycles",
    },
    {
      card1: "Justice",
      card2: "The Hanged Man",
      interpretation: "Divine balance through surrender and perspective",
    },
    {
      card1: "Death",
      card2: "Temperance",
      interpretation: "Transformation through divine alchemy",
    },
    {
      card1: "The Devil",
      card2: "The Tower",
      interpretation: "Breaking free from illusion and limitation",
    },
  ];

  return tarotCards[finalSum % tarotCards.length];
}
