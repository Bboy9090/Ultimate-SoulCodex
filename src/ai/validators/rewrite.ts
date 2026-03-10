export function rewritePrompt(originalText: string): string {
  return `
Rewrite the following text so it contains no vague language.

Rules:
- Remove abstract phrases like "this energy," "something deeper," "opens a door."
- Replace them with concrete behaviors the person actually does.
- Describe what the person experiences in real life situations.
- Use first person (I/me/my).
- Keep the same length and structure.
- Every sentence must describe something observable or actionable.

Bad example:
"When I see my stress element, I notice patterns across contexts."

Good example:
"When I'm stressed my mind races. I replay conversations, question my decisions, and struggle to relax."

Text to rewrite:
${originalText}
`.trim();
}
