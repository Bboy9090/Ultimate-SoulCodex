import type { DailyCard } from "../types/soulcodex";

export type { DailyCard };

/** Decision styles as returned by the Mirror Engine. */
export const DECISION_STYLES = {
  CALM_LOGIC: "Calm Logic",
  IMMEDIATE_ACTION: "Immediate Action",
  COLLABORATIVE: "Collaborative",
  REFLECTIVE: "Reflective",
} as const;

export type TransitInput = {
  phase: string;
  decisionStyle: string;
};

export function dailyCard(input: TransitInput): DailyCard {
  return {
    focus: `Operate within the ${input.phase} phase energy.`,
    do: [
      "prioritize clarity",
      "complete unfinished work",
      "protect mental bandwidth",
    ],
    dont: ["overcommit", "ignore signals", "rush major decisions"],
    decisionAdvice:
      input.decisionStyle === DECISION_STYLES.CALM_LOGIC
        ? "Step back and analyze before acting."
        : "Trust instinct but avoid impulse.",
  };
}
