// Archetype match engine: ranks all 12 sun signs against a user's soul blueprint

export type RelationshipMode = "love" | "attraction" | "friendship" | "growth";

export interface SignMeta {
  name: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  glyph: string;
  keywords: string[];
  rulingPlanet: string;
}

export interface ArchetypeMatch {
  sign: SignMeta;
  score: number;
  scores: { love: number; attraction: number; friendship: number; growth: number };
  headline: string;
  why: string;
  tension?: string;
}

const SIGNS: SignMeta[] = [
  { name: "Aries",       element: "Fire",  modality: "Cardinal", glyph: "♈", rulingPlanet: "Mars",    keywords: ["Bold", "Direct", "Pioneering"] },
  { name: "Taurus",      element: "Earth", modality: "Fixed",    glyph: "♉", rulingPlanet: "Venus",   keywords: ["Loyal", "Sensual", "Steadfast"] },
  { name: "Gemini",      element: "Air",   modality: "Mutable",  glyph: "♊", rulingPlanet: "Mercury", keywords: ["Curious", "Witty", "Adaptable"] },
  { name: "Cancer",      element: "Water", modality: "Cardinal", glyph: "♋", rulingPlanet: "Moon",    keywords: ["Nurturing", "Intuitive", "Protective"] },
  { name: "Leo",         element: "Fire",  modality: "Fixed",    glyph: "♌", rulingPlanet: "Sun",     keywords: ["Radiant", "Creative", "Loyal"] },
  { name: "Virgo",       element: "Earth", modality: "Mutable",  glyph: "♍", rulingPlanet: "Mercury", keywords: ["Precise", "Devoted", "Analytical"] },
  { name: "Libra",       element: "Air",   modality: "Cardinal", glyph: "♎", rulingPlanet: "Venus",   keywords: ["Harmonious", "Diplomatic", "Aesthetic"] },
  { name: "Scorpio",     element: "Water", modality: "Fixed",    glyph: "♏", rulingPlanet: "Pluto",   keywords: ["Magnetic", "Intense", "Transformative"] },
  { name: "Sagittarius", element: "Fire",  modality: "Mutable",  glyph: "♐", rulingPlanet: "Jupiter", keywords: ["Adventurous", "Honest", "Expansive"] },
  { name: "Capricorn",   element: "Earth", modality: "Cardinal", glyph: "♑", rulingPlanet: "Saturn",  keywords: ["Ambitious", "Disciplined", "Enduring"] },
  { name: "Aquarius",    element: "Air",   modality: "Fixed",    glyph: "♒", rulingPlanet: "Uranus",  keywords: ["Visionary", "Independent", "Humanitarian"] },
  { name: "Pisces",      element: "Water", modality: "Mutable",  glyph: "♓", rulingPlanet: "Neptune", keywords: ["Empathic", "Mystical", "Fluid"] },
];

const OPPOSITES: Record<string, string> = {
  Aries: "Libra", Taurus: "Scorpio", Gemini: "Sagittarius",
  Cancer: "Capricorn", Leo: "Aquarius", Virgo: "Pisces",
  Libra: "Aries", Scorpio: "Taurus", Sagittarius: "Gemini",
  Capricorn: "Cancer", Aquarius: "Leo", Pisces: "Virgo",
};

// Base scores per element pair [love, attraction, friendship, growth]
type ElemScores = { love: number; attraction: number; friendship: number; growth: number };
const E: Record<string, Record<string, ElemScores>> = {
  Fire: {
    Fire:  { love: 78, attraction: 88, friendship: 85, growth: 62 },
    Air:   { love: 87, attraction: 82, friendship: 88, growth: 74 },
    Earth: { love: 60, attraction: 68, friendship: 58, growth: 86 },
    Water: { love: 68, attraction: 84, friendship: 60, growth: 80 },
  },
  Earth: {
    Fire:  { love: 60, attraction: 68, friendship: 58, growth: 86 },
    Earth: { love: 80, attraction: 62, friendship: 82, growth: 70 },
    Air:   { love: 64, attraction: 70, friendship: 74, growth: 80 },
    Water: { love: 88, attraction: 78, friendship: 82, growth: 73 },
  },
  Air: {
    Fire:  { love: 87, attraction: 82, friendship: 88, growth: 74 },
    Earth: { love: 64, attraction: 70, friendship: 74, growth: 80 },
    Air:   { love: 76, attraction: 70, friendship: 90, growth: 66 },
    Water: { love: 68, attraction: 80, friendship: 70, growth: 83 },
  },
  Water: {
    Fire:  { love: 68, attraction: 84, friendship: 60, growth: 80 },
    Earth: { love: 88, attraction: 78, friendship: 82, growth: 73 },
    Air:   { love: 68, attraction: 80, friendship: 70, growth: 83 },
    Water: { love: 84, attraction: 82, friendship: 80, growth: 70 },
  },
};

