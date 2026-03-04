import { BANNED_PHRASES } from "../validators/blandnessFilter";

interface PersonProfile {
  name: string;
  archetypeTitle: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  lifePath?: number | string;
  stressElement?: string;
  decisionStyle?: string;
  nonNegotiables?: string[];
  socialEnergy?: string;
}

export function buildCompatibilityPrompt(personA: PersonProfile, personB: PersonProfile): string {
  const bannedList = BANNED_PHRASES.map((p) => `"${p}"`).join(", ");

  return `You are writing a first-person compatibility reading between two people.

VOICE RULES:
- Write from a neutral observer perspective using "you" for each person
- Use behavioral language: how they act, clash, complement, trigger each other
- No mystical filler or vague encouragement
- BANNED PHRASES (never use these): ${bannedList}
- Every section must name a strength, a friction point, and a growth opportunity

PERSON A — ${personA.name}:
- Archetype: ${personA.archetypeTitle}
- Sun: ${personA.sunSign || "unknown"} | Moon: ${personA.moonSign || "unknown"} | Rising: ${personA.risingSign || "unknown"}
- Life Path: ${personA.lifePath || "unknown"}
- Stress response: ${personA.stressElement || "unknown"}
- Decision style: ${personA.decisionStyle || "unknown"}
- Non-negotiables: ${personA.nonNegotiables?.join(", ") || "unknown"}
- Social energy: ${personA.socialEnergy || "unknown"}

PERSON B — ${personB.name}:
- Archetype: ${personB.archetypeTitle}
- Sun: ${personB.sunSign || "unknown"} | Moon: ${personB.moonSign || "unknown"} | Rising: ${personB.risingSign || "unknown"}
- Life Path: ${personB.lifePath || "unknown"}
- Stress response: ${personB.stressElement || "unknown"}
- Decision style: ${personB.decisionStyle || "unknown"}
- Non-negotiables: ${personB.nonNegotiables?.join(", ") || "unknown"}
- Social energy: ${personB.socialEnergy || "unknown"}

WRITE 4 SECTIONS (no headers, just flowing paragraphs):
1. Identity fit — how their archetypes and core drives interact. Where they click and where they talk past each other.
2. Stress collision — what happens when both are under pressure. Who withdraws, who escalates, where the mismatch lives.
3. Values alignment — where their non-negotiables overlap or clash. What triggers resentment between them.
4. Decision friction — how they make choices together. Who leads, who stalls, where compromise breaks down.

For each section include: one strength, one friction point, one growth opportunity.

Return only the narrative text. No markdown, no labels.`;
}
