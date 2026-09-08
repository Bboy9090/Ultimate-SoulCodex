import type { LifeMapPhase } from "./types";

export const ALL_PHASES: LifeMapPhase[] = [
  "Ignition",
  "Exposure",
  "Construction",
  "Expansion",
  "Friction",
  "Refinement",
  "Integration",
  "Legacy",
];

export const NUMEROLOGY_PHASE_RULES: Record<number, { primary: LifeMapPhase; secondary?: LifeMapPhase }> = {
  1: { primary: "Ignition", secondary: "Expansion" },
  2: { primary: "Integration", secondary: "Refinement" },
  3: { primary: "Expansion", secondary: "Ignition" },
  4: { primary: "Construction", secondary: "Refinement" },
  5: { primary: "Expansion", secondary: "Friction" },
  6: { primary: "Integration", secondary: "Legacy" },
  7: { primary: "Refinement", secondary: "Exposure" },
  8: { primary: "Construction", secondary: "Legacy" },
  9: { primary: "Legacy", secondary: "Integration" },
};

export const THEME_PHASE_RULES: Record<string, LifeMapPhase[]> = {
  precision: ["Refinement", "Construction"],
  truth: ["Exposure", "Integration"],
  boundaries: ["Refinement", "Friction"],
  innovation: ["Ignition", "Expansion"],
  legacy: ["Legacy", "Construction"],
  healing: ["Integration", "Refinement"],
  discipline: ["Construction"],
  freedom: ["Expansion", "Ignition"],
  privacy: ["Refinement", "Exposure"],
  service: ["Legacy", "Integration"],
  intensity: ["Friction", "Exposure"],
  craft: ["Construction", "Refinement"],
  leadership: ["Ignition", "Legacy"],
  intuition: ["Exposure", "Integration"],
  order: ["Construction", "Refinement"],
  emotion_depth: ["Exposure", "Integration"],
  social_sensitivity: ["Refinement", "Exposure"],
  courage: ["Ignition", "Friction"],
};
