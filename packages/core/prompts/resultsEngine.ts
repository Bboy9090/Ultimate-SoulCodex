import { BANNED_PHRASES } from "../soulcodex-v1";
import type { DepthMode } from "../types";

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
  hdStrategy?: string;
  primaryElement?: string;
  secondaryElement?: string;
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

PROFILE DATA (use when it adds genuine meaning — not as a checklist):
- Archetype: ${profile.archetypeTitle}
- Sun: ${profile.sunSign || "unknown"} | Moon: ${profile.moonSign || "unknown"} | Rising: ${profile.risingSign || "unknown"}
- Life Path: ${profile.lifePath || "unknown"} | Expression: ${profile.expression || "unknown"} | Soul Urge: ${profile.soulUrge || "unknown"}
${profile.hdType ? `- Human Design: ${profile.hdType}${profile.hdStrategy ? ` | Strategy: ${profile.hdStrategy}` : ""}${profile.hdAuthority ? ` | Authority: ${profile.hdAuthority}` : ""}` : ""}
${profile.primaryElement ? `- Element (Elemental Medicine): ${profile.primaryElement}${profile.secondaryElement ? ` | Secondary: ${profile.secondaryElement}` : ""}` : ""}
${profile.stressElement ? `- Stress response: ${profile.stressElement}` : ""}
${profile.decisionStyle ? `- Decision style: ${profile.decisionStyle}` : ""}
${profile.nonNegotiables?.length ? `- Non-negotiables: ${profile.nonNegotiables.join(", ")}` : ""}
${profile.goals?.length ? `- Goals: ${profile.goals.join(", ")}` : ""}
${profile.socialEnergy ? `- Social energy: ${profile.socialEnergy}` : ""}
${profile.themes?.length ? `- Core themes: ${profile.themes.join(", ")}` : ""}

PROFILE DATA USAGE:
- Reference placements when they explain WHY a behavior exists
- Lead with the insight, support with the data
- Don't force all systems into every section — pick what's most relevant

DEPTH: ${mode}
${MODE_INSTRUCTIONS[mode]}

STRUCTURE EACH SECTION AS Observation → Meaning → Action:
1. Strength — Observation: what I actually do well. Meaning: why it works. Action: how to use it today.
2. Shadow — Observation: what I default to under pressure. Meaning: what it costs me. Action: the specific shift to make.
3. Tension — Observation: the competing pulls inside me. Meaning: why they exist. Action: how to hold both without collapsing.
4. Growth edge — Observation: where I'm stuck. Meaning: what maintaining the pattern costs. Action: one concrete thing to practice.

Every sentence must describe something observable — a behavior, decision, habit, or reaction.
No vague encouragement. No abstract language. No metaphors.
Return only the profile text. No headers, no markdown, no labels.`;
}
