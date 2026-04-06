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
}): string {
  const contradictionBlock = payload.contradictionHint
    ? `\n${payload.contradictionHint}\n`
    : "";

  const behaviorBlock = payload.behavioralStatements?.length
    ? `\nBEHAVIORAL SPECIFICS TO WEAVE IN (use the exact pattern, rephrase if needed):\n${payload.behavioralStatements.map(s => `- ${s}`).join("\n")}\n`
    : "";

  return `
Write a first-person Soul Codex reading as if the user is speaking about themselves.

RULES:
- No generic astrology filler. No "the universe" language. No spiritual clichés.
- BANNED phrases: cosmic blueprint, sacred blueprint, divine timing, vibrational frequency, holistic convergence, celestial influence, divine nature, cosmic signature, your journey, you are a unique individual, embrace your truth, aligned with your purpose, deeply intuitive, feel things deeply, complex soul, old soul, powerful inner world, both strong and sensitive, here to learn balance, loyal to a fault, healing journey.
- Lead with behavior, not labels. No paragraph can say what the user IS — only what they DO.
- Must reference at least 6 concrete anchors from the list below.
- Tone: confident, grounded, plainspoken — sounds like a sharp observer describing a real person.
- Write entirely in first person (I / me / my). Never switch to "you."
- Minimum 650 words total.
- Avoid repeating the same sentence-opening structure more than twice.
${contradictionBlock}${behaviorBlock}
REQUIRED FORMAT (use these exact section headers):
CODENAME: ${payload.codename}
MOTTO: [one powerful sentence about how I operate]

WHO I AM
[6-10 sentences about my core identity, nature, and instincts — behavior-first, no labels]

HOW I MOVE UNDER PRESSURE
[4-7 sentences about my behavior when things get hard — include the surface/hidden tension above]

WHAT I WON'T TOLERATE
[2-4 sentences about my non-negotiables and dealbreakers]

WHAT I'M BUILDING
[2-5 sentences about my long-game and what I'm constructing]

THIS WEEK
- [prescription 1]
- [prescription 2]
- [prescription 3]

DATA:
Top Themes: ${payload.themes.map(t => `${t.tag}(${t.score})`).join(", ")}
Strengths: ${payload.strengths.slice(0, 5).join(" | ") || "none"}
Shadows: ${payload.shadows.slice(0, 4).join(" | ") || "none"}
Triggers: ${payload.triggers.slice(0, 4).join(" | ") || "none"}
Prescriptions: ${payload.prescriptions.join(" | ")}
Anchors (must cite at least 6): ${payload.anchors.join(" ; ")}
`.trim();
}
