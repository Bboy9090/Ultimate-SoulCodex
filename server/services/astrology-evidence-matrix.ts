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
  schemaVersion: "1.1.0";
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
    bodyMaximumDeltaDegrees: Record<SupportedHorizonsBody, number | null>;
  };
}

export const ALL_PLANETARY_BODIES: SupportedHorizonsBody[] = [
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
];

export const EPHEMERIS_EVIDENCE_FIXTURES: EphemerisEvidenceFixture[] = [
  {
    id: "bobby-bronx-1990",
    category: "golden_profile",
    birthDate: "1990-09-17",
    birthTime: "11:11",
    timezone: "America/New_York",
    latitude: 40.8448,
    longitude: -73.8648,
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
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
    bodies: ALL_PLANETARY_BODIES,
    note: "Mid-century historical comparison fixture.",
  },
  {
    id: "tokyo-profile-1988",
    category: "golden_profile",
    birthDate: "1988-10-29",
    birthTime: "06:30",
    timezone: "Asia/Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
    bodies: ALL_PLANETARY_BODIES,
    note: "East Asia profile fixture with no DST conversion ambiguity.",
  },
  {
    id: "anchorage-profile-2003",
    category: "golden_profile",
    birthDate: "2003-02-06",
    birthTime: "14:00",
    timezone: "America/Anchorage",
    latitude: 61.2181,
    longitude: -149.9003,
    bodies: ALL_PLANETARY_BODIES,
    note: "High-latitude North American profile fixture.",
  },
  {
    id: "tapachula-profile-1993",
    category: "golden_profile",
    birthDate: "1993-09-15",
    birthTime: "12:00",
    timezone: "America/Mexico_City",
    latitude: 14.9056,
    longitude: -92.2634,
    bodies: ALL_PLANETARY_BODIES,
    note: "Southern Mexico profile fixture.",
  },
  {
    id: "san-juan-profile-1993",
    category: "golden_profile",
    birthDate: "1993-07-26",
    birthTime: "06:30",
    timezone: "America/Puerto_Rico",
    latitude: 18.4655,
    longitude: -66.1057,
    bodies: ALL_PLANETARY_BODIES,
    note: "Second Caribbean no-DST fixture.",
  },
  {
    id: "cape-town-profile-1985",
    category: "golden_profile",
    birthDate: "1985-05-05",
    birthTime: "05:05",
    timezone: "Africa/Johannesburg",
    latitude: -33.9249,
    longitude: 18.4241,
    bodies: ALL_PLANETARY_BODIES,
    note: "Southern-hemisphere Africa fixture.",
  },
  {
    id: "reykjavik-midnight-1970",
    category: "timezone_edge",
    birthDate: "1970-01-01",
    birthTime: "00:01",
    timezone: "Atlantic/Reykjavik",
    latitude: 64.1466,
    longitude: -21.9426,
    bodies: ALL_PLANETARY_BODIES,
    note: "Near-midnight historical UTC-aligned fixture.",
  },
  {
    id: "honolulu-profile-1969",
    category: "historical",
    birthDate: "1969-07-20",
    birthTime: "14:17",
    timezone: "Pacific/Honolulu",
    latitude: 21.3099,
    longitude: -157.8581,
    bodies: ALL_PLANETARY_BODIES,
    note: "Historical Hawaii fixture.",
  },
  {
    id: "delhi-independence-1947",
    category: "historical",
    birthDate: "1947-08-15",
    birthTime: "00:01",
    timezone: "Asia/Kolkata",
    latitude: 28.6139,
    longitude: 77.209,
    bodies: ALL_PLANETARY_BODIES,
    note: "Historical half-hour-offset era fixture.",
  },
  {
    id: "buenos-aires-rollover-2001",
    category: "timezone_edge",
    birthDate: "2001-12-31",
    birthTime: "23:59",
    timezone: "America/Argentina/Buenos_Aires",
    latitude: -34.6037,
    longitude: -58.3816,
    bodies: ALL_PLANETARY_BODIES,
    note: "Local year rollover fixture in South America.",
  },
  {
    id: "auckland-solstice-2012",
    category: "zodiac_boundary",
    birthDate: "2012-06-21",
    birthTime: "12:00",
    timezone: "Pacific/Auckland",
    latitude: -36.8509,
    longitude: 174.7645,
    bodies: ALL_PLANETARY_BODIES,
    note: "Southern-hemisphere local-time solstice fixture.",
  },
  {
    id: "tokyo-millennium-rollover",
    category: "timezone_edge",
    birthDate: "2000-01-01",
    birthTime: "00:01",
    timezone: "Asia/Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
    bodies: ALL_PLANETARY_BODIES,
    note: "Millennium rollover in UTC+09.",
  },
  {
    id: "tromso-summer-2024",
    category: "timezone_edge",
    birthDate: "2024-06-21",
    birthTime: "12:00",
    timezone: "Europe/Oslo",
    latitude: 69.6492,
    longitude: 18.9553,
    bodies: ALL_PLANETARY_BODIES,
    note: "Arctic-circle summer fixture for civil-time conversion.",
  },
  {
    id: "tromso-winter-2024",
    category: "timezone_edge",
    birthDate: "2024-12-21",
    birthTime: "12:00",
    timezone: "Europe/Oslo",
    latitude: 69.6492,
    longitude: 18.9553,
    bodies: ALL_PLANETARY_BODIES,
    note: "Arctic-circle winter fixture for civil-time conversion.",
  },
  {
    id: "ushuaia-summer-2024",
    category: "timezone_edge",
    birthDate: "2024-12-21",
    birthTime: "12:00",
    timezone: "America/Argentina/Ushuaia",
    latitude: -54.8019,
    longitude: -68.303,
    bodies: ALL_PLANETARY_BODIES,
    note: "Far-southern latitude fixture.",
  },
  {
    id: "singapore-no-dst-2024",
    category: "timezone_edge",
    birthDate: "2024-05-01",
    birthTime: "12:34",
    timezone: "Asia/Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
    bodies: ALL_PLANETARY_BODIES,
    note: "Equatorial no-DST UTC+08 fixture.",
  },
  {
    id: "lord-howe-dst-2024",
    category: "dst_transition",
    birthDate: "2024-10-06",
    birthTime: "03:05",
    timezone: "Australia/Lord_Howe",
    latitude: -31.5383,
    longitude: 159.0766,
    bodies: ALL_PLANETARY_BODIES,
    note: "Thirty-minute DST transition zone fixture.",
  },
  {
    id: "chatham-quarter-hour-2024",
    category: "timezone_edge",
    birthDate: "2024-08-01",
    birthTime: "12:34",
    timezone: "Pacific/Chatham",
    latitude: -43.95,
    longitude: -176.55,
    bodies: ALL_PLANETARY_BODIES,
    note: "UTC+12:45 civil-time fixture.",
  },
  {
    id: "apia-date-line-2024",
    category: "timezone_edge",
    birthDate: "2024-01-01",
    birthTime: "00:15",
    timezone: "Pacific/Apia",
    latitude: -13.8507,
    longitude: -171.7514,
    bodies: ALL_PLANETARY_BODIES,
    note: "Post-date-line-shift Pacific fixture.",
  },
  {
    id: "greenwich-1800",
    category: "historical",
    birthDate: "1800-01-01",
    birthTime: "12:00",
    timezone: "UTC",
    latitude: 51.4769,
    longitude: 0,
    bodies: ALL_PLANETARY_BODIES,
    note: "Deep historical ephemeris-range fixture.",
  },
  {
    id: "greenwich-2050",
    category: "historical",
    birthDate: "2050-06-15",
    birthTime: "18:45",
    timezone: "UTC",
    latitude: 51.4769,
    longitude: 0,
    bodies: ALL_PLANETARY_BODIES,
    note: "Near-future ephemeris-range fixture.",
  }
];

