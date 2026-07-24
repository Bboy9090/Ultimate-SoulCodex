export type InterpretationConfidence = "low" | "moderate" | "high";

export type InterpretationClaimKind =
  | "observed"
  | "derived"
  | "inferred"
  | "unavailable";

export type EvidenceSystem =
  | "astrology"
  | "numerology"
  | "human-design"
  | "mirror"
  | "timeline"
  | "tracker"
  | "user-stated"
  | "system";

export type EvidenceProvenanceStatus =
  | "externally-verified"
  | "partially-verified"
  | "unverified";

export type EvidenceTimeSensitivity = "none" | "birth-time-required";

export type BirthTimeStatus = "known" | "approximate" | "unknown";

export interface InterpretationEvidenceRef {
  id: string;
  system: EvidenceSystem;
  field: string;
  value: string | number | boolean | null;
  confidence: InterpretationConfidence;
  provenanceStatus?: EvidenceProvenanceStatus;
  timeSensitivity?: EvidenceTimeSensitivity;
  notes?: string[];
}

export interface InterpretationLayer {
  title: string;
  summary: string;
  explanation: string;
  claimKind: InterpretationClaimKind;
  evidenceIds: string[];
  confidence: InterpretationConfidence;
  limitations: string[];
}

export const DEPTH_INTERPRETATION_LAYER_KEYS = [
  "claritySummary",
  "visiblePattern",
  "innerExperience",
  "hiddenNeed",
  "protectiveFunction",
  "coreContradiction",
  "gift",
  "shadow",
  "commonMisreading",
  "relationshipImpact",
  "decisionImpact",
  "boundaryOrRepair",
  "action",
] as const;

export type DepthInterpretationLayerKey =
  (typeof DEPTH_INTERPRETATION_LAYER_KEYS)[number];

export interface DepthInterpretationV1 {
  version: 1;
  generatedAt: string;
  claritySummary: InterpretationLayer;
  visiblePattern: InterpretationLayer;
  innerExperience: InterpretationLayer;
  hiddenNeed: InterpretationLayer;
  protectiveFunction: InterpretationLayer;
  coreContradiction: InterpretationLayer;
  gift: InterpretationLayer;
  shadow: InterpretationLayer;
  commonMisreading: InterpretationLayer;
  relationshipImpact: InterpretationLayer;
  decisionImpact: InterpretationLayer;
  boundaryOrRepair: InterpretationLayer;
  action: InterpretationLayer;
  evidence: InterpretationEvidenceRef[];
  missingData: string[];
  overallConfidence: InterpretationConfidence;
}

export interface DepthValidationFinding {
  code: string;
  severity: "error" | "warning";
  path: string;
  message: string;
}

export interface DepthValidationContext {
  birthTimeStatus?: BirthTimeStatus;
}

export interface DepthValidationResult {
  valid: boolean;
  findings: DepthValidationFinding[];
}
