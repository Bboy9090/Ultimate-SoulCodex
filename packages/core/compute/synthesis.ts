import type { SoulSignals, Synthesis } from "../types.js";
import { stressNotes } from "./elements.js";
import { deriveMoralCode } from "./moral.js";

function buildCoreEssence(s: SoulSignals): string {
  const parts: string[] = [];
  
  parts.push("WHAT THIS IS:");
  parts.push("Your Core Essence is the absolute baseline of who you are—your deepest drives, your gut instincts, and the blueprint of your life's path.");
  
  parts.push("\nWHAT THIS MEANS FOR YOU:");
  if (s.sunSign && s.moonSign) {
    parts.push(`You lead with that ${s.sunSign} drive, but you're really processing the whole world through your ${s.moonSign} instincts. The combination means you're operating on a frequency a lot of folks can't match.`);
  } else {
    parts.push(`You operate on a unique frequency built around your life path and natural instincts.`);
  }
  
  parts.push("\nHOW THIS SHOWS UP IN YOUR LIFE:");
  parts.push(`- You naturally move with a "${s.socialEnergy}" social energy.`);
  if (s.sunSign) parts.push(`- When it's time to take action, your ${s.sunSign} energy takes the wheel unquestioned.`);
  
  parts.push("\nWHY THIS MATTERS:");
  parts.push("Look, understanding your core essence means you can stop fighting your own nature. Once you know how you're built, you stop letting other people tell you how you should operate. You run your own system.");
  
  return parts.join("\n");
}

function buildStressPattern(s: SoulSignals): string {
  const parts: string[] = [];
  const notes = stressNotes(s.stressElement);
  
  const pressure: Record<string, string> = {
    fight: "push harder and confront whatever is in your way.",
    freeze: "lock up emotionally and wait until you can think clearly.",
    adapt: "shift your strategy and find another angle fast.",
    withdraw: "pull back entirely, protect your peace, and recharge in isolation.",
    perform: "raise your game, flip a switch, and refuse to let the pressure win.",
  };
  const pNote = pressure[s.pressureStyle] ?? pressure.adapt;
  
  parts.push("WHAT THIS IS:");
  parts.push("Your Stress Pattern shows exactly how your nervous system and energy field react when the pressure gets turned up.");
  
  parts.push("\nWHAT THIS MEANS FOR YOU:");
  parts.push(`Under stress, ${notes?.toLowerCase() || 'you react deeply'}. When things get wild, your default move is to ${pNote}`);
  
  parts.push("\nHOW THIS SHOWS UP IN YOUR LIFE:");
  parts.push(`- When deadlines hit or conflicts spark, you instantly default to "${s.pressureStyle}".`);
  parts.push(`- People might misunderstand your reaction, thinking it's about them when it's really just your internal security system kicking in.`);
  
  parts.push("\nWHY THIS MATTERS:");
  parts.push("If you don't know your stress pattern, your stress pattern owns you. Knowing that you default to this behavior means you can catch yourself in the act, take a breath, and choose how to respond instead of just reacting off survival instincts.");
  
  return parts.join("\n");
}

function buildRelationshipPattern(s: SoulSignals): string {
  const parts: string[] = [];
  
  const social: Record<string, string> = {
    steady: "show up consistently — people know exactly what they're getting from you.",
    bursts: "connect extremely intensely, but then you absolutely need space to recharge.",
    sensitive: "absorb other people's energy like a sponge, so you have to be highly protective of who you let in.",
  };
  const decision: Record<string, string> = {
    gut: "trust your gut and commit fast when it feels right.",
    analysis: "weigh everything carefully and overthink before letting someone get too close.",
    consensus: "need to bounce ideas off the people you trust before making big relationship moves.",
    impulse: "jump straight in head-first and try to figure it out as you go.",
    avoidance: "wait until you absolutely have to decide, which can seriously frustrate the people dealing with you.",
  };
  
  const s1 = social[s.socialEnergy] ?? social.steady;
  const d1 = decision[s.decisionStyle] ?? decision.gut;
  
  parts.push("WHAT THIS IS:");
  parts.push("Your Relationship Pattern dictates how you give your energy to others and how you calculate the risk of letting people in.");
  
  parts.push("\nWHAT THIS MEANS FOR YOU:");
  parts.push(`In your connections, you ${s1} And when it comes to deciding who gets to stay in your life, you ${d1}`);
  
  parts.push("\nHOW THIS SHOWS UP IN YOUR LIFE:");
  parts.push(`- You operate on a "${s.socialEnergy}" social battery.`);
  parts.push(`- When navigating friendships or romances, your "${s.decisionStyle}" decision style runs the show behind the scenes.`);
  
  parts.push("\nWHY THIS MATTERS:");
  parts.push("Relationships are where we lose the most energy if we aren't careful. Knowing how you connect and how you decide who deserves your time keeps you from getting drained by people who don't belong in your inner circle.");
  
  return parts.join("\n");
}
function buildPowerMode(s: SoulSignals): string {
  const partsOut: string[] = [];

  const goalMap: Record<string, string> = {
    "build something": "create something tangible that lasts",
    "build_something": "create something tangible that lasts",
    "understand life": "figure out how things work at a deep level",
    "understand_life": "figure out how things work at a deep level",
    "help others": "make someone else's life better",
    "help_others": "make someone else's life better",
    "freedom": "secure total room to move without restrictions",
    "influence": "shape how things go instead of just participating",
    "stability": "build an absolute foundation of safety first before expanding",
  };
  const partsInner = s.goals.map((g) => goalMap[g.toLowerCase()] ?? g);
  
  partsOut.push("WHAT THIS IS:");
  partsOut.push("Your Power Mode dictates what you're actually built to achieve in this lifetime.");
  
  partsOut.push("\nWHAT THIS MEANS FOR YOU:");
  partsOut.push(partsInner.length > 0 ? `You feel most alive and in your absolute element when you're able to ${partsInner.join(" and ")}.` : "You're still discovering what you're built to achieve.");
  
  partsOut.push("\nHOW THIS SHOWS UP IN YOUR LIFE:");
  if (partsInner.length > 0) partsOut.push(`- Whenever you lack the ability to ${partsInner[0]}, you probably feel unmotivated or stuck.`);
  partsOut.push(`- You structure your biggest goals around these core drives, whether you realize it or not.`);
  
  partsOut.push("\nWHY THIS MATTERS:");
  partsOut.push("If you lock into a career or a path that doesn't let you access your Power Mode, you're going to burn out. Stop chasing society's definition of success and focus strictly on what you're actually built for.");
  
  return partsOut.join("\n");
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
