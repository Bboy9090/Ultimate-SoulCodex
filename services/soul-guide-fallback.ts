import {
  createDepthSoulGuideFallback,
  type SoulGuideDepthCard,
  type SoulGuideDepthFallbackResult,
} from "../packages/core/soul-guide/index.js";
import {
  synthesizeDepthCodex,
} from "../src/codex/depth-adapter.js";
import {
  synthesizeCodex,
  type CodexSynthesis,
} from "../src/codex/synthesize.js";
import type { SoulProfile } from "../src/types/soulcodex.js";

export interface FallbackCard {
  title: string;
  body: string;
}

export interface SoulGuideFallbackResult {
  status: "fallback";
  message: string;
  cards: FallbackCard[];
  prompts: string[];
  primaryCards?: SoulGuideDepthCard[];
  detailCards?: SoulGuideDepthCard[];
  interpretation?: SoulGuideDepthFallbackResult["interpretation"];
  markdown?: string;
}

function isSoulProfile(profile: unknown): profile is SoulProfile {
  if (!profile || typeof profile !== "object") return false;
  const candidate = profile as Partial<SoulProfile>;

  return Boolean(
    candidate.birth &&
      typeof candidate.birth.birthDate === "string" &&
      typeof candidate.birth.birthPlace === "string" &&
      typeof candidate.birth.timeKnown === "boolean",
  );
}

function withTimeline(profile: SoulProfile, timeline?: unknown): SoulProfile {
  if (profile.timeline || !timeline || typeof timeline !== "object") {
    return profile;
  }

  const candidate = timeline as {
    currentPhase?: SoulProfile["timeline"] extends infer Timeline
      ? Timeline extends { currentPhase: infer Phase }
        ? Phase
        : never
      : never;
    phase?: SoulProfile["timeline"] extends infer Timeline
      ? Timeline extends { currentPhase: infer Phase }
        ? Phase
        : never
      : never;
    reasons?: string[];
  };
  const currentPhase = candidate.currentPhase ?? candidate.phase;

  if (!currentPhase) return profile;

  return {
    ...profile,
    timeline: {
      currentPhase,
      reasons: candidate.reasons,
    },
  };
}

function tryGetDepthFallback(
  profile: unknown,
  timeline?: unknown,
): SoulGuideDepthFallbackResult | null {
  if (!isSoulProfile(profile)) return null;

  try {
    const interpretation = synthesizeDepthCodex(
      withTimeline(profile, timeline),
    );
    return createDepthSoulGuideFallback(interpretation);
  } catch {
    return null;
  }
}

function tryGetSynthesis(profile: unknown): CodexSynthesis | null {
  try {
    const candidate = profile as { synthesis?: CodexSynthesis };
    if (candidate?.synthesis?.coreNature) return candidate.synthesis;
    if (!isSoulProfile(profile)) return null;
    return synthesizeCodex(profile);
  } catch {
    return null;
  }
}

function unavailableFallback(): SoulGuideFallbackResult {
  const reason =
    "Unavailable: a complete Soul Profile is required for evidence-linked backup guidance.";

  return {
    status: "fallback",
    message:
      "Backup guidance is unavailable because the profile does not contain the required source data.",
    cards: [
      { title: "Core Pattern", body: reason },
      { title: "Main Contradiction", body: reason },
      { title: "Next Move", body: reason },
    ],
    prompts: [
      "Which profile fields are still missing?",
      "Which lived-experience detail should be added before interpretation?",
      "Is the recorded birth time known, approximate, or unknown?",
    ],
  };
}

export function soulGuideFallback(
  profile: unknown,
  timeline?: unknown,
  _dailyCard?: unknown,
): SoulGuideFallbackResult {
  const depth = tryGetDepthFallback(profile, timeline);

  if (depth) {
    return {
      status: depth.status,
      message: depth.message,
      cards: depth.cards,
      prompts: depth.prompts,
      primaryCards: depth.primaryCards,
      detailCards: depth.detailCards,
      interpretation: depth.interpretation,
      markdown: depth.markdown,
    };
  }

  const synthesis = tryGetSynthesis(profile);
  if (synthesis) {
    return {
      status: "fallback",
      message:
        "Using legacy deterministic guidance because a complete depth profile is not available.",
      cards: [
        { title: "Core Pattern", body: synthesis.coreNature },
        {
          title: "Main Contradiction",
          body: `${synthesis.stressPattern} ${synthesis.blindSpot}`,
        },
        {
          title: "Next Move",
          body: `${synthesis.currentPhaseMeaning} ${synthesis.practicalGuidance[0] ?? ""}`.trim(),
        },
      ],
      prompts: [
        "Which part matches lived experience most clearly?",
        "What evidence would change this interpretation?",
        "What one grounded action can be tested next?",
      ],
    };
  }

  return unavailableFallback();
}

function layerText(
  fallback: SoulGuideDepthFallbackResult,
  ...keys: SoulGuideDepthCard["key"][]
): string {
  return keys
    .map((key) => fallback.interpretation[key])
    .map((layer) => `${layer.summary} ${layer.explanation}`.trim())
    .join(" ")
    .trim();
}

export function answerFromProfile(
  question: string,
  profile: unknown,
  timeline?: unknown,
  _dailyCard?: unknown,
): string {
  const depth = tryGetDepthFallback(profile, timeline);

  if (depth) {
    const q = question.toLowerCase();

    if (q.includes("strength") || q.includes("best") || q.includes("good at")) {
      return layerText(depth, "gift");
    }
    if (
      q.includes("pattern") ||
      q.includes("repeat") ||
      q.includes("sabotage") ||
      q.includes("stuck")
    ) {
      return layerText(depth, "claritySummary", "shadow");
    }
    if (q.includes("tolerat") || q.includes("boundary") || q.includes("stop")) {
      return layerText(depth, "boundaryOrRepair");
    }
    if (
      q.includes("focus") ||
      q.includes("today") ||
      q.includes("week") ||
      q.includes("next") ||
      q.includes("phase")
    ) {
      return layerText(depth, "claritySummary", "action");
    }
    if (q.includes("decision") || q.includes("choose") || q.includes("decide")) {
      return layerText(depth, "decisionImpact", "action");
    }
    if (q.includes("relationship") || q.includes("love") || q.includes("partner")) {
      return layerText(depth, "relationshipImpact", "commonMisreading");
    }
    if (q.includes("blind") || q.includes("miss") || q.includes("shadow")) {
      return layerText(depth, "shadow", "commonMisreading");
    }
    if (q.includes("grow") || q.includes("edge") || q.includes("improve")) {
      return layerText(depth, "boundaryOrRepair", "action");
    }

    return layerText(depth, "claritySummary", "coreContradiction", "action");
  }

  const synthesis = tryGetSynthesis(profile);
  if (synthesis) {
    return `${synthesis.coreNature} ${synthesis.currentPhaseMeaning}`.trim();
  }

  return "Unavailable: a complete Soul Profile is required before the Codex can answer this responsibly.";
}
