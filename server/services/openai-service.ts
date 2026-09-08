import { generateText, isGeminiAvailable } from "../../gemini";
import { extractVerifiedAstrology } from "../lib/verified-astrology";

interface BiographyRequest {
  name: string;
  archetypeTitle: string;
  astrologyData: any;
  numerologyData: any;
  personalityData: any;
  archetype: any;
}

function verifiedAstrologyFor(data: BiographyRequest) {
  return extractVerifiedAstrology({ astrologyData: data.astrologyData });
}

function astrologyPromptLines(data: BiographyRequest): string[] {
  const astrology = verifiedAstrologyFor(data);
  const lines: string[] = [];
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
2. Do not invent or infer unresolved astrology, biography, motives, trauma, or confidence.
3. Describe observable patterns and practical meaning.
4. Return only the biographical text.`;

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

Use only supported data. Do not infer unresolved astrology. Return 2-3 grounded sentences.`;

    const result = await generateText({ prompt, temperature: 0.7 });
    return result || generateFallbackGuidance(data);
  } catch (error) {
    console.error("Error generating daily guidance:", error);
    return generateFallbackGuidance(data);
  }
}

function generateFallbackBiography(data: BiographyRequest): string {
  const astrology = verifiedAstrologyFor(data);
  const supported: string[] = [];
  if (astrology.sun) supported.push(`${astrology.sun} Sun`);
  if (astrology.moon) supported.push(`${astrology.moon} Moon`);
  if (astrology.rising) supported.push(`${astrology.rising} Rising`);
  if (data.numerologyData?.lifePath) supported.push(`Life Path ${data.numerologyData.lifePath}`);

  const evidenceSentence = supported.length
    ? `The supported layers currently available are ${supported.join(", ")}.`
    : "The symbolic layers needed for a personalized biography are still unresolved.";

  return `I am ${data.name}, and my current Soul Codex centers on the ${data.archetypeTitle}. ${evidenceSentence}\n\nThis reading stays with what has actually been supplied and verified. Unresolved astrology is intentionally omitted rather than turned into a polished guess.\n\nMy next useful step is to compare the supported pattern with my lived experience and keep only what creates clarity.`;
}

function generateFallbackGuidance(data: BiographyRequest): string {
  const astrology = verifiedAstrologyFor(data);
  const anchor = astrology.sun ? `your verified ${astrology.sun} Sun` : `your ${data.archetypeTitle} pattern`;
  return `Today, use ${anchor} as a reflection point only where it matches your lived experience. Unresolved astrology remains paused, so focus on one grounded action you can verify through your own behavior.`;
}
