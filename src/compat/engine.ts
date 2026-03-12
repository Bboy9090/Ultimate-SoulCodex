import type { SoulProfile } from "../types/soulcodex";

export type CompatPerson = {
  name?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  venusSign?: string;
  marsSign?: string;
  lifePath?: number;
  themes?: string[];
  driver?: string;
  stressStyle?: string;
  decisionStyle?: string;
  values?: string[];
  intolerances?: string[];
  hdType?: string;
};

export type FrictionZone = {
  area: string;
  description: string;
  repair: string;
};

export type CompatAnalysis = {
  score: number;
  sharedThemes: string[];
  stressClash: string;
  frictionZones: FrictionZone[];
  chemistry: string;
  growthEdge: string;
  summary: string;
};

const SIGN_ELEMENT: Record<string, string> = {
  Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
  Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
  Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water",
};

const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  fire:  { fire: 8, air: 9, earth: 4, water: 3 },
  earth: { earth: 7, water: 8, fire: 4, air: 5 },
  air:   { air: 7, fire: 9, water: 4, earth: 5 },
  water: { water: 7, earth: 8, fire: 3, air: 4 },
};

function extractPerson(profile: SoulProfile | any): CompatPerson {
  const chart = profile?.chart || {};
  const astro = profile?.astrologyData || profile;
  return {
    name: profile?.birth?.name || profile?.name || "",
    sunSign: chart?.sun?.sign || astro?.sunSign || "",
    moonSign: chart?.moon?.sign || astro?.moonSign || "",
    risingSign: chart?.rising?.sign || astro?.risingSign || "",
    venusSign: chart?.venus?.sign || astro?.planets?.venus?.sign || "",
    marsSign: chart?.mars?.sign || astro?.planets?.mars?.sign || "",
    lifePath: profile?.numerology?.lifePath || profile?.numerologyData?.lifePath || 0,
    themes: profile?.themes?.topThemes || profile?.archetypeData?.themes || [],
    driver: profile?.mirror?.driver || profile?.synthesis?.moralCode?.name || "",
    stressStyle: profile?.mirror?.shadowTrigger || "",
    decisionStyle: profile?.mirror?.decisionStyle || "",
    values: profile?.morals?.values || profile?.moralCompassData?.coreValues || [],
    intolerances: profile?.morals?.intolerances || profile?.moralCompassData?.intolerances || [],
    hdType: profile?.humanDesign?.type || profile?.humanDesignData?.type || "",
  };
}

function scoreElementCompat(a: CompatPerson, b: CompatPerson): number {
  let total = 0;
  let count = 0;
  const pairs: [string | undefined, string | undefined][] = [
    [a.sunSign, b.sunSign],
    [a.moonSign, b.moonSign],
    [a.venusSign, b.marsSign],
    [a.marsSign, b.venusSign],
    [a.moonSign, b.venusSign],
  ];
  for (const [s1, s2] of pairs) {
    if (!s1 || !s2) continue;
    const e1 = SIGN_ELEMENT[s1];
    const e2 = SIGN_ELEMENT[s2];
    if (e1 && e2) {
      total += ELEMENT_COMPAT[e1]?.[e2] || 5;
      count++;
    }
  }
  return count > 0 ? Math.round(total / count * 10) : 50;
}

function findSharedThemes(a: CompatPerson, b: CompatPerson): string[] {
  const aSet = new Set((a.themes || []).map(t => t.toLowerCase()));
  return (b.themes || []).filter(t => aSet.has(t.toLowerCase()));
}

function analyzeStressClash(a: CompatPerson, b: CompatPerson): string {
  if (!a.stressStyle && !b.stressStyle) return "Stress patterns not fully mapped yet. Complete both profiles for deeper insight.";
  if (a.stressStyle === b.stressStyle) {
    return `Both tend toward ${a.stressStyle.toLowerCase()} under pressure. When stressed simultaneously, this pattern amplifies — you may both withdraw, both escalate, or both shut down at the same time. The fix: one person breaks the cycle first.`;
  }
  return `Under pressure, one person tends toward ${a.stressStyle?.toLowerCase() || "internal processing"} while the other moves toward ${b.stressStyle?.toLowerCase() || "external reaction"}. This mismatch can feel like one person is "too much" and the other is "not enough." The key: name the pattern out loud before it becomes a fight.`;
}

