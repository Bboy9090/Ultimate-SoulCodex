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
    const sunSign = data.astrologyData?.sunSign || 'Unknown';
    const moonSign = data.astrologyData?.moonSign || 'Unknown';
    const risingSign = data.astrologyData?.risingSign || 'Unknown';
    const lifePath = data.numerologyData?.lifePath || 'Unknown';

    const prompt = `Write a 2-3 paragraph first-person behavioral profile for ${data.name}.

CORE PROFILE (MUST reference all by name):
- Big 3: Sun in ${sunSign} | Moon in ${moonSign} | Rising in ${risingSign}
- Life Path: ${lifePath}
- Enneagram: ${data.personalityData?.enneagram?.type || 'Unknown'} | MBTI: ${data.personalityData?.mbti?.type || 'Unknown'}
- Archetype: ${data.archetypeTitle}
- Themes: ${data.archetype?.themes?.join(', ') || 'pattern recognition, decision-making, stress response'}

Write in first person as if ${data.name} is describing how they actually operate.
MUST reference Sun sign, Moon sign, Rising sign, and Life Path by name — explain what each one DOES.

Focus on:
1. What I'm built for — connect to my ${sunSign} Sun drive and how it shows up in decisions
2. My blind spots — connect to my ${moonSign} Moon emotional patterns under pressure
3. The tension inside me — how my ${risingSign} Rising (how others see me) clashes with my Moon (how I actually feel)
4. My growth edge — connect to Life Path ${lifePath} purpose

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

CORE PROFILE (reference by name):
- Sun: ${data.astrologyData?.sunSign || 'Unknown'} | Moon: ${data.astrologyData?.moonSign || 'Unknown'} | Rising: ${data.astrologyData?.risingSign || 'Unknown'}
- Life Path: ${data.numerologyData?.lifePath || 'Unknown'}
- Archetype: ${data.archetypeTitle}

FORMAT:
**Observation** — What I'm dealing with today, referencing my Sun or Moon sign by name (1 sentence)
**Meaning** — Why it matters, connecting to my Life Path pattern (1 sentence)
**Action** — What to do about it, concrete and immediate (1 sentence)

RULES:
- Write in first person (I/my/me)
- MUST name at least 2 of: Sun sign, Moon sign, Life Path number
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
  const risingSign = data.astrologyData?.risingSign || '';
  const lifePath = data.numerologyData?.lifePath;

  return `I am a ${data.archetypeTitle}. My ${sunSign} Sun drives me to push forward when others hesitate — I read situations fast and act before I fully process${risingSign ? `. My ${risingSign} Rising means people see me as composed and capable, which sets expectations I then feel obligated to meet` : ''}. My ${moonSign} Moon shows up when I'm alone: I replay conversations, second-guess decisions, and need more time than I'd admit to recover from conflict.

${lifePath ? `Life Path ${lifePath} means I default to building systems and finding patterns. ` : ''}My strength is cutting through noise to find what matters. My blind spot is dismissing people who process differently than I do. The tension I carry is between wanting deep connection and needing to stay in control — my ${sunSign} Sun wants to lead, but my ${moonSign} Moon wants to be held.

My growth edge is sitting with discomfort instead of fixing it. When I feel the urge to solve, manage, or exit — that's the signal to stay and listen.`;
}

function generateFallbackGuidance(data: BiographyRequest): string {
  const sunSign = data.astrologyData?.sunSign || '';
  const moonSign = data.astrologyData?.moonSign || '';
  const lifePath = data.numerologyData?.lifePath || '';
  return `Today my ${sunSign || data.archetypeTitle} Sun is pushing me to over-plan${moonSign ? ` while my ${moonSign} Moon adds anxiety to every open task` : ''}. My strength is preparation, but my shadow shows when I mistake planning for progress${lifePath ? `. Life Path ${lifePath} says: build one thing at a time` : ''}. Pick one thing and act on it before noon.`;
}
