import type { LifeMapPhase } from "./types";

export function phaseSummary(phase: LifeMapPhase): string {
  switch (phase) {
    case "Ignition":
      return "A start-up phase. Momentum matters more than perfection.";
    case "Exposure":
      return "A truth phase. What is hidden gets harder to ignore.";
    case "Construction":
      return "A building phase. Structure, discipline, and follow-through matter most.";
    case "Expansion":
      return "A growth phase. New options appear; the challenge is choosing what actually deserves your time.";
    case "Friction":
      return "A pressure phase. Resistance is showing you what must change.";
    case "Refinement":
      return "An editing phase. Simplify, sharpen, and remove what drains you.";
    case "Integration":
      return "A consolidation phase. Lessons are starting to fit together.";
    case "Legacy":
      return "A long-view phase. Meaning, contribution, and what lasts take center stage.";
    default:
      return "A phase between cycles. Mixed signals until the next clear direction forms.";
  }
}

export function phaseDoList(phase: LifeMapPhase): string[] {
  switch (phase) {
    case "Ignition":
      return ["start the thing", "move before doubt grows", "keep scope small and real"];
    case "Exposure":
      return ["tell the truth", "look directly at the pattern", "stop protecting what is clearly broken"];
    case "Construction":
      return ["finish what matters", "reduce distractions", "make your schedule reflect your priorities"];
    case "Expansion":
      return ["say yes selectively", "take visible action", "use confidence without overpromising"];
    case "Friction":
      return ["face the hard conversation", "cut what is unsustainable", "treat resistance as information"];
    case "Refinement":
      return ["simplify your commitments", "clean up what drains you", "choose quality over quantity"];
    case "Integration":
      return ["stabilize the lessons", "repeat what works", "trust slower progress"];
    case "Legacy":
      return ["build for the long term", "teach what you've learned", "focus on what outlasts the moment"];
  }
}

export function phaseDontList(phase: LifeMapPhase): string[] {
  switch (phase) {
    case "Ignition":
      return ["wait for perfect timing", "overplan", "scatter your energy"];
    case "Exposure":
      return ["lie to yourself", "avoid the signal", "keep smoothing over obvious problems"];
    case "Construction":
      return ["chase novelty", "start five things", "pretend discipline doesn't matter"];
    case "Expansion":
      return ["say yes to everything", "confuse motion with direction", "inflate your promises"];
    case "Friction":
      return ["force what is already cracking", "numb out", "act like the pressure means failure"];
    case "Refinement":
      return ["keep cluttering your life", "treat every option as equal", "confuse perfectionism with precision"];
    case "Integration":
      return ["rush the process", "abandon what is finally working", "mistake calm for stagnation"];
    case "Legacy":
      return ["play short-term games", "waste effort on shallow wins", "ignore the bigger arc"];
  }
}
