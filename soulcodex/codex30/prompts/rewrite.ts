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

REQUIRED FORMAT: You MUST return a valid JSON object matching exactly this structure. Return ONLY the JSON, without any markdown backticks or wrappers:
{
  "codename": "[original or rewritten codename]",
  "motto": "[one powerful sentence about how I operate]",
  "who_i_am": "[6-10 sentences about my core identity, nature, and instincts...]",
  "how_i_move": "[4-7 sentences about my behavior when things get hard...]",
  "what_i_wont_tolerate": "[2-4 sentences about my non-negotiables...]",
  "what_im_building": "[2-5 sentences about my long-game...]",
  "this_week": [
    "[prescription 1]",
    "[prescription 2]",
    "[prescription 3]"
  ]
}

Anchors: ${anchors.join(" ; ")}

TEXT TO REWRITE (Convert this into the JSON format above, applying the rewriting rules):
${badText}
`.trim();
}
