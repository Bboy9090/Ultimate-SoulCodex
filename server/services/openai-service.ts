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

/**
 * Stable profile biography authority.
 *
 * Persisted identity text must be reproducible from governed inputs. Optional
 * AI rewriting may exist as a presentation layer elsewhere, but it must never
 * become the authoritative stored biography.
 */
export async function generateBiography(data: BiographyRequest): Promise<string> {
  const description =
    typeof data.archetype?.description === "string"
      ? data.archetype.description.trim()
      : "";
  const themes = Array.isArray(data.archetype?.themes)
    ? data.archetype.themes
        .filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0)
        .slice(0, 4)
    : [];
  const guidance =
    typeof data.archetype?.guidance === "string"
      ? data.archetype.guidance.trim()
      : "";

  if (!description) return generateFallbackBiography(data);

  const themeSentence = themes.length
    ? `Supported themes: ${themes.join(", ")}.`
    : "";
  const actionSentence = guidance
    ? `A grounded next step from this synthesis is: ${guidance}`
    : "Use the supported pattern as a reflection prompt and compare it with lived experience.";

  return [
    `${data.name}'s current Soul Codex centers on ${data.archetypeTitle}. ${description}`,
    themeSentence,
    actionSentence,
  ].filter(Boolean).join("\n\n");
}

/**
 * Legacy compatibility surface for the persisted profile guidance field.
 *
 * Current-day guidance belongs to the governed Daily/Today engine. Persisted
 * profile guidance must remain stable and deterministic, so this function never
 * calls a generative model.
 */
export async function generateDailyGuidance(data: BiographyRequest): Promise<string> {
  const governedArchetypeGuidance =
    typeof data.archetype?.guidance === "string"
      ? data.archetype.guidance.trim()
      : "";

  return governedArchetypeGuidance || generateFallbackGuidance(data);
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
