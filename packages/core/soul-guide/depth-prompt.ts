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

## Diamond Way Prose Standard

- **Signal before adjective.** Prefer specific supported interactions from the source over broad identity labels.
- **Resonance must be earned.** When multiple supported layers reinforce one another, name the interaction. Do not imply agreement when the source contains only one signal.
- **Protect the tension.** The contradiction layer must preserve both supported sides of a tension instead of flattening them into a generic trait.
- **One layer, one job.** Do not recycle the same sentence, metaphor, or advice across multiple layers.
- **Use concrete language.** Prefer an observable behavior, decision, boundary, or question over vague words such as "alignment," "purpose," "intuition," "discernment," "sensitivity," or "balance" unless the source itself specifically supports that language.
- **No horoscope filler.** Avoid "trust the universe," "everything happens for a reason," "step into your power," "your higher self knows," and similar portable phrases.
- **Make the action testable.** The action layer should offer one bounded next move or reflection experiment that a user could actually try.
- **Keep agency intact.** Frame the reading as something to test, refine, reject, or use—not a verdict about who the user is.
- **Do not manufacture uniqueness.** Specificity must come from the supplied evidence, not invented biography, decorative mysticism, or random variation.

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
