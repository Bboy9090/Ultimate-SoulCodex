import {
  DEPTH_INTERPRETATION_LAYER_KEYS,
  type DepthInterpretationV1,
} from "../depth-interpretation/types.js";
import type {
  SoulGuideDepthPromptOptions,
  SoulGuideDepthProseResponse,
} from "./depth-types.js";

const LAYER_ORDER_LABELS = [
  "claritySummary",
  "coreContradiction",
  "action",
  "visiblePattern",
  "innerExperience",
  "hiddenNeed",
  "protectiveFunction",
  "gift",
  "shadow",
  "commonMisreading",
  "relationshipImpact",
  "decisionImpact",
  "boundaryOrRepair",
] as const;

function proseShape(): SoulGuideDepthProseResponse {
  return Object.fromEntries(
    DEPTH_INTERPRETATION_LAYER_KEYS.map((key) => [
      key,
      {
        title: `<plain-language title for ${key}>`,
        summary: `<concise summary for ${key}>`,
        explanation: `<grounded explanation for ${key}>`,
      },
    ]),
  ) as unknown as SoulGuideDepthProseResponse;
}

export function generateDepthSoulGuidePrompt(
  source: DepthInterpretationV1,
  options: SoulGuideDepthPromptOptions = {},
): string {
  const tone = options.tone ?? "plain";

  return `You are the prose layer for an evidence-bound Soul Codex interpretation.

Your job is to improve clarity. You may rewrite prose. You may not rewrite epistemology.

## Authoritative Source Contract

The JSON below is the complete evidence boundary. It already contains the only allowed evidence, claim kinds, confidence levels, limitations, missing data, and birth-time degradation.

${JSON.stringify(source, null, 2)}

## Non-Negotiable Rules

1. Use only the source contract above. Do not add evidence, placements, events, motives, or history.
2. Do not change, upgrade, reinterpret, or restate evidence IDs, claim kinds, confidence, limitations, provenance, missing data, or overall confidence.
3. Do not invent childhood causes, parental causes, trauma, attachment styles, diagnoses, disorders, wounds, or hidden biography.
4. Do not predict the future or describe identity as fixed. Avoid "always," "never," "destined," "guaranteed," and similar certainty.
5. Inferred layers must remain calibrated. Use language such as "may," "can," "one possible function," or "the supplied signals suggest."
6. Unavailable layers must remain unavailable. Do not fill missing data with generic personality prose.
7. Lived experience overrides any conflicting interpretation.
8. Explain visible behavior, contradiction, protection, cost, and next action only when the source layer supports them.
9. Keep the tone ${tone}, clear, grounded, and readable. Do not use mystical filler or clinical authority.
10. Return valid JSON only. Do not include Markdown fences or commentary.

## Reading Order

Write the strongest user-facing material first in this conceptual order:
${LAYER_ORDER_LABELS.map((key, index) => `${index + 1}. ${key}`).join("\n")}

## Editable Surface

Return exactly one object containing every required layer key. Each layer may contain only:

- title
- summary
- explanation

Do not return evidenceIds, claimKind, confidence, limitations, evidence, missingData, generatedAt, version, or overallConfidence. Those fields are locked and will be restored from the deterministic source after parsing.

## Required JSON Shape

${JSON.stringify(proseShape(), null, 2)}
`;
}