// Contextual blurbs per element pairing
type PairBlurbs = { love: string; attraction: string; friendship: string; growth: string; tension: string };
const BLURBS: Record<string, PairBlurbs> = {
  "Fire-Fire": {
    love: "Two fires share the same hunger for aliveness — this bond can feel fated.",
    attraction: "Instant combustion. You recognize each other's intensity immediately.",
    friendship: "You push each other to go bigger, be bolder, move faster.",
    growth: "You'll need to practice patience — two fires can create more heat than light.",
    tension: "Competition can quietly undermine the connection.",
  },
  "Fire-Air": {
    love: "Air feeds your fire and you inspire their ideas — a naturally expansive bond.",
    attraction: "You spark each other intellectually before anything else — the mind turns you on.",
    friendship: "Easy laughter, shared adventures, and endless interesting conversations.",
    growth: "They teach you to think before acting; you teach them to feel before analyzing.",
    tension: "Air's detachment can cool your passion.",
  },
  "Fire-Earth": {
    love: "An earthy partner steadies your fire, giving it somewhere lasting to burn.",
    attraction: "The tension between your restlessness and their groundedness creates real pull.",
    friendship: "You bring the spark; they bring the plan — good team, hard friendship.",
    growth: "The friction here is the lesson — patience, follow-through, presence.",
    tension: "Your pace and theirs rarely match.",
  },
  "Fire-Water": {
    love: "Deep emotional currents meet raw fire — intense and full of feeling.",
    attraction: "Water's depth draws you in; your heat warms their guarded heart.",
    friendship: "You can lift them out of spirals; they help you feel more deeply.",
    growth: "They reveal your emotional underdevelopment; you reveal their fear of action.",
    tension: "Steam or flood — this energy is rarely neutral.",
  },
  "Earth-Earth": {
    love: "Built to last. You share the same language of loyalty, comfort, and dedication.",
    attraction: "Slow burn — the attraction deepens with time and physical presence.",
    friendship: "Reliable, warm, real — this is the friendship that shows up.",
    growth: "Both can resist change; together you must consciously choose evolution.",
    tension: "Stubbornness squared — neither wants to move first.",
  },
  "Earth-Air": {
    love: "Your grounded nature fascinates them; their ideas pull you out of routine.",
    attraction: "Mental spark with a slow physical build — their mind attracts you first.",
    friendship: "Good at building things together — projects, plans, networks.",
    growth: "They teach you to think beyond tradition; you teach them to commit.",
    tension: "You want roots; they want freedom.",
  },
  "Earth-Water": {
    love: "Water nourishes your earth and you give water a safe container — deeply natural.",
    attraction: "Quiet, deep, intimate — you feel safe being vulnerable with each other.",
    friendship: "One of the most loyal and emotionally present friendships possible.",
    growth: "Together you cultivate emotional security and practical wisdom.",
    tension: "Water's moodiness and your rigidity can create distance.",
  },
  "Air-Air": {
    love: "Electric rapport. You finish each other's thoughts and feed each other's curiosity.",
    attraction: "The mind is the erogenous zone — ideas and wit ignite everything.",
    friendship: "The most naturally effortless friendship — talk, laugh, explore, repeat.",
    growth: "You both need to practice emotional depth and follow-through.",
    tension: "All thought, little feeling — who grounds this?",
  },
  "Air-Water": {
    love: "Their emotional depth gives your ideas roots; your clarity gives their feelings form.",
    attraction: "Their mystery draws you in; your mind fascinates them.",
    friendship: "Creative, empathic, and full of meaning — when it works, it's beautiful.",
    growth: "They deepen your emotional intelligence; you help them articulate their inner world.",
    tension: "Logic and emotion don't always speak the same language.",
  },
  "Water-Water": {
    love: "Oceanic emotional depth — you understand each other without words.",
    attraction: "The attraction is psychic and slow-burning — almost impossible to explain.",
    friendship: "Soul-level loyalty. You'll know each other in lifetimes.",
    growth: "Shared healing is possible — but so is shared avoidance.",
    tension: "Two oceans can merge into a storm with no horizon.",
  },
};

function getBlurbKey(el1: string, el2: string): string {
  const order = ["Fire", "Earth", "Air", "Water"];
  const [a, b] = [el1, el2].sort((x, y) => order.indexOf(x) - order.indexOf(y));
  return `${a}-${b}`;
}

// Life path harmony bonus (+/-5 range)
const LP_HARMONY: Record<number, number[]> = {
  1: [1,5,7], 2: [2,4,8,6], 3: [3,6,9], 4: [2,4,8], 5: [1,5,7,3],
  6: [2,6,9,3], 7: [1,5,7], 8: [2,4,8], 9: [3,6,9],
  11: [2,11,22], 22: [4,22,11,8], 33: [6,33,9],
};
function lpBonus(lp1?: number, lp2?: number): number {
  if (!lp1 || !lp2) return 0;
  const harmonics = LP_HARMONY[lp1] || [];
  return harmonics.includes(lp2) ? 6 : lp1 === lp2 ? 4 : -3;
}

