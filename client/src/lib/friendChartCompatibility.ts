import type { AtlasSign } from "./astrologyAtlas";

export type SharedChartPlacement = { key: string; sign: AtlasSign; house?: number };
export type ChartPlacementMatch = {
  key: string;
  yours: SharedChartPlacement;
  theirs: SharedChartPlacement;
  score: number;
  signal: "same sign" | "same element" | "same mode" | "different sign pattern";
  sameHouse: boolean | null;
};

export type FriendPerspectiveInsight = {
  key: string;
  label: string;
  youExperienceThem: string;
  theyExperienceYou: string;
  strength: string;
  watchPoint: string;
  repair: string;
};

const ELEMENT: Record<AtlasSign, string> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};
const MODE: Record<AtlasSign, string> = {
  Aries: "cardinal", Cancer: "cardinal", Libra: "cardinal", Capricorn: "cardinal",
  Taurus: "fixed", Leo: "fixed", Scorpio: "fixed", Aquarius: "fixed",
  Gemini: "mutable", Virgo: "mutable", Sagittarius: "mutable", Pisces: "mutable",
};
const FRIENDSHIP_KEYS = ["moon", "mercury", "venus", "jupiter"] as const;

const FRIENDSHIP_LABELS: Record<(typeof FRIENDSHIP_KEYS)[number], string> = {
  moon: "Emotional rhythm",
  mercury: "Communication",
  venus: "Affection & values",
  jupiter: "Mutual growth",
};

function comparePlacement(yours: SharedChartPlacement, theirs: SharedChartPlacement): ChartPlacementMatch {
  const signal: ChartPlacementMatch["signal"] = yours.sign === theirs.sign
    ? "same sign"
    : ELEMENT[yours.sign] === ELEMENT[theirs.sign]
      ? "same element"
      : MODE[yours.sign] === MODE[theirs.sign]
        ? "same mode"
        : "different sign pattern";
  const signScore = signal === "same sign" ? 100 : signal === "same element" ? 78 : signal === "same mode" ? 65 : 48;
  const sameHouse = typeof yours.house === "number" && typeof theirs.house === "number"
    ? yours.house === theirs.house
    : null;
  const score = Math.min(100, signScore + (sameHouse ? 8 : 0));
  return { key: yours.key, yours, theirs, score, signal, sameHouse };
}

function average(matches: ChartPlacementMatch[]) {
  return matches.length ? Math.round(matches.reduce((sum, match) => sum + match.score, 0) / matches.length) : null;
}

function signStyle(sign: AtlasSign): string {
  const element = ELEMENT[sign];
  if (element === "fire") return "direct, expressive, fast-moving";
  if (element === "earth") return "practical, steady, evidence-minded";
  if (element === "air") return "verbal, curious, idea-driven";
  return "emotionally perceptive, protective, intuitive";
}

function arena(placement: SharedChartPlacement): string {
  return typeof placement.house === "number" ? `House ${placement.house}` : "an unverified house";
}

function directionalSentence(
  key: string,
  observer: SharedChartPlacement,
  other: SharedChartPlacement,
): string {
  const observerStyle = signStyle(observer.sign);
  const otherStyle = signStyle(other.sign);
  const planet = key === "moon"
    ? "emotional reactions"
    : key === "mercury"
      ? "communication"
      : key === "venus"
        ? "care, affection, and values"
        : "growth, encouragement, and possibility";
  return `Your ${observer.sign} style is ${observerStyle}; their ${other.sign} style is ${otherStyle}. You are likely to notice their ${planet} through ${arena(other)}, while your own instinct comes through ${arena(observer)}.`;
}

