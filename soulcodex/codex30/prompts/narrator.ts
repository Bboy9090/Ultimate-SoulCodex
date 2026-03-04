export function narratorPrompt(payload: {
  codename: string;
  archetype: string;
  themes: { tag: string; score: number }[];
  strengths: string[];
  shadows: string[];
  triggers: string[];
  prescriptions: string[];
  anchors: string[];
}): string {
  return `
Write a first-person Soul Codex reading as if the user is speaking about themselves.

RULES:
- No generic astrology filler. No "the universe" language. No spiritual clichés.
- BANNED words/phrases: cosmic blueprint, sacred blueprint, divine timing, vibrational frequency, holistic convergence, celestial influence, divine nature, cosmic signature, your journey, you are a unique individual, embrace your truth, aligned with your purpose.
- Must reference at least 6 concrete anchors from the list below.
- Tone: confident, grounded, poetic but plainspoken.
- Write entirely in first person (I / me / my). Never switch to "you."
- Minimum 650 words total.

REQUIRED FORMAT (use these exact section headers):
CODENAME: ${payload.codename}
MOTTO: [one powerful sentence about how I operate]

WHO I AM
[6-10 sentences about my core identity, nature, and instincts]

HOW I MOVE UNDER PRESSURE
[4-7 sentences about my behavior when things get hard]

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
