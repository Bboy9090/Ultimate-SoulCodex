import { routeAIRequest } from "./ai-router";
import { BANNED_PHRASES, stripBannedPhrases } from "../soulcodex/validators/blandnessFilter";
import { buildResultsPrompt } from "../soulcodex/prompts/resultsEngine";
import { validateAndClean } from "../src/ai/pipeline";
import { SOUL_CODEX_ENGINE_RULES } from "../src/ai/soulCodexEngine";

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
  const themes = data.archetype?.themes || ['adaptation', 'self-awareness', 'personal growth'];
  const sunSign = data.astrologyData?.sunSign || data.vedicAstrologyData?.sunSign || 'my sign';
  const moonSign = data.astrologyData?.moonSign || data.vedicAstrologyData?.moonSign || '';
  const risingSign = data.astrologyData?.risingSign || '';
  const lifePath = data.numerologyData?.lifePath || '';
  const hdType = data.humanDesignData?.type || '';
  const hdStrategy = data.humanDesignData?.strategy || '';
  const geneKeyGift = data.geneKeysData?.lifeWork?.gift || '';
  const primaryElement = (data as any).elementalMedicineData?.primaryElement || '';

  const templates = [
    `I am a ${data.archetypeTitle}${hdType ? `, a ${hdType} by design` : ''}. My ${sunSign !== 'my sign' ? sunSign : ''} Sun drives me to act fast — I pick up on tension before anyone names it${risingSign ? `, and my ${risingSign} Rising means people see me as composed even when I'm not` : ''}${lifePath ? `. Life Path ${lifePath} means I default to building systems` : ''}. My shadow is that I push too hard and dismiss people who move slower than me. The tension I carry is between wanting deep connection and needing to stay in control${moonSign ? ` — my ${moonSign} Moon craves closeness while the rest of me resists vulnerability` : ''}${primaryElement ? `. My ${primaryElement} element means stress shows up in my body first — I feel it physically before I recognize it emotionally` : ''}${hdStrategy ? `. As a ${hdType}, my strategy is to ${hdStrategy.toLowerCase()} — but I often skip that and bulldoze instead` : ''}. My growth edge is learning to sit with discomfort instead of fixing it.`,
    `As a ${data.archetypeTitle}${sunSign !== 'my sign' ? ` with my ${sunSign} Sun` : ''}, I'm strong at cutting through noise and finding what matters${geneKeyGift ? ` — my gift of ${geneKeyGift} shows up as pattern recognition` : ''}${hdType ? `. As a ${hdType}, I operate best when I ${hdStrategy ? hdStrategy.toLowerCase() : 'wait for the right opening'}` : ''}. My blind spot is ignoring my own needs while managing everyone else's${moonSign ? ` — my ${moonSign} Moon processes everything internally, so by the time I speak up, I'm already frustrated` : ''}${primaryElement ? `. My ${primaryElement} element amplifies this: when I'm off-balance, my body tells me before my mind catches up` : ''}. The edge I need to work is ${themes[0]} — not as a concept, but as a daily practice of questioning my automatic reactions${lifePath ? `. Life Path ${lifePath} keeps reminding me that the structure I build matters more than the speed` : ''}${risingSign ? `. My ${risingSign} Rising gives people the impression I have it together, which means they don't offer help I actually need` : ''}.`,
    `I'm a ${data.archetypeTitle}${sunSign !== 'my sign' ? ` — my ${sunSign} Sun drives my decisions` : ''}${risingSign ? `, and my ${risingSign} Rising shapes how I walk into every room` : ''}. What I'm built for: seeing what others miss, holding complexity without panicking, and turning tension into forward motion${lifePath ? `. Life Path ${lifePath} gives me a natural instinct for ${themes[0]}` : ''}. Where I struggle: I default to independence when I should ask for help${moonSign ? `, and my ${moonSign} Moon makes me retreat under pressure instead of communicating` : ''}${hdType ? `. My ${hdType} design means I have ${hdType === 'Generator' || hdType === 'Manifesting Generator' ? 'sustained energy but only for what genuinely excites me' : hdType === 'Projector' ? 'deep insight but limited energy — I burn out when I try to keep up with Generators' : hdType === 'Manifestor' ? 'initiating power but I leave people behind when I don\'t inform them first' : 'a reflective nature that absorbs everyone else\'s energy'}` : ''}${primaryElement ? `. My ${primaryElement} element shows up in how I handle stress — it hits my body before my thoughts catch up` : ''}. My growth edge is choosing to stay open even when my instincts say to shut down and handle it alone.`
  ];
  
  const randomIndex = Math.floor(Math.random() * templates.length);
  return stripBannedPhrases(templates[randomIndex]);
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

    const report = await validateAndClean(response.content, async (p) => {
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
  const primaryElement = data.elementalMedicineData?.primaryElement || '';

  const guidanceTemplates = [
    `Today my ${sunSign || data.archetypeTitle} drive pushes me to over-plan. My strength is preparation, but my shadow shows up when I mistake planning for progress${moonSign ? `. My ${moonSign} Moon adds emotional weight to every unfinished task` : ''}${lifePath ? `. Life Path ${lifePath} says build deliberately — pick one thing and act on it before noon` : '. Pick one thing and act on it before noon.'}${hdType ? ` My ${hdType} design says: ${hdType === 'Generator' || hdType === 'Manifesting Generator' ? 'wait for the gut response before committing' : hdType === 'Projector' ? 'wait for the invitation instead of pushing' : 'inform before initiating'}.` : ''}`,
    `My ${sunSign || ''} Sun is loud today — I want to push forward. But my blind spot is bulldozing through situations that need patience${moonSign ? `. My ${moonSign} Moon needs me to check how I actually feel before I act` : ''}${lifePath ? `. Life Path ${lifePath} says build deliberately, not reactively` : ''}${primaryElement ? `. My ${primaryElement} element says: slow down physically — move, breathe, eat something grounding before making any calls` : ''}.`,
    `As a ${data.archetypeTitle}, today pulls me between what feels safe and what I actually need${sunSign ? `. My ${sunSign} Sun wants control` : ''}${moonSign ? `, but my ${moonSign} Moon wants comfort` : ''}. The edge: say the uncomfortable thing early instead of letting it build${hdType ? `. My ${hdType} strategy is clear — ${hdType === 'Generator' || hdType === 'Manifesting Generator' ? 'respond, don\'t initiate' : hdType === 'Projector' ? 'guide, don\'t push' : 'inform, then act'}` : ''}${primaryElement ? `. My ${primaryElement} element reminds me: stress shows up in my body first, so check in physically before reacting` : ''}.`
  ];
  
  const randomIndex = Math.floor(Math.random() * guidanceTemplates.length);
  return stripBannedPhrases(guidanceTemplates[randomIndex]);
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

Profile (use when relevant — don't force all into the response):
- Archetype: ${data.archetypeTitle}
${sunSign ? `- Sun: ${sunSign}` : ""}${moonSign ? ` | Moon: ${moonSign}` : ""}${risingSign ? ` | Rising: ${risingSign}` : ""}
${lifePath ? `- Life Path: ${lifePath}` : ""}
${hdType ? `- Human Design: ${hdType}${hdStrategy ? ` (${hdStrategy})` : ""}` : ""}
${primaryElement ? `- Element: ${primaryElement}` : ""}

${SOUL_CODEX_ENGINE_RULES}

FORMAT — respond in this exact structure:

**Observation**
What is happening today — specific to this person's behavioral patterns (1-2 sentences)

**Meaning**
Why it matters — the pattern, cost, or tension driving it (1-2 sentences)

**Action**
What to do today — concrete, simple, immediate (1-2 sentences)

RULES:
- Write in first person (I/my/me)
- Reference 1-2 profile data points where they genuinely explain the insight
- Lead with the behavior, not the astrology
- Use behavioral language: what I notice, what I tend to do, what to practice today
- Every sentence must describe something observable or actionable
- BANNED PHRASES (never use): ${bannedList}
- No fortune-cookie wisdom, no vague encouragement, no abstract language
- Return only the guidance text in the format above.`;

    const response = await routeAIRequest({
      prompt,
      promptType: "daily_guidance",
      temperature: 0.8,
    });

    if (!response.content || response.status === "fallback") {
      return response.content || generateFallbackDailyGuidance(data);
    }

    const report = await validateAndClean(response.content);

    return report.finalText || generateFallbackDailyGuidance(data);
  } catch (error) {
    console.error("Error generating daily guidance in AI Router, using fallback:", error);
    return generateFallbackDailyGuidance(data);
  }
}
