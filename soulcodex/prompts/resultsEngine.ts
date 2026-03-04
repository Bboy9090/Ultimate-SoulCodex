import { BANNED_PHRASES } from "../validators/blandnessFilter";

export type DepthMode = "snapshot" | "deep" | "surgical";

interface ProfileData {
  name: string;
  archetypeTitle: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  lifePath?: number | string;
  expression?: number | string;
  soulUrge?: number | string;
  hdType?: string;
  hdAuthority?: string;
  stressElement?: string;
  decisionStyle?: string;
  nonNegotiables?: string[];
  goals?: string[];
  socialEnergy?: string;
  themes?: string[];
  [key: string]: any;
}

const MODE_INSTRUCTIONS: Record<DepthMode, string> = {
  snapshot: `Write 2-3 punchy paragraphs. Each paragraph must hit ONE of: strength, shadow, tension, growth edge. No filler.`,
  deep: `Write 4-6 paragraphs. Cover all four dimensions in detail: strength (what I'm built for), shadow (my default blind spots), tension (the pull between competing parts of me), and growth edge (what I need to practice). Use concrete behavioral examples.`,
  surgical: `Write 6-8 paragraphs. Go deep on each dimension with specific scenarios. For each section name the pattern, give the behavioral tell, explain why it happens, and offer one concrete shift. Be direct and specific — no vague encouragement.`,
};

export function buildResultsPrompt(profile: ProfileData, mode: DepthMode = "snapshot"): string {
  const bannedList = BANNED_PHRASES.map((p) => `"${p}"`).join(", ");

  return `You are writing a first-person behavioral profile for ${profile.name}.

VOICE RULES:
- Write as "I" / "my" / "me" — first person, inner voice
- Use behavioral, observable language: what I do, how I react, what I avoid
- No mystical filler, no fortune-cookie wisdom
- BANNED PHRASES (never use these): ${bannedList}
- Every section must include at least one of: strength, shadow, tension, growth edge

PROFILE DATA:
- Archetype: ${profile.archetypeTitle}
- Sun: ${profile.sunSign || "unknown"} | Moon: ${profile.moonSign || "unknown"} | Rising: ${profile.risingSign || "unknown"}
- Life Path: ${profile.lifePath || "unknown"} | Expression: ${profile.expression || "unknown"} | Soul Urge: ${profile.soulUrge || "unknown"}
${profile.hdType ? `- Human Design: ${profile.hdType} | Authority: ${profile.hdAuthority || "unknown"}` : ""}
${profile.stressElement ? `- Stress response: ${profile.stressElement}` : ""}
${profile.decisionStyle ? `- Decision style: ${profile.decisionStyle}` : ""}
${profile.nonNegotiables?.length ? `- Non-negotiables: ${profile.nonNegotiables.join(", ")}` : ""}
${profile.goals?.length ? `- Goals: ${profile.goals.join(", ")}` : ""}
${profile.socialEnergy ? `- Social energy: ${profile.socialEnergy}` : ""}
${profile.themes?.length ? `- Core themes: ${profile.themes.join(", ")}` : ""}

DEPTH: ${mode}
${MODE_INSTRUCTIONS[mode]}

STRUCTURE EACH SECTION WITH:
1. Strength — what I'm naturally good at, where I shine
2. Shadow — my blind spots, what I default to under pressure
3. Tension — the competing pulls inside me
4. Growth edge — what I need to practice or lean into

Return only the profile text. No headers, no markdown, no labels.`;
}
