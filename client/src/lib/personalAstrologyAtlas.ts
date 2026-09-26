import { ATLAS_SIGNS, type AtlasSign } from "./astrologyAtlas";
import { getVerifiedPlacement } from "./placementVerification";

export const PERSONAL_ATLAS_HOUSE_CONTRACT = "ASTRO-EQUAL-HOUSE-v1";

type Placement = {
  verificationStatus?: string;
  sign?: string | null;
  house?: number;
  degree?: number;
  longitude?: number;
  mode?: string;
  policyId?: string;
  evidenceArtifactId?: string;
  qualificationMethod?: string;
  evidence?: { source?: string | null; engine?: string | null; calculatedAt?: string | null };
  provenance?: { source?: string | null; engine?: string | null; calculatedAt?: string | null };
};

export type PersonalAtlasPlacement = {
  key: string;
  label: string;
  sign: AtlasSign;
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

function atlasSign(value: unknown): AtlasSign | null {
  return typeof value === "string" && ATLAS_SIGNS.includes(value.trim() as AtlasSign)
    ? value.trim() as AtlasSign
    : null;
}

function verifiedDirectSign(value: Placement | undefined): AtlasSign | null {
  return getVerifiedPlacement(value)?.sign
    ? atlasSign(getVerifiedPlacement(value)?.sign)
    : null;
}

function governedSign(
  value: Placement | undefined,
  policyId: string,
): AtlasSign | null {
  return value?.verificationStatus === "verified" &&
    value.policyId === policyId &&
    typeof value.evidenceArtifactId === "string" &&
    value.evidenceArtifactId.trim()
    ? atlasSign(value.sign)
    : null;
}

/** Returns only evidence-bearing chart placements. It never falls back to legacy aliases. */
export function personalAtlasPlacements(astrology: any): PersonalAtlasPlacement[] {
  if (!astrology || astrology.houseSystem !== "equal") return [];
  if (!Array.isArray(astrology.houses) || astrology.houses.length !== 12) return [];
  if (astrology.houses.some((row: any, index: number) =>
    row?.verificationStatus !== "verified" ||
    row?.policyId !== PERSONAL_ATLAS_HOUSE_CONTRACT ||
    typeof row?.evidenceArtifactId !== "string" ||
    !row.evidenceArtifactId.trim() ||
    row?.house !== index + 1 ||
    !atlasSign(row?.sign)
  )) return [];

  const results: PersonalAtlasPlacement[] = [];
  for (const key of PLANETS) {
    const placement = astrology.planets?.[key] as Placement | undefined;
    const sign = verifiedDirectSign(placement);
    const house = astrology.planetaryHouses?.[key];
    if (sign && validHouse(house)) results.push({ key, label: title(key), sign, house, kind: "planet" });
  }

  const rising = verifiedDirectSign(astrology.rising);
  if (rising) results.push({ key: "rising", label: "Ascendant / Rising", sign: rising, kind: "angle" });

  const midheaven = governedSign(astrology.midheaven, PERSONAL_ATLAS_HOUSE_CONTRACT);
  if (midheaven) results.push({ key: "midheaven", label: "Midheaven", sign: midheaven, kind: "angle" });

  for (const [key, label] of [["northNode", "North Node"], ["southNode", "South Node"]] as const) {
    const placement = astrology[key] as Placement | undefined;
    const sign = governedSign(placement, "ASTRO-MEAN-NODE-v1");
    if (sign && placement?.mode === "mean" && validHouse(placement?.house)) {
      results.push({ key, label, sign, house: placement.house, kind: "node" });
    }
  }

  const chiron = astrology.chiron as Placement | undefined;
  const chironSign = governedSign(chiron, "ASTRO-CHIRON-v1");
  if (chironSign && validHouse(chiron?.house) && chiron?.qualificationMethod === "live-jpl-qualified-against-swiss") {
    results.push({ key: "chiron", label: "Chiron", sign: chironSign, house: chiron.house, kind: "chiron" });
  }
  return results;
}

export function verifiedHouseCusps(astrology: any): Array<{ house: number; sign: AtlasSign }> {
  if (!astrology || astrology.houseSystem !== "equal" || !Array.isArray(astrology.houses) || astrology.houses.length !== 12) return [];
  return astrology.houses.every((row: any, index: number) =>
    row?.verificationStatus === "verified" &&
    row?.policyId === PERSONAL_ATLAS_HOUSE_CONTRACT &&
    typeof row?.evidenceArtifactId === "string" &&
    row.evidenceArtifactId.trim() &&
    row?.house === index + 1 &&
    atlasSign(row?.sign)
  )
    ? astrology.houses.map((row: any) => ({ house: row.house, sign: atlasSign(row.sign)! }))
    : [];
}
