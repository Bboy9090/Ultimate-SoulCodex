import { parseHorizonsLongitude } from "./jpl-horizons-reference";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

interface HorizonsPayload {
  signature?: {
    source?: string;
    version?: string;
  };
  result?: string;
  error?: string;
}

export interface ChironReference {
  body: "Chiron";
  longitude: number;
  sign: string;
  source: string;
  engine: string;
  calculatedAt: string;
  inputTimestamp: string;
}

const HORIZONS_ENDPOINT = "https://ssd.jpl.nasa.gov/api/horizons.api";
const HORIZONS_ENGINE = "nasa-jpl-horizons-api@1.3-small-body";
const HORIZONS_SOURCE =
  "NASA/JPL Horizons 2060 Chiron observer quantity 31: geocentric apparent ecliptic-of-date longitude";
const CHIRON_COMMAND = "DES=1977 UB;";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

function normalizeLongitude(value: number): number {
  return ((value % 360) + 360) % 360;
}

function signFromLongitude(value: number): string {
  return ZODIAC_SIGNS[Math.floor(normalizeLongitude(value) / 30)];
}

function horizonsTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) throw new Error("invalid_input_timestamp");
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
}

function addOneMinute(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) throw new Error("invalid_input_timestamp");
  return new Date(date.getTime() + 60_000).toISOString();
}

export function buildChironHorizonsUrl(inputTimestamp: string): string {
  const params = new URLSearchParams({
    format: "json",
    COMMAND: `'${CHIRON_COMMAND}'`,
    OBJ_DATA: "'NO'",
    MAKE_EPHEM: "'YES'",
    EPHEM_TYPE: "'OBSERVER'",
    CENTER: "'500@399'",
    START_TIME: `'${horizonsTime(inputTimestamp)}'`,
    STOP_TIME: `'${horizonsTime(addOneMinute(inputTimestamp))}'`,
    STEP_SIZE: "'1 m'",
    QUANTITIES: "'31'",
    CSV_FORMAT: "'YES'",
    CAL_FORMAT: "'CAL'",
    TIME_DIGITS: "'SECONDS'",
    ANG_FORMAT: "'DEG'",
    APPARENT: "'AIRLESS'",
  });
  return `${HORIZONS_ENDPOINT}?${params.toString()}`;
}

export async function fetchChironHorizonsReference(
  inputTimestamp: string,
  options: { fetchImpl?: FetchLike; timeoutMs?: number } = {},
): Promise<ChironReference> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000);

  try {
    const response = await fetchImpl(buildChironHorizonsUrl(inputTimestamp), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`horizons_http_${response.status}`);

    const payload = await response.json() as HorizonsPayload;
    if (payload.error) throw new Error(`horizons_api_error:${payload.error}`);
    if (!payload.signature?.source?.toLowerCase().includes("jpl")) {
      throw new Error("horizons_signature_invalid");
    }
    if (!payload.result) throw new Error("horizons_result_missing");

    const longitude = parseHorizonsLongitude(payload.result);
    return {
      body: "Chiron",
      longitude,
      sign: signFromLongitude(longitude),
      source: HORIZONS_SOURCE,
      engine: HORIZONS_ENGINE,
      calculatedAt: new Date().toISOString(),
      inputTimestamp: new Date(inputTimestamp).toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}
