const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export type NodeMode = "mean";

export interface MeanNodeInput {
  inputTimestamp: string;
}

export interface NodePosition {
  mode: NodeMode;
  longitudeDegrees: number;
  sign: string;
  degreeInSign: number;
  source: string;
  engine: string;
  calculatedAt: string;
  inputTimestamp: string;
}

export interface MeanNodePair {
  northNode: NodePosition;
  southNode: NodePosition;
}

const CANDIDATE_ENGINE = "meeus-mean-lunar-node-v1";
const CANDIDATE_SOURCE =
  "Meeus mean ascending lunar node longitude, tropical ecliptic of date";

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function signFromLongitude(longitude: number): string {
  return SIGNS[Math.floor(normalizeDegrees(longitude) / 30)];
}

function julianDayUtc(timestamp: Date): number {
  return timestamp.getTime() / 86_400_000 + 2_440_587.5;
}

export function calculateMeanNorthNodeCandidate(
  input: MeanNodeInput,
): NodePosition {
  const timestamp = new Date(input.inputTimestamp);
  if (Number.isNaN(timestamp.getTime())) {
    throw new Error("node_input_timestamp_invalid");
  }

  const julianDay = julianDayUtc(timestamp);
  const centuries = (julianDay - 2_451_545.0) / 36_525;

  const longitudeDegrees = normalizeDegrees(
    125.04452 -
      1_934.136261 * centuries +
      0.0020708 * centuries ** 2 +
      centuries ** 3 / 450_000,
  );

  return {
    mode: "mean",
    longitudeDegrees,
    sign: signFromLongitude(longitudeDegrees),
    degreeInSign: longitudeDegrees % 30,
    source: CANDIDATE_SOURCE,
    engine: CANDIDATE_ENGINE,
    calculatedAt: new Date().toISOString(),
    inputTimestamp: timestamp.toISOString(),
  };
}

export function calculateMeanNodePair(input: MeanNodeInput): MeanNodePair {
  const northNode = calculateMeanNorthNodeCandidate(input);
  const southLongitude = normalizeDegrees(northNode.longitudeDegrees + 180);

  return {
    northNode,
    southNode: {
      ...northNode,
      longitudeDegrees: southLongitude,
      sign: signFromLongitude(southLongitude),
      degreeInSign: southLongitude % 30,
      source: `${northNode.source}; South Node defined as exact 180-degree opposition`,
      engine: `${northNode.engine} + exact-opposition`,
    },
  };
}

export function circularNodeDeltaDegrees(left: number, right: number): number {
  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    throw new Error("node_longitude_invalid");
  }
  const raw = Math.abs(normalizeDegrees(left) - normalizeDegrees(right));
  return Math.min(raw, 360 - raw);
}
