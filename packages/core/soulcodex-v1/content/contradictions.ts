/**
 * Contradiction-aware profile logic.
 *
 * Each entry = a tension pair that captures the gap between
 * how a person presents and what's actually running underneath.
 *
 * Selection is keyed by behavioral signals so users with the same
 * Sun sign but different stress/decision styles get different contradictions.
 */

export interface ContradictionPair {
  id: string;
  surface: string;       // "appears calm"
  hidden: string;        // "has already run worst-case scenarios"
  cost: string;          // "reads as unavailable when overwhelmed"
  signalTags: string[];  // theme tags that increase selection score
  stressElements?: string[]; // fire / earth / water / air
  decisionStyles?: string[]; // gut / analysis / sleep_on_it / quiet_instinct
  socialEnergies?: string[]; // introvert / extrovert / ambivert
}

export const CONTRADICTION_PAIRS: ContradictionPair[] = [
  {
    id: "earth-analysis",
    surface:  "I look like I have it handled",
    hidden:   "I am running threat assessments on every possible outcome in the background",
    cost:     "I delay asking for help until the situation has already gotten worse",
    signalTags:    ["precision", "order"],
    stressElements: ["earth"],
    decisionStyles: ["calm_logic"],
  },
  {
    id: "water-sleep",
    surface:  "I appear calm and considered",
    hidden:   "I have already rehearsed the worst-case scenario in high definition",
    cost:     "My caution reads as emotional unavailability to people who need faster answers",
    signalTags:    ["privacy", "emotion_depth"],
    stressElements: ["water"],
    decisionStyles: ["sleep_on_it"],
  },
  {
    id: "fire-gut",
    surface:  "I look confident and decisive",
    hidden:   "I am operating on instinct and not always sure if I am right",
    cost:     "I correct mid-motion, which looks like inconsistency to anyone watching closely",
    signalTags:    ["courage", "intensity"],
    stressElements: ["fire"],
    decisionStyles: ["gut"],
  },
  {
    id: "air-calm-logic",
    surface:  "I seem detached and analytical",
    hidden:   "I care more than I show — I process care through thinking, not expression",
    cost:     "People mistake my neutrality for indifference and stop bringing me things that matter",
    signalTags:    ["truth", "social_sensitivity"],
    stressElements: ["air"],
    decisionStyles: ["calm_logic"],
  },
  {
    id: "precision-privacy",
    surface:  "I look self-sufficient and low-maintenance",
    hidden:   "I notice exactly when no one checks in and I track it precisely",
    cost:     "I stop asking for what I need because I expect it to be seen without asking",
    signalTags:    ["precision", "privacy"],
  },
  {
    id: "intensity-truth",
    surface:  "I appear brutally direct",
    hidden:   "The directness is protecting something I am not ready to examine yet",
    cost:     "People misread my bluntness as aggression and stop trusting me with the real conversation",
    signalTags:    ["intensity", "truth"],
  },
  {
    id: "legacy-order",
    surface:  "I seem patient and focused on the long view",
    hidden:   "I am quietly anxious about whether any of it will actually add up to something",
    cost:     "I underinvest in the present while building for a future that keeps moving further away",
    signalTags:    ["legacy", "order"],
  },
  {
    id: "service-precision",
    surface:  "I seem like I am happy to help",
    hidden:   "I keep score of who follows through and who takes it for granted",
    cost:     "I resent quietly, say nothing, and am already depleted before I admit there is a problem",
    signalTags:    ["service", "precision"],
  },
  {
    id: "healing-social-sensitivity",
    surface:  "I look warm, attuned, and easy to be around",
    hidden:   "I am exhausted by the volume of emotional information I process every day",
    cost:     "I give more than I have and then disappear to recover without explanation",
    signalTags:    ["healing", "social_sensitivity"],
  },
  {
    id: "freedom-boundaries",
    surface:  "I seem flexible and self-directed",
    hidden:   "I need structure I control — not the absence of structure, which is different",
    cost:     "I exit situations I could have renegotiated because naming the constraint felt like weakness",
    signalTags:    ["freedom", "boundaries"],
  },
  {
    id: "craft-discipline",
    surface:  "I look like I have my output under control",
    hidden:   "My self-worth is more tied to quality than I let on",
    cost:     "I delay sharing until I'm satisfied, and my threshold for satisfied keeps moving",
    signalTags:    ["craft", "discipline"],
  },
  {
    id: "courage-truth",
    surface:  "I appear unbothered by conflict",
    hidden:   "I replay every difficult conversation afterward and audit what I said",
    cost:     "I say the hard thing and then spend twice as long wondering if I said it correctly",
    signalTags:    ["courage", "truth"],
  },
  {
    id: "intuition-privacy",
    surface:  "I look like I do not track what others think of me",
    hidden:   "I have already read the room and quietly adjusted before anyone noticed",
    cost:     "My adjustments are invisible and I get no credit for the effort spent managing them",
    signalTags:    ["intuition", "privacy"],
  },
  {
    id: "fire-sleep",
    surface:  "I appear decisive and energetic",
    hidden:   "I second-guess the decision while I am already acting on it",
    cost:     "I over-commit before checking my own bandwidth, then perform capability I do not have",
    signalTags:    ["intensity", "courage"],
    stressElements: ["fire"],
    decisionStyles: ["sleep_on_it"],
  },
  {
    id: "earth-quiet-instinct",
    surface:  "I look grounded and steady",
    hidden:   "I am acting on a private signal I have not verified with anyone externally",
    cost:     "I call instinct 'reason' and present the conclusion without the original doubt",
    signalTags:    ["order", "precision"],
    stressElements: ["earth"],
    decisionStyles: ["quiet_instinct"],
  },
  {
    id: "water-fight",
    surface:  "I seem emotionally open and present",
    hidden:   "I am managing what I show very carefully — the openness is curated",
    cost:     "When the management fails under sustained pressure, the reaction is disproportionate",
    signalTags:    ["emotion_depth", "privacy"],
    stressElements: ["water"],
  },
  {
    id: "air-freedom",
    surface:  "I look easy-going and genuinely open-minded",
    hidden:   "I have strong preferences and will route around constraints without announcing them",
    cost:     "I avoid direct confrontation by creating quiet distance instead of naming the conflict",
    signalTags:    ["freedom", "truth"],
    stressElements: ["air"],
  },
  {
    id: "intensity-healing",
    surface:  "I appear to have processed and moved on",
    hidden:   "I have moved forward but the underlying material is not finished",
    cost:     "Unresolved things surface in new situations wearing different disguises",
    signalTags:    ["intensity", "healing"],
  },
  {
    id: "precision-gut",
    surface:  "I look quick, sharp, and accurate",
    hidden:   "I trust the fast read but want to audit it before I fully commit — I just do not say so",
    cost:     "I project confidence while holding doubts I do not share, and that gap creates blind spots",
    signalTags:    ["precision", "intuition"],
    decisionStyles: ["gut"],
  },
  {
    id: "order-emotion-depth",
    surface:  "I look like I have my emotions organized",
    hidden:   "I am categorizing feelings I do not fully understand — the categories feel like understanding",
    cost:     "I mistake containment for resolution and skip the part where the feeling needs to actually move",
    signalTags:    ["order", "emotion_depth"],
  },
  {
    id: "adaptable-identity-loss",
    surface: "I am highly adaptable and easy to be around",
    hidden: "I am constantly mirroring my environment to feel safe",
    cost: "I lose my own internal signal; I sometimes forget who I was before the environment changed",
    signalTags: ["social_sensitivity", "truth"],
    decisionStyles: ["consensus"],
  },
  {
    id: "consistent-resistance",
    surface: "I am extremely reliable and consistent",
    hidden: "I am terrified of what happens if I stop following the routine",
    cost: "I resist necessary change even when it's clearly beneficial because 'different' feels like failure",
    signalTags: ["order", "discipline"],
    stressElements: ["earth"],
  },
  {
    id: "fast-burnout",
    surface: "I move at a pace others find impressive",
    hidden: "I am running on high-alert fumes and can't find the off-switch",
    cost: "I crash spectacularly once the lights go out, leaving me unable to function in the quiet between crises",
    signalTags: ["intensity", "courage"],
    stressElements: ["fire"],
  },
  {
    id: "precise-missed-opportunity",
    surface: "I am known for my accuracy and high standards",
    hidden: "I am afraid to ship anything that isn't perfect",
    cost: "I miss critical windows of opportunity because I'm still auditing the details while the world has moved on",
    signalTags: ["precision", "craft"],
    decisionStyles: ["analysis"],
  },
];

