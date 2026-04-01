export function rewritePrompt(badText: string, anchors: string[]): string {
  return `
Rewrite this reading to remove ALL vague, abstract, or generic language.

Must:
- Add concrete details tied to these anchors (cite at least 6 of them).
- Remove any vague spiritual filler (no "universe," no "cosmic blueprint," no "your journey," no "a shift is happening," no "energy is present").
- Every sentence must describe something observable — a behavior, decision, habit, or reaction.
- Replace abstract phrases with concrete interpretations of what the person actually does.
- Keep first-person voice throughout (I / me / my — never "you").
- Keep roughly the same length and section structure.
- Minimum 650 words.
- No poetic padding. No metaphors. No fluff.

BAD: "I feel a deep calling toward transformation."
GOOD: "I notice I'm bored with my current routine and I've been researching new directions every night instead of sleeping."

Anchors: ${anchors.join(" ; ")}

TEXT TO REWRITE:
${badText}
`.trim();
}
