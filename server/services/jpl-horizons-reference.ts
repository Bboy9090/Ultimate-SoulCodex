import type { IndependentEphemerisReference } from "./astrology-verification";

export type SupportedHorizonsBody = "Sun" | "Moon";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type SleepLike = (milliseconds: number) => Promise<void>;

interface HorizonsPayload {
  signature?: {
    source?: string;
    version?: string;
  };
  result?: string;
  error?: string;
}

const HORIZONS_ENDPOINT = "https://ssd.jpl.nasa.gov/api/horizons.api";
const HORIZONS_ENGINE = "nasa-jpl-horizons-api@1.3";
const HORIZONS_SOURCE = "NASA/JPL Horizons observer quantity 31: geocentric apparent ecliptic-of-date longitude";
const BODY_COMMAND: Record<SupportedHorizonsBody, string> = {
  Sun: "10",
  Moon: "301",
};
const TRANSIENT_HTTP_STATUSES = new Set([429, 500, 502, 503, 504]);

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

function normalizeLongitude(value: number): number {
  return ((value % 360) + 360) % 360;
}

function signFromLongitude(value: number): string {
  return ZODIAC_SIGNS[Math.floor(normalizeLongitude(value) / 30)];
}

function addOneMinute(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) throw new Error("invalid_input_timestamp");
  return new Date(date.getTime() + 60_000).toISOString();
}

function horizonsTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) throw new Error("invalid_input_timestamp");
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function buildHorizonsReferenceUrl(body: SupportedHorizonsBody, inputTimestamp: string): string {
  const start = horizonsTime(inputTimestamp);
  const stop = horizonsTime(addOneMinute(inputTimestamp));
  const params = new URLSearchParams({
    format: "json",
    COMMAND: `'${BODY_COMMAND[body]}'`,
    OBJ_DATA: "'NO'",
    MAKE_EPHEM: "'YES'",
    EPHEM_TYPE: "'OBSERVER'",
    CENTER: "'500@399'",
    START_TIME: `'${start}'`,
    STOP_TIME: `'${stop}'`,
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

function splitCsv(line: string): string[] {
  return line.split(",").map((value) => value.trim());
}

export function parseHorizonsLongitude(result: string): number {
  const lines = result.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trim() === "$$SOE");
  const endIndex = lines.findIndex((line, index) => index > startIndex && line.trim() === "$$EOE");
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex + 1) {
    throw new Error("horizons_ephemeris_block_missing");
  }

  const headerIndex = lines
    .slice(0, startIndex)
    .map((line, index) => ({ line, index }))
    .reverse()
    .find(({ line }) => /ObsEcLon|App_Lon_Sun/i.test(line))?.index;
  if (headerIndex === undefined) throw new Error("horizons_longitude_header_missing");

  const headers = splitCsv(lines[headerIndex]);
  const longitudeIndex = headers.findIndex((header) => /ObsEcLon|App_Lon_Sun/i.test(header));
  if (longitudeIndex < 0) throw new Error("horizons_longitude_column_missing");

  const dataLine = lines.slice(startIndex + 1, endIndex).find((line) => line.trim().length > 0);
  if (!dataLine) throw new Error("horizons_data_row_missing");
  const values = splitCsv(dataLine);
  const longitude = Number.parseFloat(values[longitudeIndex]);
  if (!Number.isFinite(longitude) || longitude < 0 || longitude >= 360) {
    throw new Error("horizons_invalid_longitude");
  }
  return longitude;
}

export async function fetchHorizonsReference(
  body: SupportedHorizonsBody,
  inputTimestamp: string,
  options: {
    fetchImpl?: FetchLike;
    timeoutMs?: number;
    maxAttempts?: number;
    retryBaseDelayMs?: number;
    sleepImpl?: SleepLike;
  } = {},
): Promise<IndependentEphemerisReference> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const maxAttempts = Math.max(1, options.maxAttempts ?? 4);
  const retryBaseDelayMs = Math.max(0, options.retryBaseDelayMs ?? 500);
  const sleepImpl = options.sleepImpl ?? sleep;
  const url = buildHorizonsReferenceUrl(body, inputTimestamp);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8_000);

    try {
      const response = await fetchImpl(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const error = new Error(`horizons_http_${response.status}`);
        if (TRANSIENT_HTTP_STATUSES.has(response.status) && attempt < maxAttempts) {
          clearTimeout(timeout);
          await sleepImpl(retryBaseDelayMs * 2 ** (attempt - 1));
          continue;
        }
        throw error;
      }

      const payload = await response.json() as HorizonsPayload;
      if (payload.error) throw new Error("horizons_api_error");
      if (!payload.signature?.source?.toLowerCase().includes("jpl")) {
        throw new Error("horizons_signature_invalid");
      }
      if (!payload.result) throw new Error("horizons_result_missing");

      const longitude = parseHorizonsLongitude(payload.result);
      return {
        body,
        sign: signFromLongitude(longitude),
        longitude,
        source: HORIZONS_SOURCE,
        engine: HORIZONS_ENGINE,
        calculatedAt: new Date().toISOString(),
        inputTimestamp: new Date(inputTimestamp).toISOString(),
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("horizons_retry_exhausted");
}
