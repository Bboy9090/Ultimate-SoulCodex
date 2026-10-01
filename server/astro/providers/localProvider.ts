import type { AstroProvider, AstroRequest, AstroResult } from "../types";
import { calculateAstrology } from "../../services/astrology-production";

const TIME_24H_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function normalizeTime24(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const match = TIME_24H_RE.exec(trimmed);
  return match ? `${match[1]}:${match[2]}` : undefined;
}

function normalizeTimezone(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function normalizeCoordinate(value?: number): number | undefined {
  return Number.isFinite(value) ? value : undefined;
}

function candidate(placement: any): {
  sign: string;
  degree: number;
  longitude: number;
} | null {
  const raw = placement?.internalCandidate;
  if (
    !raw ||
    typeof raw.sign !== "string" ||
    !raw.sign.trim() ||
    !Number.isFinite(raw.longitude)
  ) {
    return null;
  }

  const longitude = ((Number(raw.longitude) % 360) + 360) % 360;
  return {
    sign: raw.sign.trim(),
    degree: longitude % 30,
    longitude,
  };
}

function stableDateOnlySun(dateISO: string, timezone: string): string {
  const first = calculateAstrology({
    birthDate: dateISO,
    birthTime: "00:00",
    timezone,
  });
  const last = calculateAstrology({
    birthDate: dateISO,
    birthTime: "23:59",
    timezone,
  });

  const firstSun = candidate(first.sun);
  const lastSun = candidate(last.sun);
  return firstSun && lastSun && firstSun.sign === lastSun.sign
    ? firstSun.sign
    : "Unknown";
}

/**
 * Compatibility adapter for legacy chart consumers.
 *
 * This provider no longer owns astrology math. It delegates to the governed
 * production candidate engine and deliberately omits houses/aspects/nodes/
 * Chiron because those require their own verification contracts.
 */
export const localAstroProvider: AstroProvider = {
  name: "canonical-astronomy-candidate-adapter",

  async getChart(req: AstroRequest): Promise<AstroResult> {
    const time24 = normalizeTime24(req.time24);
    const timezone = normalizeTimezone(req.timezone);
    const lat = normalizeCoordinate(req.lat);
    const lon = normalizeCoordinate(req.lon);
    const timeUnknown = req.timeUnknown || !time24;
    const notes: string[] = [];

    if (timeUnknown) {
      notes.push(
        "Birth time unknown: Moon, Rising sign, houses, and time-sensitive chart geometry are withheld.",
      );

      if (!timezone) {
        notes.push(
          "Timezone unavailable: even date-only Sun stability cannot be proven for the local civil day.",
        );
        return { sun: "Unknown", moon: "Unknown", notes };
      }

      return {
        sun: stableDateOnlySun(req.dateISO, timezone),
        moon: "Unknown",
        notes,
      };
    }

    if (!timezone) {
      notes.push(
        "Timezone unavailable: the entered local birth time cannot be mapped to one reliable UTC instant.",
      );
      return { sun: "Unknown", moon: "Unknown", notes };
    }

    const chart = calculateAstrology({
      birthDate: req.dateISO,
      birthTime: time24,
      timezone,
      latitude: lat,
      longitude: lon,
    });

    const sun = candidate(chart.sun);
    const moon = candidate(chart.moon);
    const rising = candidate(chart.rising);

    const planets: NonNullable<AstroResult["planets"]> = {};
    for (const [name, placement] of Object.entries(chart.planets ?? {})) {
      const resolved = candidate(placement);
      if (resolved) planets[name] = resolved;
    }

    if (!sun || !moon) {
      notes.push(
        "The supplied civil time is invalid, nonexistent, ambiguous, or otherwise unresolved; no guessed instant was substituted.",
      );
    }

    if (lat === undefined || lon === undefined) {
      notes.push("No coordinates available: Rising sign and houses are withheld.");
    }

    notes.push(
      "Displayed local placements are deterministic candidates, not independently verified chart facts.",
    );
    notes.push(
      "Houses, aspects, nodes, and Chiron are omitted from this compatibility adapter until their governed verification paths are used.",
    );

    return {
      sun: sun?.sign ?? "Unknown",
      moon: moon?.sign ?? "Unknown",
      rising: rising?.sign,
      planets: Object.keys(planets).length > 0 ? planets : undefined,
      notes,
    };
  },
};
