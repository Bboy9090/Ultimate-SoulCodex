import { getAstroProvider } from "../../server/astro/provider";
import type { AstroResult } from "../../server/astro/types";

export type { AstroResult };

export type AstroInput = {
  date: string;
  time?: string;
  lat: number;
  lon: number;
  place?: string;
  timezone?: string;
};

/**
 * Unified entry point for chart generation.
 * All callers should import from here; swap providers in server/astro/provider.ts.
 */
export async function generateChart(input: AstroInput): Promise<AstroResult> {
  const provider = getAstroProvider();
  return provider.getChart({
    dateISO: input.date,
    time24: input.time,
    timeUnknown: !input.time,
    place: input.place ?? "",
    timezone: input.timezone,
    lat: input.lat,
    lon: input.lon,
  });
}
