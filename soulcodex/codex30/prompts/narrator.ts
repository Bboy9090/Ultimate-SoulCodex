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

CORE RULE: Every section must follow Observation → Meaning → Action.
- Observation: What is actually happening (specific, behavioral)
- Meaning: Why it matters (the pattern, the cost, the drive behind it)
- Action: What to do about it (concrete, immediate, usable)

RULES:
- No generic astrology filler. No "the universe" language. No spiritual clichés.
- BANNED words/phrases: cosmic blueprint, sacred blueprint, divine timing, vibrational frequency, holistic convergence, celestial influence, divine nature, cosmic signature, your journey, you are a unique individual, embrace your truth, aligned with your purpose, a shift is happening, energy is present, a door is opening.
- Must reference at least 6 concrete anchors from the list below.
- Tone: confident, grounded, plainspoken. No poetic padding.
- Write entirely in first person (I / me / my). Never switch to "you."
- Every sentence must describe something observable — a behavior, decision, habit, or reaction.
- Minimum 650 words total.

REQUIRED FORMAT (use these exact section headers):
CODENAME: ${payload.codename}
MOTTO: [one powerful sentence about how I operate — must describe a real behavior, not an abstraction]

WHO I AM
[6-10 sentences. MUST reference Sun sign, Moon sign, Rising sign by name. Explain what each one does in my actual life — identity, emotional patterns, how others see me. Include Human Design type and Life Path number. Concrete behavioral examples.]

HOW I MOVE UNDER PRESSURE
[4-7 sentences. MUST reference my Element (Elemental Medicine) and how stress shows up in my body. Name the specific behaviors: what I say, what I avoid, how my body responds, what I reach for. Connect to Moon sign emotional patterns and HD type energy management.]

WHAT I WON'T TOLERATE
[2-4 sentences. Connect dealbreakers to Sun sign identity and Life Path purpose. Specific examples of situations that trigger them.]

WHAT I'M BUILDING
[2-5 sentences. Connect to Life Path number and Human Design strategy. Not abstract goals — name the actual thing being built and the daily actions that move it forward.]

THIS WEEK
- [prescription 1 — specific, actionable, today-ready, connected to a core data point]
- [prescription 2 — specific, actionable, today-ready, connected to a core data point]
- [prescription 3 — specific, actionable, today-ready, connected to a core data point]

DATA:
Top Themes: ${payload.themes.map(t => `${t.tag}(${t.score})`).join(", ")}
Strengths: ${payload.strengths.slice(0, 5).join(" | ") || "none"}
Shadows: ${payload.shadows.slice(0, 4).join(" | ") || "none"}
Triggers: ${payload.triggers.slice(0, 4).join(" | ") || "none"}
Prescriptions: ${payload.prescriptions.join(" | ")}
Anchors (must cite at least 6): ${payload.anchors.join(" ; ")}
`.trim();
}
