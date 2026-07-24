import type {
  BirthTimeStatus,
  InterpretationClaimKind,
  InterpretationEvidenceRef,
} from "./types.js";

export type DepthSynthesisFacet =
  | "claritySummary"
  | "visiblePattern"
  | "innerExperience"
  | "hiddenNeed"
  | "protectiveFunction"
  | "gift"
  | "shadow"
  | "commonMisreading"
  | "relationshipImpact"
  | "decisionImpact"
  | "boundaryOrRepair"
  | "action";

export type DepthTensionAxis =
  | "independence"
  | "consistency"
  | "partnership"
  | "recognition"
  | "speed"
  | "analysis"
  | "structure"
  | "sensitivity"
  | "harmony"
  | "directness"
  | "freedom"
  | "stability";

export interface DepthSynthesisSeed {
  evidence: InterpretationEvidenceRef;
  label: string;
  priority?: number;
  claimKind?: Exclude<InterpretationClaimKind, "unavailable">;
  facets: Partial<Record<DepthSynthesisFacet, string>>;
  tensionAxes?: DepthTensionAxis[];
  limitations?: string[];
}

export interface DepthSynthesisInputV1 {
  version: 1;
  generatedAt: string;
  birthTimeStatus: BirthTimeStatus;
  seeds: DepthSynthesisSeed[];
  missingData?: string[];
}
