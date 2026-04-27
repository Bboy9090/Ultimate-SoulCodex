import { BANNED_PHRASES } from "../soulcodex-v1";

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

WRITE 4 SECTIONS. Each section must follow Observation → Meaning → Action:

1. Identity fit
   Observation: How their archetypes interact in daily life — specific behaviors, conversations, habits.
   Meaning: Why they click or talk past each other — the pattern driving it.
   Action: What to do about it — concrete adjustment.

2. Stress collision
   Observation: What each person actually does under pressure — who withdraws, who escalates.
   Meaning: Why the mismatch creates damage.
   Action: The specific protocol for high-stress moments.

3. Values alignment
   Observation: Where their non-negotiables overlap or clash — real examples.
   Meaning: What triggers resentment and why.
   Action: The conversation they need to have.

4. Decision friction
   Observation: How they make choices together — who leads, who stalls.
   Meaning: Where compromise breaks down and why.
   Action: The decision-making rule that would fix it.

Every sentence must describe something observable — a behavior, conversation, or situation.
No vague encouragement. No abstract language. No metaphors.
Return only the narrative text. No markdown, no labels.`;
}
