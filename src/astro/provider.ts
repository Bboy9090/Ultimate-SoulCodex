import { getAstroProvider } from "../../server/astro/provider";
import type { AstroResult } from "../../server/astro/types";

export type { AstroResult };

export type AstroInput = {
  date: string;
  time?: string;
  lat?: number;
  lon?: number;
  place?: string;
  timezone?: string;
};

/**
 * Unified entry point for chart generation.
 * All callers should import from here; swap providers in server/astro/provider.ts.
 */
export async function generateChart(input: AstroInput): Promise<AstroResult> {
  const provider = getAstroProvider();
  const trimmedTime = input.time?.trim();
  const normalizedTime = trimmedTime === "" ? undefined : trimmedTime;
  return provider.getChart({
    dateISO: input.date,
    time24: normalizedTime,
    timeUnknown: !normalizedTime,
    place: input.place ?? "Unknown",
    timezone: input.timezone,
    lat: input.lat,
    lon: input.lon,
  });
}
