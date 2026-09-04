import { fromZonedTime } from "date-fns-tz";
import type { PlacementEvidence, VerificationState } from "@soulcodex/core";
import { Body, Ecliptic, GeoVector } from "./astronomy-engine-compat";
import { fetchHorizonsReference } from "./jpl-horizons-reference";
import {
  verifyAgainstIndependentReference,
  type EphemerisCandidate,
  type IndependentEphemerisReference,
  type VerificationPolicy,
  type VerifiableBody,
} from "./astrology-verification";

export type PlanetaryBody = Exclude<VerifiableBody, "Sun" | "Moon">;
export type PlanetaryPlacementKey =
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export const PLANETARY_BODIES: readonly PlanetaryBody[] = Object.freeze([
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const);

export const PLANETARY_KEY_BY_BODY: Readonly<Record<PlanetaryBody, PlanetaryPlacementKey>> = Object.freeze({
  Mercury: "mercury",
  Venus: "venus",
  Mars: "mars",
  Jupiter: "jupiter",
  Saturn: "saturn",
  Uranus: "uranus",
  Neptune: "neptune",
  Pluto: "pluto",
});

export interface PlanetaryBirthData {
  birthDate: string;
  birthTime?: string;
  timezone?: string;
}

export interface PlanetaryPlacementVerification {
  body: PlanetaryBody;
  sign: string | null;
  verificationStatus: VerificationState;
  evidence?: PlacementEvidence | null;
  reason?: string;
  internalCandidate?: {
    sign: string;
    longitude: number;
    source: string;
    engine: string;
    calculatedAt: string;
    inputTimestamp: string;
  };
  verificationFailure?: {
    reason: string;
    attemptedAt: string;
  };
}

export type PlanetaryPlacementMap = Record<
  PlanetaryPlacementKey,
  PlanetaryPlacementVerification
>;

export interface PlanetaryVerificationOptions {
  policyForBody: (body: PlanetaryBody) => VerificationPolicy;
  referenceFetcher?: (
    body: PlanetaryBody,
    inputTimestamp: string,
  ) => Promise<IndependentEphemerisReference>;
  evidenceReceiptId?: string;
  evidenceArtifactId?: string;
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

const ENGINE = "astronomy-engine@2.1.19";
const SOURCE = "Astronomy Engine geocentric true-ecliptic-of-date calculation";

const BODY_MAP: Record<PlanetaryBody, any> = {
  Mercury: Body.Mercury,
  Venus: Body.Venus,
  Mars: Body.Mars,
  Jupiter: Body.Jupiter,
  Saturn: Body.Saturn,
  Uranus: Body.Uranus,
  Neptune: Body.Neptune,
  Pluto: Body.Pluto,
};

function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

function signFromLongitude(longitude: number): string {
  return ZODIAC_SIGNS[Math.floor(normalizeLongitude(longitude) / 30)];
}

export function exactBirthTimestampUtc(input: PlanetaryBirthData): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) return null;
  if (!input.birthTime || !/^\d{2}:\d{2}$/.test(input.birthTime)) return null;
  if (!input.timezone?.trim()) return null;

  const localTimestamp = `${input.birthDate}T${input.birthTime}:00`;
  const timestamp = fromZonedTime(localTimestamp, input.timezone);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
}

export function calculatePlanetaryCandidate(
  body: PlanetaryBody,
  input: PlanetaryBirthData,
): EphemerisCandidate {
  const timestamp = exactBirthTimestampUtc(input);
  if (!timestamp) throw new Error("planetary_exact_birth_timestamp_required");

  const vector = GeoVector(BODY_MAP[body], timestamp, true);
  const longitude = normalizeLongitude(Ecliptic(vector).elon);

  if (!Number.isFinite(longitude)) {
    throw new Error(`planetary_candidate_invalid_longitude:${body}`);
  }

  return {
    body,
    sign: signFromLongitude(longitude),
    longitude,
    source: SOURCE,
    engine: ENGINE,
    calculatedAt: new Date().toISOString(),
    inputTimestamp: timestamp.toISOString(),
  };
}

export function calculatePlanetaryCandidates(
  input: PlanetaryBirthData,
): Record<PlanetaryBody, EphemerisCandidate> {
  return Object.fromEntries(
    PLANETARY_BODIES.map((body) => [body, calculatePlanetaryCandidate(body, input)]),
  ) as Record<PlanetaryBody, EphemerisCandidate>;
}

function unresolvedPlacement(body: PlanetaryBody): PlanetaryPlacementVerification {
  return {
    body,
    sign: null,
    verificationStatus: "requires_verified_birth_time",
    reason:
      "Exact birth time and birth-place timezone are required before major-planet placements can be independently verified",
  };
}

