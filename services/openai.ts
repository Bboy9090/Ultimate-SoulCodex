import { routeAIRequest } from "./ai-router";
import { BANNED_PHRASES, stripBannedPhrases } from "../soulcodex/validators/blandnessFilter";
import { buildResultsPrompt } from "../soulcodex/prompts/resultsEngine";
import { validateAndClean } from "../src/ai/pipeline";
import { SOUL_CODEX_ENGINE_RULES } from "../src/ai/soulCodexEngine";
import { scoreOutput } from "../soulcodex/codex30/synth/quality";
import { VOICE_LAWS } from "../soulcodex/codex30/prompts/voice_laws";

interface BiographyRequest {
  name: string;
  archetypeTitle: string;
  astrologyData: any;
  numerologyData: any;
  personalityData: any;
  archetype: any;
  humanDesignData: any;
  vedicAstrologyData: any;
  geneKeysData: any;
  iChingData: any;
  chineseAstrologyData: any;
  kabbalahData: any;
  mayanAstrologyData: any;
  chakraData: any;
  sacredGeometryData: any;
  runesData: any;
  sabianSymbolsData: any;
  ayurvedaData: any;
  biorhythmsData: any;
  asteroidsData: any;
  arabicPartsData: any;
  fixedStarsData: any;
  tarotCards?: any;
}

export type DailyGuidanceRequest = Pick<BiographyRequest, 
  "name" | "archetypeTitle" | "astrologyData" | "numerologyData" | "personalityData" | "archetype" | "humanDesignData"
> & { elementalMedicineData?: any };

