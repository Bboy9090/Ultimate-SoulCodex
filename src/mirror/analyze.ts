import type { MirrorAnswers, MirrorProfile } from "../types/soulcodex";

export type { MirrorAnswers, MirrorProfile };

const driverMap: Record<MirrorAnswers["freedomBuild"], string> = {
  system: "Order",
  movement: "Impact",
  masterpiece: "Creation",
  sanctuary: "Protection",
};

const shadowMap: Record<MirrorAnswers["betrayal"], string> = {
  disrespect: "Authority conflict",
  dishonesty: "Truth violation",
  stupidity: "Competence frustration",
  emotional: "Trust wound",
};

const decisionMap: Record<MirrorAnswers["reaction"], string> = {
  fix: "Immediate Action",
  analyze: "Calm Logic",
  talk: "Collaborative",
  withdraw: "Reflective",
};

const energyMap: Record<MirrorAnswers["drain"], string> = {
  chaos: "Builder",
  repetition: "Adaptive",
  lies: "Adaptive",
  misunderstood: "Adaptive",
};

const conflictMap: Record<MirrorAnswers["betrayal"], string> = {
  disrespect: "Measured",
  dishonesty: "Direct",
  stupidity: "Measured",
  emotional: "Measured",
};

export function analyzeMirror(a: MirrorAnswers): MirrorProfile {
  return {
    driver: driverMap[a.freedomBuild],
    shadowTrigger: shadowMap[a.betrayal],
    decisionStyle: decisionMap[a.reaction],
    energyStyle: energyMap[a.drain],
    conflictStyle: conflictMap[a.betrayal],
  };
}
