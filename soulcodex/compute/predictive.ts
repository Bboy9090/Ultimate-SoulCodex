import type { SoulSignals, CoreDriver } from "../types";

export interface BehaviorPrediction {
  situation: string;
  likely: string;
  trap: string;
  alternative: string;
  sources: string[];
}

/**
 * Layer 7: Predictive Behavior Engine
 *
 * The moat: situational behavior predictions grounded in Core Drivers.
 *
 * NOT "you are a Virgo, so you will..."
 * BUT "when criticized publicly, your Virgo+LP4+impulse will analyze-then-internalize;
 *       the trap is silent self-doubt; try instead: ask clarifying questions before defending"
 *
 * This is the layer that turns personality into actionable intelligence.
 */

function predictBehaviorInSituation(
  situation: string,
  signals: SoulSignals,
  coreDrivers: CoreDriver[]
): BehaviorPrediction | null {
  const drivers = coreDrivers.map(d => d.name.toLowerCase());
  const decisionStyle = signals.decisionStyle || [];
  const pressureStyle = signals.pressureStyle || [];

  // Situation: Public criticism / being called out
  if (situation === "public_criticism") {
    const isAnalyzer = drivers.includes("analyzer");
    const isPerformer = drivers.includes("performer");
    const isReactor = decisionStyle.includes("impulse");

    if (isAnalyzer && !isReactor) {
      return {
        situation: "Public Criticism / Being Called Out",
        likely: `You analyze the critique in real-time, checking its logic before responding. If the criticism holds weight, you internalize it silently. If it doesn't, you construct a mental defense without speaking. Either way, the room sees withdrawal, not dialogue.`,
        trap: `Silent self-doubt loop: you assume they're right and start re-examining your entire premise. OR you dismiss the feedback as incomplete information and never integrate it.`,
        alternative: `Ask clarifying questions before defending: "Are you saying X is wrong, or that my approach to X is ineffective?" This breaks the analyzer paralysis and shifts to collaborative problem-solving.`,
        sources: ["Analyzer", "Analysis Decision Style"]
      };
    }

    if (isPerformer && isReactor) {
      return {
        situation: "Public Criticism / Being Called Out",
        likely: `You escalate first (your natural response to pressure) and defend your position with intensity. The room sees fire, not insight. You aim to win the exchange rather than integrate the feedback.`,
        trap: `You double down instead of listening. The critic becomes an opponent instead of a source of information. Your intensity shuts down dialogue and damages relationships.`,
        alternative: `Pause for 3 seconds before responding. Breathe. Say: "I hear you. Help me understand what specifically didn't work." This transforms the dynamic from win/lose to co-problem-solving.`,
        sources: ["Performer", "Reactor"]
      };
    }
  }

  // Situation: Making decisions under time pressure
  if (situation === "decision_under_pressure") {
    const isAnalyzer = drivers.includes("analyzer");
    const isReactor = decisionStyle.includes("impulse");
    const isInitiator = drivers.includes("initiator");

    if (isAnalyzer && !isReactor) {
      return {
        situation: "Making Decisions Under Time Pressure",
        likely: `You slow down when the clock tightens. Your natural response is to gather more information, run more scenarios, and delay the decision until you feel confident. This protects you from costly mistakes but often misses the window.`,
        trap: `Analysis paralysis: the deadline passes and someone else makes the call, leaving you frustrated and feeling unheard.`,
        alternative: `Set a hard deadline for gathering information (not for deciding). After that, make the best call with what you have. Trust that 80% information with timely execution beats 100% information arriving late.`,
        sources: ["Analyzer"]
      };
    }

    if (isReactor || isInitiator) {
      return {
        situation: "Making Decisions Under Time Pressure",
        likely: `You move fast, trusting your instinct. You decide with partial information and correct course mid-execution. The speed is your superpower, but you often miss critical details that would have changed your approach.`,
        trap: `Rushing leads to avoidable mistakes. You act before thinking through consequences and have to backtrack, burning credibility and time.`,
        alternative: `Before you move, identify the ONE thing that would change your decision if it were different. Check that one variable. Then move. Speed with one verification step beats pure impulse.`,
        sources: ["Initiator", "Reactor"]
      };
    }
  }

  // Situation: Conflict with someone close
  if (situation === "intimate_conflict") {
    const isReflector = pressureStyle.includes("withdraw");
    const isCombatant = pressureStyle.includes("fight");
    const isPerceiver = drivers.includes("perceiver");

    if (isReflector) {
      return {
        situation: "Conflict with Someone Close",
        likely: `You retreat to process. You go quiet, internal, and unavailable. The other person interprets this as rejection or indifference. They escalate to try to re-engage you. You retreat further. Classic deadlock.`,
        trap: `Your partner feels abandoned. The relationship fractures during the very moment it needs repair. By the time you're ready to talk, they've already written the story you were avoiding.`,
        alternative: `Before you withdraw, say one sentence: "I need space to process. I'm not leaving the conversation, I'm taking it offline for 2 hours. Let's resume at [time]." This preserves connection while honoring your need.`,
        sources: ["Reflector"]
      };
    }

    if (isCombatant && !isPerceiver) {
      return {
        situation: "Conflict with Someone Close",
        likely: `You push back hard, matching their intensity or exceeding it. You aim to resolve the conflict through engagement, but your escalation often makes them feel unheard. The conflict deepens instead of resolving.`,
        trap: `You win the argument but damage the relationship. You get what you argued for but lose what you actually wanted (connection, understanding, partnership).`,
        alternative: `Pause and name what you're actually fighting for: "I care about our connection. I want to understand where this is coming from." This shifts from opponent-mode to teammate-mode.`,
        sources: ["Combatant"]
      };
    }

    if (isPerceiver) {
      return {
        situation: "Conflict with Someone Close",
        likely: `You monitor their emotional state and calibrate what you say based on what they can hear. You often don't say what you actually mean — you say what will keep the peace. They never get to know what's really going on.`,
        trap: `Resentment builds silently. They think there's no problem. You're collecting evidence of how they don't understand you. When it finally breaks, it's explosive and seems to come from nowhere.`,
        alternative: `Say the true thing, even if it's hard: "I'm frustrated, and I want to tell you why." They can't respond to what you won't say. Truth-telling is more vulnerable but builds real intimacy.`,
        sources: ["Perceiver"]
      };
    }
  }

  // Situation: Opportunity to lead or step up
  if (situation === "leadership_moment") {
    const isInitiator = drivers.includes("initiator");
    const isBuilder = drivers.includes("builder");
    const isCloser = drivers.includes("closer");
    const isPerformer = drivers.includes("performer");

    if (isInitiator) {
      return {
        situation: "Opportunity to Lead or Step Up",
        likely: `You immediately say yes and start moving. You clear a path and rally people. Your speed and confidence inspire action. But you often don't finish what you started — you hand it off once the initial momentum is established.`,
        trap: `Projects stall after your initial push. You're seen as unreliable because you leave things incomplete. Others stop trusting your commitments.`,
        alternative: `Say yes to initiating, but also commit to one milestone where you'll hand off officially. Make the transition intentional, not sudden.`,
        sources: ["Initiator"]
      };
    }

    if (isBuilder) {
      return {
        situation: "Opportunity to Lead or Step Up",
        likely: `You take time to build the right foundation. You think through structure and process. Others see you as slow, but your systems actually scale. You create infrastructure others can build on.`,
        trap: `By the time your foundation is perfect, the window has passed. You're building yesterday's solution.`,
        alternative: `Build 70% of the structure in half the time. Launch with that. Iterate the remaining 30% while others are using it.`,
        sources: ["Builder"]
      };
    }
  }

  return null;
}

export function generateBehaviorPredictions(
  signals: SoulSignals,
  coreDrivers: CoreDriver[]
): BehaviorPrediction[] {
  const situations = [
    "public_criticism",
    "decision_under_pressure",
    "intimate_conflict",
    "leadership_moment",
  ];

  const predictions: BehaviorPrediction[] = [];

  for (const situation of situations) {
    const prediction = predictBehaviorInSituation(situation, signals, coreDrivers);
    if (prediction) {
      predictions.push(prediction);
    }
  }

  return predictions;
}

/**
 * Format predictions for display in UI.
 * Shows: Situation | What you'll likely do | The trap | Try instead
 */
export function formatPredictionForUI(p: BehaviorPrediction): {
  situation: string;
  likely: string;
  trap: string;
  alternative: string;
} {
  return {
    situation: p.situation,
    likely: p.likely,
    trap: p.trap,
    alternative: p.alternative,
  };
}
