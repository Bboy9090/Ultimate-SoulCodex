import {
  DEPTH_INTERPRETATION_LAYER_KEYS,
  type DepthInterpretationLayerKey,
  type DepthInterpretationV1,
  type DepthValidationContext,
  type DepthValidationFinding,
  type DepthValidationResult,
  type EvidenceProvenanceStatus,
  type InterpretationEvidenceRef,
  type InterpretationLayer,
} from "./types.js";

const UNSAFE_WORDING_RULES: ReadonlyArray<{
  code: string;
  pattern: RegExp;
  message: string;
}> = [
  {
    code: "diagnostic-wording",
    pattern:
      /\b(?:diagnos(?:e|ed|is)|mental illness|personality disorder|psychopath|sociopath)\b/i,
    message:
      "Interpretations must not diagnose the user or present clinical labels as findings.",
  },
  {
    code: "deterministic-wording",
    pattern:
      /\b(?:you (?:will|always|never)|destined to|guaranteed to|cannot change|proves that|definitely means)\b/i,
    message:
      "Interpretations must not present identity or future behavior as fixed or guaranteed.",
  },
];

const UNAVAILABLE_EXPLANATION_PATTERN =
  /^(?:unavailable|unknown|insufficient data|not enough data|cannot determine|not available)(?:[\s:;,.]|$)/i;

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function isVerified(status?: EvidenceProvenanceStatus): boolean {
  return status === "externally-verified" || status === "partially-verified";
}

function getLayerEntries(
  interpretation: DepthInterpretationV1,
): Array<[DepthInterpretationLayerKey, InterpretationLayer]> {
  return DEPTH_INTERPRETATION_LAYER_KEYS.map((key) => [
    key,
    interpretation[key],
  ]);
}

function addFinding(
  findings: DepthValidationFinding[],
  code: string,
  severity: DepthValidationFinding["severity"],
  path: string,
  message: string,
): void {
  findings.push({ code, severity, path, message });
}

function scanUnsafeWording(
  findings: DepthValidationFinding[],
  path: string,
  value: string,
): void {
  for (const rule of UNSAFE_WORDING_RULES) {
    if (rule.pattern.test(value)) {
      addFinding(findings, rule.code, "error", path, rule.message);
    }
  }
}

function scanLayerWording(
  findings: DepthValidationFinding[],
  layerKey: DepthInterpretationLayerKey,
  layer: InterpretationLayer,
): void {
  scanUnsafeWording(findings, `${layerKey}.title`, layer.title);
  scanUnsafeWording(findings, `${layerKey}.summary`, layer.summary);
  scanUnsafeWording(findings, `${layerKey}.explanation`, layer.explanation);
  layer.limitations.forEach((limitation, index) => {
    scanUnsafeWording(
      findings,
      `${layerKey}.limitations[${index}]`,
      limitation,
    );
  });
}

function resolvedEvidenceForLayer(
  layer: InterpretationLayer,
  evidenceById: ReadonlyMap<string, InterpretationEvidenceRef>,
): InterpretationEvidenceRef[] {
  return layer.evidenceIds
    .map((evidenceId) => evidenceById.get(evidenceId))
    .filter((evidence): evidence is InterpretationEvidenceRef => Boolean(evidence));
}

