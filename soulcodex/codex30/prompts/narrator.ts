import type { MirrorProfile } from "@/types/soulcodex";

export function narratorPrompt(payload: {
  codename: string;
  archetype: string;
  themes: { tag: string; score: number }[];
  strengths: string[];
  shadows: string[];
  triggers: string[];
  prescriptions: string[];
  anchors: string[];
  mirrorProfile: MirrorProfile; // Added MirrorProfile
}): string {
  const { codename, archetype, themes, strengths, shadows, triggers, prescriptions, anchors, mirrorProfile } = payload;

  // Add MirrorProfile details to anchors for the AI to draw from
  const updatedAnchors = [
    ...anchors,
    `My core drive is: ${mirrorProfile.driver}`,
    `My shadow trigger is: ${mirrorProfile.shadowTrigger}`,
    `My decision style is: ${mirrorProfile.decisionStyle}`,
    `My energy style is: ${mirrorProfile.energyStyle}`,
    `My conflict style is: ${mirrorProfile.conflictStyle}`,
    ...(mirrorProfile.nuance || []).map(n => `A unique nuance about me: ${n}`),
  ];

  return `
Write a first-person Soul Codex reading as if the user is speaking about themselves.

CORE RULE: Every section must follow Observation → Meaning → Action.
- Observation: What is actually happening (specific, behavioral)
- Meaning: Why it matters (the pattern, the cost, the drive behind it)
- Action: What to do about it (concrete, immediate, usable)

RULES:
- No generic astrology filler. No "the universe" language. No spiritual clichés.
- BANNED words/phrases: cosmic blueprint, sacred blueprint, divine timing, vibrational frequency, holistic convergence, celestial influence, divine nature, cosmic signature, your journey, you are a unique individual, embrace your truth, aligned with your purpose, a shift is happening, energy is present, a door is opening.
- Must reference at least 6 concrete anchors from the list below. Prioritize the unique nuances and specific mirror insights.
- Tone: confident, grounded, plainspoken. No poetic padding.
- Write entirely in first person (I / me / my). Never switch to "you."
- Every sentence must describe something observable — a behavior, decision, habit, or reaction.
- Minimum 650 words total.
- Ensure the narrative directly reflects the specific Mirror Profile insights provided, making the reading feel highly personalized and avoiding generalities.

REQUIRED FORMAT (use these exact section headers):
CODENAME: ${codename}
MOTTO: [one powerful sentence about how I operate — must describe a real behavior, not an abstraction]

WHO I AM
[6-10 sentences. MUST reference Sun sign, Moon sign, Rising sign by name. Explain what each one does in my actual life — identity, emotional patterns, how others see me. Include Human Design type and Life Path number. Concrete behavioral examples. Incorporate aspects of my driver and energy style from MirrorProfile.]

HOW I MOVE UNDER PRESSURE
[4-7 sentences. MUST reference my Element (Elemental Medicine) and how stress shows up in my body. Name the specific behaviors: what I say, what I avoid, how my body responds, what I reach for. Connect to Moon sign emotional patterns and HD type energy management. Directly reference my decision style and how my energy shifts from MirrorProfile.]

WHAT I WON\'T TOLERATE
[2-4 sentences. Connect dealbreakers to Sun sign identity and Life Path purpose. Specific examples of situations that trigger them. Directly reference my shadow trigger and conflict style from MirrorProfile.]

WHAT I\'M BUILDING
[2-5 sentences. Connect to Life Path number and Human Design strategy. Not abstract goals — name the actual thing being built and the daily actions that move it forward. Incorporate my core driver and any relevant nuances from MirrorProfile.]

THIS WEEK
- [prescription 1 — specific, actionable, today-ready, connected to a core data point]
- [prescription 2 — specific, actionable, today-ready, connected to a core data point]
- [prescription 3 — specific, actionable, today-ready, connected to a core data point]

DATA:
Top Themes: ${themes.map(t => `${t.tag}(${t.score})`).join(", ")}
Strengths: ${strengths.slice(0, 5).join(" | ") || "none"}
Shadows: ${shadows.slice(0, 4).join(" | ") || "none"}
Triggers: ${triggers.slice(0, 4).join(" | ") || "none"}
Prescriptions: ${prescriptions.join(" | ")}
Anchors (must cite at least 6, prioritizing specific mirror insights): ${updatedAnchors.join(" ; ")}
`.trim();
}
