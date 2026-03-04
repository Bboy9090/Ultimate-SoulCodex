import type { SoulSignals, Synthesis } from "../types";
import { stressNotes } from "./elements";
import { deriveMoralCode } from "./moral";

function buildCoreEssence(s: SoulSignals): string {
  const sun = s.sunSign ?? "unknown sign";
  const moon = s.moonSign ?? "unknown moon";
  return (
    `I lead with my ${sun} drive and process the world through my ${moon} instincts. ` +
    `My life path (${s.lifePath}) shapes how I build, and my energy style is ${s.socialEnergy}.`
  );
}

function buildStressPattern(s: SoulSignals): string {
  const notes = stressNotes(s.stressElement);
  const pressure: Record<string, string> = {
    fight: "I push harder and confront whatever is in my way.",
    freeze: "I lock up and wait until I can think clearly.",
    adapt: "I shift strategy and find another angle fast.",
    withdraw: "I pull back, protect my space, and recharge alone.",
    perform: "I raise my game and refuse to let the pressure win.",
  };
  const pNote = pressure[s.pressureStyle] ?? pressure.adapt;
  return `Under stress: ${notes} My default pressure response: ${pNote}`;
}

function buildRelationshipPattern(s: SoulSignals): string {
  const social: Record<string, string> = {
    steady: "I show up consistently — people know what they get from me.",
    bursts: "I connect intensely, then need space to recharge.",
    sensitive: "I absorb other people's energy, so I choose who I let in carefully.",
  };
  const decision: Record<string, string> = {
    gut: "I trust my gut in relationships and commit fast when it feels right.",
    analysis: "I weigh everything carefully before letting someone close.",
    consensus: "I check in with the people I trust before making big relationship moves.",
    impulse: "I jump in and figure it out as I go.",
    avoidance: "I wait until I absolutely have to decide, which can frustrate the people around me.",
  };
  const s1 = social[s.socialEnergy] ?? social.steady;
  const d1 = decision[s.decisionStyle] ?? decision.gut;
  return `${s1} ${d1}`;
}

function buildPowerMode(s: SoulSignals): string {
  const goalMap: Record<string, string> = {
    "build something": "I'm driven to create something tangible that lasts.",
    "build_something": "I'm driven to create something tangible that lasts.",
    "understand life": "I need to figure out how things work at a deep level.",
    "understand_life": "I need to figure out how things work at a deep level.",
    "help others": "I feel most alive when I'm making someone else's life better.",
    "help_others": "I feel most alive when I'm making someone else's life better.",
    "freedom": "I need room to move — restrictions drain me.",
    "influence": "I want to shape how things go, not just participate.",
    "stability": "I build a foundation first, then expand from safety.",
  };
  const parts = s.goals.map((g) => goalMap[g.toLowerCase()] ?? g);
  return parts.join(" ") || "I'm still discovering what I'm built to build.";
}

function buildGrowthEdges(s: SoulSignals): string[] {
  const edges: string[] = [];
  if (s.stressElement === "air")
    edges.push("Slow down the mental loops — not every thought needs action.");
  if (s.stressElement === "fire")
    edges.push("Channel the anger before it burns a bridge you need.");
  if (s.stressElement === "water")
    edges.push("Let the wave pass before you make a decision from the flood.");
  if (s.stressElement === "earth")
    edges.push("Stubbornness is not the same as strength — learn when to bend.");
  if (s.stressElement === "metal")
    edges.push("Cutting people off feels safe, but it costs more than it saves.");

  if (s.decisionStyle === "avoidance")
    edges.push("Delaying a decision is still a decision — own it.");
  if (s.decisionStyle === "impulse")
    edges.push("Speed is your asset, but a two-minute pause won't kill momentum.");

  if (s.socialEnergy === "sensitive")
    edges.push("Other people's moods are data, not your responsibility.");
  if (s.socialEnergy === "bursts")
    edges.push("Warn people when you need space instead of vanishing.");

  if (edges.length === 0)
    edges.push("Keep testing the edges of what you think you can handle.");

  return edges;
}

export function synthesize(signals: SoulSignals): Synthesis {
  return {
    coreEssence: buildCoreEssence(signals),
    stressPattern: buildStressPattern(signals),
    relationshipPattern: buildRelationshipPattern(signals),
    moralCode: deriveMoralCode(signals.pressureStyle, signals.nonNegotiables),
    powerMode: buildPowerMode(signals),
    growthEdges: buildGrowthEdges(signals),
  };
}
