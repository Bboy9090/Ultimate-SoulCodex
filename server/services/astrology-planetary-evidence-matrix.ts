import { calculateAstrology, type AstrologyData, type PlacementVerification } from "./astrology";
import {
  EPHEMERIS_EVIDENCE_FIXTURES,
  type EphemerisEvidenceFixture,
  type EvidenceFixtureCategory,
} from "./astrology-evidence-matrix";
import {
  fetchHorizonsReference,
  type SupportedHorizonsBody,
} from "./jpl-horizons-reference";

export const FULL_NATAL_BODIES: readonly SupportedHorizonsBody[] = Object.freeze([
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const);

export interface PlanetaryEvidenceRow {
  fixtureId: string;
  category: EvidenceFixtureCategory;
  body: SupportedHorizonsBody;
  inputTimestamp: string;
  candidateEngine: string;
  candidateLongitude: number;
  candidateSign: string;
  referenceEngine: string;
  referenceLongitude: number;
  referenceSign: string;
  longitudeDeltaDegrees: number;
  signAgreement: boolean;
}

export interface PlanetaryEvidenceReceipt {
  schemaVersion: "1.0.0";
  generatedAt: string;
  policyStatus: "evidence_only_no_planetary_tolerance_approved";
  fixtureCount: number;
  bodyCount: number;
  rows: PlanetaryEvidenceRow[];
  summary: {
    totalRows: number;
    signDisagreements: number;
    maximumLongitudeDeltaDegrees: number | null;
    bodyMaximumDeltaDegrees: Record<SupportedHorizonsBody, number | null>;
  };
}

export const PLANETARY_EVIDENCE_FIXTURES: EphemerisEvidenceFixture[] =
  EPHEMERIS_EVIDENCE_FIXTURES.map((fixture) => ({
    ...fixture,
    bodies: [...FULL_NATAL_BODIES],
    note: `${fixture.note} Expanded full-natal evidence matrix.`,
  }));

function placementForBody(
  astrology: AstrologyData,
  body: SupportedHorizonsBody,
): PlacementVerification {
  if (body === "Sun") return astrology.sun;
  if (body === "Moon") return astrology.moon;

  const planets = astrology.planets;
  if (!planets) throw new Error("planetary_candidates_missing");
  const key = body.toLowerCase() as Exclude<keyof typeof planets, "sun" | "moon">;
  return planets[key];
}

function circularDelta(left: number, right: number): number {
  const raw = Math.abs(left - right) % 360;
  return Math.min(raw, 360 - raw);
}

function maximum(values: number[]): number | null {
  return values.length > 0 ? Math.max(...values) : null;
}

export async function runLivePlanetaryEvidenceMatrix(
  fixtures: EphemerisEvidenceFixture[] = PLANETARY_EVIDENCE_FIXTURES,
): Promise<PlanetaryEvidenceReceipt> {
  const rows: PlanetaryEvidenceRow[] = [];

  for (const fixture of fixtures) {
    const astrology = calculateAstrology(fixture);

    for (const body of fixture.bodies) {
      const placement = placementForBody(astrology, body);
      const candidate = placement.internalCandidate;
      if (!candidate) throw new Error(`candidate_missing:${fixture.id}:${body}`);

      const reference = await fetchHorizonsReference(body, candidate.inputTimestamp);
      if (reference.inputTimestamp !== candidate.inputTimestamp) {
        throw new Error(`timestamp_mismatch:${fixture.id}:${body}`);
      }

      rows.push({
        fixtureId: fixture.id,
        category: fixture.category,
        body,
        inputTimestamp: candidate.inputTimestamp,
        candidateEngine: candidate.engine,
        candidateLongitude: candidate.longitude,
        candidateSign: candidate.sign,
        referenceEngine: reference.engine,
        referenceLongitude: reference.longitude,
        referenceSign: reference.sign,
        longitudeDeltaDegrees: circularDelta(candidate.longitude, reference.longitude),
        signAgreement: candidate.sign === reference.sign,
      });
    }
  }

  const bodyMaximumDeltaDegrees = Object.fromEntries(
    FULL_NATAL_BODIES.map((body) => [
      body,
      maximum(rows.filter((row) => row.body === body).map((row) => row.longitudeDeltaDegrees)),
    ]),
  ) as Record<SupportedHorizonsBody, number | null>;

  return {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    policyStatus: "evidence_only_no_planetary_tolerance_approved",
    fixtureCount: fixtures.length,
    bodyCount: FULL_NATAL_BODIES.length,
    rows,
    summary: {
      totalRows: rows.length,
      signDisagreements: rows.filter((row) => !row.signAgreement).length,
      maximumLongitudeDeltaDegrees: maximum(rows.map((row) => row.longitudeDeltaDegrees)),
      bodyMaximumDeltaDegrees,
    },
  };
}
