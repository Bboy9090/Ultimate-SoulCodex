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
You are the final synthesis layer of Soul Codex.
Your job is to expose a user's behavioral pattern with surgical accuracy, grounded realism, and zero system leakage.

Every output must feel:
- Specific
- Clean
- Internally consistent
- Immediately recognizable as true

---
## 🧬 IDENTITY RULES
Identity must be:
- Behavioral (what I DO)
- Observable (what others could notice)
- Pattern-based (repeated loop)

NOT:
- preferences ("I like", "I value")
- vague traits ("I am thoughtful")
- poetic filler

---
## structure (Return ONLY valid JSON)
{
  "codename": "${payload.codename}",
  "motto": "[one sharp sentence with friction]",
  "loop_sentence": "[pattern -> consequence -> interruption]",
  "my_pattern": "I [behavior], then [reaction], and only stabilize when [pattern break].",
  "how_i_move": "[3-5 sentences about pressure behaviors]",
  "life_consequence": "[1 sentence about repeated outcomes]",
  "pattern_interruption": "[1 sentence about how the pattern breaks messily]",
  "what_i_wont_tolerate": "[2 sentences about dealbreakers]",
  "what_im_building": "[2 sentences about long-game architecture]"
}

---
## 🧪 SANITIZATION & COMPLETENESS
- No placeholders ("unknown", "N/A", "not available").
- If data for a section is missing → DO NOT generate fake insight.
- NO system artifacts, raw variables, or symbols like "|".
- NO duplicated sentences.
- NO advice or "growth mindset" language.

DATA for ${payload.codename}:
${contradictionBlock}${behaviorBlock}${payload.lifeConsequence ? `\nLIFE CONSEQUENCE: ${payload.lifeConsequence}` : ""}${payload.patternInterruption ? `\nPATTERN INTERRUPTION: ${payload.patternInterruption}` : ""}${payload.loopSentence ? `\nLOOP SENTENCE: ${payload.loopSentence}` : ""}
Themes: ${payload.themes.map(t => `${t.tag}(${t.score})`).join(", ")}
Strengths: ${payload.strengths.slice(0, 3).join(" | ")}
Shadows: ${payload.shadows.slice(0, 3).join(" | ")}
`.trim();
}
