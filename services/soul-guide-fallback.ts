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

export function soulGuideFallback(
  profile: any,
  timeline?: any,
  dailyCard?: any,
): SoulGuideFallbackResult {
  const archData = profile?.archetypeData || profile?.archetype || {};
  const archName = archData?.archetype || archData?.name || (typeof profile?.archetype === "string" ? profile.archetype : profile?.archetype?.name) || "";
  const themes = archData?.themes || profile?.themes?.topThemes || [];
  const topTheme = themes[0] || "clarity";
  const strengths = archData?.strengths || [];
  const shadows = archData?.shadows || [];

  const synthesis = profile?.synthesis || {};
  const coreEssence = synthesis?.coreEssence || "";
  const stressPattern = synthesis?.stressPattern || "";

  const mirror = profile?.mirror || {};
  const shadowTrigger = mirror?.shadowTrigger || stressPattern || "mental overload";
  const decisionStyle = mirror?.decisionStyle || synthesis?.moralCode?.name || "analytical";

  const astro = profile?.astrologyData || {};
  const sunSign = astro?.sunSign || "";

  const phase = timeline?.phase || timeline?.currentPhase || "your current phase";
  const focus = dailyCard?.focus || "one grounded next step";

  const strengthBody = strengths.length > 0
    ? `Your profile consistently points to ${topTheme}. Your strongest edges are ${strengths.slice(0, 2).join(" and ")}. ${sunSign ? `Your ${sunSign} drive amplifies this —` : "This means"} you operate best when you lean into precision instead of trying to do everything at once.`
    : `Your current profile keeps pointing back to ${topTheme}. This is the part of you that works best when life gets noisy. ${archName ? `As ${archName}, you're built to cut through confusion and act on what matters.` : "You cut through confusion and act on what matters."}`;

  const blindSpotBody = shadows.length > 0
    ? `Your blind spot tends to show up as ${shadows[0].toLowerCase()}. Under stress, ${shadowTrigger.toLowerCase()} takes over — your mind speeds up and tries to solve everything at once. That can make you confuse mental activity with actual progress.`
    : `Your stress pattern leans toward ${shadowTrigger.toLowerCase()}. When pressure rises, your default is to speed up instead of slow down. Watch for the moment when thinking replaces doing — that's the signal to stop and pick one action.`;

  const focusBody = dailyCard
    ? `You are moving through ${phase}. ${focus} Narrow your attention. One finished action will help more than ten partially solved thoughts.`
    : `You are in ${phase}. Your ${decisionStyle} decision style works best when you give it a single clear target instead of a scattered field. Pick one thing that matters and finish it before moving to the next.`;

  return {
    status: "fallback",
    message: "Using backup guidance from your Codex.",
    cards: [
      {
        title: "Your strongest edge right now",
        body: strengthBody,
      },
      {
        title: "What may be throwing you off",
        body: blindSpotBody,
      },
      {
        title: "What to focus on today",
        body: focusBody,
      },
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
  const archData = profile?.archetypeData || profile?.archetype || {};
  const archName = archData?.archetype || archData?.name || "your archetype";
  const themes = archData?.themes || profile?.themes?.topThemes || [];
  const topTheme = themes[0] || "clarity";
  const strengths = archData?.strengths || [];
  const shadows = archData?.shadows || [];
  const synthesis = profile?.synthesis || {};
  const stressPattern = synthesis?.stressPattern || "mental overload";
  const coreEssence = synthesis?.coreEssence || "";
  const phase = timeline?.phase || timeline?.currentPhase || "your current phase";
  const focus = dailyCard?.focus || "";
  const sunSign = profile?.astrologyData?.sunSign || "";
  const lifePath = profile?.numerologyData?.lifePath || "";

  const q = question.toLowerCase();

  if (q.includes("strength") || q.includes("best") || q.includes("good at")) {
    const s = strengths.slice(0, 2).join(" and ") || topTheme;
    return `Based on your profile, your strongest edges are ${s}. ${sunSign ? `Your ${sunSign} drive` : "Your natural instinct"} pushes you to act when others hesitate. ${archName !== "your archetype" ? `As ${archName}, ` : ""}you're built for situations that require precision under pressure. The risk: you may undervalue this because it comes naturally.`;
  }

  if (q.includes("pattern") || q.includes("repeat") || q.includes("sabotage") || q.includes("stuck")) {
    const shadow = shadows[0] || "over-controlling situations";
    return `The pattern your profile keeps flagging: ${shadow.toLowerCase()}. Under pressure, ${stressPattern.toLowerCase()} kicks in — you speed up, try to manage everything, and lose the ability to distinguish between real threats and noise. The fix isn't willpower. It's noticing the moment your body tightens and choosing to do one thing instead of five.`;
  }

  if (q.includes("tolerat") || q.includes("boundary") || q.includes("stop")) {
    const morals = profile?.moralCompassData;
    const values = morals?.coreValues || morals?.values || [];
    const intolerances = morals?.intolerances || [];
    if (intolerances.length > 0) {
      return `Your moral compass data says you don't tolerate ${intolerances.slice(0, 2).join(" or ")}. ${values.length > 0 ? `You value ${values[0]} above most things.` : ""} The question isn't whether you know your boundaries — it's whether you enforce them when it's uncomfortable. That's where the real growth is.`;
    }
    return `Your profile points to a consistent pattern: you know what bothers you, but you tolerate it longer than you should because confrontation feels wasteful. It's not. The energy you spend managing frustration is more expensive than one direct conversation.`;
  }

  if (q.includes("phase") || q.includes("teach") || q.includes("learn") || q.includes("season")) {
    return `You're in ${phase}. ${lifePath ? `Life Path ${lifePath} ` : "Your numerology "}says this phase is about building, not sprinting. The lesson: stop measuring progress by speed. Measure it by whether what you're building can survive pressure. ${focus ? focus : "Focus on foundations, not visibility."}`;
  }

  if (q.includes("focus") || q.includes("today") || q.includes("week") || q.includes("next")) {
    return `Right now in ${phase}, your best move is narrowing attention. ${focus || "Pick the one thing that will still matter in 30 days and give it your best two hours."} Your ${archName !== "your archetype" ? archName : topTheme} profile works best with a single clear target, not a scattered field.`;
  }

  return `Based on your ${archName !== "your archetype" ? archName : ""} profile${sunSign ? ` (${sunSign})` : ""}${lifePath ? `, Life Path ${lifePath}` : ""}: your core pattern revolves around ${topTheme}. You're currently in ${phase}. ${coreEssence || `Your strongest move right now is to stop spreading your attention and commit to one clear action.`}`;
}
