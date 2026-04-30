import { VOICE_LAWS } from "./voice_laws";

export function rewritePrompt(badText: string, anchors: string[]): string {
  return `
Rewrite this reading to remove ALL vague, generic, or corporate self-help language.

${VOICE_LAWS}

MISSION: Convert this from a "to-do list" into a "blueprint of nature."

Must:
- IDENTITY OVER INSTRUCTION: Every sentence must answer "What kind of person is this?" NOT "What should this person do?". 
- KILL CORPORATE PROSE: If it sounds like a LinkedIn post, delete it.
- NO SOFTENERS: Remove "I tend to", "I feel", "sometimes". Use blunt declarations.
- 12-WORD LIMIT: No sentence may exceed 12 words. Period.
- NO COMMAS STACKING: One idea per sentence.
- BANNED: "set goals", "measurable", "allocate time", "attend workshops", "detailed planner", "I will", "researching".
- Add concrete details tied to these anchors (cite at least 6 of them).
- Remove any vague spiritual filler (no "universe", "journey", "divine", "cosmic").
- Every sentence must describe something observable — a behavior, habit, or reaction.
- Keep first-person voice throughout (I / me / my — never "you").
- Minimum 650 words.
- No poetic padding. No metaphors. No fluff.

BAD: "I feel a deep calling toward transformation."
GOOD: "I notice I'm bored with my current routine and I've been researching new directions every night instead of sleeping."

REQUIRED FORMAT: Return ONLY a valid JSON object. No markdown backticks.
{
  "codename": "[MUST USE EXACT ORIGINAL CODENAME]",
  "motto": "[one powerful sentence about how I operate — must have friction]",
  "who_i_am": "[6-10 sentences of identity architecture]",
  "how_i_move": "[4-7 sentences about behavior under pressure]",
  "what_i_wont_tolerate": "[2-4 sentences about dealbreakers]",
  "what_im_building": "[2-5 sentences about the long-game architecture]",
  "this_week": [
    "[identity-based focus 1]",
    "[identity-based focus 2]",
    "[identity-based focus 3]"
  ]
}

Anchors: ${anchors.join(" ; ")}

TEXT TO REWRITE (Convert this into the JSON format above, applying the rewriting rules):
${badText}
`.trim();
}
