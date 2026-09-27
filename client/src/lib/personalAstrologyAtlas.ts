import { ATLAS_SIGNS, type AtlasSign } from "./astrologyAtlas";
import { getVerifiedPlacement } from "./placementVerification";

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

function verifiedDirectSign(value: Placement | undefined): AtlasSign | null {
  const verified = getVerifiedPlacement(value as any);
  return verified?.sign ? atlasSign(verified.sign) : null;
}

function governedDerivedSign(
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
    const sign = verifiedDirectSign(placement);
    const house = astrology.planetaryHouses?.[key];
    if (sign && validHouse(house)) results.push({ key, label: title(key), sign, house, kind: "planet" });
  }

  const rising = verifiedDirectSign(astrology.rising);
  if (rising) results.push({ key: "rising", label: "Ascendant / Rising", sign: rising, kind: "angle" });

  const midheavenRecord = astrology.midheaven as Placement | undefined;
  const midheaven = governedDerivedSign(midheavenRecord, PERSONAL_ATLAS_HOUSE_CONTRACT);
  if (midheaven) {
    results.push({ key: "midheaven", label: "Midheaven", sign: midheaven, kind: "angle" });
  }

  for (const [key, label] of [["northNode", "North Node"], ["southNode", "South Node"]] as const) {
    const placement = astrology[key] as Placement | undefined;
    const sign = verifiedDirectSign(placement);
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
  const chironSign = governedDerivedSign(chiron, "ASTRO-CHIRON-v1");
  if (
    chironSign &&
    validHouse(chiron?.house) &&
    chiron?.qualificationMethod === "live-jpl-qualified-against-swiss"
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