function generateFallbackBiography(data: BiographyRequest): string {
  const sunSign = data.astrologyData?.sunSign || data.vedicAstrologyData?.sunSign || 'my sign';
  const moonSign = data.astrologyData?.moonSign || data.vedicAstrologyData?.moonSign || '';
  const risingSign = data.astrologyData?.risingSign || '';
  const lifePath = data.numerologyData?.lifePath || '';
  const hdType = data.humanDesignData?.type || '';
  const primaryElement = (data as any).elementalMedicineData?.primaryElement || '';

  // Tier B: Deterministic behavioral shots
  const templates = [
    `I am ${data.archetypeTitle}. My ${sunSign} Sun drives me to act fast. I notice tension before others name it. My ${risingSign} Rising keeps me composed while I struggle inside. Life Path ${lifePath} means I build systems to avoid chaos. I push too hard. I dismiss slow people. I need control. My ${moonSign} Moon resists vulnerability. My ${primaryElement} element shows stress in my body first. I fix things to avoid feeling them.`,
    `As ${data.archetypeTitle}, I cut through noise easily. My ${sunSign} Sun finds what matters. My ${hdType} design works best when I wait for openings. I ignore my own needs. I manage everyone else instead. My ${moonSign} Moon processes everything internally. I am frustrated before I speak. My ${primaryElement} element signals imbalance physically. Life Path ${lifePath} requires deliberate structure. My ${risingSign} Rising masks my need for help.`,
    `I am ${data.archetypeTitle}. My ${sunSign} Sun drives every decision. My ${risingSign} Rising shapes how I enter rooms. I see what others miss. I hold complexity without panicking. I turn tension into motion. Life Path ${lifePath} gives me a natural instinct for build targets. I default to independence. I refuse to ask for help. My ${moonSign} Moon makes me retreat under pressure. I shut down to handle it alone.`
  ];
  
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

export async function generateBiography(data: BiographyRequest): Promise<string> {
  try {
    const elemData = (data as any).elementalMedicineData;
    const prompt = buildResultsPrompt({
      name: data.name,
      archetypeTitle: data.archetypeTitle,
      sunSign: data.astrologyData?.sunSign,
      moonSign: data.astrologyData?.moonSign,
      risingSign: data.astrologyData?.risingSign,
      lifePath: data.numerologyData?.lifePath,
      expression: data.numerologyData?.expression,
      soulUrge: data.numerologyData?.soulUrge,
      hdType: data.humanDesignData?.type,
      hdAuthority: data.humanDesignData?.authority,
      hdStrategy: data.humanDesignData?.strategy,
      primaryElement: elemData?.primaryElement,
      secondaryElement: elemData?.secondaryElement,
      themes: data.archetype?.themes,
    }, "deep");

    const response = await routeAIRequest({
      prompt,
      promptType: "biography",
      temperature: 0.8,
    });

    if (!response.content || response.status === "fallback") {
      return response.content || generateFallbackBiography(data);
    }

    if (response.content) {
      const score = scoreOutput(response.content);
      if (!score.passed) {
        console.warn(`[Biography] Output score ${score.total.toFixed(1)} failed threshold. Using fallback.`);
        return generateFallbackBiography(data);
      }
    }

    const report = await validateAndClean(response.content || "", async (p) => {
      const cleanupResponse = await routeAIRequest({
        prompt: p,
        promptType: "validation",
        temperature: 0.85,
      });
      return cleanupResponse.content || "";
    });

    return report.finalText || generateFallbackBiography(data);
  } catch (error) {
    console.error("Error generating biography in AI Router, using fallback:", error);
    return generateFallbackBiography(data);
  }
}

function generateFallbackDailyGuidance(data: DailyGuidanceRequest): string {
  const sunSign = data.astrologyData?.sunSign || '';
  const moonSign = data.astrologyData?.moonSign || '';
  const lifePath = data.numerologyData?.lifePath || '';
  const hdType = data.humanDesignData?.type || '';

  // Tier B: Deterministic behavioral shots
  const guidanceTemplates = [
    `**Observation**\nMy ${sunSign} Sun drives me to over-plan today. I mistake planning for progress.\n\n**Meaning**\nMy ${moonSign} Moon adds weight to every unfinished task. My ${hdType} design requires a gut response first.\n\n**Action**\nPick one thing. Act before noon. Stop managing the room.`,
    `**Observation**\nMy ${sunSign} Sun pushes forward too fast. I bulldoze situations that need patience.\n\n**Meaning**\nLife Path ${lifePath} requires deliberate action, not reaction. My ${moonSign} Moon signals internal frustration.\n\n**Action**\nSlow down physically. Move before making calls. Ignore the urge to explain.`,
    `**Observation**\nToday pulls me between safety and need. My ${sunSign} Sun wants control.\n\n**Meaning**\nMy ${moonSign} Moon wants comfort. My ${hdType} strategy is clear: I respond. I do not initiate.\n\n**Action**\nSay the uncomfortable thing early. Do not let it build. Refuse the easy path.`
  ];
  
  const randomIndex = Math.floor(Math.random() * guidanceTemplates.length);
  return guidanceTemplates[randomIndex];
}

export async function generateDailyGuidance(data: DailyGuidanceRequest): Promise<string> {
  try {
    const bannedList = BANNED_PHRASES.map((p) => `"${p}"`).join(", ");
    const sunSign = data.astrologyData?.sunSign || "";
    const moonSign = data.astrologyData?.moonSign || "";
    const risingSign = data.astrologyData?.risingSign || "";
    const lifePath = data.numerologyData?.lifePath || "";
    const hdType = data.humanDesignData?.type || "";
    const hdStrategy = data.humanDesignData?.strategy || "";
    const primaryElement = data.elementalMedicineData?.primaryElement || "";

    const prompt = `Generate a daily guidance card for ${data.name}.

Profile:
- Archetype: ${data.archetypeTitle}
${sunSign ? `- Sun: ${sunSign}` : ""}${moonSign ? ` | Moon: ${moonSign}` : ""}${risingSign ? ` | Rising: ${risingSign}` : ""}
${lifePath ? `- Life Path: ${lifePath}` : ""}
${hdType ? `- Human Design: ${hdType}${hdStrategy ? ` (${hdStrategy})` : ""}` : ""}
${primaryElement ? `- Element: ${primaryElement}` : ""}

${VOICE_LAWS}

FORMAT — respond in this exact structure:

**Observation**
What is happening today — specific to this person's behavioral patterns (1-2 sentences)

**Meaning**
Why it matters — the pattern, cost, or tension driving it (1-2 sentences)

**Action**
What to do today — concrete, simple, immediate (1-2 sentences)

RULES:
- Write in first person (I/my/me)
- Lead with behavior, not astrology.
- Reference 1-2 profile data points where they genuinely explain the insight.
- Every sentence must describe something observable or actionable.
- BANNED PHRASES: ${bannedList}
- No "I think," "I feel," "I try," or "I aim." Use "I delay," "I avoid," "I push," "I stall."
- Avoid sentence repetition. Vary your structure.
- No fortune-cookie wisdom, no vague encouragement.
- Return only the guidance text.`;

    const response = await routeAIRequest({
      prompt,
      promptType: "daily_guidance",
      temperature: 0.8,
    });

    if (!response.content || response.status === "fallback") {
      return response.content || generateFallbackDailyGuidance(data);
    }

    if (response.content) {
      const score = scoreOutput(response.content);
      if (!score.passed) {
        console.warn(`[DailyGuidance] Output score ${score.total.toFixed(1)} failed threshold. Using fallback.`);
        return generateFallbackDailyGuidance(data);
      }
    }

    const report = await validateAndClean(response.content || "");

    return report.finalText || generateFallbackDailyGuidance(data);
  } catch (error) {
    console.error("Error generating daily guidance in AI Router, using fallback:", error);
    return generateFallbackDailyGuidance(data);
  }
}
