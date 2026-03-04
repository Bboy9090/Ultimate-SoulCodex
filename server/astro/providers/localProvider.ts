import type { AstroProvider, AstroRequest, AstroResult } from "../types";
import { calculateAstrology } from "../../../astrology";

export const localAstroProvider: AstroProvider = {
  name: "local-astronomy-engine",
  async getChart(req: AstroRequest): Promise<AstroResult> {
    const notes: string[] = [];

    if (req.timeUnknown || !req.time24) {
      notes.push("Birth time unknown: Rising sign and houses omitted.");
    }

    if (!req.lat || !req.lon) {
      if (!req.timeUnknown) {
        notes.push("No coordinates available: Rising sign and houses omitted.");
      }
    }

    const canComputeFull = !req.timeUnknown && !!req.time24 && req.lat !== undefined && req.lon !== undefined && req.timezone;

    if (!canComputeFull) {
      const basicResult = computeBasic(req);
      return { ...basicResult, notes };
    }

    try {
      const data = calculateAstrology({
        name: req.place,
        birthDate: req.dateISO,
        birthTime: req.time24!,
        birthLocation: req.place,
        latitude: req.lat!,
        longitude: req.lon!,
        timezone: req.timezone!,
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
      return { ...computeBasic(req), notes };
    }
  },
};

function computeBasic(req: AstroRequest): Pick<AstroResult, "sun" | "moon"> {
  try {
    const data = calculateAstrology({
      name: req.place,
      birthDate: req.dateISO,
      birthTime: req.time24 ?? "12:00",
      birthLocation: req.place,
      latitude: req.lat ?? 0,
      longitude: req.lon ?? 0,
      timezone: req.timezone ?? "UTC",
    });
    return { sun: data.sunSign, moon: data.moonSign };
  } catch {
    return { sun: "Unknown", moon: "Unknown" };
  }
}
