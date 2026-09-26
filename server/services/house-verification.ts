import { SiderealTime } from "./astronomy-engine-compat";
import { calculateAscendantCandidate } from "./ascendant-verification";

export type HouseSystem = "equal";

export interface HouseInput {
  inputTimestamp: string;
  latitude: number;
  longitude: number;
}

export interface AngleEvidenceRecord extends HouseInput {
  longitudeDegrees: number;
  sign: string;
  degreeInSign: number;
  source: string;
  engine: string;
  calculatedAt: string;
}

export interface HouseCusp {
  house: number;
  longitudeDegrees: number;
  sign: string;
  degreeInSign: number;
}

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const CANDIDATE_ENGINE = "astronomy-engine@2.1.19-sidereal-time + IAU-2006-obliquity";
const CANDIDATE_SOURCE =
  "Astronomy Engine apparent sidereal time with standard ecliptic meridian geometry";
const REFERENCE_ENGINE = "soulcodex-meeus-apparent-sidereal-mc-reference-v1";
const REFERENCE_SOURCE =
  "Independent Meeus apparent sidereal time plus nutation and IAU-2006 obliquity";

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function degrees(radiansValue: number): number {
  return (radiansValue * 180) / Math.PI;
}

export function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function circularDegreesDelta(left: number, right: number): number {
  const raw = Math.abs(normalizeDegrees(left) - normalizeDegrees(right));
  return Math.min(raw, 360 - raw);
}

function signFromLongitude(longitude: number): string {
  return SIGNS[Math.floor(normalizeDegrees(longitude) / 30)];
}

function hasExplicitUtcOffset(inputTimestamp: string): boolean {
  return /(?:Z|[+-]\\d{2}:\\d{2})$/i.test(inputTimestamp.trim());
}

function validInput(input: HouseInput): boolean {
  return (
    typeof input.inputTimestamp === "string" &&
    hasExplicitUtcOffset(input.inputTimestamp) &&
    !Number.isNaN(new Date(input.inputTimestamp).getTime()) &&
    Number.isFinite(input.latitude) &&
    input.latitude > -90 &&
    input.latitude < 90 &&
    Number.isFinite(input.longitude) &&
    input.longitude >= -180 &&
    input.longitude <= 180
  );
}

function julianDayUtc(timestamp: Date): number {
  return timestamp.getTime() / 86_400_000 + 2_440_587.5;
}

function meanObliquityIau2006(julianDay: number): number {
  const centuries = (julianDay - 2_451_545.0) / 36_525;
  const arcseconds =
    84_381.406 -
    46.836769 * centuries -
    0.0001831 * centuries ** 2 +
    0.0020034 * centuries ** 3 -
    0.000000576 * centuries ** 4 -
    0.0000000434 * centuries ** 5;
  return arcseconds / 3_600;
}

function truncatedNutation(julianDay: number): {
  longitudeDegrees: number;
  obliquityDegrees: number;
} {
  const centuries = (julianDay - 2_451_545.0) / 36_525;
  const omega = radians(
    normalizeDegrees(
      125.04452 -
      1_934.136261 * centuries +
      0.0020708 * centuries ** 2 +
      centuries ** 3 / 450_000,
    ),
  );
  const meanSunLongitude = radians(
    normalizeDegrees(280.4665 + 36_000.7698 * centuries),
  );
  const meanMoonLongitude = radians(
    normalizeDegrees(218.3165 + 481_267.8813 * centuries),
  );

  return {
    longitudeDegrees:
      (-17.2 * Math.sin(omega) -
        1.32 * Math.sin(2 * meanSunLongitude) -
        0.23 * Math.sin(2 * meanMoonLongitude) +
        0.21 * Math.sin(2 * omega)) /
      3_600,
    obliquityDegrees:
      (9.2 * Math.cos(omega) +
        0.57 * Math.cos(2 * meanSunLongitude) +
        0.1 * Math.cos(2 * meanMoonLongitude) -
        0.09 * Math.cos(2 * omega)) /
      3_600,
  };
}

function greenwichMeanSiderealTimeMeeus(julianDay: number): number {
  const centuries = (julianDay - 2_451_545.0) / 36_525;
  return normalizeDegrees(
    280.46061837 +
    360.98564736629 * (julianDay - 2_451_545.0) +
    0.000387933 * centuries ** 2 -
    centuries ** 3 / 38_710_000,
  );
}

