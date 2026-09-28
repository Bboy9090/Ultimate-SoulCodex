import { calcLifePath } from "@soulcodex/core";
import { hasApprovedVerifiedHumanDesignTrust } from "../../server/services/human-design-trust";

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
  verifiedAstrologyData?: any;
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

const ZODIAC_SIGNS = new Set([
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]);

function evidenceText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function verifiedAstrologySign(value: any): string {
  if (!value || typeof value !== "object") return "";
  const evidence = value.provenance ?? value.evidence;
  const hasDirectEvidence = Boolean(
    evidenceText(evidence?.source) &&
    evidenceText(evidence?.engine) &&
    evidenceText(evidence?.calculatedAt) &&
    !Number.isNaN(Date.parse(evidence.calculatedAt))
  );
  const hasGovernedEvidence = Boolean(
    evidenceText(value?.policyId) &&
    evidenceText(value?.evidenceArtifactId)
  );
  return value.verificationStatus === "verified" &&
    ZODIAC_SIGNS.has(value.sign) &&
    (hasDirectEvidence || hasGovernedEvidence)
      ? value.sign
      : "";
}

function canonicalLifePath(profile: ProfileInput, numData: any): number | "" {
  const birthDate =
    typeof profile?.birthDate === "string"
      ? profile.birthDate.slice(0, 10)
      : profile?.birthDate instanceof Date
        ? profile.birthDate.toISOString().slice(0, 10)
        : null;
  if (!birthDate) return "";
  try {
    const expected = calcLifePath(birthDate);
    const supplied = Number(numData?.lifePath ?? profile?.lifePath);
    return supplied === expected ? expected : "";
  } catch {
    return "";
  }
}

export function extractCore(profile: ProfileInput) {
  const astro = profile?.verifiedAstrologyData || profile?.astrologyData || {};
  const numData = profile?.numerologyData || {};
  const hdData = profile?.humanDesignData || {};
  const verifiedHumanDesign = hasApprovedVerifiedHumanDesignTrust(hdData) ? hdData : null;
  const verifiedHumanDesignFields = verifiedHumanDesign
    ? ((verifiedHumanDesign.candidate && typeof verifiedHumanDesign.candidate === "object")
        ? verifiedHumanDesign.candidate
        : (hdData as Record<string, any>))
    : {};
  const elemData = profile?.elementalMedicineData || {};
  const archData = profile?.archetypeData || profile?.archetype || {};
  const synth = profile?.synthesis || {};

  return {
    name: profile?.name || "You",
    sunSign: verifiedAstrologySign(astro?.sun ?? astro?.planets?.sun),
    moonSign: verifiedAstrologySign(astro?.moon ?? astro?.planets?.moon),
    risingSign: verifiedAstrologySign(astro?.rising),
    lifePath: canonicalLifePath(profile, numData),
    hdType: verifiedHumanDesignFields.type || "",
    hdStrategy: verifiedHumanDesignFields.strategy || "",
    hdAuthority: verifiedHumanDesignFields.authority || "",
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
