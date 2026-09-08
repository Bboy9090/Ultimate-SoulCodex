import type { TimelinePhase, TimelineOutput, TimelineConfidence } from "./types";
import { PHASES } from "./phases";

const PHASE_NARRATIVE: Record<TimelinePhase, (focus: string) => string> = {
  Ignition: (focus) =>
    `You are at the start of a new cycle. The work right now is not polished output — it is momentum. Most people sabotage this phase by waiting for certainty before they move. Certainty comes after action, not before. Your task is straightforward: ${focus} The evidence for whether this is working will not arrive on your timeline. Build regardless.`,

  Exposure: (focus) =>
    `You are in a feedback window. What you have started is now visible to others, and the world is responding — through people's reactions, through what is landing, and through what is bouncing off. This is uncomfortable but productive. Filtering feedback is a skill: some of what you hear is signal; most is noise. ${focus} Your main job is to stay in the room and keep adjusting.`,

  Construction: (focus) =>
    `You are in a build phase. The exciting early momentum has leveled off, and now the actual structure needs to be erected. This is where most people quit — because the work is unglamorous and the payoff feels distant. But this is exactly where the gap between those who deliver and those who only plan is created. ${focus} Execute the boring parts well. The results compound downstream.`,

  Expansion: (focus) =>
    `You are in a growth window. The work you have done is gaining traction, and new opportunities are arriving. This is a good problem to have, and it comes with a specific risk: over-expansion. Not every open door deserves a yes. The people who burn out in expansion phases are the ones who said yes to everything. ${focus} Be selective. Compound the momentum rather than fragmenting it.`,

  Friction: (focus) =>
    `You are in a friction phase. What has been working is not working as smoothly. Resistance has increased, and old patterns are being stress-tested. This is not a sign that you have failed — it is a sign that the structure you built is being audited. Some of what you have built will pass. Some will not. ${focus} The work is diagnostic: find what the resistance is actually pointing at.`,

  Refinement: (focus) =>
    `You are in a precision phase. The noise has cleared enough that you can see what actually matters. This phase rewards patience, depth, and willingness to cut what is merely good so the excellent can emerge. Volume is not the goal — quality and integrity are. ${focus} Go slower and deeper than feels comfortable. This is where craft is built.`,

  Integration: (focus) =>
    `You are in a synthesis phase. Multiple threads of your life — work, relationships, values, accumulated experience — are converging. What seemed unconnected is showing you the underlying pattern. This phase is often mistaken for stagnation because the movement is internal rather than external. ${focus} The integration you do here is the raw material for the next cycle.`,

  Legacy: (focus) =>
    `You are operating at a phase where your work begins to extend beyond your immediate interests. What you build now has the potential to outlast you — in the people you develop, the systems you create, the knowledge you transmit. ${focus} The decisions you make in this phase have a longer half-life than decisions made in any other. Think accordingly.`,
};

export function buildNarrative(
  phase: TimelinePhase,
  confidence: TimelineConfidence,
  reasons: string[]
): string {
  const def = PHASES[phase];
  const focusText = def.focus;
  const core = PHASE_NARRATIVE[phase](focusText);

  const primaryReason = reasons[0] ?? "";
  const qualifier =
    confidence === "Partial"
      ? " (Note: birth time is unknown — this reading is based on numerology and approximate cycle markers.)"
      : "";

  return `${core}\n\n${primaryReason}${qualifier}`.trim();
}
