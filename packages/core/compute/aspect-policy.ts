export type MajorAspectKind =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition";

export interface MajorAspectPolicyEntry {
  kind: MajorAspectKind;
  angleDegrees: number;
  maximumOrbDegrees: number;
}

export const MAJOR_ASPECT_POLICY_ID = "ASTRO-ASPECT-MAJOR-v1" as const;

export const MAJOR_ASPECT_POLICY_V1 = Object.freeze({
  policyId: MAJOR_ASPECT_POLICY_ID,
  status: "approved" as const,
  entries: Object.freeze([
    { kind: "conjunction", angleDegrees: 0, maximumOrbDegrees: 10 },
    { kind: "sextile", angleDegrees: 60, maximumOrbDegrees: 6 },
    { kind: "square", angleDegrees: 90, maximumOrbDegrees: 8 },
    { kind: "trine", angleDegrees: 120, maximumOrbDegrees: 8 },
    { kind: "opposition", angleDegrees: 180, maximumOrbDegrees: 10 },
  ] as const satisfies readonly MajorAspectPolicyEntry[]),
  rationale:
    "Versioned compatibility policy matching the historical Soul Codex major-aspect orb convention. Orb values are interpretive policy, not astronomical measurement accuracy.",
});

const ENTRY_BY_KIND = new Map<MajorAspectKind, MajorAspectPolicyEntry>(
  MAJOR_ASPECT_POLICY_V1.entries.map((entry) => [entry.kind, entry]),
);

export function majorAspectPolicyEntry(
  value: unknown,
): MajorAspectPolicyEntry | null {
  if (typeof value !== "string") return null;
  return ENTRY_BY_KIND.get(value.toLowerCase() as MajorAspectKind) ?? null;
}

export function isGovernedMajorAspect(
  kind: unknown,
  orb: unknown,
): kind is MajorAspectKind {
  const entry = majorAspectPolicyEntry(kind);
  const numericOrb = Number(orb);
  return Boolean(
    entry &&
      Number.isFinite(numericOrb) &&
      numericOrb >= 0 &&
      numericOrb <= entry.maximumOrbDegrees,
  );
}
