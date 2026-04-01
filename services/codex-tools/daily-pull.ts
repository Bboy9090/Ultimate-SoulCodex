/**
 * Daily Pull — Tarot + Transit + Archetype fused into one output.
 * Not three systems arguing. One intelligence speaking.
 */

import type { CodexToolResult, ProfileInput } from "./types";
import { extractCore } from "./types";

const MAJOR_ARCANA = [
  { name: "The Fool", theme: "new beginnings", behavior: "starting something without overthinking", shadow: "recklessness" },
  { name: "The Magician", theme: "focused action", behavior: "using available resources deliberately", shadow: "manipulation" },
  { name: "The High Priestess", theme: "intuition", behavior: "trusting the quiet signal over the loud one", shadow: "passivity" },
  { name: "The Empress", theme: "creation", behavior: "nurturing what you've already started", shadow: "overgiving" },
  { name: "The Emperor", theme: "structure", behavior: "setting boundaries and enforcing them", shadow: "rigidity" },
  { name: "The Hierophant", theme: "learning", behavior: "seeking guidance from someone who's done it", shadow: "blind conformity" },
  { name: "The Lovers", theme: "choice", behavior: "making a values-based decision", shadow: "avoidance" },
  { name: "The Chariot", theme: "willpower", behavior: "pushing through despite discomfort", shadow: "bulldozing" },
  { name: "Strength", theme: "patience", behavior: "holding steady when you want to react", shadow: "suppression" },
  { name: "The Hermit", theme: "reflection", behavior: "stepping back to observe before acting", shadow: "isolation" },
  { name: "Wheel of Fortune", theme: "cycles", behavior: "recognizing that this phase is temporary", shadow: "fatalism" },
  { name: "Justice", theme: "accountability", behavior: "addressing what you've been avoiding", shadow: "harshness" },
  { name: "The Hanged Man", theme: "perspective shift", behavior: "pausing your default response", shadow: "stagnation" },
  { name: "Death", theme: "ending", behavior: "releasing something that's finished", shadow: "clinging" },
  { name: "Temperance", theme: "balance", behavior: "finding the middle path between extremes", shadow: "over-compromise" },
  { name: "The Devil", theme: "attachment", behavior: "noticing what you're clinging to out of habit", shadow: "denial" },
  { name: "The Tower", theme: "disruption", behavior: "letting a failing structure collapse", shadow: "panic" },
  { name: "The Star", theme: "hope", behavior: "rebuilding with a clear vision", shadow: "naivety" },
  { name: "The Moon", theme: "uncertainty", behavior: "sitting with confusion instead of forcing answers", shadow: "anxiety" },
  { name: "The Sun", theme: "clarity", behavior: "acting on what you know to be true", shadow: "over-optimism" },
  { name: "Judgement", theme: "reckoning", behavior: "confronting the consequences of past choices", shadow: "self-punishment" },
  { name: "The World", theme: "completion", behavior: "acknowledging what you've built before starting over", shadow: "restlessness" },
];

function getDailyCardIndex(birthDate: string | Date | null, date: Date = new Date()): number {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  let seed = d + m + y;
  if (birthDate) {
    const bd = new Date(birthDate);
    if (!isNaN(bd.getTime())) {
      seed += bd.getDate() + (bd.getMonth() + 1);
    }
  }
  return seed % MAJOR_ARCANA.length;
}

function getTransitSignal(profile: ProfileInput): { planet: string; theme: string; detail: string } {
  try {
    const astro = profile?.astrologyData;
    if (!astro) return { planet: "Moon", theme: "emotional processing", detail: "inner reflection is active" };

    const moonSign = astro?.moonSign || "";
    const sunSign = astro?.sunSign || "";

    const day = new Date().getDay();
    const signals = [
      { planet: "Mercury", theme: "communication clarity", detail: `watch how you express ideas today — your ${sunSign} directness may land harder than intended` },
      { planet: "Venus", theme: "values and connection", detail: `notice what you're drawn to vs. what you're settling for` },
      { planet: "Mars", theme: "drive and conflict", detail: `your energy is high but scattered — channel it into one thing` },
      { planet: "Jupiter", theme: "expansion and risk", detail: `opportunity is present but so is overcommitment` },
      { planet: "Saturn", theme: "discipline and limits", detail: `structure helps today — your ${moonSign || "emotional"} side needs containment, not freedom` },
      { planet: "Moon", theme: "emotional processing", detail: `your ${moonSign || "Moon"} patterns are active — check your reactions before acting` },
      { planet: "Sun", theme: "identity and purpose", detail: `your ${sunSign || "core"} drive is asking for alignment — are you doing what actually matters?` },
    ];

    return signals[day % signals.length];
  } catch {
    return { planet: "Moon", theme: "emotional processing", detail: "inner reflection is active" };
  }
}

export function dailyPull(profile: ProfileInput, date: Date = new Date()): CodexToolResult {
  const core = extractCore(profile);
  const cardIndex = getDailyCardIndex(core.birthDate, date);
  const card = MAJOR_ARCANA[cardIndex];
  const transit = getTransitSignal(profile);

  const observation = `Card: ${card.name}\nTransit signal: ${transit.planet} — ${transit.theme}\nArchetype: ${core.archetype || "Your current pattern"}`;

  const meaning = `${card.name} says today favors ${card.behavior}. ${transit.detail}. ${core.hdType ? `As a ${core.hdType}, your strategy (${core.hdStrategy || "wait for clarity"}) matters more than usual today.` : `Your pattern of ${core.themes[0] || "pattern recognition"} is the lens to use.`} ${core.primaryElement ? `Your ${core.primaryElement} element says: ${core.primaryElement === "Earth" ? "ground yourself physically before deciding" : core.primaryElement === "Water" ? "check your emotional state before responding" : core.primaryElement === "Fire" ? "act on the impulse that has staying power, not the loudest one" : core.primaryElement === "Air" ? "think it through but set a deadline for the thinking" : "balance input with output today"}.` : ""}`;

  const action = `${card.behavior.charAt(0).toUpperCase() + card.behavior.slice(1)}. Watch for ${card.shadow} — that's your trap today.${core.lifePath ? ` Life Path ${core.lifePath} says: ${Number(core.lifePath) <= 3 ? "act on instinct" : Number(core.lifePath) <= 6 ? "build, don't react" : "observe before committing"}.` : ""}`;

  return {
    tool: "daily_pull",
    title: `Daily Pull — ${card.name}`,
    observation,
    meaning,
    action,
    extras: {
      card: card.name,
      cardTheme: card.theme,
      cardShadow: card.shadow,
      transitPlanet: transit.planet,
      transitTheme: transit.theme,
    },
  };
}
