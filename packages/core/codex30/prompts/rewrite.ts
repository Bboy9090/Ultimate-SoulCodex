export function rewritePrompt(badText: string, anchors: string[]): string {
  return `
Rewrite the following reading to be more specific and less generic.

Must:
- Add concrete details tied to these anchors (cite at least 6 of them).
- Remove any vague spiritual filler (no "universe," no "cosmic blueprint," no "your journey").
- Keep first-person voice throughout (I / me / my — never "you").
- Keep roughly the same length and section structure.
- Minimum 650 words.

Anchors: ${anchors.join(" ; ")}

TEXT TO REWRITE:
${badText}
`.trim();
}
