/**
 * Soul Circle synastry aspect evidence layer.
 *
 * Only caller-supplied, verified ecliptic longitudes are compared. This module
 * neither calculates births nor guesses positions from sign/house-only records.
 * A symbolic geometric relationship is not a relationship-outcome prediction.
 */
import { ATLAS_SIGNS, type AtlasSign } from "./astrologyAtlas";
import { CONNECTION_PLACEMENT_KEYS, type ConnectionPlacementKey } from "./connectionRepository";

export type VerifiedAspectPlacement = {
  key: ConnectionPlacementKey;
  sign: AtlasSign;
  degree: number; // Degrees within sign: [0,30)
  verified: true;
};
export type SoulCircleAspectName = "conjunction" | "sextile" | "square" | "trine" | "opposition";
export type SoulCircleAspect = {
  a: ConnectionPlacementKey;
  b: ConnectionPlacementKey;
  aspect: SoulCircleAspectName;
  separation: number;
  orb: number;
  allowedOrb: number;
};
export type SoulCircleAspectResult = {
  aspects: SoulCircleAspect[];
  verifiedA: number;
  verifiedB: number;
  comparedPairs: number;
  excludedA: number;
  excludedB: number;
  notice: string;
};
const ASPECTS: readonly { name: SoulCircleAspectName; angle: number; orb: number }[] = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "sextile", angle: 60, orb: 5 },
  { name: "square", angle: 90, orb: 6 },
  { name: "trine", angle: 120, orb: 6 },
  { name: "opposition", angle: 180, orb: 8 },
];

function isVerified(value: unknown): value is VerifiedAspectPlacement {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<VerifiedAspectPlacement>;
  return row.verified === true
    && CONNECTION_PLACEMENT_KEYS.includes(row.key as ConnectionPlacementKey)
    && ATLAS_SIGNS.includes(row.sign as AtlasSign)
    && typeof row.degree === "number" && Number.isFinite(row.degree)
    && row.degree >= 0 && row.degree < 30;
}
function sanitize(raw: readonly unknown[]): VerifiedAspectPlacement[] {
  const byKey = new Map<ConnectionPlacementKey, VerifiedAspectPlacement>();
  for (const row of raw) {
    if (isVerified(row) && !byKey.has(row.key)) byKey.set(row.key, row);
  }
  return CONNECTION_PLACEMENT_KEYS.flatMap(key => byKey.has(key) ? [byKey.get(key)!] : []);
}
function longitude(row: VerifiedAspectPlacement): number {
  return ATLAS_SIGNS.indexOf(row.sign) * 30 + row.degree;
}
function angularSeparation(a: number, b: number): number {
  const delta = Math.abs(a - b) % 360;
  return Math.min(delta, 360 - delta);
}

/** Calculate cross-person aspects; no invented coordinates or aggregate verdict. */
export function compareVerifiedSoulCircleAspects(
  rawA: readonly unknown[],
  rawB: readonly unknown[],
): SoulCircleAspectResult {
  const a = sanitize(rawA), b = sanitize(rawB);
  const aspects: SoulCircleAspect[] = [];
  for (const first of a) for (const second of b) {
    const separation = angularSeparation(longitude(first), longitude(second));
    const candidates = ASPECTS.map(spec => ({
      ...spec, difference: Math.abs(separation - spec.angle),
    })).filter(spec => spec.difference <= spec.orb)
      .sort((left, right) => left.difference - right.difference || left.angle - right.angle);
    const best = candidates[0];
    if (best) aspects.push({
      a: first.key, b: second.key, aspect: best.name,
      separation, orb: best.difference, allowedOrb: best.orb,
    });
  }
  return {
    aspects, verifiedA: a.length, verifiedB: b.length,
    comparedPairs: a.length * b.length,
    excludedA: rawA.length - a.length,
    excludedB: rawB.length - b.length,
    notice: "Calculated only from explicitly verified sign and degree evidence on both sides. Aspects are symbolic geometry, not proof of compatibility or a forecast.",
  };
}
