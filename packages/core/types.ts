export type StressElement = "fire" | "water" | "air" | "earth" | "metal";

export type DecisionStyle =
  | "gut"
  | "analysis"
  | "consensus"
  | "impulse"
  | "avoidance";

export type PressureStyle =
  | "fight"
  | "freeze"
  | "adapt"
  | "withdraw"
  | "perform";

export type SocialEnergy = "steady" | "bursts" | "sensitive";

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
  stressElement: StressElement;
  decisionStyle: DecisionStyle;
  pressureStyle: PressureStyle;
  nonNegotiables: string[];
  goals: string[];
  socialEnergy: SocialEnergy;
}

export interface SoulSignals {
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  lifePath: number;
  stressElement: StressElement;
  decisionStyle: DecisionStyle;
  pressureStyle: PressureStyle;
  nonNegotiables: string[];
  goals: string[];
  socialEnergy: SocialEnergy;
}

export interface Archetype {
  name: string;
  tagline: string;
  element: string;
  role: string;
}

export interface Synthesis {
  coreEssence: string;
  stressPattern: string;
  relationshipPattern: string;
  moralCode: { name: string; notes: string };
  powerMode: string;
  growthEdges: string[];
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

// Soul Codex Reading Experience v1 types
export type DisplayMode = "essential" | "complete" | "technical";

export interface EvidencePoint {
  source: string;
  description: string;
  value?: string;
  verified?: boolean;
  confidence?: number;
}

export interface ReadingElement {
  headline: string;
  mechanism: string;
  protection: string;
  howOthersSeeit: string;
  gift: string;
  cost: string;
  action: string;
  evidence: EvidencePoint[];
  confidence: number;
  verified: boolean;
  visibleIn: DisplayMode[];
}
