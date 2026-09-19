import type { VerifiableBody } from "./astrology-verification";

export type MajorAspectKind =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition";

export interface AspectPolicyEntry {
  kind: MajorAspectKind;
  angleDegrees: number;
  maximumOrbDegrees: number;
}

export interface AspectPolicy {
  policyId: string;
  status: "draft" | "approved";
  entries: readonly AspectPolicyEntry[];
  rationale: string;
}

export interface VerifiedLongitudePlacement {
  body: VerifiableBody;
  longitudeDegrees: number;
  verificationStatus: "verified";
}

export interface CalculatedAspect {
  bodyA: VerifiableBody;
  bodyB: VerifiableBody;
  aspect: MajorAspectKind;
  targetAngleDegrees: number;
  separationDegrees: number;
  orbDegrees: number;
  policyId: string;
}

export const LEGACY_COMPAT_MAJOR_ASPECT_POLICY_V1: AspectPolicy = Object.freeze({
  policyId: "ASTRO-ASPECT-MAJOR-v1",
  status: "approved",
  entries: Object.freeze([
    { kind: "conjunction", angleDegrees: 0, maximumOrbDegrees: 10 },
    { kind: "sextile", angleDegrees: 60, maximumOrbDegrees: 6 },
    { kind: "square", angleDegrees: 90, maximumOrbDegrees: 8 },
    { kind: "trine", angleDegrees: 120, maximumOrbDegrees: 8 },
    { kind: "opposition", angleDegrees: 180, maximumOrbDegrees: 10 },
  ] as const),
  rationale:
    "Versioned compatibility policy matching the historical Soul Codex major-aspect orb convention. Orb values are interpretive policy, not astronomical measurement accuracy.",
});

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function circularSeparationDegrees(left: number, right: number): number {
  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    throw new Error("aspect_longitude_invalid");
  }
  const raw = Math.abs(normalizeDegrees(left) - normalizeDegrees(right));
  return Math.min(raw, 360 - raw);
}

function assertPolicy(policy: AspectPolicy): void {
  if (policy.status !== "approved") throw new Error("aspect_policy_not_approved");
  if (!policy.policyId.trim()) throw new Error("aspect_policy_id_missing");
  if (policy.entries.length === 0) throw new Error("aspect_policy_empty");

  const kinds = new Set<MajorAspectKind>();
  for (const entry of policy.entries) {
    if (kinds.has(entry.kind)) throw new Error("aspect_policy_duplicate_kind");
    kinds.add(entry.kind);
    if (
      !Number.isFinite(entry.angleDegrees) ||
      entry.angleDegrees < 0 ||
      entry.angleDegrees > 180 ||
      !Number.isFinite(entry.maximumOrbDegrees) ||
      entry.maximumOrbDegrees <= 0 ||
      entry.maximumOrbDegrees > 30
    ) {
      throw new Error("aspect_policy_entry_invalid");
    }
  }
}

function assertVerifiedPlacements(
  placements: readonly VerifiedLongitudePlacement[],
): void {
  const bodies = new Set<VerifiableBody>();
  for (const placement of placements) {
    if (placement.verificationStatus !== "verified") {
      throw new Error("unverified_aspect_input");
    }
    if (!Number.isFinite(placement.longitudeDegrees)) {
      throw new Error("aspect_longitude_invalid");
    }
    if (bodies.has(placement.body)) {
      throw new Error("duplicate_aspect_body");
    }
    bodies.add(placement.body);
  }
}

function matchAspect(
  separationDegrees: number,
  policy: AspectPolicy,
): AspectPolicyEntry | null {
  let best:
    | { entry: AspectPolicyEntry; orbDegrees: number }
    | null = null;

  for (const entry of policy.entries) {
    const orbDegrees = Math.abs(separationDegrees - entry.angleDegrees);
    if (orbDegrees > entry.maximumOrbDegrees) continue;
    if (
      best === null ||
      orbDegrees < best.orbDegrees ||
      (orbDegrees === best.orbDegrees &&
        entry.angleDegrees < best.entry.angleDegrees)
    ) {
      best = { entry, orbDegrees };
    }
  }

  return best?.entry ?? null;
}

export function calculateMajorAspects(
  placements: readonly VerifiedLongitudePlacement[],
  policy: AspectPolicy = LEGACY_COMPAT_MAJOR_ASPECT_POLICY_V1,
): CalculatedAspect[] {
  assertPolicy(policy);
  assertVerifiedPlacements(placements);

  const sorted = [...placements].sort((left, right) =>
    left.body.localeCompare(right.body),
  );
  const aspects: CalculatedAspect[] = [];

  for (let leftIndex = 0; leftIndex < sorted.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < sorted.length;
      rightIndex += 1
    ) {
      const left = sorted[leftIndex];
      const right = sorted[rightIndex];
      const separationDegrees = circularSeparationDegrees(
        left.longitudeDegrees,
        right.longitudeDegrees,
      );
      const matched = matchAspect(separationDegrees, policy);
      if (!matched) continue;

      aspects.push({
        bodyA: left.body,
        bodyB: right.body,
        aspect: matched.kind,
        targetAngleDegrees: matched.angleDegrees,
        separationDegrees,
        orbDegrees: Math.abs(separationDegrees - matched.angleDegrees),
        policyId: policy.policyId,
      });
    }
  }

  return aspects;
}