// HD type interaction bonus
const HD_BONUSES: Record<string, Record<string, number>> = {
  "Generator":             { "Projector": 8, "Manifestor": 5, "Generator": 4, "Manifesting Generator": 6, "Reflector": 7 },
  "Manifesting Generator": { "Projector": 8, "Manifestor": 5, "Generator": 6, "Manifesting Generator": 4, "Reflector": 7 },
  "Projector":             { "Generator": 8, "Manifesting Generator": 8, "Manifestor": 4, "Projector": 5, "Reflector": 6 },
  "Manifestor":            { "Projector": 6, "Generator": 5, "Manifesting Generator": 5, "Manifestor": 3, "Reflector": 7 },
  "Reflector":             { "Generator": 7, "Manifesting Generator": 7, "Projector": 6, "Manifestor": 7, "Reflector": 8 },
};
function hdBonus(type1?: string, type2?: string): number {
  if (!type1 || !type2) return 0;
  return (HD_BONUSES[type1]?.[type2] ?? 0) - 4; // normalize so 4=0, 8=+4, 0=-4
}

// Modality aspect angle scoring adjustment
function aspectAdjustment(mod1: string, mod2: string, el1: string, el2: string): ElemScores {
  const sameEl = el1 === el2;
  const sameMod = mod1 === mod2;
  if (sameEl) {
    // Trine — harmonious
    return { love: 8, attraction: 6, friendship: 8, growth: 4 };
  }
  if (sameMod) {
    // Square — tension / friction
    return { love: -8, attraction: -4, friendship: -10, growth: 6 };
  }
  return { love: 0, attraction: 0, friendship: 0, growth: 0 };
}

export function calculateArchetypeMatches(
  userSunSign: string,
  lifePathNumber?: number,
  hdType?: string,
  mode: RelationshipMode = "love"
): ArchetypeMatch[] {
  const userSign = SIGNS.find(s => s.name.toLowerCase() === userSunSign?.toLowerCase());
  if (!userSign) return [];

  return SIGNS.map(target => {
    const base = E[userSign.element][target.element];
    const aspect = aspectAdjustment(userSign.modality, target.modality, userSign.element, target.element);
    const lp = lpBonus(lifePathNumber, lifePathNumber); // placeholder — we don't know target's LP, so use self-resonance pattern
    const hd = hdBonus(hdType, undefined);
    const isOpposite = OPPOSITES[userSign.name] === target.name;
    const isSame = userSign.name === target.name;

    const oppBonus: ElemScores = isOpposite
      ? { love: -5, attraction: 14, friendship: -5, growth: 8 }
      : { love: 0, attraction: 0, friendship: 0, growth: 0 };
    const sameBonus: ElemScores = isSame
      ? { love: -8, attraction: -6, friendship: 6, growth: -4 }
      : { love: 0, attraction: 0, friendship: 0, growth: 0 };

    const scores: ElemScores = {
      love:       Math.max(20, Math.min(99, base.love       + aspect.love       + oppBonus.love       + sameBonus.love       + (hd > 0 ? 2 : 0))),
      attraction: Math.max(20, Math.min(99, base.attraction + aspect.attraction + oppBonus.attraction + sameBonus.attraction + (hd > 0 ? 1 : 0))),
      friendship: Math.max(20, Math.min(99, base.friendship + aspect.friendship + oppBonus.friendship + sameBonus.friendship + (hd > 0 ? 2 : 0))),
      growth:     Math.max(20, Math.min(99, base.growth     + aspect.growth     + oppBonus.growth     + sameBonus.growth     + (hd > 0 ? 3 : 0))),
    };

    const blurbKey = getBlurbKey(userSign.element, target.element);
    const blurbs = BLURBS[blurbKey] || BLURBS["Air-Water"];
    const headline = isOpposite
      ? `Your magnetic mirror — pulls you in`
      : isSame
      ? `Your reflection — familiar but rarely easy`
      : blurbs[mode].split("—")[0].trim();

    return {
      sign: target,
      score: scores[mode],
      scores,
      headline,
      why: blurbs[mode],
      tension: blurbs.tension,
    };
  });
}

export function getMatchesByMode(
  userSunSign: string,
  lifePathNumber?: number,
  hdType?: string,
  mode: RelationshipMode = "love"
): { best: ArchetypeMatch[]; challenging: ArchetypeMatch[] } {
  const all = calculateArchetypeMatches(userSunSign, lifePathNumber, hdType, mode);
  const sorted = all.sort((a, b) => b.score - a.score);
  return {
    best: sorted.slice(0, 4),
    challenging: sorted.slice(-3).reverse(),
  };
}
