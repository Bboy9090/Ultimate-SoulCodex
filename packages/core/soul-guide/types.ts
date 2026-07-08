export interface SoulGuideInterpretation {
  version: 1;
  generatedAt: string;

  // Main interpretive essay
  theme: string;
  narrative: string;

  // Specific guidance
  reflectionPrompts: string[];
  nextSteps: string[];

  // What the AI noticed
  keyInsights: string[];

  // Metadata
  dataPointsAnalyzed: number;
  confidenceInInterpretation: "Low" | "Moderate" | "High";
}

export interface SoulGuideOptions {
  tone?: "reflective" | "analytical" | "poetic";
  focusArea?: "patterns" | "divergences" | "alignment";
  includeReflectionPrompts?: boolean;
  includedNextSteps?: boolean;
}
