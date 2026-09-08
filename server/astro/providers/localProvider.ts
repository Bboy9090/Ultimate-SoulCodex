import type { AstroProvider, AstroRequest, AstroResult } from "../types";
import { calculateAstrology } from "../../../services/astrology";

const TIME_24H_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const localAstroProvider: AstroProvider = {
  name: "local-astronomy-engine",
  async getChart(req: AstroRequest): Promise<AstroResult> {
    const normalizedReq: AstroRequest = {
      ...req,
      time24: normalizeTime24(req.time24),
      timezone: normalizeTimezone(req.timezone),
      lat: normalizeCoordinate(req.lat),
      lon: normalizeCoordinate(req.lon),
      timeUnknown: req.timeUnknown || !normalizeTime24(req.time24),
    };
    const notes: string[] = [];

    if (normalizedReq.timeUnknown || !normalizedReq.time24) {
      notes.push("Birth time unknown: Rising sign and houses omitted.");
    }

    if (normalizedReq.lat === undefined || normalizedReq.lon === undefined) {
      if (!normalizedReq.timeUnknown) {
        notes.push("No coordinates available: Rising sign and houses omitted.");
      }
    }

    const canComputeFull = !normalizedReq.timeUnknown &&
      !!normalizedReq.time24 &&
      normalizedReq.lat !== undefined &&
      normalizedReq.lon !== undefined &&
      !!normalizedReq.timezone;

    if (!canComputeFull) {
      const basicResult = computeBasic(normalizedReq);
      return { ...basicResult, notes };
    }

    try {
      const data = calculateAstrology({
        name: normalizedReq.place,
        birthDate: normalizedReq.dateISO,
        birthTime: normalizedReq.time24!,
        birthLocation: normalizedReq.place,
        latitude: normalizedReq.lat!,
        longitude: normalizedReq.lon!,
        timezone: normalizedReq.timezone!,
      });

      const planets: AstroResult["planets"] = {};
      for (const [name, pd] of Object.entries(data.planets)) {
        planets[name] = {
          sign: (pd as any).sign,
          degree: (pd as any).degree,
          longitude: (pd as any).longitude,
        };
      }

      const cusps = data.houses.map((h: any) => h.degree);

      const aspects: AstroResult["aspects"] = (data.aspects ?? []).map((a: any) => ({
        planet1: a.planet1,
        planet2: a.planet2,
        aspect: a.aspect,
        orb: a.orb,
      }));

      return {
        sun: data.sunSign,
        moon: data.moonSign,
        rising: data.risingSign,
        planets,
        houses: { system: "equal", cusps },
        aspects,
        notes,
      };
    } catch (err) {
      console.error("[localAstroProvider] calculateAstrology failed:", err);
      notes.push("Calculation error — partial data only.");
      return { ...computeBasic(normalizedReq), notes };
    }
  },
};

function computeBasic(req: AstroRequest): Pick<AstroResult, "sun" | "moon"> {
  const safeBirthTime = normalizeTime24(req.time24) ?? "12:00";
  const safeTimezone = normalizeTimezone(req.timezone) ?? "UTC";
  const safeLat = normalizeCoordinate(req.lat) ?? 0;
  const safeLon = normalizeCoordinate(req.lon) ?? 0;

  try {
    const data = calculateAstrology({
      name: req.place,
      birthDate: req.dateISO,
      birthTime: safeBirthTime,
      birthLocation: req.place,
      latitude: safeLat,
      longitude: safeLon,
      timezone: safeTimezone,
    });
    return { sun: data.sunSign, moon: data.moonSign };
  } catch {
    return { sun: "Unknown", moon: "Unknown" };
  }
}

function normalizeTime24(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const match = TIME_24H_RE.exec(trimmed);
  if (!match) return undefined;
  return `${match[1]}:${match[2]}`;
}

function normalizeTimezone(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeCoordinate(value?: number): number | undefined {
  return Number.isFinite(value) ? value : undefined;
}
