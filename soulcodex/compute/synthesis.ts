import type { SoulSignals, Synthesis } from "../types";
import { stressNotes } from "./elements";
import { deriveMoralCode } from "./moral";

function buildCoreEssence(s: SoulSignals): string {
  const parts: string[] = [];
  if (s.sunSign && s.moonSign) {
    parts.push(`I lead with my ${s.sunSign} drive and process the world through my ${s.moonSign} instincts.`);
  } else if (s.sunSign) {
    parts.push(`I lead with my ${s.sunSign} drive.`);
  } else if (s.moonSign) {
    parts.push(`I process the world through my ${s.moonSign} instincts.`);
  }
  parts.push(`My life path (${s.lifePath}) shapes how I build, and my energy style is ${s.mirrorProfile.energyStyle}.`);
  if (s.mirrorProfile.driver) {
    parts.push(`My core drive is ${s.mirrorProfile.driver}.`);
  }
  return parts.join(" ");
}

function buildStressPattern(s: SoulSignals): string {
  const notes = stressNotes(s.mirrorProfile.energyStyle);
  return `Under stress: ${notes} My default pressure response: ${s.mirrorProfile.decisionStyle}.`;
}

function buildRelationshipPattern(s: SoulSignals): string {
  return `I navigate relationships with a ${s.mirrorProfile.conflictStyle} approach. My energy style is ${s.mirrorProfile.energyStyle}.`;
}

function buildPowerMode(s: SoulSignals): string {
  const goalDescriptions: Record<string, string> = {
    "build something": "driven to create something tangible that lasts",
    "master a craft": "dedicated to mastering a craft",
    "lead others": "compelled to lead and guide others",
    "change systems": "focused on transforming existing systems",
    "help others": "most alive when making someone else's life better",
    "freedom": "seeking ultimate freedom and autonomy",
    "influence": "aiming to shape how things go and make an impact",
    "stability": "building a foundation for lasting stability",
  };
  const parts = s.goals.map(g => goalDescriptions[g.toLowerCase()] || g);
  let powerModeText = parts.length > 0 ? `I am ${parts.join(" and ")}.` : "I am still discovering my true power mode.";
  if (s.mirrorProfile.freedomBuild) {
    powerModeText += ` When I imagine freedom, I build ${s.mirrorProfile.freedomBuild}.`;
  }
  return powerModeText;
}

function buildGrowthEdges(s: SoulSignals): string[] {
  const edges: string[] = [];
  if (s.mirrorProfile.nuance && s.mirrorProfile.nuance.length > 0) {
    edges.push(...s.mirrorProfile.nuance);
  }
  if (s.mirrorProfile.energyStyle.includes("Reflective Solitude")) {
    edges.push("Remember to re-engage after periods of withdrawal; solitude is for recharging, not hiding.");
  }
  if (s.mirrorProfile.shadowTrigger.includes("Authority Conflict")) {
    edges.push("Distinguish between healthy challenge and destructive rebellion in your interactions.");
  }
  if (s.mirrorProfile.decisionStyle.includes("Immediate Action") && s.mirrorProfile.decisionStyle.includes("Calm Logic")) {
    edges.push("Balance your impulse to act with a moment for strategic analysis.");
  }
  if (edges.length === 0) {
    edges.push("Keep testing the edges of what you think you can handle.");
  }
  return edges;
}

export function synthesize(signals: SoulSignals): Synthesis {
  return {
    coreEssence: buildCoreEssence(signals),
    stressPattern: buildStressPattern(signals),
    relationshipPattern: buildRelationshipPattern(signals),
    moralCode: deriveMoralCode(signals.mirrorProfile.conflictStyle, signals.nonNegotiables),
    powerMode: buildPowerMode(signals),
    growthEdges: buildGrowthEdges(signals),
  };
}
