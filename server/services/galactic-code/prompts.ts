/**
 * Galactic Code Interpretation Prompts
 *
 * Generate structured interpretations combining multiple governed systems.
 * Symbolic systems remain reflection frameworks; assessed behavior remains
 * distinct from symbolic synthesis. AI fails gracefully to deterministic fallback.
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

  return `Generate a brief, evidence-bounded interpretation for a person with the Galactic Code profile: ${codename}.

Systems present: ${systems.join(', ')}
Top axis: ${topAxis}
Second axis: ${secondAxis}

Requirements:
- Avoid banned phrases (no "embrace your truth", "step into your power", "old soul", "intuitive empath")
- Treat astrology, Human Design, and numerology as symbolic/reflection frameworks, not validated predictors of personality or behavior
- Treat explicitly assessed behavioral fields as observations from that assessment only; do not backfill missing behavior from symbolic systems
- Phrase cross-system synthesis as hypotheses or reflection prompts the person can compare with lived experience
- Every cross-system statement must reference at least two governed systems
- Explain tensions between symbolic frameworks without turning them into factual psychological conflicts
- Suggest concrete questions or operating experiments rather than asserting hidden traits

Do not use:
- percentages
- claim certainty where data is partial
- therapeutic language
- vague mystical claims
- factual claims about motives, cognition, stress response, relationship style, destiny, or mission unless directly supported by explicit assessed behavior

Sections to generate (one paragraph each):
1. Identity: a symbolic synthesis hypothesis, not a fixed core identity
2. Decision Code: a decision reflection question or experiment, not a claim about how they typically decide
3. Stress Mechanic: state what is unresolved unless explicit behavioral evidence supports a pressure pattern
4. Relational Code: a relationship reflection prompt, not an inferred relationship style
5. Mission Arc: a practical direction prompt; explicitly avoid destiny or predetermined mission claims`;
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
  const systemLabel = systems.length > 0 ? systems.join(' + ') : 'the available governed systems';

  return {
    identity: `${codename} is a symbolic synthesis label built from ${systemLabel}. The ${topAxis} / ${primaryFunction} emphasis is best used as a reflection hypothesis to compare with lived experience, not as a fixed identity claim.`,
    decisionCode: `Decision reflection: test whether a ${primaryFunction} lens and a ${secondaryFunction} lens help clarify the choice in front of you. Keep the method only if it improves an observable decision process; the symbolic inputs do not establish how you normally decide.`,
    stressMechanic: `No stress response is established by astrology, Human Design, or numerology alone. If pressure patterns matter here, observe what actually happens under stress or use explicit assessed behavioral evidence rather than inferring a response from the symbolic profile.`,
    relationalCode: `No relationship style is established by the symbolic systems alone. Use the ${secondaryFunction} theme as a question to test against real interactions, and discard it where it does not match observed relationship behavior.`,
    missionArc: `No destiny or predetermined mission is inferred. A practical reflection theme is to test where ${primaryFunction} and ${secondaryFunction} are useful in real projects, then keep only the patterns that produce observable value.`,
  };
}
