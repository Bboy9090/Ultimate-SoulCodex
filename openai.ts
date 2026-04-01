import { generateText, isGeminiAvailable } from "./gemini";
import { BANNED_PHRASES, stripBannedPhrases } from "./soulcodex/validators/blandnessFilter";
import { buildResultsPrompt } from "./soulcodex/prompts/resultsEngine";
import { validateAndClean } from "./src/ai/pipeline";
import { SOUL_CODEX_ENGINE_RULES } from "./src/ai/soulCodexEngine";

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
  "name" | "archetypeTitle" | "astrologyData" | "numerologyData" | "personalityData" | "archetype"
>;

function generateFallbackBiography(data: BiographyRequest): string {
  const themes = data.archetype?.themes || ['adaptation', 'self-awareness', 'personal growth'];
  const sunSign = data.astrologyData?.sunSign || data.vedicAstrologyData?.sunSign || 'my sign';
  const moonSign = data.astrologyData?.moonSign || data.vedicAstrologyData?.moonSign || '';
  const lifePath = data.numerologyData?.lifePath || '';
  const hdType = data.humanDesignData?.type || '';
  const geneKeyGift = data.geneKeysData?.lifeWork?.gift || '';
  const ayurvedaDosha = data.ayurvedaData?.primaryDosha?.name || '';

  const templates = [
    `I am a ${data.archetypeTitle}${hdType ? `, a ${hdType} by design` : ''}. My strength is reading situations fast — I pick up on tension before anyone names it${sunSign !== 'my sign' ? `, and my ${sunSign} drive keeps me moving when others stall` : ''}${lifePath ? `. Life Path ${lifePath} means I default to building systems` : ''}. My shadow is that I push too hard and dismiss people who move slower than me. The tension I carry is between wanting deep connection and needing to stay in control${moonSign ? ` — my ${moonSign} side craves closeness while the rest of me resists vulnerability` : ''}. My growth edge is learning to sit with discomfort instead of fixing it.`,

    `As a ${data.archetypeTitle}, I'm strong at cutting through noise and finding what matters${geneKeyGift ? ` — my gift of ${geneKeyGift} shows up as pattern recognition` : ''}${hdType ? `. As a ${hdType}, I operate best when I wait for the right opening` : ''}. My blind spot is ignoring my own needs while managing everyone else's. I feel the pull between wanting stability and craving change${ayurvedaDosha ? `, and my ${ayurvedaDosha} nature amplifies that restlessness` : ''}. The edge I need to work is ${themes[0]} — not as a concept, but as a daily practice of questioning my automatic reactions${lifePath ? `. Life Path ${lifePath} keeps reminding me that the structure I build matters more than the speed` : ''}.`,

    `I'm a ${data.archetypeTitle}${sunSign !== 'my sign' ? ` with ${sunSign} energy driving my decisions` : ''}. What I'm built for: seeing what others miss, holding complexity without panicking, and turning tension into forward motion${lifePath ? `. Life Path ${lifePath} gives me a natural instinct for ${themes[0]}` : ''}. Where I struggle: I default to independence when I should ask for help${moonSign ? `, and my ${moonSign} emotional patterns make me retreat under pressure instead of communicating` : ''}. The friction inside me is real — I want to be understood but I make it hard for people to get close. My growth edge is choosing to stay open even when my instincts say to shut down and handle it alone.`
  ];
  
  const randomIndex = Math.floor(Math.random() * templates.length);
  return stripBannedPhrases(templates[randomIndex]);
}

export async function generateBiography(data: BiographyRequest): Promise<string> {
  if (!isGeminiAvailable()) {
    console.log("Gemini AI not available, using fallback biography generation");
    return generateFallbackBiography(data);
  }

  try {
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
      themes: data.archetype?.themes,
    }, "deep");

    const rawBiography = await generateText({
      model: "gemini-2.5-flash",
      temperature: 0.8,
      prompt
    });

    if (!rawBiography) return generateFallbackBiography(data);

    const report = await validateAndClean(rawBiography, (p) =>
      generateText({ model: "gemini-2.5-flash", temperature: 0.85, prompt: p })
    );

    if (report.rewroteText) {
      console.log(`[Biography] Clarity rewrite triggered. Score: ${report.clarityScore}. Problems: ${report.clarityProblems.join(", ")}`);
    }

    return report.finalText || generateFallbackBiography(data);
  } catch (error) {
    console.error("Error generating biography with Gemini AI, using fallback:", error);
    return generateFallbackBiography(data);
  }
}

function generateFallbackDailyGuidance(data: DailyGuidanceRequest): string {
  const guidanceTemplates = [
    `Today as a ${data.archetypeTitle}, I notice my tendency to over-plan. My strength is in preparation, but my shadow shows up when I mistake planning for progress. The growth edge today: pick one thing and act on it before noon.`,
    
    `My ${data.astrologyData?.sunSign || ''} drive is loud today — I want to push forward. But my blind spot is bulldozing through situations that need patience. The tension between action and restraint is my real work today${data.numerologyData?.lifePath ? `. Life Path ${data.numerologyData.lifePath} says build deliberately` : ''}.`,
    
    `As a ${data.archetypeTitle}, today pulls me between what feels safe and what I actually need. My strength is reading the room — my shadow is avoiding the hard conversation. The edge: say the uncomfortable thing early instead of letting it build.`
  ];
  
  const randomIndex = Math.floor(Math.random() * guidanceTemplates.length);
  return stripBannedPhrases(guidanceTemplates[randomIndex]);
}

export async function generateDailyGuidance(data: DailyGuidanceRequest): Promise<string> {
  // If Gemini AI not available, use fallback guidance generator
  if (!isGeminiAvailable()) {
    console.log("Gemini AI not available, using fallback daily guidance generation");
    return generateFallbackDailyGuidance(data);
  }

  try {
    const bannedList = BANNED_PHRASES.map((p) => `"${p}"`).join(", ");
    const prompt = `Generate a daily guidance card for ${data.name}.

Profile:
- Archetype: ${data.archetypeTitle}
- Sun/Moon/Rising: ${data.astrologyData?.sunSign}/${data.astrologyData?.moonSign}/${data.astrologyData?.risingSign}
- Life Path: ${data.numerologyData?.lifePath}

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
- Use behavioral language: what I notice, what I tend to do, what to practice today
- Every sentence must describe something observable or actionable
- BANNED PHRASES (never use): ${bannedList}
- No fortune-cookie wisdom, no vague encouragement, no abstract language
- No metaphors. No poetic padding.

Return only the guidance text in the format above.`;

    const rawGuidance = await generateText({
      model: "gemini-2.5-flash",
      temperature: 0.8,
      prompt
    });

    if (!rawGuidance) return generateFallbackDailyGuidance(data);

    const report = await validateAndClean(rawGuidance);

    return report.finalText || generateFallbackDailyGuidance(data);
  } catch (error) {
    console.error("Error generating daily guidance with Gemini AI, using fallback:", error);
    return generateFallbackDailyGuidance(data);
  }
}
