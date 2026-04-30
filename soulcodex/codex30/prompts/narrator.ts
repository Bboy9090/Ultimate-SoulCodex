function sanitize(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/\|/g, "")
    .replace(/unknown/gi, "")
    .replace(/chaos/gi, "")
    .replace(/fix/gi, "")
    .trim();
}

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
  const codename = sanitize(payload.codename);
  const contradictionBlock = payload.contradictionHint
    ? `\nIDENTITY FRICTION (weave this tension into the narrative):\n${sanitize(payload.contradictionHint)}\n`
    : "";

  const behaviorBlock = payload.behavioralStatements?.length
    ? `\nBEHAVIORAL SPECIFICS TO WEAVE IN (use the exact pattern, rephrase if needed):\n${payload.behavioralStatements.map(s => `- ${sanitize(s)}`).join("\n")}\n`
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
  "loop_sentence": "[behavioral pattern -> consequence -> interruption]",
  "my_pattern": "I [specific behavior], then [observable reaction], and only stabilize when [pattern break].",
  "how_i_move": "[3-5 sentences about specific pressure behaviors and their costs]",
  "life_consequence": "[1 blunt sentence about the repeated outcome of this loop]",
  "pattern_interruption": "[1 sharp sentence about how the pattern breaks messily]",
  "motto": "[one sharp behavioral declaration with internal friction]",
  "codename": "${codename}",
  "what_i_wont_tolerate": "[2 sentences about behavioral dealbreakers]",
  "what_im_building": "[2 sentences about long-game behavioral architecture]"
}

---
## 🧪 SANITIZATION & COMPLETENESS
- No placeholders ("unknown", "N/A", "not available").
- If data for a section is missing → DO NOT generate fake insight.
- NO system artifacts, raw variables, or symbols like "|".
- NO duplicated sentences.
- NO advice or "growth mindset" language.

DATA for ${codename}:
${contradictionBlock}${behaviorBlock}${payload.lifeConsequence ? `\nLIFE CONSEQUENCE: ${sanitize(payload.lifeConsequence)}` : ""}${payload.patternInterruption ? `\nPATTERN INTERRUPTION: ${sanitize(payload.patternInterruption)}` : ""}${payload.loopSentence ? `\nLOOP SENTENCE: ${sanitize(payload.loopSentence)}` : ""}
Themes: ${payload.themes.map(t => `${sanitize(t.tag)}(${t.score})`).join(", ")}
Strengths: ${payload.strengths.slice(0, 3).map(s => sanitize(s)).join(" · ")}
Shadows: ${payload.shadows.slice(0, 3).map(s => sanitize(s)).join(" · ")}
`.trim();
}
