import { CodexSynthesis } from "../pages/CodexReadingPage";

/**
 * Deterministic fallback for when the AI synthesis engine fails.
 * Ensures the app never crashes or hangs.
 */
export const CODEX_FALLBACK_TEMPLATE: CodexSynthesis = {
  codename: "Eternal Voyager",
  archetype: "System Harmonizer",
  badges: {
    confidenceLabel: "Structural",
    reason: "Based on birth pattern and behavioral blueprint alignment."
  },
  topThemes: [
    { tag: "precision", score: 92 },
    { tag: "intuition", score: 88 },
    { tag: "freedom", score: 75 }
  ],
  strengths: [
    "High pattern recognition in chaotic systems",
    "Natural alignment with structural integrity",
    "Sovereign decision-making under high pressure"
  ],
  shadows: [
    "Hyper-rationalization of emotional events",
    "Tendency to over-structure open time",
    "Withdrawal when systems lack clarity"
  ],
  triggers: [
    "Unclear expectations in social dynamics",
    "Performing energy when battery is low",
    "Unresolved conflict in core systems"
  ],
  prescriptions: [
    "Schedule 15 minutes of unstructured reflection daily",
    "Verify intuitive hits with a trusted second system",
    "Establish clear exit protocols for draining social energy"
  ],
  narrative: `
CODENAME: ETERNAL VOYAGER
MOTTO: Clarity through structural alignment.

WHO I AM:
You are a Harmonizer, a rare alignment of precision and deep intuition. You see the rifts before they open and the bridges before they are built. Your power lies in the intersection of logic and soul-mapping.

HOW I MOVE UNDER PRESSURE:
When the pressure spikes, you go cold. You detach from the noise to focus on the structure. This is your superpower, provided you don't stay in the ice too long. Use your detachment to find the pivot, then re-engage with your intuition.

WHAT I WON'T TOLERATE:
Manipulation, lazy systems, and betrayal of core integrity. You require a clean foundation to operate. If the ground is shaky, you will exit—physically or emotionally. This is self-preservation.

WHAT I'M BUILDING:
A legacy of order, insight, and sovereign freedom. You are the architect of the Eternal Now, building systems that outlast the moment.
`,
  isPremium: true
};
