import type {
  DepthInterpretationV1,
  EvidenceProvenanceStatus,
  InterpretationClaimKind,
  InterpretationConfidence,
  InterpretationEvidenceRef,
  InterpretationLayer,
} from "./types.js";
import type {
  DepthSynthesisFacet,
  DepthSynthesisInputV1,
  DepthSynthesisSeed,
  DepthTensionAxis,
} from "./synthesis-types.js";

const FACET_TITLES: Record<DepthSynthesisFacet, string> = {
  claritySummary: "Clarity summary",
  visiblePattern: "What people may notice first",
  innerExperience: "What may be less visible",
  hiddenNeed: "Possible need beneath the pattern",
  protectiveFunction: "Possible protective function",
  gift: "Constructive expression",
  shadow: "Cost when overused",
  commonMisreading: "Common misreading",
  relationshipImpact: "Relationship impact",
  decisionImpact: "Decision impact",
  boundaryOrRepair: "Boundary or repair",
  action: "Grounded action",
};

const DEFAULT_INFERENCE_LIMITATIONS = [
  "This interpretation is limited to the supplied signals.",
  "Lived experience may describe or weight the pattern differently.",
];

interface ContradictionRule {
  title: string;
  left: readonly DepthTensionAxis[];
  right: readonly DepthTensionAxis[];
}

const CONTRADICTION_RULES: readonly ContradictionRule[] = [
  {
    title: "Independence and connection",
    left: ["independence"],
    right: ["consistency", "partnership", "recognition"],
  },
  {
    title: "Speed and analysis",
    left: ["speed"],
    right: ["analysis"],
  },
  {
    title: "Structure and sensitivity",
    left: ["structure"],
    right: ["sensitivity"],
  },
  {
    title: "Harmony and directness",
    left: ["harmony"],
    right: ["directness"],
  },
  {
    title: "Freedom and stability",
    left: ["freedom"],
    right: ["stability"],
  },
];

