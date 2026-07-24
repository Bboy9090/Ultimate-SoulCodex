import {
  DEPTH_INTERPRETATION_LAYER_KEYS,
  validateDepthInterpretationV1,
  type DepthInterpretationLayerKey,
  type DepthInterpretationV1,
  type DepthValidationContext,
} from "../depth-interpretation/index.js";
import type {
  SoulGuideDepthParseFinding,
  SoulGuideDepthParseResult,
  SoulGuideDepthProse,
  SoulGuideDepthProseResponse,
} from "./depth-types.js";

const ALLOWED_PROSE_FIELDS = new Set(["title", "summary", "explanation"]);

const PROSE_SAFETY_RULES: ReadonlyArray<{
  code: string;
  pattern: RegExp;
  message: string;
}> = [
  {
    code: "diagnostic-wording",
    pattern:
      /\b(?:diagnos(?:e|ed|is)|mental illness|personality disorder|psychopath|sociopath|narcissist(?:ic)? disorder)\b/i,
    message: "Soul Guide prose must not diagnose or assign clinical labels.",
  },
  {
    code: "invented-biography",
    pattern:
      /\b(?:your childhood|when you were a child|your parents?|your mother|your father|your caregiver|grew up|because you were raised|taught you never|learned as a child)\b/i,
    message:
      "Soul Guide prose must not invent childhood, parental, or biographical causes.",
  },
  {
    code: "invented-trauma-or-attachment",
    pattern:
      /\b(?:trauma response|trauma wound|traumatized|attachment style|attachment wound|anxious attachment|avoidant attachment|abandonment wound)\b/i,
    message:
      "Soul Guide prose must not infer trauma or attachment labels from symbolic data.",
  },
  {
    code: "deterministic-wording",
    pattern:
      /\b(?:you (?:will|always|never)|destined to|guaranteed to|cannot change|fixed identity|proves that|definitely means)\b/i,
    message:
      "Soul Guide prose must not present identity or future behavior as fixed.",
  },
  {
    code: "invented-hidden-cause",
    pattern:
      /\b(?:the cause is|this happened because|the real reason is|deep down you know)\b/i,
    message:
      "Soul Guide prose must not declare an unsupported hidden cause or motive.",
  },
];

function addFinding(
  findings: SoulGuideDepthParseFinding[],
  code: string,
  path: string,
  message: string,
): void {
  findings.push({ code, path, message });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function extractJsonObject(response: string): unknown {
  const trimmed = response.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("No JSON object was found in the response.");
  }

  return JSON.parse(trimmed.slice(start, end + 1));
}

function scanProseSafety(
  findings: SoulGuideDepthParseFinding[],
  path: string,
  value: string,
): void {
  for (const rule of PROSE_SAFETY_RULES) {
    if (rule.pattern.test(value)) {
      addFinding(findings, rule.code, path, rule.message);
    }
  }
}

function parseLayerProse(
  raw: unknown,
  layerKey: DepthInterpretationLayerKey,
  findings: SoulGuideDepthParseFinding[],
): SoulGuideDepthProse | null {
  if (!isRecord(raw)) {
    addFinding(
      findings,
      "invalid-layer-object",
      layerKey,
      "Each layer must be an object containing title, summary, and explanation.",
    );
    return null;
  }

  for (const key of Object.keys(raw)) {
    if (!ALLOWED_PROSE_FIELDS.has(key)) {
      addFinding(
        findings,
        "attempted-metadata-rewrite",
        `${layerKey}.${key}`,
        `Field "${key}" is locked. The AI may return prose fields only.`,
      );
    }
  }

  const prose: Partial<SoulGuideDepthProse> = {};

  for (const field of ["title", "summary", "explanation"] as const) {
    const value = raw[field];

    if (typeof value !== "string" || value.trim().length === 0) {
      addFinding(
        findings,
        "missing-layer-prose",
        `${layerKey}.${field}`,
        `Layer "${layerKey}" requires a non-empty ${field}.`,
      );
      continue;
    }

    const cleanValue = value.trim();
    prose[field] = cleanValue;
    scanProseSafety(findings, `${layerKey}.${field}`, cleanValue);
  }

  if (!prose.title || !prose.summary || !prose.explanation) {
    return null;
  }

  return prose as SoulGuideDepthProse;
}

function parseProseResponse(
  parsed: unknown,
  findings: SoulGuideDepthParseFinding[],
): SoulGuideDepthProseResponse | null {
  if (!isRecord(parsed)) {
    addFinding(
      findings,
      "invalid-response-shape",
      "$",
      "The response must be one JSON object keyed by interpretation layer.",
    );
    return null;
  }

  const requiredKeys = new Set<string>(DEPTH_INTERPRETATION_LAYER_KEYS);

  for (const key of Object.keys(parsed)) {
    if (!requiredKeys.has(key)) {
      addFinding(
        findings,
        "attempted-top-level-metadata-rewrite",
        key,
        `Top-level field "${key}" is not editable and must not be returned.`,
      );
    }
  }

  const prose = {} as SoulGuideDepthProseResponse;
  let complete = true;

  for (const layerKey of DEPTH_INTERPRETATION_LAYER_KEYS) {
    if (!(layerKey in parsed)) {
      addFinding(
        findings,
        "missing-layer",
        layerKey,
        `The response is missing required layer "${layerKey}".`,
      );
      complete = false;
      continue;
    }

    const layerProse = parseLayerProse(parsed[layerKey], layerKey, findings);
    if (!layerProse) {
      complete = false;
      continue;
    }

    prose[layerKey] = layerProse;
  }

  return complete ? prose : null;
}

function mergeLockedInterpretation(
  source: DepthInterpretationV1,
  prose: SoulGuideDepthProseResponse,
): DepthInterpretationV1 {
  const merged: DepthInterpretationV1 = {
    ...source,
    evidence: source.evidence.map((item) => ({
      ...item,
      notes: item.notes ? [...item.notes] : undefined,
    })),
    missingData: [...source.missingData],
  };

  for (const layerKey of DEPTH_INTERPRETATION_LAYER_KEYS) {
    merged[layerKey] = {
      ...source[layerKey],
      title: prose[layerKey].title,
      summary: prose[layerKey].summary,
      explanation: prose[layerKey].explanation,
      evidenceIds: [...source[layerKey].evidenceIds],
      limitations: [...source[layerKey].limitations],
    };
  }

  return merged;
}

export function parseDepthSoulGuideResponse(
  response: string,
  source: DepthInterpretationV1,
  context: DepthValidationContext = {},
): SoulGuideDepthParseResult {
  const findings: SoulGuideDepthParseFinding[] = [];
  let parsed: unknown;

  try {
    parsed = extractJsonObject(response);
  } catch (error) {
    addFinding(
      findings,
      "invalid-json",
      "$",
      error instanceof Error ? error.message : "The response is not valid JSON.",
    );
    return { interpretation: null, findings };
  }

  const prose = parseProseResponse(parsed, findings);
  if (!prose || findings.length > 0) {
    return { interpretation: null, findings };
  }

  const interpretation = mergeLockedInterpretation(source, prose);
  const validation = validateDepthInterpretationV1(interpretation, context);

  for (const finding of validation.findings) {
    addFinding(
      findings,
      `contract-${finding.code}`,
      finding.path,
      finding.message,
    );
  }

  return {
    interpretation: validation.valid ? interpretation : null,
    findings,
  };
}
