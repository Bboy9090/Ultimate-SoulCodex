export type LifeMapPhase =
  | "Ignition"
  | "Exposure"
  | "Construction"
  | "Expansion"
  | "Friction"
  | "Refinement"
  | "Integration"
  | "Legacy";

export type ConfidenceLevel = "verified" | "partial" | "unverified";

export type LifeMapReason = {
  source: "numerology" | "astrology" | "themes" | "mirror";
  label: string;
  weight: number;
};

export type LifeMapYear = {
  year: number;
  phase: LifeMapPhase;
  summary: string;
};

export type LifeMapInput = {
  currentYear: number;
  profile: {
    confidence?: {
      badge?: ConfidenceLevel;
    };
    numerology?: {
      personalYear?: number;
      lifePath?: number;
    };
    themes?: {
      topThemes?: string[];
    };
    mirror?: {
      driver?: string;
      decisionStyle?: string;
      shadowTrigger?: string;
    };
    timeline?: {
      currentPhase?: LifeMapPhase;
    };
  };
  fullChart?: {
    cycles?: {
      saturnStrong?: boolean;
      saturnHard?: boolean;
      jupiterStrong?: boolean;
      jupiterReturn?: boolean;
      nodeStrong?: boolean;
      plutoHard?: boolean;
      neptuneHard?: boolean;
      uranusHard?: boolean;
    };
  };
};

export type LifeMapResult = {
  confidence: ConfidenceLevel;
  currentPhase: LifeMapPhase;
  previousPhase: LifeMapPhase;
  nextPhase: LifeMapPhase;
  reasons: LifeMapReason[];
  do: string[];
  dont: string[];
  years: LifeMapYear[];
};