function unique(values: readonly string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function isVerified(status?: EvidenceProvenanceStatus): boolean {
  return status === "externally-verified" || status === "partially-verified";
}

function confidenceRank(confidence: InterpretationConfidence): number {
  if (confidence === "high") return 3;
  if (confidence === "moderate") return 2;
  return 1;
}

function confidenceFromRank(rank: number): InterpretationConfidence {
  if (rank >= 3) return "high";
  if (rank >= 2) return "moderate";
  return "low";
}

function conservativeConfidence(
  evidence: readonly InterpretationEvidenceRef[],
): InterpretationConfidence {
  if (evidence.length === 0) return "low";

  const lowestRank = Math.min(
    ...evidence.map((item) => confidenceRank(item.confidence)),
  );
  const confidence = confidenceFromRank(lowestRank);

  if (
    confidence === "high" &&
    !evidence.some((item) => isVerified(item.provenanceStatus))
  ) {
    return "moderate";
  }

  return confidence;
}

function unavailableLayer(title: string, reason: string): InterpretationLayer {
  return {
    title,
    summary: `Unavailable: ${reason}`,
    explanation: `Insufficient data: ${reason}`,
    claimKind: "unavailable",
    evidenceIds: [],
    confidence: "low",
    limitations: [reason],
  };
}

function claimKindForSeeds(
  seeds: readonly DepthSynthesisSeed[],
): Exclude<InterpretationClaimKind, "unavailable"> {
  const kinds = seeds.map((seed) => seed.claimKind ?? "inferred");

  if (kinds.every((kind) => kind === "observed")) return "observed";
  if (kinds.every((kind) => kind === "derived")) return "derived";
  return "inferred";
}

function layerFromFacet(
  facet: DepthSynthesisFacet,
  seeds: readonly DepthSynthesisSeed[],
): InterpretationLayer {
  const selected = seeds
    .filter((seed) => Boolean(seed.facets[facet]?.trim()))
    .slice(0, 2);

  if (selected.length === 0) {
    return unavailableLayer(
      FACET_TITLES[facet],
      `no supported signal was supplied for ${FACET_TITLES[facet].toLowerCase()}.`,
    );
  }

  const evidence = selected.map((seed) => seed.evidence);
  const claimKind = claimKindForSeeds(selected);
  const limitations = unique([
    ...selected.flatMap((seed) => seed.limitations ?? []),
    ...(claimKind === "inferred" ? DEFAULT_INFERENCE_LIMITATIONS : []),
  ]);
  const summary = selected[0].facets[facet]!.trim();
  const labels = selected.map((seed) => seed.label);
  const explanation =
    selected.length === 1
      ? `This layer is supported by ${labels[0]}. It describes the supplied pattern without treating it as fixed identity.`
      : `This layer combines ${labels[0]} with ${labels[1]}. Their overlap is supporting context, not independent proof.`;

  return {
    title: FACET_TITLES[facet],
    summary,
    explanation,
    claimKind,
    evidenceIds: unique(evidence.map((item) => item.id)),
    confidence: conservativeConfidence(evidence),
    limitations,
  };
}

function hasAxis(
  seed: DepthSynthesisSeed,
  axes: readonly DepthTensionAxis[],
): boolean {
  return (seed.tensionAxes ?? []).some((axis) => axes.includes(axis));
}

function contradictionLayer(
  seeds: readonly DepthSynthesisSeed[],
): InterpretationLayer {
  for (const rule of CONTRADICTION_RULES) {
    const left = seeds.find((seed) => hasAxis(seed, rule.left));
    if (!left) continue;

    const right = seeds.find(
      (seed) =>
        seed.evidence.id !== left.evidence.id && hasAxis(seed, rule.right),
    );
    if (!right) continue;

    const evidence = [left.evidence, right.evidence];

    return {
      title: rule.title,
      summary: `The supplied profile supports both ${left.label} and ${right.label}.`,
      explanation:
        "These signals can coexist even when they appear to pull in different directions. The rule identifies a supported tension, not a hidden cause or biography.",
      claimKind: "inferred",
      evidenceIds: unique(evidence.map((item) => item.id)),
      confidence: conservativeConfidence(evidence),
      limitations: [
        "This rule detects coexistence between supplied signals; it does not establish why the tension developed.",
        "Lived experience may show that one side is stronger, situational, or no longer active.",
      ],
    };
  }

  return unavailableLayer(
    "Core contradiction",
    "the supplied signals do not support one of the defined contradiction pairs.",
  );
}

function prepareSeeds(input: DepthSynthesisInputV1): {
  seeds: DepthSynthesisSeed[];
  missingData: string[];
} {
  const missingData = [...(input.missingData ?? [])];
  const seeds: DepthSynthesisSeed[] = [];

  for (const seed of input.seeds) {
    const requiresBirthTime =
      seed.evidence.timeSensitivity === "birth-time-required";

    if (input.birthTimeStatus === "unknown" && requiresBirthTime) {
      missingData.push(
        `Exact birth time is required for ${seed.evidence.field}.`,
      );
      continue;
    }

    if (input.birthTimeStatus === "approximate" && requiresBirthTime) {
      seeds.push({
        ...seed,
        evidence: {
          ...seed.evidence,
          confidence: "low",
          notes: unique([
            ...(seed.evidence.notes ?? []),
            "Birth time is approximate; this time-sensitive signal is degraded.",
          ]),
        },
        limitations: unique([
          ...(seed.limitations ?? []),
          "Birth time is approximate, so this signal may change after verification.",
        ]),
      });
      continue;
    }

    seeds.push(seed);
  }

  seeds.sort(
    (a, b) =>
      (b.priority ?? 0) - (a.priority ?? 0) ||
      a.evidence.id.localeCompare(b.evidence.id) ||
      a.label.localeCompare(b.label),
  );

  return { seeds, missingData: unique(missingData) };
}

function evidenceFromSeeds(
  seeds: readonly DepthSynthesisSeed[],
): InterpretationEvidenceRef[] {
  const byId = new Map<string, InterpretationEvidenceRef>();

  for (const seed of seeds) {
    if (!byId.has(seed.evidence.id)) {
      byId.set(seed.evidence.id, seed.evidence);
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id));
}

function overallConfidence(
  evidence: readonly InterpretationEvidenceRef[],
  missingData: readonly string[],
): InterpretationConfidence {
  if (evidence.length === 0) return "low";

  const allHigh = evidence.every((item) => item.confidence === "high");
  const hasVerifiedSupport = evidence.some((item) =>
    isVerified(item.provenanceStatus),
  );

  if (
    evidence.length >= 3 &&
    allHigh &&
    hasVerifiedSupport &&
    missingData.length === 0
  ) {
    return "high";
  }

  if (evidence.some((item) => item.confidence !== "low")) {
    return "moderate";
  }

  return "low";
}

export function synthesizeDepthInterpretationV1(
  input: DepthSynthesisInputV1,
): DepthInterpretationV1 {
  const prepared = prepareSeeds(input);
  const evidence = evidenceFromSeeds(prepared.seeds);

  return {
    version: 1,
    generatedAt: input.generatedAt,
    claritySummary: layerFromFacet("claritySummary", prepared.seeds),
    visiblePattern: layerFromFacet("visiblePattern", prepared.seeds),
    innerExperience: layerFromFacet("innerExperience", prepared.seeds),
    hiddenNeed: layerFromFacet("hiddenNeed", prepared.seeds),
    protectiveFunction: layerFromFacet(
      "protectiveFunction",
      prepared.seeds,
    ),
    coreContradiction: contradictionLayer(prepared.seeds),
    gift: layerFromFacet("gift", prepared.seeds),
    shadow: layerFromFacet("shadow", prepared.seeds),
    commonMisreading: layerFromFacet("commonMisreading", prepared.seeds),
    relationshipImpact: layerFromFacet(
      "relationshipImpact",
      prepared.seeds,
    ),
    decisionImpact: layerFromFacet("decisionImpact", prepared.seeds),
    boundaryOrRepair: layerFromFacet("boundaryOrRepair", prepared.seeds),
    action: layerFromFacet("action", prepared.seeds),
    evidence,
    missingData: prepared.missingData,
    overallConfidence: overallConfidence(evidence, prepared.missingData),
  };
}
