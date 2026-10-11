import { extractVerifiedAstrology } from "../lib/verified-astrology";
import { verifiedProfileHumanDesignSummary } from "./profile-human-design";
import { canonicalNumberPattern, canonicalSignPattern, type CanonicalSymbolicPattern } from "@shared/symbolic-vocabulary";

interface ArchetypeData {
  title: string;
  description: string;
  strengths: string[];
  shadows: string[];
  themes: string[];
  guidance: string;
}

type SymbolicPattern = CanonicalSymbolicPattern;

const unresolvedArchetype: ArchetypeData = {
  title: "Archetype unresolved",
  description:
    "Your Soul Codex is still assembling the governed layers needed for a responsible synthesis. No substitute archetype is assigned while those layers are unresolved.",
  strengths: ["Self-observation", "Curiosity", "Patience with uncertainty"],
  shadows: ["Rushing toward labels", "Treating guesses as identity"],
  themes: ["Observation", "Verification", "Lived experience"],
  guidance:
    "Use supported facts as reflection prompts and leave unresolved material open instead of filling it with a generic identity.",
};

function validNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && canonicalNumberPattern(parsed) ? parsed : null;
}

function unique(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())).map((value) => value.trim()))];
}

export function synthesizeArchetype(
  astrologyData: unknown,
  numerologyData: any,
  personalityData: any,
  humanDesignData?: unknown,
): ArchetypeData {
  const verified = extractVerifiedAstrology({ astrologyData });
  const sun = verified.sun?.toLowerCase() ?? null;
  const moon = verified.moon?.toLowerCase() ?? null;
  const rising = verified.rising?.toLowerCase() ?? null;
  const lifePath = validNumber(numerologyData?.lifePath);
  const expression = validNumber(numerologyData?.expression ?? numerologyData?.expressionNumber);
  const soulUrge = validNumber(numerologyData?.soulUrge ?? numerologyData?.soulUrgeNumber);

  const sunPattern = canonicalSignPattern(sun);
  const moonPattern = canonicalSignPattern(moon);
  const risingPattern = canonicalSignPattern(rising);
  const pathPattern = canonicalNumberPattern(lifePath);
  const expressionPattern = canonicalNumberPattern(expression);
  const soulPattern = canonicalNumberPattern(soulUrge);
  const humanDesignSummary = verifiedProfileHumanDesignSummary(humanDesignData);
  const assessedDescriptions = [
    Number.isInteger(personalityData?.enneagram?.type) && personalityData.enneagram.type >= 1 && personalityData.enneagram.type <= 9
      ? personalityData.enneagram.description : null,
    /^[IE][NS][TF][JP]$/.test(personalityData?.mbti?.type ?? "") ? personalityData.mbti.description : null,
  ].filter((value): value is string => typeof value === "string" && Boolean(value.trim()));

  const supported = [sunPattern, moonPattern, risingPattern, pathPattern, expressionPattern, soulPattern].filter(Boolean);
  if (supported.length === 0 && !humanDesignSummary) return unresolvedArchetype;

  const titleParts = unique([
    sunPattern ? String(verified.sun) + " " + sunPattern.word : null,
    pathPattern ? "LP" + lifePath + " " + pathPattern.word : null,
    moonPattern ? String(verified.moon) + " Moon " + moonPattern.word : null,
    risingPattern ? String(verified.rising) + " Rising " + risingPattern.word : null,
    humanDesignSummary ? "Human Design " + humanDesignSummary.split(";")[0] : null,
  ]);
  const title = titleParts.slice(0, 3).join(" × ");

  const sourceSentences = unique([
    sunPattern ? "Verified Sun symbolism emphasizes " + sunPattern.drive + "." : null,
    moonPattern ? "Verified Moon symbolism adds " + moonPattern.drive + "." : null,
    risingPattern ? "Verified Rising symbolism adds " + risingPattern.drive + "." : null,
    pathPattern ? "Life Path " + lifePath + " adds the governed numerology theme of " + pathPattern.drive + "." : null,
    expressionPattern ? "Expression " + expression + " adds an outward-development theme of " + expressionPattern.drive + "." : null,
    soulPattern ? "Soul Urge " + soulUrge + " adds an inner-motivation theme of " + soulPattern.drive + "." : null,
    humanDesignSummary ? "Verified Human Design supports symbolic decision reflection: " + humanDesignSummary + "." : null,
    ...assessedDescriptions.map((description) => "Saved user-assessment context: " + description + " These are assessed tendencies, not verified identity facts."),
  ]);

  const strengths = unique([
    sunPattern?.gift, moonPattern?.gift, risingPattern?.gift,
    pathPattern?.gift, expressionPattern?.gift, soulPattern?.gift,
  ]);
  const shadows = unique([
    sunPattern?.shadow, moonPattern?.shadow, risingPattern?.shadow,
    pathPattern?.shadow, expressionPattern?.shadow, soulPattern?.shadow,
  ]);
  const themes = unique([
    verified.sun ? "Sun " + verified.sun : null,
    verified.moon ? "Moon " + verified.moon : null,
    verified.rising ? "Rising " + verified.rising : null,
    lifePath ? "Life Path " + lifePath : null,
    expression ? "Expression " + expression : null,
    soulUrge ? "Soul Urge " + soulUrge : null,
    humanDesignSummary ? "Human Design " + humanDesignSummary : null,
    personalityData?.enneagram?.type ? "Enneagram " + personalityData.enneagram.type : null,
    personalityData?.mbti?.type ? "MBTI " + personalityData.mbti.type : null,
  ]);

  return {
    title,
    description:
      sourceSentences.join(" ") +
      " These layers are combined as a symbolic reflection profile, not a fixed or scientifically verified personality diagnosis.",
    strengths,
    shadows,
    themes,
    guidance: unique([
      sunPattern?.action, moonPattern?.action, risingPattern?.action,
      pathPattern?.action, expressionPattern?.action, soulPattern?.action,
    ]).slice(0, 3).join(" "),
  };
}
