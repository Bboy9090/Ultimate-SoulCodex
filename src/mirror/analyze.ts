import type { MirrorAnswers, MirrorProfile } from "../types/soulcodex";

export type { MirrorAnswers, MirrorProfile };

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
  const driver = a.freedomBuild.map(k => driverMap[k]).join(" × ");
  const shadowTrigger = a.betrayal.map(k => shadowMap[k]).join(" + ");
  const decisionStyle = a.reaction.map(k => decisionMap[k]).join(" & ");
  const energyStyle = a.drain.map(k => energyMap[k]).join(" | ");
  
  // Calculate specific nuance based on overlapping signals
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
