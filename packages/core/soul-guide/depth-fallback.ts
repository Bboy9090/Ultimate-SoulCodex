import type {
  DepthInterpretationLayerKey,
  DepthInterpretationV1,
  InterpretationLayer,
} from "../depth-interpretation/types.js";
import type {
  SoulGuideDepthCard,
  SoulGuideDepthFallbackResult,
} from "./depth-types.js";

const PRIMARY_CARD_KEYS: readonly DepthInterpretationLayerKey[] = [
  "claritySummary",
  "coreContradiction",
  "action",
];

const DETAIL_CARD_KEYS: readonly DepthInterpretationLayerKey[] = [
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
];

const PROMPT_TEMPLATES: Partial<
  Record<DepthInterpretationLayerKey, string>
> = {
  coreContradiction:
    "Where do both sides of the main contradiction show up in the same situation?",
  hiddenNeed:
    "Which possible need feels accurate, and which part does not match lived experience?",
  protectiveFunction:
    "What is this pattern trying to preserve, and what does that protection cost?",
  commonMisreading:
    "What do other people usually misunderstand about this pattern?",
  relationshipImpact:
    "How does this pattern affect trust, closeness, or conflict in one real relationship?",
  decisionImpact:
    "Which recent decision shows this pattern most clearly?",
  boundaryOrRepair:
    "What boundary or repair needs to be stated plainly rather than implied?",
  action:
    "What would make the next move small enough to test today?",
};

function toCard(
  key: DepthInterpretationLayerKey,
  layer: InterpretationLayer,
): SoulGuideDepthCard {
  return {
    key,
    title: layer.title,
    body: [layer.summary, layer.explanation].filter(Boolean).join("\n\n"),
    summary: layer.summary,
    explanation: layer.explanation,
    confidence: layer.confidence,
    claimKind: layer.claimKind,
    evidenceIds: [...layer.evidenceIds],
    limitations: [...layer.limitations],
    unavailable: layer.claimKind === "unavailable",
  };
}

function reflectionPrompts(
  interpretation: DepthInterpretationV1,
): string[] {
  const prompts: string[] = [];
  const preferredKeys: readonly DepthInterpretationLayerKey[] = [
    "coreContradiction",
    "hiddenNeed",
    "protectiveFunction",
    "commonMisreading",
    "relationshipImpact",
    "decisionImpact",
    "boundaryOrRepair",
    "action",
  ];

  for (const key of preferredKeys) {
    if (interpretation[key].claimKind === "unavailable") continue;
    const prompt = PROMPT_TEMPLATES[key];
    if (prompt && !prompts.includes(prompt)) prompts.push(prompt);
    if (prompts.length === 3) break;
  }

  if (prompts.length < 3) {
    const fallbacks = [
      "Which part of this reading matches lived experience most clearly?",
      "Which part needs correction, more context, or better evidence?",
      "What one observable result would show whether the next action helped?",
    ];

    for (const prompt of fallbacks) {
      if (!prompts.includes(prompt)) prompts.push(prompt);
      if (prompts.length === 3) break;
    }
  }

  return prompts;
}

function renderCardMarkdown(card: SoulGuideDepthCard): string {
  const evidence =
    card.evidenceIds.length > 0 ? card.evidenceIds.join(", ") : "none available";
  const limitations =
    card.limitations.length > 0
      ? card.limitations.map((item) => `- ${item}`).join("\n")
      : "- None recorded.";

  return `## ${card.title}\n\n${card.body}\n\n**Claim:** ${card.claimKind}  \n**Confidence:** ${card.confidence}  \n**Evidence:** ${evidence}\n\n**Limitations**\n${limitations}`;
}

export function renderDepthSoulGuideMarkdown(
  interpretation: DepthInterpretationV1,
): string {
  const primaryCards = PRIMARY_CARD_KEYS.map((key) =>
    toCard(key, interpretation[key]),
  );
  const detailCards = DETAIL_CARD_KEYS.map((key) =>
    toCard(key, interpretation[key]),
  );
  const prompts = reflectionPrompts(interpretation);
  const missingData =
    interpretation.missingData.length > 0
      ? interpretation.missingData.map((item) => `- ${item}`).join("\n")
      : "- No material missing data recorded.";

  return [
    "# Soul Guide: Clarity First",
    ...primaryCards.map(renderCardMarkdown),
    "# Deeper Layers",
    ...detailCards.map(renderCardMarkdown),
    `# Overall Confidence\n\n${interpretation.overallConfidence}`,
    `# Missing Data\n\n${missingData}`,
    `# Reflection Prompts\n\n${prompts.map((prompt) => `- ${prompt}`).join("\n")}`,
    "Lived experience remains the final authority. Correct any layer that does not match it.",
  ].join("\n\n");
}

export function createDepthSoulGuideFallback(
  interpretation: DepthInterpretationV1,
): SoulGuideDepthFallbackResult {
  const primaryCards = PRIMARY_CARD_KEYS.map((key) =>
    toCard(key, interpretation[key]),
  );
  const detailCards = DETAIL_CARD_KEYS.map((key) =>
    toCard(key, interpretation[key]),
  );

  return {
    status: "fallback",
    message:
      "Using deterministic, evidence-linked guidance from your Codex. Lived experience remains the final authority.",
    primaryCards,
    detailCards,
    cards: [...primaryCards, ...detailCards],
    prompts: reflectionPrompts(interpretation),
    interpretation,
    markdown: renderDepthSoulGuideMarkdown(interpretation),
  };
}
