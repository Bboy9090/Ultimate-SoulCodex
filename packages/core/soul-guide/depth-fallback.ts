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

const PROMPT_VARIANTS: Partial<
  Record<DepthInterpretationLayerKey, readonly string[]>
> = {
  coreContradiction: [
    "Where do both sides of this tension show up in the same situation?",
    "What recent moment shows the two competing pulls most clearly?",
    "Which side of this tension tends to take over first, and what happens next?",
  ],
  hiddenNeed: [
    "Which possible need fits the evidence, and which part does not?",
    "What condition seems necessary for this pattern to work well in real life?",
    "What would you need more of—or less of—for this situation to feel workable?",
  ],
  protectiveFunction: [
    "What does this response appear to preserve when it shows up?",
    "What short-term benefit might this response provide, and what is the tradeoff?",
    "If this response is useful at all, what problem is it actually solving?",
  ],
  commonMisreading: [
    "What do people tend to get wrong about this behavior?",
    "Which visible behavior is easiest for someone else to misread?",
    "What context would change another person's interpretation of this behavior?",
  ],
  relationshipImpact: [
    "What changes in trust, closeness, or conflict when this shows up?",
    "Which relationship makes this pattern easiest to observe?",
    "What does the other person actually experience when this behavior appears?",
  ],
  decisionImpact: [
    "Which recent choice gives you the cleanest evidence for or against this reading?",
    "Where did this pattern materially change a decision?",
    "What decision would look different if this interpretation were wrong?",
  ],
  boundaryOrRepair: [
    "What needs to be said directly instead of hinted at?",
    "What boundary would reduce confusion here?",
    "What repair would be specific enough for the other person to recognize?",
  ],
  action: [
    "What is the smallest useful move you can test today?",
    "What action would produce new information fastest?",
    "What can you do once, observe, and then revise?",
  ],
};

function promptVariantIndex(
  interpretation: DepthInterpretationV1,
  key: DepthInterpretationLayerKey,
  count: number,
): number {
  const source = [
    key,
    interpretation[key].summary,
    interpretation[key].evidenceIds.join("|"),
    interpretation.generatedAt,
  ].join("::");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % count;
}

function promptFor(
  interpretation: DepthInterpretationV1,
  key: DepthInterpretationLayerKey,
): string | undefined {
  const variants = PROMPT_VARIANTS[key];
  if (!variants?.length) return undefined;
  return variants[promptVariantIndex(interpretation, key, variants.length)];
}
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
    const prompt = promptFor(interpretation, key);
    if (prompt && !prompts.includes(prompt)) prompts.push(prompt);
    if (prompts.length === 3) break;
  }

  if (prompts.length < 3) {
    const fallbacks = [
      "Which claim in this reading has the strongest real-world evidence?",
      "What part would you rewrite after comparing it with a recent event?",
      "What observable result would tell you the next step actually helped?",
      "Which detail is specific enough to test instead of simply agreeing with it?",
      "What new information would make you change this interpretation?",
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
    `# Questions to Test\n\n${prompts.map((prompt) => `- ${prompt}`).join("\n")}`,
    "Use lived experience to keep, revise, or reject any layer that does not hold up.",
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
      "This fallback uses only the evidence already attached to your Codex. Keep what holds up in real life and revise what does not.",
    primaryCards,
    detailCards,
    cards: [...primaryCards, ...detailCards],
    prompts: reflectionPrompts(interpretation),
    interpretation,
    markdown: renderDepthSoulGuideMarkdown(interpretation),
  };
}
