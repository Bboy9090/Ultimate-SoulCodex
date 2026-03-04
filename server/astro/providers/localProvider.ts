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
          longitude: (pd as any).degree + getSignOffset((pd as any).sign),
        };
      }

      const cusps = data.houses.map((h: any) => h.degree);

      return {
        sun: data.sunSign,
        moon: data.moonSign,
        rising: data.risingSign,
        planets,
        houses: { system: "equal", cusps },
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

const SIGN_OFFSETS: Record<string, number> = {
  Aries: 0, Taurus: 30, Gemini: 60, Cancer: 90,
  Leo: 120, Virgo: 150, Libra: 180, Scorpio: 210,
  Sagittarius: 240, Capricorn: 270, Aquarius: 300, Pisces: 330,
};
function getSignOffset(sign: string): number {
  return SIGN_OFFSETS[sign] ?? 0;
}
