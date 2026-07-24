import { BLAND_BANNED_PHRASES } from "../validators/blandnessFilter.js";
import {
  DEPTH_INTERPRETATION_LAYER_KEYS,
  type BirthTimeStatus,
  type DepthInterpretationLayerKey,
  type DepthInterpretationV1,
  type InterpretationLayer,
} from "./types.js";
import { validateDepthInterpretationV1 } from "./validate.js";

export type DepthQualityCategory =
  | "contract"
  | "clarity"
  | "depth"
  | "honesty"
  | "traceability"
  | "actionability";

export interface DepthQualityFinding {
  code: string;
  severity: "error" | "warning";
  category: DepthQualityCategory;
  path: string;
  message: string;
}

export interface DepthQualityMetrics {
  totalLayers: number;
  availableLayers: number;
  unavailableLayers: number;
  totalEvidence: number;
  referencedEvidence: number;
  evidenceSystems: number;
  duplicateSummaryGroups: number;
  limitationCount: number;
}

export interface DepthQualityGateResult {
  pass: boolean;
  score: number;
  minimumPassingScore: number;
  findings: DepthQualityFinding[];
  metrics: DepthQualityMetrics;
}

export interface DepthQualityOptions {
  birthTimeStatus?: BirthTimeStatus;
  minimumPassingScore?: number;
  minimumAvailableLayers?: number;
}

const DEFAULT_MINIMUM_PASSING_SCORE = 80;
const DEFAULT_MINIMUM_AVAILABLE_LAYERS = 9;
const ERROR_DEDUCTION = 12;
const WARNING_DEDUCTION = 3;

const GENERIC_SELF_HELP_PHRASES = [
  "trust the process",
  "be yourself",
  "stay positive",
  "follow your heart",
  "embrace the journey",
  "you are unique",
  "everything happens for a reason",
  "believe in yourself",
  "step into your power",
  "let go and flow",
  "you've got this",
  "you got this",
] as const;

const HONESTY_RULES: ReadonlyArray<{
  code: string;
  pattern: RegExp;
  message: string;
}> = [
  {
    code: "invented-biography",
    pattern:
      /\b(?:your childhood|when you were a child|your parents?|your mother|your father|your caregiver|grew up|because you were raised|taught you never|learned as a child)\b/i,
    message:
      "Interpretation must not invent childhood, parental, or biographical causes.",
  },
  {
    code: "invented-trauma-or-attachment",
    pattern:
      /\b(?:trauma response|trauma wound|traumatized|attachment style|attachment wound|anxious attachment|avoidant attachment|abandonment wound)\b/i,
    message:
      "Interpretation must not infer trauma or attachment labels from symbolic data.",
  },
  {
    code: "diagnostic-authority",
    pattern:
      /\b(?:diagnos(?:e|ed|is)|mental illness|personality disorder|psychopath|sociopath|narcissist(?:ic)? disorder)\b/i,
    message: "Interpretation must not diagnose or assign clinical labels.",
  },
  {
    code: "deterministic-certainty",
    pattern:
      /\b(?:you (?:will|always|never)|destined to|guaranteed to|cannot change|fixed identity|definitely means|proves that|scientifically proves|scientifically confirms)\b/i,
    message:
      "Interpretation must not present identity, behavior, or future outcomes as fixed fact.",
  },
  {
    code: "invented-hidden-cause",
    pattern:
      /\b(?:the cause is|this happened because|the real reason is|deep down you know|the hidden truth is)\b/i,
    message:
      "Interpretation must not declare an unsupported hidden cause or motive.",
  },
];

const CALIBRATION_PATTERN =
  /\b(?:may|might|can|could|suggests?|possible|possibly|appears?|seems?|one interpretation|one possible|one function)\b/i;

const ACTION_VERB_PATTERN =
  /\b(?:write|name|state|ask|choose|pause|track|record|schedule|tell|test|set|remove|finish|complete|compare|notice|identify|limit|review|share|clarify|practice|decide|stop|start|list|check|measure|observe)\b/i;

