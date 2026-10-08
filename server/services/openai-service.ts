import { generateText, isGeminiAvailable } from "../../gemini";
import { extractVerifiedAstrology } from "../lib/verified-astrology";
import { canonicalNumberPattern, canonicalSignPattern, type CanonicalSymbolicPattern } from "@shared/symbolic-vocabulary";
import { verifiedProfileHumanDesignSummary } from "./profile-human-design";

export interface BiographyRequest {
  name: string;
  archetypeTitle: string;
  astrologyData: any;
  numerologyData: any;
  personalityData: any;
  archetype: any;
  humanDesignData?: unknown;
}

function verifiedAstrologyFor(data: BiographyRequest) {
  return extractVerifiedAstrology({ astrologyData: data.astrologyData });
}

function astrologyPromptLines(data: BiographyRequest): string[] {
  const astrology = verifiedAstrologyFor(data);
  const lines: string[] = [];
  const humanDesign = verifiedProfileHumanDesignSummary(data.humanDesignData);
  if (humanDesign) lines.push(`- Verified Human Design core (interpretation is symbolic): ${humanDesign}`);
  if (astrology.sun) lines.push(`- Sun: ${astrology.sun}`);
  if (astrology.moon) lines.push(`- Moon: ${astrology.moon}`);
  if (astrology.rising) lines.push(`- Rising: ${astrology.rising}`);
  if (astrology.unresolved.length) {
    lines.push(`- Unresolved astrology: ${astrology.unresolved.join(", ")}. Do not infer or interpret these placements.`);
  }
  return lines;
}

export async function generateBiography(data: BiographyRequest): Promise<string> {
  if (!isGeminiAvailable()) return generateFallbackBiography(data);

  try {
    const prompt = `You are an expert behavioral biographer. Create a compelling 2-3 paragraph first-person narrative for ${data.name}.

Profile Summary:
- Archetype: ${data.archetypeTitle}
${astrologyPromptLines(data).join("\n")}
- Life Path Number: ${data.numerologyData?.lifePath || "Unresolved"}
- Enneagram Type: ${data.personalityData?.enneagram?.type || "Unresolved"}
- MBTI Type: ${data.personalityData?.mbti?.type || "Unresolved"}

Core Themes from Analysis:
${data.archetype?.themes?.join(", ") || "No verified themes supplied"}

Rules:
1. Use only supplied profile facts.
2. Treat astrology, numerology, Human Design, archetype, Enneagram, and MBTI meanings as symbolic or assessed reflection frameworks, not scientific diagnoses or fixed destiny.
3. Do not invent or infer unresolved astrology, biography, motives, trauma, or confidence.
4. Prefer calibrated language such as "may", "can", or "one pattern to test" when moving from supplied data to interpretation.
5. Describe observable patterns and practical meaning.
6. Return only the biographical text.`;

    const result = await generateText({ prompt, temperature: 0.8 });
    return result || generateFallbackBiography(data);
  } catch (error) {
    console.error("Error generating biography:", error);
    return generateFallbackBiography(data);
  }
}

export async function generateDailyGuidance(data: BiographyRequest): Promise<string> {
  if (!isGeminiAvailable()) return generateFallbackGuidance(data);

  try {
    const prompt = `Create brief, actionable daily guidance for ${data.name}.

Supported profile:
- Archetype: ${data.archetypeTitle}
${astrologyPromptLines(data).join("\n")}
- Life Path: ${data.numerologyData?.lifePath || "Unresolved"}

Use only supported data. Treat symbolic and assessed systems as reflection prompts rather than fixed identity. Do not infer unresolved astrology. Use calibrated language and return 2-3 grounded sentences.`;

    const result = await generateText({ prompt, temperature: 0.7 });
    return result || generateFallbackGuidance(data);
  } catch (error) {
    console.error("Error generating daily guidance:", error);
    return generateFallbackGuidance(data);
  }
}

function supportedReflectionLayers(data: BiographyRequest) {
  // Qualified calculation provenance admits a placement; its meaning remains
  // symbolic and cannot establish somebody's behavior or psychological motive.
  const layers: Array<{ label: string; pattern: CanonicalSymbolicPattern }> = [];
  const astrology = verifiedAstrologyFor(data);
  for (const body of ["sun", "moon", "rising"] as const) {
    const sign = astrology[body];
    const pattern = canonicalSignPattern(sign);
    if (pattern) layers.push({ label: `${sign} ${body === "sun" ? "Sun" : body === "moon" ? "Moon" : "Rising"}`, pattern });
  }
  for (const [field, label] of [["lifePath", "Life Path"], ["expression", "Expression"], ["soulUrge", "Soul Urge"]] as const) {
    const value = data.numerologyData?.[field];
    if (typeof value !== "number" && typeof value !== "string") continue;
    const pattern = canonicalNumberPattern(value);
    if (pattern) layers.push({ label: `${label} ${Number(value)}`, pattern });
  }
  return layers;
}

export function generateFallbackBiography(data: BiographyRequest): string {
  const layers = supportedReflectionLayers(data);
  const humanDesign = verifiedProfileHumanDesignSummary(data.humanDesignData);
  const reflections = layers.map(({ label, pattern }) =>
    `${label} symbolism emphasizes ${pattern.drive}. Its constructive theme is ${pattern.gift}; its overuse risk is ${pattern.shadow}.`);
  if (humanDesign) reflections.push(`Verified Human Design adds ${humanDesign}. Strategy and Authority offer an optional decision practice, not a demonstrated psychological trait.`);
  if (!reflections.length) {
    return `${data.name}'s profile has no governed layers available for a personalized interpretation. A supported calculation or assessment is needed before adding a source-specific reflection.`;
  }
  return `${data.name}'s Codex brings these supported layers into one symbolic reading.\n\n${reflections.join(" ")}\n\nCompare these themes with a specific event from your life; calculations do not establish motives, history, or fixed identity.`;
}

export function generateFallbackGuidance(data: BiographyRequest): string {
  const layers = supportedReflectionLayers(data);
  const actions = new Map<string, string[]>();
  for (const { label, pattern } of layers) {
    actions.set(pattern.action, [...(actions.get(pattern.action) ?? []), label]);
  }
  const reflections = [...actions].map(([action, labels]) => `${labels.join(" / ")} reflection: ${action}`);
  const humanDesign = verifiedProfileHumanDesignSummary(data.humanDesignData);
  if (humanDesign) reflections.push(`Human Design decision experiment (${humanDesign}): try the supported Strategy and Authority for a low-stakes choice, then record what happened. This is an optional symbolic practice.`);
  if (!reflections.length) return "No source-specific guidance is available until a governed calculation or assessment is supplied.";
  return `Optional symbolic experiments for today: ${reflections.join(" ")}`;
}
