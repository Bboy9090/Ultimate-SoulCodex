export type SoulCodexRegistryState =
  | "governed"
  | "user-assessed"
  | "inspect-only"
  | "unavailable";

export interface SoulCodexRegistryEntry {
  id: string;
  label: string;
  family: string;
  state: SoulCodexRegistryState;
  mayInfluenceUltimateCodex: boolean;
  evidenceContract: string;
  rule: string;
}

/**
 * Living production registry.
 *
 * Presence of legacy code, calculators, prompt templates, or marketing copy does
 * not make a system production-governed. Only entries explicitly marked as
 * capable of influencing the Ultimate Codex may alter the combined identity.
 */
export const SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY: readonly SoulCodexRegistryEntry[] = Object.freeze([
  {
    id: "natal-astrology",
    label: "Natal astrology · planets / Big Three",
    family: "Astrology",
    state: "governed",
    mayInfluenceUltimateCodex: true,
    evidenceContract: "independently verified astronomical placements",
    rule: "Only verified placements enter synthesis; candidates and legacy sign aliases do not.",
  },
  {
    id: "houses-midheaven",
    label: "Houses / Ascendant / Midheaven",
    family: "Astrology",
    state: "governed",
    mayInfluenceUltimateCodex: true,
    evidenceContract: "ASTRO-EQUAL-HOUSE-v1 + verified Ascendant",
    rule: "Equal House geometry and angles must pass their governed verification contracts.",
  },
  {
    id: "major-aspects",
    label: "Major natal aspects",
    family: "Astrology",
    state: "governed",
    mayInfluenceUltimateCodex: true,
    evidenceContract: "ASTRO-ASPECT-MAJOR-v1 from verified longitudes",
    rule: "Conjunction, opposition, trine, square, and sextile may be interpreted only from verified positions.",
  },
  {
    id: "nodes-chiron",
    label: "Mean Nodes / Chiron",
    family: "Astrology",
    state: "governed",
    mayInfluenceUltimateCodex: true,
    evidenceContract: "ASTRO-MEAN-NODE-v1 + ASTRO-CHIRON-v1",
    rule: "Chiron additionally requires the live-JPL qualification path; no approximate fallback.",
  },
  {
    id: "western-elements-modalities",
    label: "Western elements / modalities / stellium-style concentrations",
    family: "Astrology synthesis",
    state: "governed",
    mayInfluenceUltimateCodex: true,
    evidenceContract: "deterministic aggregation of verified natal placements",
    rule: "Aggregates may summarize verified chart evidence but may not manufacture missing placements.",
  },
  {
    id: "numerology-core",
    label: "Numerology · stable core",
    family: "Numerology",
    state: "governed",
    mayInfluenceUltimateCodex: true,
    evidenceContract: "documented deterministic arithmetic",
    rule: "Life Path, Birthday, Expression, Soul Urge, Personality, and Maturity may enter the stable identity fingerprint when available.",
  },
  {
    id: "numerology-cycles",
    label: "Numerology · Personal Year / daily cycles",
    family: "Numerology",
    state: "governed",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "documented deterministic arithmetic",
    rule: "Time-varying cycles may inform current guidance but are excluded from the stable identity fingerprint.",
  },
  {
    id: "human-design-core",
    label: "Human Design · core bodygraph",
    family: "Human Design",
    state: "governed",
    mayInfluenceUltimateCodex: true,
    evidenceContract: "HUMAN-DESIGN-CORE-v1",
    rule: "Type, Strategy, Authority, Profile, Definition, centers, channels, gates, and gate/line activations may influence synthesis only after the verified core contract passes.",
  },
  {
    id: "human-design-advanced",
    label: "Human Design · Variables / Incarnation Cross naming",
    family: "Human Design",
    state: "inspect-only",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "no approved production verification contract",
    rule: "Do not promote advanced labels into verified identity output until independently qualified.",
  },
  {
    id: "personality-assessments",
    label: "Personality assessments · MBTI / Enneagram / similar",
    family: "Assessment",
    state: "user-assessed",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "explicit user assessment state + normalized assessment schema not yet promoted",
    rule: "May be inspected as user-supplied supporting context, but does not enter the stable Codex fingerprint until a normalized assessment-evidence contract is promoted. Never infer a type from birth data.",
  },
  {
    id: "legacy-elemental-medicine",
    label: "Legacy Elemental Medicine profile",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "no approved assessment or calculation contract",
    rule: "Do not infer an elemental personality profile from natal signs, numerology, or Human Design.",
  },
  {
    id: "legacy-soul-archetype",
    label: "Legacy Soul Archetype generator",
    family: "Legacy synthesis",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "superseded by governed Diamond Way / Galactic evidence synthesis",
    rule: "Generic zodiac or numerology prose, deterministic fill text, and invented soul-frequency labels must not substitute for missing evidence.",
  },
  {
    id: "parental-influence",
    label: "Parental sign influence",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "no approved behavioral or family-history assessment contract",
    rule: "Parent zodiac signs do not establish inherited traits, relationship patterns, or parental influence facts.",
  },
  {
    id: "moral-compass",
    label: "Moral Compass",
    family: "Assessment",
    state: "user-assessed",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "explicit user responses required",
    rule: "Legacy calculators or compatibility weights do not create a moral profile without user evidence.",
  },
  {
    id: "chinese-astrology",
    label: "Chinese astrology",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "Legacy templates and placeholders are quarantined from identity synthesis.",
  },
  {
    id: "ayurveda",
    label: "Ayurvedic constitution",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "No dosha is inferred from unrelated profile fields.",
  },
  {
    id: "returns-progressions",
    label: "Solar / Lunar Returns and Secondary Progressions",
    family: "Astrology extensions",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "no approved return/progression astronomical verification contract",
    rule: "Legacy placeholder day-of-year, fixed-house, or approximate return calculations are quarantined. Production requires exact return search, governed chart geometry, and independent verification.",
  },
  {
    id: "vedic-astrology",
    label: "Vedic astrology / Nakshatras",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "No Vedic or Nakshatra claim enters production synthesis without its own calculation and verification policy.",
  },
  {
    id: "gene-keys",
    label: "Gene Keys",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "Legacy gift/purpose placeholders are not evidence.",
  },
  {
    id: "i-ching",
    label: "I Ching",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "No hexagram is generated or assigned as a birth identity without a governed method.",
  },
  {
    id: "mayan",
    label: "Mayan / Tzolk'in-style astrology",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "Legacy day-sign and tone placeholders remain excluded.",
  },
  {
    id: "chakras",
    label: "Chakra / energy-center profile",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "No dominant chakra is inferred without an explicit governed assessment.",
  },
  {
    id: "runes",
    label: "Runes",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "No birth rune is assigned through a fallback table or placeholder.",
  },
  {
    id: "tarot",
    label: "Tarot birth cards / symbolic cards",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not part of the governed Foundation identity contract",
    rule: "Tarot may be offered as an explicit symbolic practice later; it does not silently influence the current identity fingerprint.",
  },
  {
    id: "kabbalah",
    label: "Kabbalah / Tree of Life paths",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "No path is fabricated from missing or unrelated evidence.",
  },
  {
    id: "sacred-geometry",
    label: "Sacred geometry",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "Decorative geometry may be visual design; it is not a calculated identity fact.",
  },
  {
    id: "sabian-symbols",
    label: "Sabian Symbols",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed in the Ultimate Codex",
    rule: "Legacy lookup content does not enter the stable identity fingerprint.",
  },
  {
    id: "biorhythms",
    label: "Biorhythms",
    family: "Legacy symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "No cycle is described as a validated biological measurement.",
  },
  {
    id: "asteroids",
    label: "Asteroids",
    family: "Astrology extensions",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "no approved complete asteroid verification contract",
    rule: "No key asteroid influence enters synthesis through placeholder text.",
  },
  {
    id: "arabic-parts",
    label: "Arabic Parts / Lots",
    family: "Astrology extensions",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "Part of Fortune or Spirit must be explicitly calculated under a documented convention before use.",
  },
  {
    id: "fixed-stars",
    label: "Fixed stars",
    family: "Astrology extensions",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "not production-governed",
    rule: "No fixed-star influence enters synthesis through a generic star placeholder.",
  },
  {
    id: "astrocartography",
    label: "Astrocartography",
    family: "Astrology extensions",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "no production-grade line calculation and mapping contract",
    rule: "No decorative power-place or planetary-line claims.",
  },
  {
    id: "palmistry",
    label: "Palmistry",
    family: "Image-based symbolic systems",
    state: "unavailable",
    mayInfluenceUltimateCodex: false,
    evidenceContract: "no governed image-analysis + consent contract",
    rule: "No palm claim is generated without actual image evidence and explicit consent.",
  },
]);

