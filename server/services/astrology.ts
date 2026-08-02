import { Body, Ecliptic, GeoVector } from "astronomy-engine";
import { fromZonedTime } from "date-fns-tz";

interface BirthData {
  birthDate: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

type PlacementStatus =
  | "verified"
  | "calculated_pending_independent_verification"
  | "pending_ephemeris"
  | "requires_verified_birth_time"
  | "requires_location";

interface PlacementCandidate {
  sign: string;
  longitude: number;
  source: string;
  engine: string;
  calculatedAt: string;
  inputTimestamp: string;
}

interface PlacementVerification {
  sign: string | null;
  status: PlacementStatus;
  confidence: number | null;
  source: string | null;
  reason?: string;
  candidate?: PlacementCandidate;
}

interface AstrologyData {
  sun: PlacementVerification;
  moon: PlacementVerification;
  rising: PlacementVerification;
  planets?: {
    sun?: { sign?: string; house?: number; degree?: number };
    moon?: { sign?: string; house?: number; degree?: number };
    [key: string]: any;
  };
  houses?: Array<{ sign?: string; degree?: number }>;
  aspects?: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>;
  northNode?: { sign?: string; house?: number; degree?: number };
  southNode?: { sign?: string; house?: number; degree?: number };
  chiron?: { sign?: string; house?: number; degree?: number };
  verification: {
    complete: boolean;
    missingData: string[];
    suggestions: string;
    lastUpdated: string;
  };
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

  // Date-only Sun calculations remain useful at noon UTC because the Sun moves
  // roughly one degree per day. Time-sensitive placements remain blocked unless
  // an explicit timezone is present.
  if (requiresTime) return null;
  const utc = new Date(`${localTimestamp}Z`);
  return Number.isNaN(utc.getTime()) ? null : utc;
}

function calculateCandidate(body: Body, timestamp: Date): PlacementCandidate {
  const vector = GeoVector(body, timestamp, true);
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

function pendingCandidatePlacement(candidate: PlacementCandidate): PlacementVerification {
  return {
    // Candidate values are deliberately withheld from the authoritative `sign`
    // field until an independent reference agrees within the release tolerance.
    sign: null,
    status: "calculated_pending_independent_verification",
    confidence: null,
    source: null,
    candidate,
    reason: "Calculated by one trusted ephemeris engine; independent comparison is still required before interpretation",
  };
}

function getSunPlacement(birthData: BirthData): PlacementVerification {
  const timestamp = buildUtcBirthTimestamp(birthData, false);
  if (!timestamp) {
    return {
      sign: null,
      status: "pending_ephemeris",
      confidence: null,
      source: null,
      reason: "A valid birth date is required for ephemeris calculation",
    };
  }

  try {
    return pendingCandidatePlacement(calculateCandidate(Body.Sun, timestamp));
  } catch {
    return {
      sign: null,
      status: "pending_ephemeris",
      confidence: null,
      source: null,
      reason: "Ephemeris calculation failed safely; no placement was promoted",
    };
  }
}

function getMoonPlacement(birthData: BirthData): PlacementVerification {
  if (!birthData.birthTime) {
    return {
      sign: null,
      status: "requires_verified_birth_time",
      confidence: null,
      source: null,
      reason: "Birth time required for Moon sign calculation",
    };
  }

  if (!birthData.timezone) {
    return {
      sign: null,
      status: "requires_verified_birth_time",
      confidence: null,
      source: null,
      reason: "Timezone required to convert the entered birth time to UTC",
    };
  }

  const timestamp = buildUtcBirthTimestamp(birthData, true);
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
    return pendingCandidatePlacement(calculateCandidate(Body.Moon, timestamp));
  } catch {
    return {
      sign: null,
      status: "pending_ephemeris",
      confidence: null,
      source: null,
      reason: "Ephemeris calculation failed safely; no placement was promoted",
    };
  }
}

function getRisingPlacement(birthData: BirthData): PlacementVerification {
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

  return {
    sign: null,
    status: "pending_ephemeris",
    confidence: null,
    source: null,
    reason: "Ascendant calculation remains intentionally blocked until its formula and independent reference suite are validated",
  };
}

export function calculateAstrology(birthData: BirthData): AstrologyData {
  const sun = getSunPlacement(birthData);
  const moon = getMoonPlacement(birthData);
  const rising = getRisingPlacement(birthData);

  const missingData: string[] = [];
  if (!birthData.birthTime) missingData.push("verified_birth_time");
  if (!birthData.timezone) missingData.push("timezone");
  if (birthData.latitude === undefined || birthData.longitude === undefined) missingData.push("precise_location");
  if (sun.status !== "verified") missingData.push("independent_sun_verification");
  if (moon.status !== "verified") missingData.push("independent_moon_verification");
  if (rising.status !== "verified") missingData.push("validated_ascendant_engine");

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
    verification: {
      complete: false,
      missingData: [...new Set(missingData)],
      suggestions: "Sun and Moon may carry evidence-bearing candidate calculations, but interpretation remains paused until independent verification. Ascendant remains unresolved until its dedicated validation suite passes.",
      lastUpdated: new Date().toISOString(),
    },
  };
}

export function getTarotBirthCards(birthDate: string): { card1: string; card2: string; interpretation: string } {
  const date = new Date(birthDate);
  const sum = date.getDate() + (date.getMonth() + 1) + date.getFullYear();
  const digitalRoot = sum.toString().split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  const finalSum = digitalRoot > 9
    ? digitalRoot.toString().split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0)
    : digitalRoot;

  const tarotCards = [
    { card1: "The Fool", card2: "The World", interpretation: "Journey of infinite potential and cosmic completion" },
    { card1: "The Magician", card2: "The High Priestess", interpretation: "Balance of conscious will and intuitive wisdom" },
    { card1: "The Empress", card2: "The Emperor", interpretation: "Creative nurturing paired with structured authority" },
    { card1: "The Hierophant", card2: "The Lovers", interpretation: "Traditional wisdom meets heart-centered choices" },
    { card1: "The Chariot", card2: "Strength", interpretation: "Directed willpower flowing through inner courage" },
    { card1: "The Hermit", card2: "Wheel of Fortune", interpretation: "Inner guidance navigating life's cycles" },
    { card1: "Justice", card2: "The Hanged Man", interpretation: "Divine balance through surrender and perspective" },
    { card1: "Death", card2: "Temperance", interpretation: "Transformation through divine alchemy" },
    { card1: "The Devil", card2: "The Tower", interpretation: "Breaking free from illusion and limitation" },
  ];

  return tarotCards[finalSum % tarotCards.length];
}
