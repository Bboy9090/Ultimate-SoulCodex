import { synthesizeCodex, type CodexSynthesis } from "../src/codex/synthesize";

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
  try {
    if (profile?.synthesis?.coreNature) return profile.synthesis;
    return synthesizeCodex(profile);
  } catch {
    return null;
  }
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

  const archData = profile?.archetypeData || profile?.archetype || {};
  const archName = archData?.archetype || archData?.name || (typeof profile?.archetype === "string" ? profile.archetype : profile?.archetype?.name) || "";
  const themes = archData?.themes || profile?.themes?.topThemes || [];
  const topTheme = themes[0] || "clarity";
  const strengths = archData?.strengths || [];
  const shadows = archData?.shadows || [];
  const oldSynthesis = profile?.synthesis || {};
  const stressPattern = oldSynthesis?.stressPattern || "";
  const shadowTrigger = profile?.mirror?.shadowTrigger || stressPattern || "mental overload";
  const decisionStyle = profile?.mirror?.decisionStyle || oldSynthesis?.moralCode?.name || "analytical";
  const phase = timeline?.phase || timeline?.currentPhase || profile?.timeline?.currentPhase || "your current phase";
  const focus = dailyCard?.focus || "one grounded next step";

  const strengthBody = strengths.length > 0
    ? `Your profile emphasizes ${topTheme}. Your strongest edges are ${strengths.slice(0, 2).join(" and ")}. You operate best when you prioritize precision instead of trying to do everything at once.`
    : `Your profile emphasizes ${topTheme}. This is the part of you that works best when life gets noisy. ${archName ? `As ${archName}, you're built to cut through confusion and act on what matters.` : "You cut through confusion and act on what matters."}`;

  const blindSpotBody = shadows.length > 0
    ? `Your blind spot tends to show up as ${shadows[0].toLowerCase()}. Under stress, ${shadowTrigger.toLowerCase()} takes over — your mind speeds up and tries to solve everything at once.`
    : `Your stress pattern leans toward ${shadowTrigger.toLowerCase()}. When pressure rises, your default is to speed up instead of slow down. Watch for the moment when thinking replaces doing.`;

  const focusBody = `You are in ${phase}. The best move today is ${focus}. Narrow your attention. One finished action will help more than ten partially solved thoughts.`;

  return {
    status: "fallback",
    message: "Using backup guidance from your Codex.",
    cards: [
      { title: "Your strongest edge right now", body: strengthBody },
      { title: "What may be throwing you off", body: blindSpotBody },
      { title: "What to focus on today", body: focusBody },
    ],
    prompts: [
      "What pattern am I repeating right now?",
      "What do I need to stop tolerating?",
      "What is this phase trying to teach me?",
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

  const archName = profile?.archetypeData?.archetype || profile?.archetype?.name || "your archetype";
  const topTheme = profile?.themes?.topThemes?.[0] || "clarity";
  const phase = timeline?.phase || profile?.timeline?.currentPhase || "your current phase";
  const sunSign = profile?.astrologyData?.sunSign || profile?.chart?.sun?.sign || "";

  return `Based on your ${archName} profile${sunSign ? ` (${sunSign})` : ""}: your core pattern revolves around ${topTheme}. You're currently in ${phase}. Focus on one clear action rather than spreading your attention.`;
}