export function registrySystemsAllowedInUltimateCodex(): SoulCodexRegistryEntry[] {
  return SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.filter((entry) => entry.mayInfluenceUltimateCodex);
}

export function registrySystemsExcludedFromUltimateCodex(): SoulCodexRegistryEntry[] {
  return SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.filter((entry) => !entry.mayInfluenceUltimateCodex);
}

export function registryEntry(id: string): SoulCodexRegistryEntry | null {
  return SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.find((entry) => entry.id === id) ?? null;
}

export type SoulCodexUseContext =
  | "stable-identity"
  | "current-guidance"
  | "supporting-reflection"
  | "technical-inspection";

const CURRENT_GUIDANCE_SYSTEM_IDS = new Set([
  "numerology-cycles",
]);

const SUPPORTING_REFLECTION_SYSTEM_IDS = new Set([
  "personality-assessments",
  "moral-compass",
]);

/**
 * Select systems by the job they are actually qualified to do.
 *
 * This is intentionally not a "more systems is better" selector:
 * - stable identity admits only governed systems explicitly allowed to alter the Codex;
 * - current guidance admits governed time-varying systems, without promoting them into identity;
 * - supporting reflection admits explicit user-assessment context, without treating it as birth-derived fact;
 * - technical inspection exposes every registered system so unresolved/excluded states stay inspectable.
 */