function buildFrictionZones(a: CompatPerson, b: CompatPerson): FrictionZone[] {
  const zones: FrictionZone[] = [];

  const moonA = SIGN_ELEMENT[a.moonSign || ""] || "";
  const moonB = SIGN_ELEMENT[b.moonSign || ""] || "";
  if (moonA && moonB && ELEMENT_COMPAT[moonA]?.[moonB] !== undefined && ELEMENT_COMPAT[moonA][moonB] < 5) {
    zones.push({
      area: "Emotional processing",
      description: `${a.moonSign} Moon processes emotions through ${moonA === "fire" ? "action" : moonA === "earth" ? "stability" : moonA === "air" ? "analysis" : "feeling"}. ${b.moonSign} Moon processes through ${moonB === "fire" ? "action" : moonB === "earth" ? "stability" : moonB === "air" ? "analysis" : "feeling"}. These styles can feel foreign to each other.`,
      repair: "Don't try to process the same way. Give each other permission to handle emotions differently. Check in after processing, not during.",
    });
  }

  if (a.decisionStyle && b.decisionStyle && a.decisionStyle !== b.decisionStyle) {
    zones.push({
      area: "Decision-making",
      description: `One person decides through ${a.decisionStyle.toLowerCase()}, the other through ${b.decisionStyle.toLowerCase()}. This creates friction when choices need to be made together — one feels rushed, the other feels stalled.`,
      repair: "Agree on a decision timeline before discussing the options. Remove time pressure from the conversation and focus on the criteria each person needs to feel confident.",
    });
  }

  const aIntol = new Set((a.intolerances || []).map(i => i.toLowerCase()));
  const bIntol = new Set((b.intolerances || []).map(i => i.toLowerCase()));
  const sharedIntol = [...aIntol].filter(i => bIntol.has(i));
  if (sharedIntol.length > 0) {
    zones.push({
      area: "Shared triggers",
      description: `Both people are triggered by ${sharedIntol.join(" and ")}. When this shows up in the relationship, both partners escalate simultaneously because neither can absorb the other's reaction.`,
      repair: "Identify the trigger before it fires. Create a shared signal — a word or gesture — that means 'this is the trigger, not you.' Pause before responding.",
    });
  }

  if (a.values?.length && b.values?.length) {
    const aVals = new Set(a.values.map(v => v.toLowerCase()));
    const mismatched = b.values.filter(v => !aVals.has(v.toLowerCase()));
    if (mismatched.length > 1) {
      zones.push({
        area: "Values alignment",
        description: `The values that matter most to each person don't fully overlap. One prioritizes ${a.values[0]?.toLowerCase() || "stability"}, the other prioritizes ${mismatched[0]?.toLowerCase() || "freedom"}. This creates quiet friction that builds over time.`,
        repair: "Name the values gap explicitly. You don't need identical values — you need to understand which ones are non-negotiable for each person and respect the difference.",
      });
    }
  }

  if (zones.length === 0) {
    zones.push({
      area: "Communication timing",
      description: "No major structural friction detected, but all relationships face timing mismatches — when one person needs to talk and the other needs space.",
      repair: "Establish a check-in rhythm. Don't wait for pressure to build. A 5-minute honest conversation weekly prevents most unnecessary fights.",
    });
  }

  return zones;
}

function buildChemistry(a: CompatPerson, b: CompatPerson): string {
  const venusA = SIGN_ELEMENT[a.venusSign || ""] || "";
  const marsB = SIGN_ELEMENT[b.marsSign || ""] || "";
  const venusB = SIGN_ELEMENT[b.venusSign || ""] || "";
  const marsA = SIGN_ELEMENT[a.marsSign || ""] || "";

  if ((venusA === "fire" && marsB === "fire") || (venusB === "fire" && marsA === "fire")) {
    return "Strong physical and creative chemistry. The connection is direct, passionate, and action-oriented. Risk: intensity without depth.";
  }
  if ((venusA === "water" && marsB === "water") || (venusB === "water" && marsA === "water")) {
    return "Deep emotional chemistry. The connection is intuitive and absorbing. Risk: boundary dissolution and emotional codependence.";
  }
  if ((venusA === "air" && marsB === "fire") || (venusB === "air" && marsA === "fire")) {
    return "Stimulating chemistry. Ideas and action feed each other. Risk: moving fast on concepts without grounding them in reality.";
  }
  if ((venusA === "earth" && marsB === "water") || (venusB === "earth" && marsA === "water")) {
    return "Steady, nurturing chemistry. The connection builds slowly but holds. Risk: comfort becoming stagnation.";
  }
  return "Moderate chemistry with room to build. The connection grows through shared experiences rather than instant spark.";
}

function buildGrowthEdge(a: CompatPerson, b: CompatPerson): string {
  if (a.hdType === "Projector" || b.hdType === "Projector") {
    return "One partner sees patterns the other misses. The growth edge: learning to receive insight without feeling criticized, and learning to offer guidance without forcing it.";
  }
  if (a.lifePath === 1 || b.lifePath === 1) {
    return "Independence vs. partnership is the growth edge. One person needs autonomy to function; the other needs closeness. The work: creating a relationship that supports both without sacrifice.";
  }
  return "The growth edge is learning to stay honest when honesty feels risky, and staying present when the instinct is to withdraw.";
}

export function analyzeFullCompatibility(profileA: any, profileB: any): CompatAnalysis {
  const a = extractPerson(profileA);
  const b = extractPerson(profileB);

  const elementScore = scoreElementCompat(a, b);
  const shared = findSharedThemes(a, b);
  const themeBonus = shared.length * 3;
  const driverBonus = a.driver && a.driver === b.driver ? 8 : 0;
  const score = Math.max(10, Math.min(98, elementScore + themeBonus + driverBonus));

  return {
    score,
    sharedThemes: shared,
    stressClash: analyzeStressClash(a, b),
    frictionZones: buildFrictionZones(a, b),
    chemistry: buildChemistry(a, b),
    growthEdge: buildGrowthEdge(a, b),
    summary: `Compatibility score: ${score}%. ${shared.length > 0 ? `Shared themes: ${shared.join(", ")}. ` : ""}${score > 70 ? "Strong natural alignment with manageable friction." : score > 50 ? "Workable connection that requires conscious effort in the friction zones." : "Significant differences that create growth potential but require honest communication."}`,
  };
}