function pendingPlacement(candidate: EphemerisCandidate): PlanetaryPlacementVerification {
  return {
    body: candidate.body as PlanetaryBody,
    sign: null,
    verificationStatus: "pending_independent_verification",
    evidence: {
      inputTimestamp: candidate.inputTimestamp,
      candidateSource: candidate.source,
      candidateEngine: candidate.engine,
      candidateCalculatedAt: candidate.calculatedAt,
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
      "A major-planet candidate exists, but it remains withheld until NASA/JPL reference agreement passes the approved policy",
  };
}

export function calculatePlanetaryCandidatePlacements(
  input: PlanetaryBirthData,
): PlanetaryPlacementMap {
  const timestamp = exactBirthTimestampUtc(input);
  return Object.fromEntries(
    PLANETARY_BODIES.map((body) => {
      const key = PLANETARY_KEY_BY_BODY[body];
      if (!timestamp) return [key, unresolvedPlacement(body)];
      try {
        return [key, pendingPlacement(calculatePlanetaryCandidate(body, input))];
      } catch {
        return [
          key,
          {
            body,
            sign: null,
            verificationStatus: "pending_ephemeris",
            reason: "Planetary ephemeris calculation failed safely; no value was promoted",
          } satisfies PlanetaryPlacementVerification,
        ];
      }
    }),
  ) as PlanetaryPlacementMap;
}

async function verifyPlacement(
  placement: PlanetaryPlacementVerification,
  options: PlanetaryVerificationOptions,
): Promise<PlanetaryPlacementVerification> {
  const candidate = placement.internalCandidate;
  if (!candidate) return placement;

  const ephemerisCandidate: EphemerisCandidate = {
    body: placement.body,
    ...candidate,
  };

  try {
    const referenceFetcher = options.referenceFetcher ??
      ((body: PlanetaryBody, inputTimestamp: string) =>
        fetchHorizonsReference(body, inputTimestamp, { timeoutMs: 5_000 }));
    const reference = await referenceFetcher(
      placement.body,
      ephemerisCandidate.inputTimestamp,
    );
    const policy = options.policyForBody(placement.body);
    const result = verifyAgainstIndependentReference(
      ephemerisCandidate,
      reference,
      policy,
    );

    if (result.status !== "verified") {
      return {
        ...placement,
        reason: `Independent planetary verification rejected the candidate: ${result.reason}`,
        verificationFailure: {
          reason: result.reason,
          attemptedAt: new Date().toISOString(),
        },
      };
    }

    return {
      body: placement.body,
      sign: result.sign,
      verificationStatus: "verified",
      evidence: {
        source: `${ephemerisCandidate.source}; independently confirmed by ${reference.source}`,
        engine: `${ephemerisCandidate.engine} + ${reference.engine}`,
        calculatedAt: result.verifiedAt,
        inputTimestamp: ephemerisCandidate.inputTimestamp,
        candidateSource: ephemerisCandidate.source,
        candidateEngine: ephemerisCandidate.engine,
        candidateCalculatedAt: ephemerisCandidate.calculatedAt,
        referenceSource: reference.source,
        referenceEngine: reference.engine,
        referenceCalculatedAt: reference.calculatedAt,
        policyId: result.policyId,
        evidenceReceiptId: options.evidenceReceiptId,
        evidenceArtifactId: options.evidenceArtifactId,
        longitudeDeltaDegrees: result.longitudeDeltaDegrees,
        confidence: 1,
      },
      internalCandidate: candidate,
      reason:
        "Planetary longitude and zodiac sign agreed with NASA/JPL Horizons inside the approved planetary tolerance",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "planetary_reference_failed";
    return {
      ...placement,
      reason:
        "Independent planetary verification was unavailable or invalid; the candidate remains inspectable but is not promoted",
      verificationFailure: {
        reason,
        attemptedAt: new Date().toISOString(),
      },
    };
  }
}

export async function calculateVerifiedPlanetaryPlacements(
  input: PlanetaryBirthData,
  options: PlanetaryVerificationOptions,
): Promise<PlanetaryPlacementMap> {
  const candidates = calculatePlanetaryCandidatePlacements(input);
  const verifiedEntries = await Promise.all(
    PLANETARY_BODIES.map(async (body) => {
      const key = PLANETARY_KEY_BY_BODY[body];
      return [key, await verifyPlacement(candidates[key], options)] as const;
    }),
  );
  return Object.fromEntries(verifiedEntries) as PlanetaryPlacementMap;
}