/**
 * Score a contradiction pair against the user's signals.
 * Higher = better match.
 */
export function scoreContradiction(
  pair: ContradictionPair,
  themeTags: string[],
  stressElement?: string,
  decisionStyle?: string,
  socialEnergy?: string,
): number {
  let score = 0;

  // Tag overlap
  for (const tag of pair.signalTags) {
    if (themeTags.includes(tag)) score += 2;
  }

  // Behavioral signal matches (stronger weight)
  if (pair.stressElements && stressElement && pair.stressElements.includes(stressElement)) score += 3;
  if (pair.decisionStyles && decisionStyle && pair.decisionStyles.includes(decisionStyle)) score += 3;
  if (pair.socialEnergies && socialEnergy && pair.socialEnergies.includes(socialEnergy)) score += 2;

  return score;
}

export function pickContradiction(
  themeTags: string[],
  stressElement?: string,
  decisionStyle?: string,
  socialEnergy?: string,
): ContradictionPair {
  const scored = CONTRADICTION_PAIRS
    .map(p => ({ pair: p, score: scoreContradiction(p, themeTags, stressElement, decisionStyle, socialEnergy) }))
    .sort((a, b) => b.score - a.score);

  // Return best match; if tie or zero, return first element (deterministic)
  return scored[0].pair;
}

/**
 * Format a contradiction as a narrative hint for the LLM narrator.
 */
export function formatContradictionHint(pair: ContradictionPair): string {
  return `REQUIRED CONTRADICTION TO WEAVE IN:
Surface pattern: "${pair.surface}"
Hidden pattern: "${pair.hidden}"  
Cost of this gap: "${pair.cost}"
(Build this tension into at least one section — do not state it explicitly, dramatize it through behavior.)`;
}
