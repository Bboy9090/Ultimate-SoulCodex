import { registryEntry } from "./system-registry";

export type SoulCodexSystemVisibility =
  | "primary"
  | "supporting"
  | "inspectable"
  | "unavailable";

export type SoulCodexEvidenceRequirement =
  | "deterministic"
  | "verified-astronomy"
  | "verified-system-contract"
  | "user-assessment"
  | "not-production-ready";

export type SoulCodexEvidenceState =
  | "verified"
  | "deterministic"
  | "assessed"
  | "candidate"
  | "unavailable";

export interface SoulCodexSystemPolicy {
  id: string;
  label: string;
  visibility: SoulCodexSystemVisibility;
  evidenceRequirement: SoulCodexEvidenceRequirement;
  mayInfluencePrimarySynthesis: boolean;
  inspectableWhenUnverified: boolean;
  rule: string;
}

/**
 * Canonical product rule for specialist systems.
 *
 * The primary Soul Codex is synthesis-first. Specialist systems may enrich the
 * synthesis when their evidence contract is strong enough, while raw labels
 * remain available in the optional inspector. An implementation is never
 * promoted merely because a calculator or legacy route exists.
 */
export const SOUL_CODEX_SYSTEM_POLICIES = {
  astrologyCore: {
    id: "astrology-core",
    label: "Astrology · Sun / Moon / Rising",
    visibility: "supporting",
    evidenceRequirement: "verified-astronomy",
    mayInfluencePrimarySynthesis: true,
    inspectableWhenUnverified: true,
    rule: "Verified placements may enrich synthesis. Internal candidates may be inspected with an explicit unverified label but never relabeled as chart facts.",
  },
  numerology: {
    id: "numerology",
    label: "Numerology",
    visibility: "supporting",
    evidenceRequirement: "deterministic",
    mayInfluencePrimarySynthesis: true,
    inspectableWhenUnverified: true,
    rule: "Arithmetic values are deterministic under the documented formula; psychological or spiritual meaning remains symbolic.",
  },
  humanDesign: {
    id: "human-design",
    label: "Human Design",
    visibility: "supporting",
    evidenceRequirement: "verified-system-contract",
    mayInfluencePrimarySynthesis: true,
    inspectableWhenUnverified: true,
    rule: "Calculated candidates remain inspectable only. Human Design may influence synthesis only after its trust record is verified.",
  },
  personalityAssessments: {
    id: "personality-assessments",
    label: "Personality assessments",
    visibility: "supporting",
    evidenceRequirement: "user-assessment",
    mayInfluencePrimarySynthesis: false,
    inspectableWhenUnverified: true,
    rule: "Assessment results may support reflection when based on explicit user responses, but they do not alter the stable Codex fingerprint until a normalized assessment-evidence contract is promoted.",
  },
  housesMidheaven: {
    id: "houses-midheaven",
    label: "Houses / Midheaven",
    visibility: "supporting",
    evidenceRequirement: "verified-system-contract",
    mayInfluencePrimarySynthesis: true,
    inspectableWhenUnverified: false,
    rule: "Verified Equal House geometry, planetary-house assignments, and Midheaven may support symbolic synthesis under ASTRO-EQUAL-HOUSE-v1. Candidates and geometry from an unnamed or unverified house system remain excluded.",
  },
  nodesChiron: {
    id: "nodes-chiron",
    label: "Nodes / Chiron / planetary house placements",
    visibility: "supporting",
    evidenceRequirement: "verified-system-contract",
    mayInfluencePrimarySynthesis: true,
    inspectableWhenUnverified: false,
    rule: "Mean Nodes and Chiron may support symbolic synthesis only when their verified placement contracts pass. Chiron additionally requires the live JPL result qualified against Swiss Ephemeris; candidates and fallbacks remain excluded.",
  },
  astrocartography: {
    id: "astrocartography",
    label: "Astrocartography",
    visibility: "unavailable",
    evidenceRequirement: "not-production-ready",
    mayInfluencePrimarySynthesis: false,
    inspectableWhenUnverified: false,
    rule: "No sample power places or decorative planetary lines. Release requires real line calculation, mapping, and evidence tests.",
  },
  chineseAstrology: {
    id: "chinese-astrology",
    label: "Chinese Astrology / BaZi",
    visibility: "unavailable",
    evidenceRequirement: "not-production-ready",
    mayInfluencePrimarySynthesis: false,
    inspectableWhenUnverified: false,
    rule: "The legacy Gregorian shortcut is not BaZi/Four Pillars. Production requires governed sexagenary-cycle and solar-term calculations before any result may be exposed.",
  },
  iChing: {
    id: "i-ching",
    label: "I Ching",
    visibility: "unavailable",
    evidenceRequirement: "not-production-ready",
    mayInfluencePrimarySynthesis: false,
    inspectableWhenUnverified: false,
    rule: "The legacy prototype has an incomplete hexagram corpus and no governed casting method, so it cannot produce production identity claims.",
  },
  runes: {
    id: "runes",
    label: "Runes",
    visibility: "unavailable",
    evidenceRequirement: "not-production-ready",
    mayInfluencePrimarySynthesis: false,
    inspectableWhenUnverified: false,
    rule: "Legacy birth-rune mappings remain quarantined until a governed symbolic-use contract is explicitly approved.",
  },
  sacredGeometry: {
    id: "sacred-geometry",
    label: "Sacred Geometry",
    visibility: "unavailable",
    evidenceRequirement: "not-production-ready",
    mayInfluencePrimarySynthesis: false,
    inspectableWhenUnverified: false,
    rule: "Decorative geometry may be used as visual design, but legacy personal-geometry mappings remain quarantined from identity and inspection claims.",
  },
  palmistry: {
    id: "palmistry",
    label: "Palmistry",
    visibility: "unavailable",
    evidenceRequirement: "not-production-ready",
    mayInfluencePrimarySynthesis: false,
    inspectableWhenUnverified: false,
    rule: "No generated palm claims without an actual image-analysis contract and explicit image consent.",
  },
} as const satisfies Record<string, SoulCodexSystemPolicy>;

