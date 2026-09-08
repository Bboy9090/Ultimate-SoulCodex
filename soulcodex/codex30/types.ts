export type SystemId =
  | "astrology"
  | "aspects"
  | "numerology"
  | "humanDesign"
  | "elements"
  | "moralCompass";

export type Polarity = "strength" | "shadow" | "neutral";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface Signal {
  id: string;
  system: SystemId;
  label: string;
  evidence: string[];
  intensity: number;
  polarity: Polarity;
  confidence: ConfidenceLevel;
  tags: string[];
}

export interface ThemeScore {
  tag: string;
  score: number;
  sources: string[];
}

export interface CodexSynthesis {
  codename: string;
  archetype: string;
  badges: {
    badge: "verified" | "partial" | "unverified";
    label: string;
    reason: string;
    aiAssuranceNote: string;
  };
  topThemes: ThemeScore[];
  strengths: string[];
  shadows: string[];
  triggers: string[];
  prescriptions: string[];
  narrative: string;
  debug?: {
    signals: Signal[];
    themeScores: ThemeScore[];
  };
}

export interface Codex30Input {
  profile: any;
  fullChart?: any;
  userInputs: {
    stressElement?: string;
    pressureStyle?: string;
    decisionStyle?: string;
    nonNegotiables?: string[];
    socialEnergy?: string;
    goals?: string[];
    seed?: string;
  };
}