export function validateDepthInterpretationV1(
  interpretation: DepthInterpretationV1,
  context: DepthValidationContext = {},
): DepthValidationResult {
  const findings: DepthValidationFinding[] = [];
  const evidenceById = new Map<string, InterpretationEvidenceRef>();

  interpretation.evidence.forEach((evidence, index) => {
    if (evidenceById.has(evidence.id)) {
      addFinding(
        findings,
        "duplicate-evidence-id",
        "error",
        `evidence[${index}].id`,
        `Evidence ID "${evidence.id}" is duplicated.`,
      );
    } else {
      evidenceById.set(evidence.id, evidence);
    }

    evidence.notes?.forEach((note, noteIndex) => {
      scanUnsafeWording(
        findings,
        `evidence[${index}].notes[${noteIndex}]`,
        note,
      );
    });
  });

  if (!hasText(interpretation.claritySummary.summary)) {
    addFinding(
      findings,
      "empty-clarity-summary",
      "error",
      "claritySummary.summary",
      "The clarity summary must state the strongest supported pattern.",
    );
  }

  if (
    !hasText(interpretation.action.summary) &&
    !hasText(interpretation.action.explanation)
  ) {
    addFinding(
      findings,
      "empty-action",
      "error",
      "action",
      "The action layer must include one grounded next move.",
    );
  }

  for (const [layerKey, layer] of getLayerEntries(interpretation)) {
    scanLayerWording(findings, layerKey, layer);

    const resolvedEvidence = resolvedEvidenceForLayer(layer, evidenceById);

    layer.evidenceIds.forEach((evidenceId, evidenceIndex) => {
      const evidence = evidenceById.get(evidenceId);

      if (!evidence) {
        addFinding(
          findings,
          "missing-evidence-reference",
          "error",
          `${layerKey}.evidenceIds[${evidenceIndex}]`,
          `Evidence ID "${evidenceId}" is not present in the evidence collection.`,
        );
        return;
      }

      if (
        context.birthTimeStatus === "unknown" &&
        evidence.timeSensitivity === "birth-time-required"
      ) {
        addFinding(
          findings,
          "unknown-time-sensitive-claim",
          "error",
          `${layerKey}.evidenceIds[${evidenceIndex}]`,
          `Evidence ID "${evidenceId}" requires a known birth time and cannot support an available claim.`,
        );
      }
    });

    if (layer.claimKind === "observed" && resolvedEvidence.length === 0) {
      addFinding(
        findings,
        "observed-without-evidence",
        "error",
        `${layerKey}.evidenceIds`,
        "Observed claims must reference at least one available evidence item.",
      );
    }

    if (layer.claimKind === "inferred" && layer.limitations.length === 0) {
      addFinding(
        findings,
        "inference-without-limitations",
        "error",
        `${layerKey}.limitations`,
        "Inferred claims must state their limitations.",
      );
    }

    if (layer.claimKind === "unavailable") {
      if (layer.confidence !== "low") {
        addFinding(
          findings,
          "unavailable-with-confidence",
          "error",
          `${layerKey}.confidence`,
          "Unavailable claims must use low confidence.",
        );
      }

      const explanatoryText = [layer.summary, layer.explanation]
        .filter(hasText)
        .join(" ")
        .trim();

      if (
        explanatoryText.length > 0 &&
        !UNAVAILABLE_EXPLANATION_PATTERN.test(explanatoryText)
      ) {
        addFinding(
          findings,
          "unavailable-with-explanatory-claim",
          "error",
          `${layerKey}.explanation`,
          "Unavailable layers may explain missing data, but must not present a confident interpretation.",
        );
      }
    }

    if (
      layer.confidence === "high" &&
      layer.claimKind !== "unavailable" &&
      !resolvedEvidence.some((evidence) =>
        isVerified(evidence.provenanceStatus),
      )
    ) {
      addFinding(
        findings,
        "unsupported-layer-high-confidence",
        "error",
        `${layerKey}.confidence`,
        "High-confidence layers require at least partially verified supporting evidence.",
      );
    }
  }

  if (
    interpretation.overallConfidence === "high" &&
    !interpretation.evidence.some((evidence) =>
      isVerified(evidence.provenanceStatus),
    )
  ) {
    addFinding(
      findings,
      "unsupported-overall-high-confidence",
      "error",
      "overallConfidence",
      "Overall high confidence is unsupported when all evidence is unverified or missing.",
    );
  }

  interpretation.missingData.forEach((item, index) => {
    scanUnsafeWording(findings, `missingData[${index}]`, item);
  });

  return {
    valid: findings.every((finding) => finding.severity !== "error"),
    findings,
  };
}
