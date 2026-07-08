import type { SoulSignals } from "../types";

export interface SystemInteraction {
  system1: string;
  system2: string;
  type: "reinforcement" | "balance" | "conflict";
  intensity: "high" | "medium" | "low";
  explanation: string;
}

/**
 * Layer 2: Synergy Engine
 *
 * Analyzes how all personality systems interact with each other.
 * Classifies each pair as:
 * - REINFORCEMENT: systems amplify each other
 * - BALANCE: one system softens another
 * - CONFLICT: systems create internal tension
 */

function findReinforcements(s: SoulSignals): SystemInteraction[] {
  const reinforcements: SystemInteraction[] = [];

  // Sun + Moon same sign (e.g., Virgo Sun + Virgo Moon)
  if (s.sunSign === s.moonSign) {
    reinforcements.push({
      system1: `${s.sunSign} Sun`,
      system2: `${s.moonSign} Moon`,
      type: "reinforcement",
      intensity: "high",
      explanation: `Your conscious identity and emotional core align on ${s.sunSign}. You operate from a unified place — what you want matches what you feel.`
    });
  }

  // Life Path + Sun alignment patterns
  if (s.lifePath === 4 && ["Virgo", "Capricorn", "Taurus"].includes(s.sunSign)) {
    reinforcements.push({
      system1: `Life Path ${s.lifePath}`,
      system2: `${s.sunSign} Sun`,
      type: "reinforcement",
      intensity: "high",
      explanation: `Your LP4 builder nature and ${s.sunSign} structure-orientation reinforce each other. You naturally move toward systems, order, and long-term construction.`
    });
  }

  // Life Path 9 + introspective placements
  if (s.lifePath === 9 && ["Pisces", "Scorpio", "Cancer"].includes(s.sunSign)) {
    reinforcements.push({
      system1: `Life Path ${s.lifePath}`,
      system2: `${s.sunSign} Sun`,
      type: "reinforcement",
      intensity: "medium",
      explanation: `Your LP9 completion phase and ${s.sunSign} depth combine naturally. You're drawn to closure, wisdom extraction, and understanding endings.`
    });
  }

  // Impulse decision style + Action-oriented Sun (fire signs)
  if (s.decisionStyle?.includes("impulse") && ["Aries", "Leo", "Sagittarius"].includes(s.sunSign)) {
    reinforcements.push({
      system1: `${s.sunSign} Sun`,
      system2: "Impulse Decision Style",
      type: "reinforcement",
      intensity: "high",
      explanation: `Your ${s.sunSign} fire and impulse decision-making align. You're built to act fast without overthinking — your instinct is your guide.`
    });
  }

  return reinforcements;
}

function findBalances(s: SoulSignals): SystemInteraction[] {
  const balances: SystemInteraction[] = [];

  // Water Sun + Air Moon (emotions + thinking)
  if (["Cancer", "Scorpio", "Pisces"].includes(s.sunSign) &&
      ["Gemini", "Aquarius", "Libra"].includes(s.moonSign)) {
    balances.push({
      system1: `${s.sunSign} Sun`,
      system2: `${s.moonSign} Moon`,
      type: "balance",
      intensity: "high",
      explanation: `Your ${s.sunSign} emotional depth is grounded by ${s.moonSign} mental clarity. You feel things deeply but can think about them clearly — this is your steadying force.`
    });
  }

  // Fire Sun + Earth Moon (passion + practicality)
  if (["Aries", "Leo", "Sagittarius"].includes(s.sunSign) &&
      ["Taurus", "Virgo", "Capricorn"].includes(s.moonSign)) {
    balances.push({
      system1: `${s.sunSign} Sun`,
      system2: `${s.moonSign} Moon`,
      type: "balance",
      intensity: "high",
      explanation: `Your ${s.sunSign} fire is tempered by ${s.moonSign} earth. Your enthusiasm is grounded in practical reality — you want big things but won't ignore the logistics.`
    });
  }

  // Life Path 1 (initiator) + Withdraw pressure style (pause-first)
  if (s.lifePath === 1 && s.pressureStyle?.includes("withdraw")) {
    balances.push({
      system1: `Life Path 1`,
      system2: "Withdraw Pressure Style",
      type: "balance",
      intensity: "medium",
      explanation: `Your LP1 drive to initiate is balanced by your tendency to withdraw under pressure. You move fast, then need silence to recalibrate. Both are real.`
    });
  }

  // Adapt pressure style + Analysis decision style
  if (s.pressureStyle?.includes("adapt") && s.decisionStyle?.includes("analysis")) {
    balances.push({
      system1: "Adapt Pressure Style",
      system2: "Analysis Decision Style",
      type: "balance",
      intensity: "medium",
      explanation: `Your flexibility under pressure is slowed by your need to analyze before committing. You adapt the surface but check the logic before moving. This tension is your safety mechanism.`
    });
  }

  return balances;
}