function buildPerspective(match: ChartPlacementMatch): FriendPerspectiveInsight {
  const key = match.key as (typeof FRIENDSHIP_KEYS)[number];
  const sameHouseText = match.sameHouse
    ? "Because the same house is active for both of you, this theme can feel unusually immediate in the same life arena."
    : "Different houses can make the same symbolic theme land in different parts of life.";

  if (match.signal === "same sign") {
    return {
      key,
      label: FRIENDSHIP_LABELS[key],
      youExperienceThem: `${directionalSentence(key, match.yours, match.theirs)} Their style may feel familiar before they explain it.`,
      theyExperienceYou: `${directionalSentence(key, match.theirs, match.yours)} Your reactions can feel readable to them for the same reason.`,
      strength: `Shared ${match.yours.sign} language can create fast recognition. ${sameHouseText}`,
      watchPoint: "Familiarity can become assumption: each person may think the other should automatically understand.",
      repair: "Say the obvious thing anyway. Shared symbolism is not a substitute for direct communication.",
    };
  }

  if (match.signal === "same element") {
    return {
      key,
      label: FRIENDSHIP_LABELS[key],
      youExperienceThem: directionalSentence(key, match.yours, match.theirs),
      theyExperienceYou: directionalSentence(key, match.theirs, match.yours),
      strength: `Both signs work through ${ELEMENT[match.yours.sign]} energy, so the basic instinct can feel compatible even when the style differs. ${sameHouseText}`,
      watchPoint: "Because the underlying instinct feels similar, subtle differences can be underestimated until stress exposes them.",
      repair: "Name the difference in style instead of arguing over which approach is 'obviously' right.",
    };
  }

  if (match.signal === "same mode") {
    return {
      key,
      label: FRIENDSHIP_LABELS[key],
      youExperienceThem: directionalSentence(key, match.yours, match.theirs),
      theyExperienceYou: directionalSentence(key, match.theirs, match.yours),
      strength: `Both signs share a ${MODE[match.yours.sign]} rhythm, so you may understand each other's pace even when your motives differ. ${sameHouseText}`,
      watchPoint: "Matching pace can still produce friction when both people try to lead, hold ground, or keep changing at the same time.",
      repair: "Agree on the goal first, then let each person use their own route.",
    };
  }

  return {
    key,
    label: FRIENDSHIP_LABELS[key],
    youExperienceThem: directionalSentence(key, match.yours, match.theirs),
    theyExperienceYou: directionalSentence(key, match.theirs, match.yours),
    strength: `Contrast can add perspective neither person naturally generates alone. ${sameHouseText}`,
    watchPoint: "Different symbolic instincts may make one person's normal behavior feel confusing or excessive to the other.",
    repair: "Translate before judging: ask what the other person is trying to accomplish, not only why they did it differently.",
  };
}

function buildGuideSummary(friendshipMatches: ChartPlacementMatch[]) {
  if (!friendshipMatches.length) {
    return {
      headline: "Not enough shared chart evidence yet",
      streetTranslation: "Aureon is not filling the blanks just to make the reading sound complete.",
      strength: "Add verified matching placements to deepen the friendship reading.",
      watchPoint: "Do not treat missing data as negative compatibility.",
    };
  }

  const strongest = [...friendshipMatches].sort((a, b) => b.score - a.score)[0];
  const hardest = [...friendshipMatches].sort((a, b) => a.score - b.score)[0];
  const strongestLabel = FRIENDSHIP_LABELS[strongest.key as (typeof FRIENDSHIP_KEYS)[number]];
  const hardestLabel = FRIENDSHIP_LABELS[hardest.key as (typeof FRIENDSHIP_KEYS)[number]];

  return {
    headline: `${strongestLabel} is the clearest shared lane`,
    streetTranslation: strongest.score >= 80
      ? `Aureon's read: this friendship has a real shared language around ${strongestLabel.toLowerCase()}. The move is not to assume—use it.`
      : `Aureon's read: y'all can work with this, but the friendship gets stronger when the differences are translated instead of guessed at.`,
    strength: `${strongestLabel} currently carries the strongest symbolic resonance in the verified overlap.`,
    watchPoint: hardest.key === strongest.key
      ? "Coverage is still narrow, so one placement should not be asked to explain the whole friendship."
      : `${hardestLabel} carries the most adjustment pressure among the currently comparable friendship placements.`,
  };
}

/** Transparent symbolic comparison of only matching chart placements; never calculates degree-based aspects. */
export function compareFriendCharts(yours: SharedChartPlacement[], theirs: SharedChartPlacement[]) {
  const otherByKey = new Map(theirs.map((placement) => [placement.key, placement]));
  const matches = yours.flatMap((placement) => {
    const other = otherByKey.get(placement.key);
    return other ? [comparePlacement(placement, other)] : [];
  });
  const friendshipMatches = matches.filter((match) => FRIENDSHIP_KEYS.includes(match.key as typeof FRIENDSHIP_KEYS[number]));
  return {
    matches,
    overallScore: average(matches),
    friendshipScore: average(friendshipMatches),
    friendshipMatches,
    friendshipPerspectives: friendshipMatches.map(buildPerspective),
    guideSummary: buildGuideSummary(friendshipMatches),
    overallCoverage: { matched: matches.length, available: new Set([...yours, ...theirs].map((placement) => placement.key)).size },
    friendshipCoverage: { matched: friendshipMatches.length, available: FRIENDSHIP_KEYS.length },
  };
}
