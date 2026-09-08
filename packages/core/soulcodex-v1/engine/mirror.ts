import { z } from "zod";
import type { EngineConfidence, SourceSystem, TraitSignal } from "./types.js";

export const mirrorReactionSchema = z.enum(["fix", "analyze", "talk", "withdraw"]);
export const mirrorBetrayalSchema = z.enum(["disrespect", "dishonesty", "stupidity", "emotional"]);
export const mirrorDrainSchema = z.enum(["chaos", "repetition", "lies", "misunderstood"]);
export const mirrorFreedomBuildSchema = z.enum(["system", "movement", "masterpiece", "sanctuary"]);

export const mirrorAnswersSchema = z.object({
  reaction: z.array(mirrorReactionSchema).default([]),
  betrayal: z.array(mirrorBetrayalSchema).default([]),
  drain: z.array(mirrorDrainSchema).default([]),
  freedomBuild: z.array(mirrorFreedomBuildSchema).default([]),
});

export type MirrorAnswers = z.infer<typeof mirrorAnswersSchema>;

export const mirrorProfileSchema = z.object({
  driver: z.string(),
  shadowTrigger: z.string(),
  decisionStyle: z.string(),
  energyStyle: z.string(),
  conflictStyle: z.string(),
  nuance: z.array(z.string()).optional(),
});

export type MirrorProfile = z.infer<typeof mirrorProfileSchema>;

const driverMap: Record<string, string> = {
  system: "Order & Architecture",
  movement: "Impact & Community",
  masterpiece: "Creation & Legacy",
  sanctuary: "Protection & Peace",
};

const shadowMap: Record<string, string> = {
  disrespect: "Authority Conflict",
  dishonesty: "Truth Violation",
  stupidity: "Competence Frustration",
  emotional: "Trust Wound",
};

const decisionMap: Record<string, string> = {
  fix: "Immediate Action",
  analyze: "Calm Logic",
  talk: "Collaborative Processing",
  withdraw: "Reflective Solitude",
};

const energyMap: Record<string, string> = {
  chaos: "Structural Integrity",
  repetition: "Dynamic Evolution",
  lies: "Radical Authenticity",
  misunderstood: "Precise Expression",
};

export function analyzeMirror(a: MirrorAnswers): MirrorProfile {
  const driver = a.freedomBuild.map((k) => driverMap[k]).join(" × ");
  const shadowTrigger = a.betrayal.map((k) => shadowMap[k]).join(" + ");
  const decisionStyle = a.reaction.map((k) => decisionMap[k]).join(" & ");
  const energyStyle = a.drain.map((k) => energyMap[k]).join(" | ");

  const nuance: string[] = [];
  if (a.reaction.includes("fix") && a.reaction.includes("analyze")) {
    nuance.push("The Tactical Architect: You solve problems with high-speed precision.");
  }
  if (a.reaction.includes("talk") && a.reaction.includes("withdraw")) {
    nuance.push("The Selective Communicator: You process externally only once you feel safe.");
  }
  if (a.drain.includes("chaos") && a.drain.includes("lies")) {
    nuance.push("The Truth Anchor: You require stable, honest environments to maintain energy.");
  }
  if (a.freedomBuild.includes("system") && a.freedomBuild.includes("sanctuary")) {
    nuance.push("The Fortress Builder: You create structures specifically to protect your peace.");
  }
  if (a.freedomBuild.includes("masterpiece") && a.freedomBuild.includes("movement")) {
    nuance.push("The Cultural Catalyst: Your work is designed to move and inspire the collective.");
  }

  return {
    driver: driver || "Undefined",
    shadowTrigger: shadowTrigger || "Undefined",
    decisionStyle: decisionStyle || "Undefined",
    energyStyle: energyStyle || "Undefined",
    conflictStyle: a.betrayal.includes("dishonesty") ? "Direct" : "Measured",
    nuance: nuance.length > 0 ? nuance : ["Pure Archetype: Your behavioral signals are highly concentrated."],
  };
}

function uniq<T>(items: T[]): T[] {
  const out: T[] = [];
  for (const i of items) if (!out.includes(i)) out.push(i);
  return out;
}

function signal(trait_key: string, value: number, confidence: EngineConfidence, sources: SourceSystem[], notes?: string): TraitSignal {
  return {
    trait_key,
    value: Math.max(-10, Math.min(10, Math.round(value))),
    confidence,
    sources: uniq(sources),
    notes,
  };
}

export function mirrorToTraitSignals(profile: MirrorProfile): TraitSignal[] {
  const src: SourceSystem = "human_design"; // treated as internal behavioral input; keep within existing enum
  const out: TraitSignal[] = [];

  const driver = profile.driver.toLowerCase();
  if (driver.includes("order")) out.push(signal("work_structure", 6, "high", [src], "Mirror driver favors structure."));
  if (driver.includes("creation") || driver.includes("legacy")) out.push(signal("mission_arc", 5, "medium", [src], "Mirror driver favors creation/legacy."));
  if (driver.includes("impact") || driver.includes("community")) out.push(signal("mission_arc", 5, "medium", [src], "Mirror driver favors impact/community."));
  if (driver.includes("protection") || driver.includes("peace")) out.push(signal("rel_independence", 4, "medium", [src], "Mirror driver favors protection/peace."));

  const decision = profile.decisionStyle.toLowerCase();
  if (decision.includes("immediate")) out.push(signal("decision_fast", 6, "high", [src], "Mirror decision style is fast."));
  if (decision.includes("logic") || decision.includes("calm")) out.push(signal("decision_wait", 6, "high", [src], "Mirror decision style prefers analysis/time."));
  if (decision.includes("collaborative")) out.push(signal("rel_depth", 4, "medium", [src], "Mirror decision style processes with others."));
  if (decision.includes("reflective")) out.push(signal("decision_wait", 4, "medium", [src], "Mirror decision style prefers solitude before deciding."));

  const shadow = profile.shadowTrigger.toLowerCase();
  if (shadow.includes("truth")) out.push(signal("stress_truth_violation", 6, "high", [src], "Mirror shadow trigger: dishonesty."));
  if (shadow.includes("authority")) out.push(signal("stress_authority_conflict", 5, "medium", [src], "Mirror shadow trigger: disrespect."));
  if (shadow.includes("competence")) out.push(signal("stress_competence_frustration", 5, "medium", [src], "Mirror shadow trigger: stupidity."));
  if (shadow.includes("trust")) out.push(signal("stress_trust_wound", 5, "medium", [src], "Mirror shadow trigger: emotional unreliability."));

  const energy = profile.energyStyle.toLowerCase();
  if (energy.includes("structural")) out.push(signal("optimal_conditions", 4, "medium", [src], "Mirror energy: chaos drains."));
  if (energy.includes("authentic")) out.push(signal("relational_pattern", 3, "medium", [src], "Mirror energy: lies drain."));
  if (energy.includes("precise")) out.push(signal("how_you_work", 3, "medium", [src], "Mirror energy: misunderstood drains."));

  return out;
}

