import type {
  DepthInterpretationLayerKey,
  DepthInterpretationV1,
  InterpretationClaimKind,
  InterpretationConfidence,
} from "../depth-interpretation/types.js";

export interface SoulGuideDepthProse {
  title: string;
  summary: string;
  explanation: string;
}

export type SoulGuideDepthProseResponse = Record<
  DepthInterpretationLayerKey,
  SoulGuideDepthProse
>;

export interface SoulGuideDepthParseFinding {
  code: string;
  path: string;
  message: string;
}

export interface SoulGuideDepthParseResult {
  interpretation: DepthInterpretationV1 | null;
  findings: SoulGuideDepthParseFinding[];
}

export interface SoulGuideDepthPromptOptions {
  tone?: "plain" | "reflective" | "analytical";
}

export interface SoulGuideDepthCard {
  key: DepthInterpretationLayerKey;
  title: string;
  body: string;
  summary: string;
  explanation: string;
  confidence: InterpretationConfidence;
  claimKind: InterpretationClaimKind;
  evidenceIds: string[];
  limitations: string[];
  unavailable: boolean;
}

export interface SoulGuideDepthFallbackResult {
  status: "fallback";
  message: string;
  primaryCards: SoulGuideDepthCard[];
  detailCards: SoulGuideDepthCard[];
  cards: SoulGuideDepthCard[];
  prompts: string[];
  interpretation: DepthInterpretationV1;
  markdown: string;
}