function circularDelta(left: number, right: number): number {
  const raw = Math.abs(left - right) % 360;
  return Math.min(raw, 360 - raw);
}

function maximum(values: number[]): number | null {
  return values.length > 0 ? Math.max(...values) : null;
}

function placementForBody(
  astrology: ReturnType<typeof calculateAstrology>,
  body: SupportedHorizonsBody,
) {
  if (body === "Sun") return astrology.sun;
  if (body === "Moon") return astrology.moon;

  const key = body.toLowerCase() as
    | "mercury"
    | "venus"
    | "mars"
    | "jupiter"
    | "saturn"
    | "uranus"
    | "neptune"
    | "pluto";
  return astrology.planets?.[key];
}

export async function runLiveEphemerisEvidenceMatrix(
  fixtures: EphemerisEvidenceFixture[] = EPHEMERIS_EVIDENCE_FIXTURES,
): Promise<EphemerisEvidenceReceipt> {
  const rows: EphemerisEvidenceRow[] = [];

  for (const fixture of fixtures) {
    const astrology = calculateAstrology(fixture);

    for (const body of fixture.bodies) {
      const placement = placementForBody(astrology, body);
      const candidate = placement?.internalCandidate;
      if (!candidate) {
        throw new Error(`candidate_missing:${fixture.id}:${body}`);
      }

      let reference;
      try {
        reference = await fetchHorizonsReference(body, candidate.inputTimestamp);
      } catch (error) {
        const reason = error instanceof Error ? error.message : "unknown_reference_error";
        throw new Error(`reference_failed:${fixture.id}:${body}:${reason}`);
      }
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
    ALL_PLANETARY_BODIES.map((body) => [
      body,
      maximum(
        rows
          .filter((row) => row.body === body)
          .map((row) => row.longitudeDeltaDegrees),
      ),
    ]),
  ) as Record<SupportedHorizonsBody, number | null>;

  return {
    schemaVersion: "1.1.0",
    generatedAt: new Date().toISOString(),
    policyStatus: "evidence_only_no_tolerance_approved",
    fixtures,
    rows,
    summary: {
      totalRows: rows.length,
      signDisagreements: rows.filter((row) => !row.signAgreement).length,
      maximumLongitudeDeltaDegrees: maximum(rows.map((row) => row.longitudeDeltaDegrees)),
      sunMaximumDeltaDegrees: bodyMaximumDeltaDegrees.Sun,
      moonMaximumDeltaDegrees: bodyMaximumDeltaDegrees.Moon,
      bodyMaximumDeltaDegrees,
    },
  };
}
