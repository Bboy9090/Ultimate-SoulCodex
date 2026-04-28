export function narratorPrompt(payload: {
  codename: string;
  archetype: string;
  themes: { tag: string; score: number }[];
  strengths: string[];
  shadows: string[];
  triggers: string[];
  prescriptions: string[];
  anchors: string[];
  /** Optional: contradiction hint from the anti-generic engine */
  contradictionHint?: string;
  /** Optional: behaviorally specific statements to weave in */
  behavioralStatements?: string[];
  /** Optional: life outcome consequence for memory layer */
  lifeConsequence?: string;
  /** Optional: observation of where the pattern breaks */
  patternInterruption?: string;
  /** Optional: compressed behavioral summary */
  loopSentence?: string;
}): string {
  const contradictionBlock = payload.contradictionHint
    ? `\nIDENTITY FRICTION (weave this tension into the narrative):\n${payload.contradictionHint}\n`
    : "";

  const behaviorBlock = payload.behavioralStatements?.length
    ? `\nBEHAVIORAL SPECIFICS TO WEAVE IN (use the exact pattern, rephrase if needed):\n${payload.behavioralStatements.map(s => `- ${s}`).join("\n")}\n`
    : "";

  return `
Write a first-person Soul Codex reading as if the user is speaking about themselves.

CORE MISSION: ENFORCE IDENTITY INTENSITY.
Your goal is to describe a specific internal architecture, not to provide self-help. 

RULES:
1. IDENTITY OVER INSTRUCTION: Every sentence must answer "What kind of person is this under pressure?" NOT "What should this person do?". 
   - BAD: "I set measurable goals."
   - GOOD: "I don't move without a target. Wandering drains me."
2. KILL CHECKLIST SENTENCES: Forbid all task-based language. If a sentence sounds like a LinkedIn post or a productivity blog, delete it.
   - BANNED verbs/phrases: "I set...", "I will...", "I allocate...", "I attend...", "I maintain...", "I research...", "I focus on...".
3. FORCE TENSION: Strong lines have friction. Use phrases like "I won't tolerate...", "I shut down when...", "I cut things that...", "I move when...". 
   - BAD: "I stay calm and review my options."
   - GOOD: "I slow everything down before I move. Rushed decisions cost me more than delay."
4. IDENTITY DIVERGENCE: Avoid "balanced" or "reasonable" descriptions. If this persona is a builder, they should be obsessed. If they are a seeker, they should be restless. Force the persona to be extreme in their specific way. They should feel like they would CLASH with someone who has a different architecture.
5. PERSONALITY PHYSICS: Every identity has a cost. If they are fast, they are reckless. If they are precise, they are slow. Highlight the friction and the price paid for their specific nature.
6. NO GENERIC FILLER: No "cosmic blueprint", "vibrational frequency", "journey", "divine timing".
7. CODENAME INTEGRITY: Use the exact CODENAME provided: "${payload.codename}". This is a role, not a title.
8. LEXICON: Use mechanical, structural, or psychological terms (synthesis, extraction, vector, architecture). Avoid spiritual cliches.
9. FIRST PERSON: Write entirely in "I / me / my".
10. BEHAVIORAL MICRO-SIGNALS: Include at least two specific, grounded habits (e.g., how I text, how I end things, how I handle decision delays, how I react to feedback). Make it annoyingly accurate, not poetic.
11. LIFE PATTERN RECOGNITION: Connect the identity to a likely life outcome using the 'Life Consequence' data. This is the 'why my life looks like this' moment.
12. BEHAVIORAL CONTRADICTION: Highlight contradictory habit pairs (e.g., 'I ignore messages for days, but expect immediate response'). This makes the identity feel 'invasive'.
13. FORBID BEAUTIFUL SUFFERING: Avoid movie monologues. Keep 1-2 'punchy' lines, but ground the rest in cold, observable facts.
14. STRIKE PATTERN (DENSITY CONTROL): Aim for: 1-2 invasive behaviors, 1 contradiction pair, 1 life consequence, and 1 pattern interruption. Don't over-stack.
15. DEFENSIVE FRAMING: Use neutral, objective framing for harsh truths (e.g., 'connections don't always last' vs. 'people don't stay'). Make them feel 'seen', not 'judged'.
16. CHOICE AWARENESS: Include the 'Pattern Interruption' data. This is a cold observation of what happens when the pattern is broken, not advice.
17. TONAL DIVERSITY: Not every user is dramatic. If the data suggests a practical or cold persona, use a blunt, grounded tone. Avoid theatricality.
18. THE LOOP SENTENCE: Include the 'Loop Sentence' provided. This is a single, compressed line: pattern -> consequence -> interruption. (e.g., 'I avoid early decisions, get forced into late ones, and only move cleanly when I skip the middle entirely').
19. MESSY REALISM & TIMING: Avoid 'clean' exits. Highlight when the pattern break 'feels wrong' or 'only happens when I'm exhausted'. Include 'Failed Interruptions' (e.g., 'I've tried to respond faster but I fall back into silence') where relevant.

REQUIRED FORMAT: Return ONLY a valid JSON object. No markdown backticks.
{
  "codename": "${payload.codename}",
  "motto": "[one powerful sentence about how I operate — must have friction]",
  "loop_sentence": "[one compressed line: pattern -> consequence -> interruption]",
  "who_i_am": "[6-10 sentences of identity architecture — behavior-first, no labels]",
  "how_i_move": "[4-7 sentences about behavior under pressure — include the tension block below]",
  "life_consequence": "[1-2 powerful sentences about the repeated outcome of this pattern]",
  "pattern_interruption": "[1-2 sentences about the messy, timing-dependent breaks or failed attempts]",
  "what_i_wont_tolerate": "[2-4 sentences about dealbreakers]",
  "what_im_building": "[2-5 sentences about the long-game architecture]",
  "this_week": [
    "[identity-based focus 1]",
    "[identity-based focus 2]",
    "[identity-based focus 3]"
  ]
}

DATA:
${contradictionBlock}${behaviorBlock}
LIFE CONSEQUENCE (weave this into the 'life_consequence' JSON field):
${payload.lifeConsequence || "N/A"}

PATTERN INTERRUPTION (weave this into the 'pattern_interruption' JSON field):
${payload.patternInterruption || "N/A"}

LOOP SENTENCE (weave this into the 'loop_sentence' JSON field):
${payload.loopSentence || "N/A"}

Top Themes: ${payload.themes.map(t => `${t.tag}(${t.score})`).join(", ")}
Strengths: ${payload.strengths.slice(0, 5).join(" | ")}
Shadows: ${payload.shadows.slice(0, 4).join(" | ")}
Triggers: ${payload.triggers.slice(0, 4).join(" | ")}
Prescriptions (reference these for 'this_week'): ${payload.prescriptions.join(" | ")}
Anchors (cite at least 6): ${payload.anchors.join(" ; ")}
`.trim();
}