export function registrySystemsForUseContext(
  context: SoulCodexUseContext,
): SoulCodexRegistryEntry[] {
  if (context === "stable-identity") {
    return registrySystemsAllowedInUltimateCodex();
  }

  if (context === "current-guidance") {
    return SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.filter(
      (entry) =>
        entry.state === "governed" &&
        (entry.mayInfluenceUltimateCodex || CURRENT_GUIDANCE_SYSTEM_IDS.has(entry.id)),
    );
  }

  if (context === "supporting-reflection") {
    return SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.filter(
      (entry) => SUPPORTING_REFLECTION_SYSTEM_IDS.has(entry.id),
    );
  }

  return [...SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY];
}


export type SoulCodexRegistryDisplayState =
  | "Governed"
  | "Supporting"
  | "Inspect only"
  | "Unavailable";

export interface SoulCodexRegistryDisplayEntry {
  id: string;
  label: string;
  family: string;
  state: SoulCodexRegistryDisplayState;
  stableIdentityEligible: boolean;
  evidenceContract: string;
  rule: string;
}

function registryDisplayState(
  state: SoulCodexRegistryState,
): SoulCodexRegistryDisplayState {
  if (state === "governed") return "Governed";
  if (state === "user-assessed") return "Supporting";
  if (state === "inspect-only") return "Inspect only";
  return "Unavailable";
}

/**
 * Canonical user-facing projection of the production registry.
 *
 * Important distinction: "Governed" describes the system's production policy,
 * not whether a particular user's evidence has passed verification. Per-profile
 * verification remains a separate runtime concern.
 */
export function registryDisplayManifest(): SoulCodexRegistryDisplayEntry[] {
  return SOUL_CODEX_PRODUCTION_SYSTEM_REGISTRY.map((entry) => ({
    id: entry.id,
    label: entry.label,
    family: entry.family,
    state: registryDisplayState(entry.state),
    stableIdentityEligible: entry.mayInfluenceUltimateCodex,
    evidenceContract: entry.evidenceContract,
    rule: entry.rule,
  }));
}
