import type { CodexSynthesis } from "../src/codex/synthesize";

export interface FallbackCard {
  title: string;
  body: string;
}

export interface SoulGuideFallbackResult {
  status: "fallback";
  message: string;
  cards: FallbackCard[];
  prompts: string[];
}

function tryGetSynthesis(profile: any): CodexSynthesis | null {
  const synthesis = profile?.synthesis as CodexSynthesis | undefined;
  return synthesis?.coreNature ? synthesis : null;
}

export function soulGuideFallback(
  profile: any,
  timeline?: any,
  dailyCard?: any,
): SoulGuideFallbackResult {
  const synth = tryGetSynthesis(profile);

  if (synth) {
    return {
      status: "fallback",
      message: "Using backup guidance from your Codex.",
      cards: [
        {
          title: "Your strongest edge right now",
          body: synth.coreNature,
        },
        {
          title: "What may be throwing you off",
          body: synth.stressPattern,
        },
        {
          title: "What to focus on today",
          body: synth.currentPhaseMeaning + " " + synth.practicalGuidance[0],
        },
      ],
      prompts: [
        "What pattern am I repeating right now?",
        "What do I need to stop tolerating?",
        "What is this phase trying to teach me?",
      ],
    };
  }

  void timeline;
  void dailyCard;

  const reason =
    "Unavailable: deterministic synthesis is required before backup guidance can be generated.";

  return {
    status: "fallback",
    message:
      "Backup guidance is unavailable because there is not enough governed profile evidence.",
    cards: [
      { title: "Core Pattern", body: reason },
      { title: "Main Contradiction", body: reason },
      { title: "Next Move", body: reason },
    ],
    prompts: [
      "Which profile fields are still missing?",
      "Which verified evidence should be added before interpretation?",
      "Is the recorded birth time known, approximate, or unknown?",
    ],
  };
}

export function answerFromProfile(
  question: string,
  profile: any,
  timeline?: any,
  dailyCard?: any,
): string {
  const synth = tryGetSynthesis(profile);

  if (synth) {
    const q = question.toLowerCase();

    if (q.includes("strength") || q.includes("best") || q.includes("good at")) {
      return synth.coreNature;
    }
    if (q.includes("pattern") || q.includes("repeat") || q.includes("sabotage") || q.includes("stuck")) {
      return `${synth.stressPattern} ${synth.blindSpot}`;
    }
    if (q.includes("tolerat") || q.includes("boundary") || q.includes("stop")) {
      return synth.relationshipStyle;
    }
    if (q.includes("phase") || q.includes("teach") || q.includes("learn") || q.includes("season")) {
      return `${synth.currentPhaseMeaning} ${synth.growthEdge}`;
    }
    if (q.includes("focus") || q.includes("today") || q.includes("week") || q.includes("next")) {
      return `${synth.currentPhaseMeaning} ${synth.practicalGuidance.join(" ")}`;
    }
    if (q.includes("decision") || q.includes("choose") || q.includes("decide")) {
      return synth.decisionStyle;
    }
    if (q.includes("relationship") || q.includes("love") || q.includes("partner")) {
      return `${synth.relationshipStyle} ${synth.blindSpot}`;
    }
    if (q.includes("blind") || q.includes("miss") || q.includes("shadow")) {
      return `${synth.blindSpot} ${synth.growthEdge}`;
    }
    if (q.includes("grow") || q.includes("edge") || q.includes("improve")) {
      return synth.growthEdge;
    }

    return `As ${synth.archetype}: ${synth.coreNature} ${synth.currentPhaseMeaning}`;
  }

  void timeline;
  void dailyCard;
  return "Unavailable: deterministic synthesis is required before the Codex can answer this responsibly.";
}