function findConflicts(s: SoulSignals): SystemInteraction[] {
  const conflicts: SystemInteraction[] = [];

  // Cancer Moon wants closeness + Aquarius Sun wants independence
  if (s.sunSign === "Aquarius" && s.moonSign === "Cancer") {
    conflicts.push({
      system1: "Aquarius Sun",
      system2: "Cancer Moon",
      type: "conflict",
      intensity: "high",
      explanation: `Your Aquarius need for independence clashes with your Cancer need for emotional safety. You want freedom AND closeness. This is your core internal friction.`
    });
  }

  // Gemini Sun needs variety + Taurus Moon needs stability
  if (s.sunSign === "Gemini" && s.moonSign === "Taurus") {
    conflicts.push({
      system1: "Gemini Sun",
      system2: "Taurus Moon",
      type: "conflict",
      intensity: "high",
      explanation: `Your Gemini restlessness conflicts with your Taurus anchor. You want to explore AND stay put. You crave change but need stability to feel safe.`
    });
  }

  // Life Path 5 (freedom) vs Life Path 6 (responsibility)
  if ((s.lifePath === 5 || s.lifePath === 6) &&
      ((s.sunSign === "Aquarius" && s.lifePath === 6) ||
       (s.sunSign === "Cancer" && s.lifePath === 5))) {
    conflicts.push({
      system1: `Life Path ${s.lifePath}`,
      system2: `${s.sunSign} Sun`,
      type: "conflict",
      intensity: "medium",
      explanation: `Your LP${s.lifePath} impulse (${s.lifePath === 5 ? "freedom" : "responsibility"}) conflicts with your ${s.sunSign} nature (${s.sunSign === "Aquarius" ? "independence" : "care"}). Both are pulling you in real directions.`
    });
  }

  // Fight pressure style + Sensitive social energy
  if (s.pressureStyle?.includes("fight") && s.socialEnergy?.includes("sensitive")) {
    conflicts.push({
      system1: "Fight Pressure Style",
      system2: "Sensitive Social Energy",
      type: "conflict",
      intensity: "high",
      explanation: `You want to fight your way through obstacles, but you're also monitoring the room's emotional temperature. You escalate AND absorb — this is why you feel torn in conflict.`
    });
  }

  // Impulse decision style + Virgo Sun (analysis)
  if (s.decisionStyle?.includes("impulse") && s.sunSign === "Virgo") {
    conflicts.push({
      system1: "Impulse Decision Style",
      system2: "Virgo Sun",
      type: "conflict",
      intensity: "high",
      explanation: `Your impulse to move fast conflicts with your Virgo need to analyze every detail. You want to act AND verify. You move, then second-guess yourself.`
    });
  }

  // Perform pressure style + Bursts social energy (can't sustain the performance)
  if (s.pressureStyle?.includes("perform") && s.socialEnergy?.includes("bursts")) {
    conflicts.push({
      system1: "Perform Pressure Style",
      system2: "Bursts Social Energy",
      type: "conflict",
      intensity: "high",
      explanation: `You're built to over-perform in a crisis, but you crash hard after. You give everything, then need complete isolation. The intensity and recovery cycle creates whiplash.`
    });
  }

  return conflicts;
}

export function analyzeSynergy(s: SoulSignals): SystemInteraction[] {
  const reinforcements = findReinforcements(s);
  const balances = findBalances(s);
  const conflicts = findConflicts(s);

  // Sort by intensity, then by type
  const all = [...reinforcements, ...balances, ...conflicts];

  all.sort((a, b) => {
    const intensityOrder = { high: 0, medium: 1, low: 2 };
    if (intensityOrder[a.intensity] !== intensityOrder[b.intensity]) {
      return intensityOrder[a.intensity] - intensityOrder[b.intensity];
    }
    const typeOrder = { reinforcement: 0, balance: 1, conflict: 2 };
    return typeOrder[a.type] - typeOrder[b.type];
  });

  return all;
}

/**
 * Build UI-friendly section summaries
 */
export function buildSynergySection(interactions: SystemInteraction[], type: "reinforcement" | "balance" | "conflict"): string {
  const filtered = interactions.filter(i => i.type === type);

  if (filtered.length === 0) return "";

  const titles = {
    reinforcement: "What Amplifies You",
    balance: "What Stabilizes You",
    conflict: "Internal Tensions You're Managing"
  };

  const explanations = filtered.map(i => i.explanation);

  return `${titles[type]}\n\n${explanations.join("\n\n")}`;
}
