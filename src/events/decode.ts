import type { LifeEventResult } from "../types/soulcodex";

export type { LifeEventResult };

export type LifeEventInput = {
  event: string;
  phase: string;
  driver: string;
};

const lessons: Record<string, string> = {
  betrayal: "Strengthen boundaries and reduce tolerance for dishonesty.",
  breakup: "Identity is separating from a past version of yourself.",
  burnout: "Your system has exceeded sustainable output.",
  opportunity: "Expansion is available but requires courage.",
  move: "Your environment is shifting to support the next chapter.",
};

export function decodeEvent(e: LifeEventInput): LifeEventResult {
  return {
    whyNow: `This occurred during a ${e.phase} phase where life pressures expose hidden patterns.`,
    lesson:
      lessons[e.event] ??
      `The "${e.event}" event during a ${e.phase} phase signals a shift in personal direction. Observe the pattern before reacting.`,
    nextSteps: ["pause and observe", "identify the pattern", "adjust boundaries"],
  };
}
