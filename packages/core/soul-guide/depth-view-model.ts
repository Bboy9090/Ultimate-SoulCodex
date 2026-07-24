import type {
  DepthInterpretationLayerKey,
  DepthInterpretationV1,
  EvidenceSystem,
  InterpretationClaimKind,
  InterpretationConfidence,
} from "../depth-interpretation/types.js";

export const DEPTH_SOUL_GUIDE_PRIMARY_KEYS = [
  "claritySummary",
  "coreContradiction",
  "action",
] as const satisfies readonly DepthInterpretationLayerKey[];

export interface DepthSoulGuideDisclosureDefinition {
  id: string;
  title: string;
  description: string;
  layerKeys: readonly DepthInterpretationLayerKey[];
}

export const DEPTH_SOUL_GUIDE_DISCLOSURES: readonly DepthSoulGuideDisclosureDefinition[] = [
  {
    id: "what-people-see",
    title: "What people see",
    description: "The behavior or energy that may appear first.",
    layerKeys: ["visiblePattern"],
  },
  {
    id: "what-they-miss",
    title: "What they miss",
    description: "The internal experience that may not be obvious from the outside.",
    layerKeys: ["innerExperience"],
  },
  {
    id: "need-and-protection",
    title: "The need and protection beneath it",
    description: "What the pattern may be preserving, preventing, or asking for.",
    layerKeys: ["hiddenNeed", "protectiveFunction"],
  },
  {
    id: "gift-and-shadow",
    title: "Gift and shadow",
    description: "What the pattern does well and what happens when it is overused.",
    layerKeys: ["gift", "shadow"],
  },
  {
    id: "common-misreading",
    title: "Common misreading",
    description: "How other people may misunderstand the visible pattern.",
    layerKeys: ["commonMisreading"],
  },
  {
    id: "relationship-and-decision-effects",
    title: "Relationship and decision effects",
    description: "How the pattern may affect trust, conflict, judgment, and timing.",
    layerKeys: ["relationshipImpact", "decisionImpact"],
  },
  {
    id: "boundary-and-repair",
    title: "Boundary and repair",
    description: "What may need to be protected, clarified, said, or repaired.",
    layerKeys: ["boundaryOrRepair"],
  },
] as const;

export interface DepthSoulGuideLayerView {
  key: DepthInterpretationLayerKey;
  title: string;
  summary: string;
  explanation: string;
  claimKind: InterpretationClaimKind;
  confidence: InterpretationConfidence;
  evidenceIds: string[];
  limitations: string[];
  unavailable: boolean;
}

export interface DepthSoulGuideDisclosureView {
  id: string;
  title: string;
  description: string;
  layers: DepthSoulGuideLayerView[];
  availableCount: number;
  unavailableCount: number;
}

export interface DepthSoulGuideEvidenceSystemCount {
  system: EvidenceSystem;
  count: number;
}

export interface DepthSoulGuideEvidenceView {
  totalEvidence: number;
  externallyVerified: number;
  partiallyVerified: number;
  unverified: number;
  referencedEvidenceIds: string[];
  systemCounts: DepthSoulGuideEvidenceSystemCount[];
  limitationCount: number;
}

export interface DepthSoulGuideViewModel {
  primary: DepthSoulGuideLayerView[];
  disclosures: DepthSoulGuideDisclosureView[];
  evidence: DepthSoulGuideEvidenceView;
  missingData: string[];
  overallConfidence: InterpretationConfidence;
  generatedAt: string;
}

function layerView(
  interpretation: DepthInterpretationV1,
  key: DepthInterpretationLayerKey,
): DepthSoulGuideLayerView {
  const layer = interpretation[key];

  return {
    key,
    title: layer.title,
    summary: layer.summary,
    explanation: layer.explanation,
    claimKind: layer.claimKind,
    confidence: layer.confidence,
    evidenceIds: [...layer.evidenceIds],
    limitations: [...layer.limitations],
    unavailable: layer.claimKind === "unavailable",
  };
}

function evidenceView(
  interpretation: DepthInterpretationV1,
  allLayers: readonly DepthSoulGuideLayerView[],
): DepthSoulGuideEvidenceView {
  const systemCounts = new Map<EvidenceSystem, number>();
  let externallyVerified = 0;
  let partiallyVerified = 0;
  let unverified = 0;

  for (const evidence of interpretation.evidence) {
    systemCounts.set(
      evidence.system,
      (systemCounts.get(evidence.system) ?? 0) + 1,
    );

    if (evidence.provenanceStatus === "externally-verified") {
      externallyVerified += 1;
    } else if (evidence.provenanceStatus === "partially-verified") {
      partiallyVerified += 1;
    } else {
      unverified += 1;
    }
  }

  const referencedEvidenceIds = Array.from(
    new Set(allLayers.flatMap((layer) => layer.evidenceIds)),
  ).sort((a, b) => a.localeCompare(b));

  return {
    totalEvidence: interpretation.evidence.length,
    externallyVerified,
    partiallyVerified,
    unverified,
    referencedEvidenceIds,
    systemCounts: Array.from(systemCounts.entries())
      .map(([system, count]) => ({ system, count }))
      .sort((a, b) => a.system.localeCompare(b.system)),
    limitationCount: allLayers.reduce(
      (total, layer) => total + layer.limitations.length,
      0,
    ),
  };
}

export function buildDepthSoulGuideViewModel(
  interpretation: DepthInterpretationV1,
): DepthSoulGuideViewModel {
  const primary = DEPTH_SOUL_GUIDE_PRIMARY_KEYS.map((key) =>
    layerView(interpretation, key),
  );
  const disclosures = DEPTH_SOUL_GUIDE_DISCLOSURES.map((definition) => {
    const layers = definition.layerKeys.map((key) =>
      layerView(interpretation, key),
    );

    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      layers,
      availableCount: layers.filter((layer) => !layer.unavailable).length,
      unavailableCount: layers.filter((layer) => layer.unavailable).length,
    };
  });
  const allLayers = [
    ...primary,
    ...disclosures.flatMap((group) => group.layers),
  ];

  return {
    primary,
    disclosures,
    evidence: evidenceView(interpretation, allLayers),
    missingData: [...interpretation.missingData],
    overallConfidence: interpretation.overallConfidence,
    generatedAt: interpretation.generatedAt,
  };
}
