/**
 * Shared types for all Codex tools.
 * Every tool produces a CodexToolResult following Observation → Meaning → Action.
 */

export interface CodexToolResult {
  tool: string;
  title: string;
  observation: string;
  meaning: string;
  action: string;
  extras?: Record<string, any>;
}

export interface ProfileInput {
  name?: string;
  astrologyData?: any;
  numerologyData?: any;
  humanDesignData?: any;
  elementalMedicineData?: any;
  archetypeData?: any;
  archetype?: any;
  synthesis?: any;
  moralCompassData?: any;
  birthDate?: string | Date;
  [key: string]: any;
}

export function extractCore(profile: ProfileInput) {
  const astro = profile?.astrologyData || {};
  const numData = profile?.numerologyData || {};
  const hdData = profile?.humanDesignData || {};
  const elemData = profile?.elementalMedicineData || {};
  const archData = profile?.archetypeData || profile?.archetype || {};
  const synth = profile?.synthesis || {};

  return {
    name: profile?.name || "You",
    sunSign: astro?.sunSign || profile?.sunSign || "",
    moonSign: astro?.moonSign || profile?.moonSign || "",
    risingSign: astro?.risingSign || profile?.risingSign || "",
    lifePath: numData?.lifePath || profile?.lifePath || "",
    hdType: hdData?.type || profile?.hdType || "",
    hdStrategy: hdData?.strategy || "",
    hdAuthority: hdData?.authority || "",
    primaryElement: elemData?.primaryElement || archData?.element || profile?.element || "",
    secondaryElement: elemData?.secondaryElement || "",
    archetype: archData?.archetype || archData?.name ||
      (typeof profile?.archetype === "string" ? profile.archetype : profile?.archetype?.name) || "",
    themes: archData?.themes || profile?.themes?.topThemes || [],
    strengths: archData?.strengths || [],
    shadows: archData?.shadows || [],
    stressPattern: synth?.stressPattern || "",
    blindSpot: synth?.blindSpot || "",
    growthEdge: synth?.growthEdge || "",
    decisionStyle: synth?.decisionStyle || profile?.mirror?.decisionStyle || "",
    coreNature: synth?.coreNature || "",
    tarotCard1: archData?.tarotCards?.card1 || "",
    tarotCard2: archData?.tarotCards?.card2 || "",
    birthDate: profile?.birthDate || null,
  };
}
