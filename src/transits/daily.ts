import type { DailyCard } from "../types/soulcodex";
import { calculateActiveTransits, extractNatalPositions } from "../../transits";
import type { ActiveTransits } from "../../transits";

export type { DailyCard };

export const DECISION_STYLES = {
  CALM_LOGIC: "Calm Logic",
  IMMEDIATE_ACTION: "Immediate Action",
  COLLABORATIVE: "Collaborative",
  REFLECTIVE: "Reflective",
} as const;

export type TransitInput = {
  phase: string;
  decisionStyle: string;
  astrologyData?: any;
};

function buildDoList(transits: ActiveTransits): string[] {
  const items: string[] = [];
  const dominated = transits.dominantTheme.toLowerCase();

  if (dominated.includes("discipline") || dominated.includes("structure"))
    items.push("focus on long-term structure");
  if (dominated.includes("transformation") || dominated.includes("shadow"))
    items.push("confront what you've been avoiding");
  if (dominated.includes("expansion") || dominated.includes("growth"))
    items.push("say yes to new opportunities");
  if (dominated.includes("awakening") || dominated.includes("liberation"))
    items.push("break one unnecessary routine");
  if (dominated.includes("spiritual") || dominated.includes("surrender"))
    items.push("trust intuition over logic today");

  items.push("protect mental bandwidth");
  items.push("complete unfinished work");

  return items.slice(0, 4);
}

function buildDontList(transits: ActiveTransits): string[] {
  const items: string[] = [];
  const highIntensity = transits.transits.filter(t => t.intensity === "high");

  if (highIntensity.length > 0) items.push("rush major decisions");
  if (transits.overallIntensity > 60) items.push("ignore emotional signals");
  if (highIntensity.some(t => t.planet === "Pluto")) items.push("force control over outcomes");
  if (highIntensity.some(t => t.planet === "Neptune")) items.push("make binding commitments");
  if (highIntensity.some(t => t.planet === "Uranus")) items.push("resist all change");

  items.push("overcommit your energy");

  return items.slice(0, 4);
}

function buildDecisionAdvice(decisionStyle: string, transits: ActiveTransits): string {
  const intensity = transits.overallIntensity;

  if (intensity > 70) {
    return "High-intensity transits active. Delay irreversible decisions if possible.";
  }

  if (decisionStyle === DECISION_STYLES.CALM_LOGIC) {
    return "Step back and analyze before acting. Your logic is supported today.";
  }
  if (decisionStyle === DECISION_STYLES.REFLECTIVE) {
    return "Take space to process. Clarity comes through patience, not speed.";
  }
  if (decisionStyle === DECISION_STYLES.COLLABORATIVE) {
    return "Seek input from trusted people. Perspective matters more than speed.";
  }
  return "Trust instinct but avoid impulse. Pause before committing.";
}

export function dailyCard(input: TransitInput): DailyCard {
  const natalPositions = input.astrologyData
    ? extractNatalPositions(input.astrologyData)
    : null;

  if (natalPositions && Object.keys(natalPositions).length > 0) {
    const transits = calculateActiveTransits(natalPositions);

    const topTransit = transits.transits[0];
    const focusTheme = topTransit
      ? `${topTransit.planet} ${topTransit.aspect} your ${topTransit.natalPlanet} — ${transits.dominantTheme.split(",")[0].trim().toLowerCase()}`
      : transits.dominantTheme;

    return {
      focus: `${input.phase} phase. Transit focus: ${focusTheme}.`,
      do: buildDoList(transits),
      dont: buildDontList(transits),
      watchouts: transits.transits
        .filter(t => t.intensity === "high")
        .slice(0, 3)
        .map(t => `${t.planet} ${t.aspect} ${t.natalPlanet} (${t.orb.toFixed(1)}° orb)`),
      decisionAdvice: buildDecisionAdvice(input.decisionStyle, transits),
    };
  }

  return {
    focus: `Operate within the ${input.phase} phase energy.`,
    do: [
      "prioritize clarity",
      "complete unfinished work",
      "protect mental bandwidth",
    ],
    dont: ["overcommit", "ignore signals", "rush major decisions"],
    decisionAdvice:
      input.decisionStyle === DECISION_STYLES.CALM_LOGIC
        ? "Step back and analyze before acting."
        : "Trust instinct but avoid impulse.",
  };
}
