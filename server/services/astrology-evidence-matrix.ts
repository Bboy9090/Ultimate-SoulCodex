import { calculateAstrology } from "./astrology";
import { fetchHorizonsReference, type SupportedHorizonsBody } from "./jpl-horizons-reference";

export type EvidenceFixtureCategory =
  | "golden_profile"
  | "zodiac_boundary"
  | "dst_transition"
  | "leap_day"
  | "timezone_edge"
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

const BOTH_BODIES: SupportedHorizonsBody[] = ["Sun", "Moon"];

export const EPHEMERIS_EVIDENCE_FIXTURES: EphemerisEvidenceFixture[] = [
  {
    id: "bobby-bronx-1990",
    category: "golden_profile",
    birthDate: "1990-09-17",
    birthTime: "11:11",
    timezone: "America/New_York",
    latitude: 40.8448,
    longitude: -73.8648,
    bodies: BOTH_BODIES,
    note: "Golden profile fixture; no expected sign is hardcoded.",
  },
  {
    id: "san-juan-profile-1991",
    category: "golden_profile",
    birthDate: "1991-04-23",
    birthTime: "12:00",
    timezone: "America/Puerto_Rico",
    latitude: 18.4655,
    longitude: -66.1057,
    bodies: BOTH_BODIES,
    note: "Caribbean no-DST profile fixture with a controlled noon time.",
  },
  {
    id: "spring-equinox-boundary-2000",
    category: "zodiac_boundary",
    birthDate: "2000-03-20",
    birthTime: "07:35",
    timezone: "UTC",
    latitude: 0,
    longitude: 0,
    bodies: BOTH_BODIES,
    note: "Near the Pisces-Aries tropical boundary; agreement must be measured, not assumed.",
  },
  {
    id: "summer-solstice-boundary-2000",
    category: "zodiac_boundary",
    birthDate: "2000-06-21",
    birthTime: "01:45",
    timezone: "UTC",
    latitude: 51.4769,
    longitude: 0,
    bodies: BOTH_BODIES,
    note: "Near the Gemini-Cancer tropical boundary.",
  },
  {
    id: "autumn-equinox-boundary-2000",
    category: "zodiac_boundary",
    birthDate: "2000-09-22",
    birthTime: "17:30",
    timezone: "UTC",
    latitude: 0,
    longitude: 0,
    bodies: BOTH_BODIES,
    note: "Near the Virgo-Libra tropical boundary.",
  },
  {
    id: "winter-solstice-boundary-2000",
    category: "zodiac_boundary",
    birthDate: "2000-12-21",
    birthTime: "13:40",
    timezone: "UTC",
    latitude: 51.4769,
    longitude: 0,
    bodies: BOTH_BODIES,
    note: "Near the Sagittarius-Capricorn tropical boundary.",
  },
  {
    id: "new-york-dst-spring-2024",
    category: "dst_transition",
    birthDate: "2024-03-10",
    birthTime: "03:05",
    timezone: "America/New_York",
    latitude: 40.7128,
    longitude: -74.006,
    bodies: BOTH_BODIES,
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
    bodies: BOTH_BODIES,
    note: "Post-fall-back local time avoids ambiguous 01:xx while testing offset transition handling.",
  },
  {
    id: "london-dst-spring-2024",
    category: "dst_transition",
    birthDate: "2024-03-31",
    birthTime: "02:05",
    timezone: "Europe/London",
    latitude: 51.5074,
    longitude: -0.1278,
    bodies: BOTH_BODIES,
    note: "Post-UK spring transition fixture.",
  },
  {
    id: "london-dst-fall-2024",
    category: "dst_transition",
    birthDate: "2024-10-27",
    birthTime: "02:05",
    timezone: "Europe/London",
    latitude: 51.5074,
    longitude: -0.1278,
    bodies: BOTH_BODIES,
    note: "Post-UK fall transition fixture avoids the repeated 01:xx hour.",
  },
  {
    id: "sydney-dst-spring-2024",
    category: "dst_transition",
    birthDate: "2024-10-06",
    birthTime: "03:05",
    timezone: "Australia/Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
    bodies: BOTH_BODIES,
    note: "Southern-hemisphere spring-forward fixture.",
  },
  {
    id: "sydney-dst-fall-2024",
    category: "dst_transition",
    birthDate: "2024-04-07",
    birthTime: "03:05",
    timezone: "Australia/Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
    bodies: BOTH_BODIES,
    note: "Southern-hemisphere fall-back fixture after the repeated hour.",
  },
  {
    id: "leap-day-2000-utc",
    category: "leap_day",
    birthDate: "2000-02-29",
    birthTime: "12:00",
    timezone: "UTC",
    latitude: 0,
    longitude: 0,
    bodies: BOTH_BODIES,
    note: "Century leap-year fixture.",
  },
  {
    id: "leap-day-2024-new-york",
    category: "leap_day",
    birthDate: "2024-02-29",
    birthTime: "23:30",
    timezone: "America/New_York",
    latitude: 40.7128,
    longitude: -74.006,
    bodies: BOTH_BODIES,
    note: "Modern leap-day fixture near local-day rollover.",
  },
  {
    id: "kiritimati-date-line-2024",
    category: "timezone_edge",
    birthDate: "2024-01-01",
    birthTime: "00:15",
    timezone: "Pacific/Kiritimati",
    latitude: 1.8721,
    longitude: -157.4278,
    bodies: BOTH_BODIES,
    note: "UTC+14 date-line fixture checks previous-UTC-day conversion.",
  },
  {
    id: "pago-pago-date-line-2024",
    category: "timezone_edge",
    birthDate: "2024-01-01",
    birthTime: "23:45",
    timezone: "Pacific/Pago_Pago",
    latitude: -14.2756,
    longitude: -170.702,
    bodies: BOTH_BODIES,
    note: "UTC-11 date-line fixture checks next-UTC-day conversion.",
  },
  {
    id: "kathmandu-quarter-hour-2024",
    category: "timezone_edge",
    birthDate: "2024-08-01",
    birthTime: "12:34",
    timezone: "Asia/Kathmandu",
    latitude: 27.7172,
    longitude: 85.324,
    bodies: BOTH_BODIES,
    note: "UTC+05:45 fixture rejects assumptions that offsets are whole hours.",
  },
  {
    id: "st-johns-half-hour-2024",
    category: "timezone_edge",
    birthDate: "2024-01-15",
    birthTime: "12:34",
    timezone: "America/St_Johns",
    latitude: 47.5615,
    longitude: -52.7126,
    bodies: BOTH_BODIES,
    note: "Negative half-hour offset fixture.",
  },
  {
    id: "historical-greenwich-1900",
    category: "historical",
    birthDate: "1900-01-01",
    birthTime: "12:00",
    timezone: "UTC",
    latitude: 51.4769,
    longitude: 0,
    bodies: BOTH_BODIES,
    note: "Historical-range comparison fixture.",
  },
  {
    id: "historical-greenwich-1950",
    category: "historical",
    birthDate: "1950-06-15",
    birthTime: "18:45",
    timezone: "UTC",
    latitude: 51.4769,
    longitude: 0,
    bodies: BOTH_BODIES,
    note: "Mid-century historical comparison fixture.",
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
