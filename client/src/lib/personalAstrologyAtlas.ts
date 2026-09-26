import { ATLAS_SIGNS, type AtlasSign } from "./astrologyAtlas";

export const PERSONAL_ATLAS_HOUSE_CONTRACT = "ASTRO-EQUAL-HOUSE-v1";

type Placement = {
  verificationStatus?: string;
  sign?: string | null;
  house?: number;
  degree?: number;
  longitude?: number;
  policyId?: string;
  evidenceArtifactId?: string;
  mode?: string;
  qualificationMethod?: string;
  evidence?: { source?: string; engine?: string; calculatedAt?: string } | null;
  provenance?: { source?: string; engine?: string; calculatedAt?: string } | null;
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

function verifiedSign(value: Placement | undefined): AtlasSign | null {
  if (value?.verificationStatus !== "verified") return null;
  const evidence = value.provenance ?? value.evidence;
  const hasProvenance =
    Boolean(evidence?.source?.trim()) &&
    Boolean(evidence?.engine?.trim()) &&
    Boolean(evidence?.calculatedAt?.trim());
  return hasProvenance ? atlasSign(value.sign) : null;
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function signFromLongitude(value: number): AtlasSign {
  return ATLAS_SIGNS[Math.floor(normalizeDegrees(value) / 30)];
}

function verifiedHouseRow(row: any, index: number): boolean {
  if (
    row?.verificationStatus !== "verified" ||
    row?.policyId !== PERSONAL_ATLAS_HOUSE_CONTRACT ||
    row?.house !== index + 1 ||
    typeof row?.evidenceArtifactId !== "string" ||
    !row.evidenceArtifactId.trim() ||
    !Number.isFinite(row?.longitude) ||
    !Number.isFinite(row?.degree)
  ) {
    return false;
  }

  const longitude = normalizeDegrees(Number(row.longitude));
  const sign = atlasSign(row.sign);
  return Boolean(
    sign &&
    signFromLongitude(longitude) === sign &&
    Math.abs(Number(row.degree) - (longitude % 30)) < 0.01
  );
}

/** Returns only evidence-bearing chart placements. It never falls back to legacy aliases. */
export function personalAtlasPlacements(astrology: any): PersonalAtlasPlacement[] {
  if (!astrology || astrology.houseSystem !== "equal") return [];
  if (!Array.isArray(astrology.houses) || astrology.houses.length !== 12) return [];
  if (astrology.houses.some((row: any, index: number) => !verifiedHouseRow(row, index))) return [];

  const results: PersonalAtlasPlacement[] = [];
  for (const key of PLANETS) {
    const placement = astrology.planets?.[key] as Placement | undefined;
    const sign = verifiedSign(placement);
    const house = astrology.planetaryHouses?.[key];
    if (sign && validHouse(house)) results.push({ key, label: title(key), sign, house, kind: "planet" });
  }

  const rising = verifiedSign(astrology.rising);
  if (rising) results.push({ key: "rising", label: "Ascendant / Rising", sign: rising, kind: "angle" });

  const midheavenRecord = astrology.midheaven as Placement | undefined;
  const midheaven = verifiedSign(midheavenRecord);
  if (
    midheaven &&
    midheavenRecord?.policyId === PERSONAL_ATLAS_HOUSE_CONTRACT &&
    typeof midheavenRecord.evidenceArtifactId === "string" &&
    midheavenRecord.evidenceArtifactId.trim()
  ) {
    results.push({ key: "midheaven", label: "Midheaven", sign: midheaven, kind: "angle" });
  }

  for (const [key, label] of [["northNode", "North Node"], ["southNode", "South Node"]] as const) {
    const placement = astrology[key] as Placement | undefined;
    const sign = verifiedSign(placement);
    if (
      sign &&
      validHouse(placement?.house) &&
      placement?.mode === "mean" &&
      placement?.policyId === "ASTRO-MEAN-NODE-v1" &&
      typeof placement.evidenceArtifactId === "string" &&
      placement.evidenceArtifactId.trim()
    ) {
      results.push({ key, label, sign, house: placement.house, kind: "node" });
    }
  }

  const chiron = astrology.chiron as Placement | undefined;
  const chironSign = verifiedSign(chiron);
  if (
    chironSign &&
    validHouse(chiron?.house) &&
    chiron?.policyId === "ASTRO-CHIRON-v1" &&
    chiron?.qualificationMethod === "live-jpl-qualified-against-swiss" &&
    typeof chiron.evidenceArtifactId === "string" &&
    chiron.evidenceArtifactId.trim()
  ) {
    results.push({ key: "chiron", label: "Chiron", sign: chironSign, house: chiron.house, kind: "chiron" });
  }
  return results;
}

export function verifiedHouseCusps(astrology: any): Array<{ house: number; sign: AtlasSign }> {
  if (!astrology || astrology.houseSystem !== "equal" || !Array.isArray(astrology.houses) || astrology.houses.length !== 12) return [];
  return astrology.houses.every((row: any, index: number) => verifiedHouseRow(row, index))
    ? astrology.houses.map((row: any) => ({ house: row.house, sign: atlasSign(row.sign)! }))
    : [];
}
