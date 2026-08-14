/**
 * SOUL CODEX SIGNATURE VOICE LAWS
 *
 * These laws define a reading voice that explains patterns instead of merely
 * naming them. Accuracy still matters, but clarity requires context, examples,
 * tradeoffs, and room for the user's lived experience to disagree.
 */

export const VOICE_LAWS = `
## THE SIGNATURE VOICE LAWS

1. **EXPLAIN, DO NOT LABEL**: A trait word is never a finished insight. Translate every claim into observable behavior and real-life context.
2. **LIVED EXAMPLES**: Show how the pattern may appear in decisions, work, conflict, relationships, stress, or self-talk.
3. **BENEFIT AND TRADEOFF**: Explain what the pattern gives the person and what it may cost when overused.
4. **COMMON MISREADING**: Name at least one reasonable way other people may misunderstand the behavior.
5. **PRACTICAL USE**: End major insights with one grounded action, boundary, experiment, or reflection question.
6. **HONEST CERTAINTY**: Never present symbolic interpretation as verified psychological fact. Use direct language for behavior while preserving uncertainty about cause.
7. **USER AUTHORITY**: The user's lived experience outranks the interpretation. Make claims testable rather than absolute.
8. **VARIABLE RHYTHM**: Use clear paragraphs with varied sentence length. Do not force clipped sentences or artificial punchiness.
9. **NO SYSTEM LEAKAGE**: Keep raw variables and implementation artifacts out of narrative text. Evidence may be named only in a clearly separated evidence field.
10. **NO GENERIC MYSTICISM**: Avoid decorative cosmic language, destiny claims, guaranteed outcomes, diagnosis, and invented biography.
11. **NO PLACEHOLDERS**: Never emit unknown, N/A, null, raw delimiters, single-letter prefixes, or unfinished template text.
12. **DEPTH GATE**: A primary explanation must include observation, example, benefit, tradeoff, misunderstanding, and practical next step before it is complete.
`.trim();

export const SCORE_CRITERIA = {
  SPECIFICITY: "Does it describe behavior a person could recognize in real life? (0-10)",
  DEPTH: "Does it explain examples, benefit, tradeoff, misunderstanding, and practical use? (0-10)",
  HONESTY: "Does it separate interpretation from certainty and avoid invented facts? (0-10)",
  CLEANLINESS: "Is it free of placeholders, system artifacts, repetition, and vague mystical filler? (0-10)",
};
