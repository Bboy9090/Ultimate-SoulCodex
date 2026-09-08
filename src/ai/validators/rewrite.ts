export function rewritePrompt(originalText: string): string {
  return `
Rewrite this output to remove ALL vague, abstract, or generic language.

RULES:
- Every sentence must describe something observable: a behavior, a decision, a habit, a conversation.
- Remove abstract phrases like "this energy," "something deeper," "opens a door," "a shift is happening."
- Replace generalizations with concrete interpretations of what the person actually does.
- Use first person (I/me/my).
- Keep the same length and structure.
- No poetic padding. No filler. No fluff.
- If a sentence doesn't describe a real action, feeling, or situation — rewrite it until it does.

BAD (vague — sounds deep but means nothing):
"External forces mirror your internal shadow. A door is opening."

GOOD (specific — immediately usable):
"I'm dealing with expectations from others that don't match what I actually want. This creates tension because I'm trying to meet those expectations instead of choosing my own direction."

BAD (abstract pattern):
"When I see my stress element, I notice patterns across contexts."

GOOD (behavioral, concrete):
"When I'm stressed my mind races. I replay conversations, question my decisions, and struggle to relax."

Text to rewrite:
${originalText}
`.trim();
}
