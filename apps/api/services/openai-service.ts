import { generateText, isGeminiAvailable } from "../../gemini";

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
    const prompt = `Write a 2-3 paragraph first-person behavioral profile for ${data.name}.

Profile:
- Archetype: ${data.archetypeTitle}
- Sun: ${data.astrologyData?.sunSign || 'Unknown'} | Moon: ${data.astrologyData?.moonSign || 'Unknown'} | Rising: ${data.astrologyData?.risingSign || 'Unknown'}
- Life Path: ${data.numerologyData?.lifePath || 'Unknown'}
- Enneagram: ${data.personalityData?.enneagram?.type || 'Unknown'} | MBTI: ${data.personalityData?.mbti?.type || 'Unknown'}
- Themes: ${data.archetype?.themes?.join(', ') || 'pattern recognition, decision-making, stress response'}

Write in first person as if ${data.name} is describing how they actually operate. Focus on:
1. What I'm built for — my real strengths, how they show up in decisions and conversations
2. My blind spots — what I default to under pressure, what it costs me
3. The tension inside me — the competing pulls I live with daily
4. My growth edge — the specific shift I need to make

RULES:
- Use behavioral, observable language only
- Every sentence must describe something I actually do, feel, or avoid
- BANNED: "cosmic blueprint", "sacred blueprint", "divine timing", "spiritual journey", "cosmic dance", "soul's evolution", "embrace", "universe", "celestial"
- No mystical filler. No fortune-cookie wisdom. No metaphors.

Return only the biographical text.`;

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
    const prompt = `Generate daily guidance for ${data.name}.

Profile:
- Archetype: ${data.archetypeTitle}
- Sun/Moon/Rising: ${data.astrologyData?.sunSign}/${data.astrologyData?.moonSign}/${data.astrologyData?.risingSign}
- Life Path: ${data.numerologyData?.lifePath}

FORMAT:
**Observation** — What I'm likely dealing with today (1 sentence, behavioral)
**Meaning** — Why it matters (1 sentence, the pattern or cost)
**Action** — What to do about it (1 sentence, concrete and immediate)

RULES:
- Write in first person (I/my/me)
- Every sentence must describe something observable or actionable
- No vague language. No metaphors. No "energy" or "cosmic" anything.
- BANNED: "cosmic blueprint", "embrace", "energy of", "universe", "divine", "spiritual"

Return only the guidance text.`;

    const result = await generateText({ prompt, temperature: 0.7 });
    return result || generateFallbackGuidance(data);
  } catch (error) {
    console.error("Error generating daily guidance:", error);
    return generateFallbackGuidance(data);
  }
}

function generateFallbackBiography(data: BiographyRequest): string {
  const sunSign = data.astrologyData?.sunSign || 'my dominant';
  const moonSign = data.astrologyData?.moonSign || 'my emotional';
  const lifePath = data.numerologyData?.lifePath;

  return `I am a ${data.archetypeTitle}. My ${sunSign} drive makes me push forward when others hesitate — I read situations fast and act before I fully process. My ${moonSign} side shows up when I'm alone: I replay conversations, second-guess decisions, and need more time than I'd admit to recover from conflict.

${lifePath ? `Life Path ${lifePath} means I default to building systems and finding patterns. ` : ''}My strength is cutting through noise to find what matters. My blind spot is dismissing people who process differently than I do. The tension I carry is between wanting deep connection and needing to stay in control.

My growth edge is sitting with discomfort instead of fixing it. When I feel the urge to solve, manage, or exit — that's the signal to stay and listen.`;
}

function generateFallbackGuidance(data: BiographyRequest): string {
  return `Today as a ${data.archetypeTitle}, I notice my tendency to over-plan. My strength is preparation, but my shadow shows when I mistake planning for progress. Pick one thing and act on it before noon.`;
}