function midheavenLongitude(
  localSiderealDegrees: number,
  obliquityDegrees: number,
): number {
  const sidereal = radians(localSiderealDegrees);
  const obliquity = radians(obliquityDegrees);

  return normalizeDegrees(
    degrees(
      Math.atan2(
        Math.sin(sidereal),
        Math.cos(sidereal) * Math.cos(obliquity),
      ),
    ),
  );
}

function angleRecord(
  input: HouseInput,
  longitudeDegrees: number,
  engine: string,
  source: string,
): AngleEvidenceRecord {
  const normalized = normalizeDegrees(longitudeDegrees);
  return {
    ...input,
    longitudeDegrees: normalized,
    sign: signFromLongitude(normalized),
    degreeInSign: normalized % 30,
    engine,
    source,
    calculatedAt: new Date().toISOString(),
  };
}

export function calculateMidheavenCandidate(input: HouseInput): AngleEvidenceRecord {
  if (!validInput(input)) throw new Error("house_input_invalid");
  const timestamp = new Date(input.inputTimestamp);
  const julianDay = julianDayUtc(timestamp);
  const localSiderealDegrees = normalizeDegrees(
    SiderealTime(timestamp) * 15 + input.longitude,
  );
  return angleRecord(
    input,
    midheavenLongitude(localSiderealDegrees, meanObliquityIau2006(julianDay)),
    CANDIDATE_ENGINE,
    CANDIDATE_SOURCE,
  );
}

export function calculateIndependentMidheavenReference(
  input: HouseInput,
): AngleEvidenceRecord {
  if (!validInput(input)) throw new Error("house_input_invalid");
  const timestamp = new Date(input.inputTimestamp);
  const julianDay = julianDayUtc(timestamp);
  const nutation = truncatedNutation(julianDay);
  const trueObliquity =
    meanObliquityIau2006(julianDay) + nutation.obliquityDegrees;
  const greenwichApparentSiderealDegrees = normalizeDegrees(
    greenwichMeanSiderealTimeMeeus(julianDay) +
    nutation.longitudeDegrees * Math.cos(radians(trueObliquity)),
  );
  const localSiderealDegrees = normalizeDegrees(
    greenwichApparentSiderealDegrees + input.longitude,
  );

  return angleRecord(
    input,
    midheavenLongitude(localSiderealDegrees, trueObliquity),
    REFERENCE_ENGINE,
    REFERENCE_SOURCE,
  );
}

export function calculateEqualHouseCuspsFromAscendant(
  ascendantLongitudeDegrees: number,
): HouseCusp[] {
  if (!Number.isFinite(ascendantLongitudeDegrees)) {
    throw new Error("ascendant_longitude_invalid");
  }
  const firstCusp = normalizeDegrees(ascendantLongitudeDegrees);
  return Array.from({ length: 12 }, (_, index) => {
    const longitudeDegrees = normalizeDegrees(firstCusp + index * 30);
    return {
      house: index + 1,
      longitudeDegrees,
      sign: signFromLongitude(longitudeDegrees),
      degreeInSign: longitudeDegrees % 30,
    };
  });
}

export function calculateEqualHouseEvidence(input: HouseInput): {
  system: "equal";
  ascendantLongitudeDegrees: number;
  midheavenCandidate: AngleEvidenceRecord;
  midheavenReference: AngleEvidenceRecord;
  cusps: HouseCusp[];
} {
  if (!validInput(input)) throw new Error("house_input_invalid");
  const ascendant = calculateAscendantCandidate(input);
  return {
    system: "equal",
    ascendantLongitudeDegrees: ascendant.longitudeDegrees,
    midheavenCandidate: calculateMidheavenCandidate(input),
    midheavenReference: calculateIndependentMidheavenReference(input),
    cusps: calculateEqualHouseCuspsFromAscendant(ascendant.longitudeDegrees),
  };
}

export function calculateHousePosition(
  longitudeDegrees: number,
  cusps: readonly HouseCusp[],
): number {
  if (cusps.length !== 12 || !Number.isFinite(longitudeDegrees)) {
    throw new Error("house_position_input_invalid");
  }
  const longitude = normalizeDegrees(longitudeDegrees);
  for (let index = 0; index < cusps.length; index += 1) {
    const current = normalizeDegrees(cusps[index].longitudeDegrees);
    const next = normalizeDegrees(cusps[(index + 1) % cusps.length].longitudeDegrees);
    const inside = next > current
      ? longitude >= current && longitude < next
      : longitude >= current || longitude < next;
    if (inside) return index + 1;
  }
  throw new Error("house_position_unresolved");
}