export type SoulCodexSystemKey = keyof typeof SOUL_CODEX_SYSTEM_POLICIES;

const REGISTRY_ID_BY_SYSTEM: Record<SoulCodexSystemKey, string> = {
  astrologyCore: "natal-astrology",
  numerology: "numerology-core",
  humanDesign: "human-design-core",
  personalityAssessments: "personality-assessments",
  housesMidheaven: "houses-midheaven",
  nodesChiron: "nodes-chiron",
  astrocartography: "astrocartography",
  chineseAstrology: "chinese-astrology",
  iChing: "i-ching",
  runes: "runes",
  sacredGeometry: "sacred-geometry",
  palmistry: "palmistry",
};

function canonicalRegistryEntry(system: SoulCodexSystemKey) {
  return registryEntry(REGISTRY_ID_BY_SYSTEM[system]);
}

function policyFor(system: SoulCodexSystemKey): SoulCodexSystemPolicy {
  return SOUL_CODEX_SYSTEM_POLICIES[system];
}

export function maySystemInfluenceSynthesis(
  system: SoulCodexSystemKey,
  evidenceState: SoulCodexEvidenceState,
): boolean {
  const policy = policyFor(system);
  const registry = canonicalRegistryEntry(system);

  // The production registry is the canonical authority. This compatibility
  // policy may impose stricter evidence requirements, but it may never promote
  // a system that the registry excludes from the stable Codex.
  if (
    !registry ||
    !registry.mayInfluenceUltimateCodex ||
    registry.state === "unavailable" ||
    !policy.mayInfluencePrimarySynthesis ||
    policy.visibility === "unavailable"
  ) {
    return false;
  }

  switch (policy.evidenceRequirement) {
    case "deterministic":
      return evidenceState === "deterministic" || evidenceState === "verified";
    case "verified-astronomy":
    case "verified-system-contract":
      return evidenceState === "verified";
    case "user-assessment":
      return evidenceState === "assessed" || evidenceState === "verified";
    case "not-production-ready":
      return false;
  }
}

export function mayInspectSystem(
  system: SoulCodexSystemKey,
  evidenceState: SoulCodexEvidenceState,
): boolean {
  const policy = policyFor(system);
  const registry = canonicalRegistryEntry(system);
  if (!registry || registry.state === "unavailable" || policy.visibility === "unavailable") {
    return false;
  }
  if (
    evidenceState === "verified" ||
    evidenceState === "deterministic" ||
    evidenceState === "assessed"
  ) {
    return true;
  }
  return policy.inspectableWhenUnverified && evidenceState === "candidate";
}

export function systemsAllowedToInfluenceSynthesis(): SoulCodexSystemPolicy[] {
  return (Object.keys(SOUL_CODEX_SYSTEM_POLICIES) as SoulCodexSystemKey[])
    .filter((system) => {
      const policy = policyFor(system);
      const registry = canonicalRegistryEntry(system);
      return Boolean(
        registry?.mayInfluenceUltimateCodex &&
        registry.state !== "unavailable" &&
        policy.mayInfluencePrimarySynthesis &&
        policy.visibility !== "unavailable",
      );
    })
    .map((system) => policyFor(system));
}

export function unavailableProductionSystems(): SoulCodexSystemPolicy[] {
  return (Object.keys(SOUL_CODEX_SYSTEM_POLICIES) as SoulCodexSystemKey[])
    .filter((system) => {
      const policy = policyFor(system);
      const registry = canonicalRegistryEntry(system);
      return registry?.state === "unavailable" || policy.visibility === "unavailable";
    })
    .map((system) => policyFor(system));
}
