/**
 * Galactic Code Interpretation Prompts
 *
 * Generate structured interpretations combining multiple systems.
 * AI fails gracefully to deterministic fallback.
 */

import type { NormalizedGalacticInput, GalacticAxisScore } from '../../../shared/galactic-code/types';

const BANNED_PHRASES = [
  'embrace your truth',
  'step into your power',
  'old soul',
  'intuitive empath',
  'the universe wants',
  'you may feel',
  'you might be',
  'deeply intuitive',
  'spiritual awakening',
  'soul purpose',
];

export function validateInterpretation(text: string): boolean {
  const lowerText = text.toLowerCase();
  return !BANNED_PHRASES.some(phrase => lowerText.includes(phrase));
}

export function createInterpretationPrompt(
  normalized: NormalizedGalacticInput,
  codename: string,
  topAxes: GalacticAxisScore[]
): string {
  const systems: string[] = [];

  if (normalized.astrology.sun) {
    systems.push(`Sun ${normalized.astrology.sun}`);
  }
  if (normalized.astrology.moon) {
    systems.push(`Moon ${normalized.astrology.moon}`);
  }
  if (normalized.humanDesign.type) {
    systems.push(`HD ${normalized.humanDesign.type}`);
  }
  if (normalized.numerology.lifePath) {
    systems.push(`Life Path ${normalized.numerology.lifePath}`);
  }

  const topAxis = topAxes[0]?.label || 'Unknown';
  const secondAxis = topAxes[1]?.label || 'Unknown';

  return `Generate a brief, evidence-based interpretation for a person with the Galactic Code profile: ${codename}.

Systems present: ${systems.join(', ')}
Top axis: ${topAxis}
Second axis: ${secondAxis}

Requirements:
- Avoid banned phrases (no "embrace your truth", "step into your power", "old soul", "intuitive empath")
- Every statement must reference at least two systems (astrology + HD, astrology + numerology, etc.)
- Describe behavioral patterns, not feelings
- Explain conflicts between systems
- Identify a decision mechanic
- Name a stress response pattern
- Suggest operating principles

Do not use:
- percentages
- claim certainty where data is partial
- therapeutic language
- vague mystical claims

Sections to generate (one paragraph each):
1. Identity: how the systems combine to create this person's core operating mode
2. Decision Code: how they typically decide and why
3. Stress Mechanic: what happens under pressure
4. Relational Code: how they show up in relationships
5. Mission Arc: what this combination suggests about their trajectory`;
}

export function createDeterministicInterpretation(
  codename: string,
  primaryFunction: string,
  secondaryFunction: string,
  topAxis: string,
  systems: string[]
): {
  identity: string;
  decisionCode: string;
  stressMechanic: string;
  relationalCode: string;
  missionArc: string;
} {
  return {
    identity: `${codename} combines ${systems.join(' and ')} into a profile oriented toward ${primaryFunction}. The ${topAxis} axis is prominent, suggesting a natural inclination toward observing patterns and building frameworks.`,
    decisionCode: `You tend to gather information before committing, with emphasis on ${primaryFunction} criteria. Decisions feel most sound when they integrate both instinctive wisdom and systematic analysis.`,
    stressMechanic: `Under pressure, the tendency is to withdraw into analysis or over-refine incomplete solutions. The antidote is action—committing to direction even with partial information and course-correcting as you move.`,
    relationalCode: `You show up as a ${secondaryFunction} in relationships, preferring depth over breadth. Your strongest connections form with those who respect your process and can match your intellectual engagement.`,
    missionArc: `Your trajectory suggests growing mastery in translating patterns into practical structures others can use. The core challenge is moving from observation to influence—letting what you know benefit the systems you care about.`,
  };
}
