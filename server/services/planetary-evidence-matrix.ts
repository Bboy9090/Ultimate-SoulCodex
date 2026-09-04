import { fetchHorizonsReference } from "./jpl-horizons-reference";
import {
  PLANETARY_BODIES,
  calculatePlanetaryCandidate,
  type PlanetaryBody,
} from "./planetary-verification";

export type PlanetaryEvidenceCategory =
  | "golden_profile"
  | "seasonal_boundary"
  | "dst_transition"
  | "leap_day"
  | "timezone_edge"
  | "historical";

export interface PlanetaryEvidenceFixture {
  id: string;
  category: PlanetaryEvidenceCategory;
  birthDate: string;
  birthTime: string;
  timezone: string;
  note: string;
}

export interface PlanetaryEvidenceRow {
  fixtureId: string;
  category: PlanetaryEvidenceCategory;
  body: PlanetaryBody;
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

export interface PlanetaryBodyEvidenceSummary {
  rows: number;
  signDisagreements: number;
  maximumLongitudeDeltaDegrees: number | null;
}

export interface PlanetaryEvidenceReceipt {
  schemaVersion: "1.0.0";
  generatedAt: string;
  policyStatus: "evidence_only_no_planetary_policy_approved";
  fixtures: PlanetaryEvidenceFixture[];
  rows: PlanetaryEvidenceRow[];
  summary: {
    totalRows: number;
    rowsPerBody: number;
    signDisagreements: number;
    maximumLongitudeDeltaDegrees: number | null;
    byBody: Record<PlanetaryBody, PlanetaryBodyEvidenceSummary>;
  };
}

export const PLANETARY_EVIDENCE_FIXTURES: PlanetaryEvidenceFixture[] = [
  {
    id: "bobby-bronx-1990",
    category: "golden_profile",
    birthDate: "1990-09-17",
    birthTime: "11:11",
    timezone: "America/New_York",
    note: "Golden profile fixture with an exact local birth timestamp.",
  },
  {
    id: "san-juan-1991",
    category: "golden_profile",
    birthDate: "1991-04-23",
    birthTime: "12:00",
    timezone: "America/Puerto_Rico",
    note: "No-DST Caribbean fixture.",
  },
  {
    id: "spring-equinox-2000",
    category: "seasonal_boundary",
    birthDate: "2000-03-20",
    birthTime: "07:35",
    timezone: "UTC",
    note:
      "Seasonal-boundary timestamp. This is not counted as a Mercury-through-Pluto zodiac-cusp test unless a body-specific cusp fixture separately proves proximity to a 30-degree boundary.",
  },
  {
    id: "winter-solstice-2000",
    category: "seasonal_boundary",
    birthDate: "2000-12-21",
    birthTime: "13:40",
    timezone: "UTC",
    note:
      "Second seasonal-boundary timestamp. It exercises date/ephemeris behavior but is not represented as a body-specific planetary zodiac-cusp test.",
  },
  {
    id: "new-york-dst-spring-2024",
    category: "dst_transition",
    birthDate: "2024-03-10",
    birthTime: "03:05",
    timezone: "America/New_York",
    note: "Post-spring-forward timestamp conversion fixture.",
  },
  {
    id: "london-dst-fall-2024",
    category: "dst_transition",
    birthDate: "2024-10-27",
    birthTime: "02:05",
    timezone: "Europe/London",
    note: "Post-fall-back UK fixture outside the repeated hour.",
  },
  {
    id: "sydney-dst-spring-2024",
    category: "dst_transition",
    birthDate: "2024-10-06",
    birthTime: "03:05",
    timezone: "Australia/Sydney",
    note: "Southern-hemisphere DST fixture.",
  },
  {
    id: "leap-day-new-york-2024",
    category: "leap_day",
    birthDate: "2024-02-29",
    birthTime: "23:30",
    timezone: "America/New_York",
    note: "Leap-day and local-day-rollover fixture.",
  },
  {
    id: "kiritimati-date-line-2024",
    category: "timezone_edge",
    birthDate: "2024-01-01",
    birthTime: "00:15",
    timezone: "Pacific/Kiritimati",
    note: "UTC+14 date-line conversion fixture.",
  },
  {
    id: "historical-greenwich-1950",
    category: "historical",
    birthDate: "1950-06-15",
    birthTime: "18:45",
    timezone: "UTC",
    note: "Mid-century historical-range fixture.",
  },
];

function circularDelta(left: number, right: number): number {
  const raw = Math.abs(left - right) % 360;
  return Math.min(raw, 360 - raw);
}

function maximum(values: number[]): number | null {
  return values.length > 0 ? Math.max(...values) : null;
}

export async function runPlanetaryEvidenceMatrix(
  fixtures: PlanetaryEvidenceFixture[] = PLANETARY_EVIDENCE_FIXTURES,
): Promise<PlanetaryEvidenceReceipt> {
  const rows: PlanetaryEvidenceRow[] = [];

  for (const fixture of fixtures) {
    for (const configuredBody of PLANETARY_BODIES) {
      const body: PlanetaryBody = configuredBody;
      const candidate = calculatePlanetaryCandidate(body, fixture);
      const reference = await fetchHorizonsReference(body, candidate.inputTimestamp, {
        timeoutMs: 8_000,
        maxAttempts: 4,
        retryBaseDelayMs: 650,
      });

      if (reference.body !== body) {
        throw new Error(`planetary_reference_body_mismatch:${fixture.id}:${body}`);
      }
      if (reference.inputTimestamp !== candidate.inputTimestamp) {
        throw new Error(`planetary_timestamp_mismatch:${fixture.id}:${body}`);
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

  const byBody = Object.fromEntries(
    PLANETARY_BODIES.map((configuredBody) => {
      const body: PlanetaryBody = configuredBody;
      const bodyRows = rows.filter((row) => row.body === body);
      return [
        body,
        {
          rows: bodyRows.length,
          signDisagreements: bodyRows.filter((row) => !row.signAgreement).length,
          maximumLongitudeDeltaDegrees: maximum(
            bodyRows.map((row) => row.longitudeDeltaDegrees),
          ),
        } satisfies PlanetaryBodyEvidenceSummary,
      ];
    }),
  ) as Record<PlanetaryBody, PlanetaryBodyEvidenceSummary>;

  return {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    policyStatus: "evidence_only_no_planetary_policy_approved",
    fixtures,
    rows,
    summary: {
      totalRows: rows.length,
      rowsPerBody: fixtures.length,
      signDisagreements: rows.filter((row) => !row.signAgreement).length,
      maximumLongitudeDeltaDegrees: maximum(rows.map((row) => row.longitudeDeltaDegrees)),
      byBody,
    },
  };
}
