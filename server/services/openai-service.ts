import { generateText, isGeminiAvailable } from "../../gemini";
import { VOICE_LAWS } from "../../soulcodex/codex30/prompts/voice_laws";

interface BiographyRequest {
  name: string;
  archetypeTitle: string;
  astrologyData: any;
  numerologyData: any;
  personalityData: any;
  archetype: any;
}

export async function generateBiography(data: BiographyRequest): Promise<string> {
  if (!isGeminiAvailable()) {
    return generateFallbackBiography(data);
  }

  try {
    const prompt = `You are an expert mystical biographer. Create a compelling 2-3 paragraph first-person biographical narrative for ${data.name}.

Profile Summary:
- Archetype: ${data.archetypeTitle}
- Sun Sign: ${data.astrologyData?.sunSign || 'Unknown'}
- Moon Sign: ${data.astrologyData?.moonSign || 'Unknown'}
- Rising Sign: ${data.astrologyData?.risingSign || 'Unknown'}
- Life Path Number: ${data.numerologyData?.lifePath || 'Unknown'}
- Enneagram Type: ${data.personalityData?.enneagram?.type || 'Unknown'}
- MBTI Type: ${data.personalityData?.mbti?.type || 'Unknown'}

Core Themes from Analysis:
${data.archetype?.themes?.join(', ') || 'Transformation, self-discovery, spiritual growth'}

Write in first person as if ${data.name} is introducing themselves.

${VOICE_LAWS}

Focus on:
1. Their core essence and spiritual nature
2. How they transform challenges into wisdom
3. Their unique gifts and life purpose
4. PRIORITY: ABSOLUTE SURGICAL TRUTH.

Return ONLY the biographical text. No markdown. No single-letter prefixes (D., C., P.). No labels.`;

    const result = await generateText({ prompt, temperature: 0.8 });
    return result || generateFallbackBiography(data);
  } catch (error) {
    console.error("Error generating biography:", error);
    return generateFallbackBiography(data);
  }
}

export async function generateDailyGuidance(data: BiographyRequest): Promise<string> {
  if (!isGeminiAvailable()) {
    return generateFallbackGuidance(data);
  }

  try {
    const prompt = `Create personalized daily guidance for ${data.name} based on their spiritual profile.

Profile:
- Archetype: ${data.archetypeTitle}
- Sun/Moon/Rising: ${data.astrologyData?.sunSign}/${data.astrologyData?.moonSign}/${data.astrologyData?.risingSign}
- Life Path: ${data.numerologyData?.lifePath}

${VOICE_LAWS}

Generate a brief, actionable daily insight (2-3 sentences) that aligns with their cosmic blueprint. 

PRIORITY: ABSOLUTE SURGICAL TRUTH.
NO SINGLE-LETTER PREFIXES (D., C., P.).
NO LABELS.

Return ONLY the guidance text. No markdown.`;

    const result = await generateText({ prompt, temperature: 0.7 });
    return result || generateFallbackGuidance(data);
  } catch (error) {
    console.error("Error generating daily guidance:", error);
    return generateFallbackGuidance(data);
  }
}

function generateFallbackBiography(data: BiographyRequest): string {
  return `I am ${data.name}, a soul walking the path of the ${data.archetypeTitle}. With my ${data.astrologyData?.sunSign || 'cosmic'} Sun illuminating my core essence and my ${data.astrologyData?.moonSign || 'intuitive'} Moon guiding my emotional depths, I navigate life's journey with purpose and wonder.

My Life Path ${data.numerologyData?.lifePath || 'number'} reveals the lessons I came here to learn and the gifts I have to share. Each day brings new opportunities for growth, transformation, and deeper self-understanding.

I embrace my unique cosmic blueprint, knowing that my journey is both deeply personal and universally connected to the greater tapestry of existence.`;
}

function generateFallbackGuidance(data: BiographyRequest): string {
  const sunSign = data.astrologyData?.sunSign || 'your sign';
  return `Today, dear ${data.name}, embrace the energy of ${sunSign} and let your inner ${data.archetypeTitle} guide you toward meaningful connections and insights.`;
}