function addFinding(
  findings: DepthQualityFinding[],
  finding: DepthQualityFinding,
): void {
  const duplicate = findings.some(
    (existing) =>
      existing.code === finding.code &&
      existing.path === finding.path &&
      existing.message === finding.message,
  );

  if (!duplicate) findings.push(finding);
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function layerEntries(
  interpretation: DepthInterpretationV1,
): Array<[DepthInterpretationLayerKey, InterpretationLayer]> {
  return DEPTH_INTERPRETATION_LAYER_KEYS.map((key) => [
    key,
    interpretation[key],
  ]);
}

function qualityMetrics(
  interpretation: DepthInterpretationV1,
): DepthQualityMetrics {
  const entries = layerEntries(interpretation);
  const available = entries.filter(([, layer]) => layer.claimKind !== "unavailable");
  const referencedEvidence = new Set(
    available.flatMap(([, layer]) => layer.evidenceIds),
  );
  const duplicateGroups = new Map<string, number>();

  for (const [, layer] of available) {
    const normalized = normalizeText(layer.summary);
    if (!normalized) continue;
    duplicateGroups.set(normalized, (duplicateGroups.get(normalized) ?? 0) + 1);
  }

  return {
    totalLayers: entries.length,
    availableLayers: available.length,
    unavailableLayers: entries.length - available.length,
    totalEvidence: interpretation.evidence.length,
    referencedEvidence: referencedEvidence.size,
    evidenceSystems: new Set(
      interpretation.evidence.map((evidence) => evidence.system),
    ).size,
    duplicateSummaryGroups: Array.from(duplicateGroups.values()).filter(
      (count) => count > 1,
    ).length,
    limitationCount: entries.reduce(
      (total, [, layer]) => total + layer.limitations.length,
      0,
    ),
  };
}

function evaluateContract(
  interpretation: DepthInterpretationV1,
  options: DepthQualityOptions,
  findings: DepthQualityFinding[],
): void {
  const validation = validateDepthInterpretationV1(interpretation, {
    birthTimeStatus: options.birthTimeStatus,
  });

  for (const finding of validation.findings) {
    addFinding(findings, {
      code: `contract-${finding.code}`,
      severity: finding.severity,
      category: "contract",
      path: finding.path,
      message: finding.message,
    });
  }
}

function evaluatePrimaryClarity(
  interpretation: DepthInterpretationV1,
  findings: DepthQualityFinding[],
): void {
  if (interpretation.claritySummary.claimKind === "unavailable") {
    addFinding(findings, {
      code: "clarity-summary-unavailable",
      severity: "error",
      category: "clarity",
      path: "claritySummary",
      message: "A complete reading requires an available clarity summary.",
    });
  }

  if (interpretation.action.claimKind === "unavailable") {
    addFinding(findings, {
      code: "action-unavailable",
      severity: "error",
      category: "actionability",
      path: "action",
      message: "A complete reading requires one available grounded action.",
    });
  }

  if (interpretation.coreContradiction.claimKind === "unavailable") {
    addFinding(findings, {
      code: "contradiction-unavailable",
      severity: "warning",
      category: "depth",
      path: "coreContradiction",
      message:
        "No supported contradiction is available. Keep the layer unavailable rather than inventing one.",
    });
  }
}

function evaluateLayerDepth(
  interpretation: DepthInterpretationV1,
  minimumAvailableLayers: number,
  findings: DepthQualityFinding[],
): void {
  const entries = layerEntries(interpretation);
  const available = entries.filter(([, layer]) => layer.claimKind !== "unavailable");

  if (available.length < Math.max(6, minimumAvailableLayers - 3)) {
    addFinding(findings, {
      code: "insufficient-layer-coverage",
      severity: "error",
      category: "depth",
      path: "$",
      message: `Only ${available.length} of ${entries.length} layers are available.`,
    });
  } else if (available.length < minimumAvailableLayers) {
    addFinding(findings, {
      code: "limited-layer-coverage",
      severity: "warning",
      category: "depth",
      path: "$",
      message: `Only ${available.length} of ${entries.length} layers are available.`,
    });
  }

  const summaries = new Map<string, DepthInterpretationLayerKey[]>();

  for (const [key, layer] of available) {
    const normalizedSummary = normalizeText(layer.summary);
    const normalizedExplanation = normalizeText(layer.explanation);

    if (normalizedSummary.length > 0) {
      const keys = summaries.get(normalizedSummary) ?? [];
      keys.push(key);
      summaries.set(normalizedSummary, keys);
    }

    if (normalizedSummary.length < 24) {
      addFinding(findings, {
        code: "thin-layer-summary",
        severity: "warning",
        category: "depth",
        path: `${key}.summary`,
        message: "Available layer summary is too thin to provide useful clarity.",
      });
    }

    if (normalizedExplanation.length < 50) {
      addFinding(findings, {
        code: "thin-layer-explanation",
        severity: "warning",
        category: "depth",
        path: `${key}.explanation`,
        message: "Available layer explanation needs more supported context.",
      });
    }

    if (
      normalizedSummary.length > 0 &&
      normalizedSummary === normalizedExplanation
    ) {
      addFinding(findings, {
        code: "summary-explanation-duplicate",
        severity: "warning",
        category: "depth",
        path: key,
        message: "Summary and explanation repeat the same text.",
      });
    }

    if (
      layer.claimKind === "inferred" &&
      !CALIBRATION_PATTERN.test(`${layer.summary} ${layer.explanation}`)
    ) {
      addFinding(findings, {
        code: "uncalibrated-inference-language",
        severity: "warning",
        category: "honesty",
        path: key,
        message:
          "Inferred prose should visibly use calibrated language such as may, can, could, or suggests.",
      });
    }
  }

  for (const [summary, keys] of summaries) {
    if (keys.length < 2) continue;
    addFinding(findings, {
      code: "duplicate-layer-summary",
      severity: "error",
      category: "depth",
      path: keys.join(","),
      message: `The same summary is repeated across ${keys.length} layers: "${summary}".`,
    });
  }
}

function evaluateLanguageHonesty(
  interpretation: DepthInterpretationV1,
  findings: DepthQualityFinding[],
): void {
  for (const [key, layer] of layerEntries(interpretation)) {
    const text = `${layer.title} ${layer.summary} ${layer.explanation}`;
    const lower = text.toLowerCase();

    for (const phrase of GENERIC_SELF_HELP_PHRASES) {
      if (!lower.includes(phrase)) continue;
      addFinding(findings, {
        code: "generic-self-help-filler",
        severity: "error",
        category: "clarity",
        path: key,
        message: `Generic filler phrase is not Codex-level interpretation: "${phrase}".`,
      });
    }

    for (const phrase of BLAND_BANNED_PHRASES) {
      if (!lower.includes(phrase.toLowerCase())) continue;
      addFinding(findings, {
        code: "mystical-filler",
        severity: "error",
        category: "clarity",
        path: key,
        message: `Banned mystical filler appears in the layer: "${phrase}".`,
      });
    }

    for (const rule of HONESTY_RULES) {
      if (!rule.pattern.test(text)) continue;
      addFinding(findings, {
        code: rule.code,
        severity: "error",
        category: "honesty",
        path: key,
        message: rule.message,
      });
    }
  }
}

function evaluateTraceability(
  interpretation: DepthInterpretationV1,
  options: DepthQualityOptions,
  findings: DepthQualityFinding[],
): void {
  const entries = layerEntries(interpretation);
  const available = entries.filter(([, layer]) => layer.claimKind !== "unavailable");
  const evidenceSystems = new Set(
    interpretation.evidence.map((evidence) => evidence.system),
  );

  if (
    interpretation.coreContradiction.claimKind !== "unavailable" &&
    new Set(interpretation.coreContradiction.evidenceIds).size < 2
  ) {
    addFinding(findings, {
      code: "contradiction-needs-two-evidence-sides",
      severity: "error",
      category: "traceability",
      path: "coreContradiction.evidenceIds",
      message:
        "An available contradiction must cite at least two distinct evidence references.",
    });
  }

  if (
    interpretation.overallConfidence === "high" &&
    evidenceSystems.size < 2
  ) {
    addFinding(findings, {
      code: "high-confidence-low-system-diversity",
      severity: "error",
      category: "traceability",
      path: "overallConfidence",
      message:
        "High overall confidence requires support from at least two evidence systems.",
    });
  }

  if (available.length >= 5) {
    const usage = new Map<string, number>();
    for (const [, layer] of available) {
      for (const id of new Set(layer.evidenceIds)) {
        usage.set(id, (usage.get(id) ?? 0) + 1);
      }
    }

    const mostUsed = Array.from(usage.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0];

    if (mostUsed && mostUsed[1] / available.length >= 0.8) {
      addFinding(findings, {
        code: "evidence-overconcentration",
        severity: "warning",
        category: "traceability",
        path: "evidence",
        message: `Evidence "${mostUsed[0]}" supports ${mostUsed[1]} of ${available.length} available layers. Correlated claims may be overcounted.`,
      });
    }
  }

  if (interpretation.evidence.length > 0) {
    const referenced = new Set(
      available.flatMap(([, layer]) => layer.evidenceIds),
    );
    if (referenced.size / interpretation.evidence.length < 0.5) {
      addFinding(findings, {
        code: "low-evidence-utilization",
        severity: "warning",
        category: "traceability",
        path: "evidence",
        message:
          "Fewer than half of the supplied evidence records are referenced by available layers.",
      });
    }
  }

  if (options.birthTimeStatus === "unknown") {
    const disclosesUnknownTime = interpretation.missingData.some((item) =>
      /birth time|rising sign|houses|angles|moon degree|human design/i.test(item),
    );

    if (!disclosesUnknownTime) {
      addFinding(findings, {
        code: "unknown-time-not-disclosed",
        severity: "error",
        category: "traceability",
        path: "missingData",
        message:
          "Unknown birth time must be visible in missing data and affected claims.",
      });
    } else {
      addFinding(findings, {
        code: "unknown-time-degradation-visible",
        severity: "warning",
        category: "traceability",
        path: "missingData",
        message:
          "Unknown birth time is visibly degraded rather than silently tolerated.",
      });
    }
  }
}

function evaluateActionability(
  interpretation: DepthInterpretationV1,
  findings: DepthQualityFinding[],
): void {
  if (interpretation.action.claimKind === "unavailable") return;

  const actionText = `${interpretation.action.summary} ${interpretation.action.explanation}`;
  if (!ACTION_VERB_PATTERN.test(actionText)) {
    addFinding(findings, {
      code: "action-lacks-observable-verb",
      severity: "error",
      category: "actionability",
      path: "action",
      message:
        "The action layer must include a concrete observable verb such as write, ask, track, choose, test, or clarify.",
    });
  }
}

function scoreFindings(
  findings: readonly DepthQualityFinding[],
): number {
  const deductions = findings.reduce(
    (total, finding) =>
      total +
      (finding.severity === "error" ? ERROR_DEDUCTION : WARNING_DEDUCTION),
    0,
  );

  return Math.max(0, 100 - deductions);
}

export function evaluateDepthInterpretationQuality(
  interpretation: DepthInterpretationV1,
  options: DepthQualityOptions = {},
): DepthQualityGateResult {
  const findings: DepthQualityFinding[] = [];
  const minimumPassingScore =
    options.minimumPassingScore ?? DEFAULT_MINIMUM_PASSING_SCORE;
  const minimumAvailableLayers =
    options.minimumAvailableLayers ?? DEFAULT_MINIMUM_AVAILABLE_LAYERS;

  evaluateContract(interpretation, options, findings);
  evaluatePrimaryClarity(interpretation, findings);
  evaluateLayerDepth(
    interpretation,
    minimumAvailableLayers,
    findings,
  );
  evaluateLanguageHonesty(interpretation, findings);
  evaluateTraceability(interpretation, options, findings);
  evaluateActionability(interpretation, findings);

  findings.sort(
    (a, b) =>
      (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1) ||
      a.category.localeCompare(b.category) ||
      a.path.localeCompare(b.path) ||
      a.code.localeCompare(b.code),
  );

  const score = scoreFindings(findings);
  const hasErrors = findings.some((finding) => finding.severity === "error");

  return {
    pass: !hasErrors && score >= minimumPassingScore,
    score,
    minimumPassingScore,
    findings,
    metrics: qualityMetrics(interpretation),
  };
}
