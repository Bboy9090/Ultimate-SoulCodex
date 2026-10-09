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
    overallCoverage: { matched: matches.length, available: new Set([...yours, ...theirs].map((placement) => placement.key)).size },
    friendshipCoverage: { matched: friendshipMatches.length, available: FRIENDSHIP_KEYS.length },
  };
}
