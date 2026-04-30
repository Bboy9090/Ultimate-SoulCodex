export type StressElement = ("fire" | "water" | "air" | "earth" | "metal")[];

export type DecisionStyle =
  | ("gut" | "analysis" | "consensus" | "impulse" | "avoidance")[];

export type PressureStyle =
  | ("fight" | "freeze" | "adapt" | "withdraw" | "perform")[];

export type SocialEnergy = ("steady" | "bursts" | "sensitive")[];

export type DepthMode = "snapshot" | "deep" | "surgical";

export interface BirthData {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  timezone?: string;
  latitude?: number | string;
  longitude?: number | string;
}

export interface UserInputs {
  birthData: BirthData;
  mirror: MirrorAnswers;
  nonNegotiables: string[];
  goals: string[];
}

export interface SoulSignals {
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  lifePath: number;
  mirrorProfile: MirrorProfile;
  nonNegotiables: string[];
  goals: string[];
  seed: string;
  pressureStyle: PressureStyle;
  stressElement: StressElement;
  decisionStyle: DecisionStyle;
  socialEnergy: SocialEnergy;
}

export interface Archetype {
  name: string;
  tagline: string;
  element: string;
  role: string;
}

export interface Synthesis {
  myPattern: string;
  stressPattern: string;
  relationshipPattern: string;
  recognitionMoment: string;
  moralCode: { name: string; notes: string };
  powerMode: string;
  growthEdges: string[];
  contradiction: string;
  lifeConsequence: string;
  patternInterruption: string;
  loopSentence: string;
  codename: string;
}

export interface SoulProfile {
  archetype: Archetype;
  synthesis: Synthesis;
  signals: SoulSignals;
}

export interface CompatibilityDimension {
  label: string;
  score: number;
  note: string;
}

export interface CompatibilityScore {
  overall: number;
  dimensions: {
    identity: CompatibilityDimension;
    stress: CompatibilityDimension;
    values: CompatibilityDimension;
    decisions: CompatibilityDimension;
  };
  friction: string[];
  synergy: string[];
}
