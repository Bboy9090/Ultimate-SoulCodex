import type { DailyCard, TransitDetail } from "../types/soulcodex";
import { calculateActiveTransits, extractNatalPositions } from "../../transits";
import type { ActiveTransits, Transit } from "../../transits";

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

const TRANSIT_AFFECTS: Record<string, string> = {
  Pluto: "power dynamics, hidden motivations, and deep emotional patterns",
  Neptune: "intuition, boundaries, and emotional clarity",
  Uranus: "routines, freedom, and sudden realizations",
  Saturn: "discipline, commitments, and long-term structure",
  Jupiter: "confidence, opportunities, and risk tolerance",
};

const TRANSIT_EXAMPLES: Record<string, Record<string, string>> = {
  Pluto: {
    Conjunction: "You may feel an intense need to control a situation at work or in a relationship. The harder you grip, the more it slips.",
    Opposition: "Someone pushes back on something you assumed was settled. The tension reveals what you've been avoiding.",
    Square: "A power struggle surfaces — at work, at home, or internally. Letting go feels like losing, but holding on costs more.",
    Trine: "Deep honesty comes naturally today. A conversation you've avoided may resolve itself with surprising ease.",
    Sextile: "You notice a pattern you usually ignore. Today you have the clarity to name it without reacting.",
  },
  Neptune: {
    Conjunction: "Your usual certainty feels foggy. Decisions that seemed clear yesterday now feel ambiguous. That's the point — sit with it.",
    Opposition: "Someone or something exposes a gap between what you believe and what you do. Uncomfortable but necessary.",
    Square: "You may feel disillusioned about a goal or relationship. The fantasy version is dissolving so the real one can form.",
    Trine: "Your intuition is sharp today. Trust the quiet knowing over the loud reasoning.",
    Sextile: "A small moment of beauty or connection catches you off guard. Pay attention to it.",
  },
  Uranus: {
    Conjunction: "Something you took for granted shifts suddenly. A conversation, a plan, a belief — something breaks open.",
    Opposition: "You feel the pull between stability and freedom. The solution isn't choosing one — it's redesigning the container.",
    Square: "Disruption hits an area where you've been rigid. The chaos is not random — it's targeting the thing you refuse to change.",
    Trine: "A new idea or connection arrives without effort. Your openness to change is rewarded today.",
    Sextile: "A small break from routine leads to an insight. Change one thing about your day and see what happens.",
  },
  Saturn: {
    Conjunction: "The weight of a responsibility feels heavier than usual. This is not punishment — it's the cost of something worth building.",
    Opposition: "External pressure tests what you've built. If the structure is solid, it holds. If not, you'll see the cracks today.",
    Square: "Frustration with limitations hits hard. The obstacle is not in your way — it is your way. Build through it.",
    Trine: "Your discipline pays off today. Something you've been working on quietly starts to show results.",
    Sextile: "A small opportunity rewards consistent effort. Show up and follow through.",
  },
  Jupiter: {
    Conjunction: "Optimism and energy are high. Use it to start something, not just dream about it.",
    Opposition: "You may overcommit or overestimate your capacity. Abundance without boundaries creates waste.",
    Square: "Growth requires friction today. The discomfort means you're stretching into new territory.",
    Trine: "Expansion flows naturally. Say yes to the thing that excites you and scares you equally.",
    Sextile: "A small opportunity for growth presents itself. It won't feel dramatic — but it matters. Take it.",
  },
};

function buildTransitDo(transit: Transit): string[] {
  const planet = transit.planet;
  const items: string[] = [];
  if (planet === "Pluto") items.push("have the honest conversation you've been avoiding", "let go of one thing you're over-controlling");
  if (planet === "Saturn") items.push("finish what you started before starting something new", "honor a commitment even when it's inconvenient");
  if (planet === "Jupiter") items.push("take one calculated risk", "expand a boundary you've outgrown");
  if (planet === "Uranus") items.push("change one thing about your routine", "listen to the idea that feels too different");
  if (planet === "Neptune") items.push("trust a feeling you can't explain yet", "create something without judging it");
  return items.slice(0, 2);
}

function buildTransitAvoid(transit: Transit): string[] {
  const planet = transit.planet;
  const items: string[] = [];
  if (planet === "Pluto") items.push("forcing control over outcomes", "avoiding difficult truths");
  if (planet === "Saturn") items.push("cutting corners on important work", "blaming others for your limitations");
  if (planet === "Jupiter") items.push("overcommitting your time or money", "performing for approval");
  if (planet === "Uranus") items.push("resisting all change out of fear", "making impulsive permanent decisions");
  if (planet === "Neptune") items.push("making binding commitments in confusion", "numbing out instead of feeling through");
  return items.slice(0, 2);
}

function buildTransitDetails(transits: ActiveTransits): TransitDetail[] {
  return transits.transits.slice(0, 3).map((t) => ({
    title: `${t.planet} ${t.aspect} ${t.natalPlanet}`,
    whatItAffects: TRANSIT_AFFECTS[t.planet] || "daily focus and mental clarity",
    realLifeExample: TRANSIT_EXAMPLES[t.planet]?.[t.aspect] || t.interpretation,
    do: buildTransitDo(t),
    avoid: buildTransitAvoid(t),
  }));
}

function buildDoList(transits: ActiveTransits): string[] {
  const items: string[] = [];
  const dominated = transits.dominantTheme.toLowerCase();
  if (dominated.includes("discipline") || dominated.includes("structure")) items.push("focus on long-term structure");
  if (dominated.includes("transformation") || dominated.includes("shadow")) items.push("confront what you've been avoiding");
  if (dominated.includes("expansion") || dominated.includes("growth")) items.push("say yes to new opportunities");
  if (dominated.includes("awakening") || dominated.includes("liberation")) items.push("break one unnecessary routine");
  if (dominated.includes("spiritual") || dominated.includes("surrender")) items.push("trust intuition over logic today");
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
  if (intensity > 70) return "High-intensity transits active. Delay irreversible decisions if possible.";
  if (decisionStyle === DECISION_STYLES.CALM_LOGIC) return "Step back and analyze before acting. Your logic is supported today.";
  if (decisionStyle === DECISION_STYLES.REFLECTIVE) return "Take space to process. Clarity comes through patience, not speed.";
  if (decisionStyle === DECISION_STYLES.COLLABORATIVE) return "Seek input from trusted people. Perspective matters more than speed.";
  return "Trust instinct but avoid impulse. Pause before committing.";
}

export function dailyCard(input: TransitInput): DailyCard {
  const natalPositions = input.astrologyData ? extractNatalPositions(input.astrologyData) : null;

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
      watchouts: transits.transits.filter(t => t.intensity === "high").slice(0, 3)
        .map(t => `${t.planet} ${t.aspect} ${t.natalPlanet} (${t.orb.toFixed(1)}° orb)`),
      transits: buildTransitDetails(transits),
      decisionAdvice: buildDecisionAdvice(input.decisionStyle, transits),
    };
  }

  return {
    focus: `Focus on the themes of the ${input.phase} phase.`,
    do: ["prioritize clarity", "complete unfinished work", "protect mental bandwidth"],
    dont: ["overcommit", "ignore signals", "rush major decisions"],
    decisionAdvice: input.decisionStyle === DECISION_STYLES.CALM_LOGIC
      ? "Step back and analyze before acting."
      : "Trust instinct but avoid impulse.",
  };
}
