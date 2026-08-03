import { calculateAstrology } from "./astrology";
import { fetchHorizonsReference, type SupportedHorizonsBody } from "./jpl-horizons-reference";

export type EvidenceFixtureCategory =
  | "golden_profile"
  | "zodiac_boundary"
  | "dst_transition"
  | "historical";

export interface EphemerisEvidenceFixture {
  id: string;
  category: EvidenceFixtureCategory;
  birthDate: string;
  birthTime: string;
  timezone: string;
  latitude: number;
  longitude: number;
  bodies: SupportedHorizonsBody[];
  note: string;
}

export interface EphemerisEvidenceRow {
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

export interface EphemerisEvidenceReceipt {
  schemaVersion: "1.0.0";
  generatedAt: string;
  policyStatus: "evidence_only_no_tolerance_approved";
  fixtures: EphemerisEvidenceFixture[];
  rows: EphemerisEvidenceRow[];
  summary: {
    totalRows: number;
    signDisagreements: number;
    maximumLongitudeDeltaDegrees: number | null;
    sunMaximumDeltaDegrees: number | null;
    moonMaximumDeltaDegrees: number | null;
  };
}

export const EPHEMERIS_EVIDENCE_FIXTURES: EphemerisEvidenceFixture[] = [
  {
    id: "bobby-bronx-1990",
    category: "golden_profile",
    birthDate: "1990-09-17",
    birthTime: "11:11",
    timezone: "America/New_York",
    latitude: 40.8448,
    longitude: -73.8648,
    bodies: ["Sun", "Moon"],
    note: "Golden profile fixture; no expected sign is hardcoded.",
  },
  {
    id: "spring-equinox-boundary-2000",
    category: "zodiac_boundary",
    birthDate: "2000-03-20",
    birthTime: "07:35",
    timezone: "UTC",
    latitude: 0,
    longitude: 0,
    bodies: ["Sun", "Moon"],
    note: "Near a tropical zodiac boundary; agreement must be measured, not assumed.",
  },
  {
    id: "new-york-dst-spring-2024",
    category: "dst_transition",
    birthDate: "2024-03-10",
    birthTime: "03:05",
    timezone: "America/New_York",
    latitude: 40.7128,
    longitude: -74.006,
    bodies: ["Sun", "Moon"],
    note: "Post-spring-forward local time checks UTC conversion consistency.",
  },
  {
    id: "new-york-dst-fall-2024",
    category: "dst_transition",
    birthDate: "2024-11-03",
    birthTime: "02:05",
    timezone: "America/New_York",
    latitude: 40.7128,
    longitude: -74.006,
    bodies: ["Sun", "Moon"],
    note: "Post-fall-back local time avoids ambiguous 01:xx while testing offset transition handling.",
  },
  {
    id: "historical-greenwich-1900",
    category: "historical",
    birthDate: "1900-01-01",
    birthTime: "12:00",
    timezone: "UTC",
    latitude: 51.4769,
    longitude: 0,
    bodies: ["Sun", "Moon"],
    note: "Historical-range comparison fixture.",
  },
];

function circularDelta(left: number, right: number): number {
  const raw = Math.abs(left - right) % 360;
  return Math.min(raw, 360 - raw);
}

function maximum(values: number[]): number | null {
  return values.length > 0 ? Math.max(...values) : null;
}

export async function runLiveEphemerisEvidenceMatrix(
  fixtures: EphemerisEvidenceFixture[] = EPHEMERIS_EVIDENCE_FIXTURES,
): Promise<EphemerisEvidenceReceipt> {
  const rows: EphemerisEvidenceRow[] = [];

  for (const fixture of fixtures) {
    const astrology = calculateAstrology(fixture);

    for (const body of fixture.bodies) {
      const placement = body === "Sun" ? astrology.sun : astrology.moon;
      const candidate = placement.candidate;
      if (!candidate) {
        throw new Error(`candidate_missing:${fixture.id}:${body}`);
      }

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

  const sunRows = rows.filter((row) => row.body === "Sun");
  const moonRows = rows.filter((row) => row.body === "Moon");

  return {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    policyStatus: "evidence_only_no_tolerance_approved",
    fixtures,
    rows,
    summary: {
      totalRows: rows.length,
      signDisagreements: rows.filter((row) => !row.signAgreement).length,
      maximumLongitudeDeltaDegrees: maximum(rows.map((row) => row.longitudeDeltaDegrees)),
      sunMaximumDeltaDegrees: maximum(sunRows.map((row) => row.longitudeDeltaDegrees)),
      moonMaximumDeltaDegrees: maximum(moonRows.map((row) => row.longitudeDeltaDegrees)),
    },
  };
}
