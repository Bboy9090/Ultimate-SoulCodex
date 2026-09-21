type Placement = { verificationStatus?: string; sign?: string | null; house?: number; degree?: number; longitude?: number };

export type PersonalAtlasPlacement = {
  key: string;
  label: string;
  sign: string;
  house?: number;
  kind: "planet" | "angle" | "node" | "chiron";
};

const PLANETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"] as const;

function title(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function validHouse(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 12;
}

function verifiedSign(value: Placement | undefined): string | null {
  return value?.verificationStatus === "verified" && typeof value.sign === "string" && value.sign.trim()
    ? value.sign.trim()
    : null;
}

/** Returns only evidence-bearing chart placements. It never falls back to legacy aliases. */
export function personalAtlasPlacements(astrology: any): PersonalAtlasPlacement[] {
  if (!astrology || astrology.houseSystem !== "equal") return [];
  if (!Array.isArray(astrology.houses) || astrology.houses.length !== 12) return [];
  if (astrology.houses.some((row: any, index: number) => row?.verificationStatus !== "verified" || row?.house !== index + 1)) return [];

  const results: PersonalAtlasPlacement[] = [];
  for (const key of PLANETS) {
    const placement = astrology.planets?.[key] as Placement | undefined;
    const sign = verifiedSign(placement);
    const house = astrology.planetaryHouses?.[key];
    if (sign && validHouse(house)) results.push({ key, label: title(key), sign, house, kind: "planet" });
  }

  const midheaven = verifiedSign(astrology.midheaven);
  if (midheaven) results.push({ key: "midheaven", label: "Midheaven", sign: midheaven, kind: "angle" });

  for (const [key, label] of [["northNode", "North Node"], ["southNode", "South Node"]] as const) {
    const placement = astrology[key] as Placement | undefined;
    const sign = verifiedSign(placement);
    if (sign && validHouse(placement?.house)) results.push({ key, label, sign, house: placement.house, kind: "node" });
  }

  const chiron = astrology.chiron as Placement & { qualificationMethod?: string } | undefined;
  const chironSign = verifiedSign(chiron);
  if (chironSign && validHouse(chiron?.house) && chiron?.qualificationMethod === "live-jpl-qualified-against-swiss") {
    results.push({ key: "chiron", label: "Chiron", sign: chironSign, house: chiron.house, kind: "chiron" });
  }
  return results;
}

export function verifiedHouseCusps(astrology: any): Array<{ house: number; sign: string }> {
  if (!astrology || astrology.houseSystem !== "equal" || !Array.isArray(astrology.houses) || astrology.houses.length !== 12) return [];
  return astrology.houses.every((row: any, index: number) => row?.verificationStatus === "verified" && row?.house === index + 1 && typeof row?.sign === "string")
    ? astrology.houses.map((row: any) => ({ house: row.house, sign: row.sign }))
    : [];
}
