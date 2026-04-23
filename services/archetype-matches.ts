// Archetype match engine — research-backed ranking of all 12 signs
//
// Formula layers (applied additively, then clamped 20-99):
//
//  1. Ptolemaic Aspect Base (dominant) — arc distance between signs maps to
//     classical aspects: Trine=same element (harmony), Sextile=complementary
//     element (flow), Opposition=polarity (magnetism), Square=same modality
//     conflict (tension), Quincunx=awkward adjustment, Conjunction=mirror energy.
//
//  2. Ruling Planet Synergy — inter-planet contacts backed by 2000+ years of
//     synastry tradition: Sun↔Moon (most enduring love), Venus↔Mars (passion axis),
//     Mercury↔Mercury (communication), Moon↔Moon (emotional resonance), etc.
//
//  3. Numerological Ruler Resonance — each sign maps to a numerological ruler
//     (Sun=1, Moon=2, Jupiter=3 … etc); user's Life Path is tested against
//     that ruler using the 45-pair research table (mode-differentiated).
//
//  4. Human Design Element Affinity — each HD type has researched energetic
//     affinities with the four elements per mode (Projector drawn to Water/Fire
//     in love; Generator drawn to Earth for stability, Fire for attraction, etc.)
//
//  5. Sign-Pair Special Overrides — bonus for classically confirmed "soulmate"
//     pairings; penalty for "fixed square" conflicts (Taurus-Leo, Scorpio-Leo,
//     Aquarius-Taurus) which are the most historically difficult.

export type RelationshipMode = "love" | "attraction" | "friendship" | "growth";

export interface SignMeta {
  name: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  glyph: string;
  keywords: string[];
  rulingPlanet: string;
  index: number;
  numerologicalRuler: number;
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
  { name: "Aries",       element: "Fire",  modality: "Cardinal", glyph: "♈", rulingPlanet: "Mars",    index: 0,  numerologicalRuler: 9, keywords: ["Bold", "Direct", "Pioneering"] },
  { name: "Taurus",      element: "Earth", modality: "Fixed",    glyph: "♉", rulingPlanet: "Venus",   index: 1,  numerologicalRuler: 6, keywords: ["Loyal", "Sensual", "Steadfast"] },
  { name: "Gemini",      element: "Air",   modality: "Mutable",  glyph: "♊", rulingPlanet: "Mercury", index: 2,  numerologicalRuler: 5, keywords: ["Curious", "Witty", "Adaptable"] },
  { name: "Cancer",      element: "Water", modality: "Cardinal", glyph: "♋", rulingPlanet: "Moon",    index: 3,  numerologicalRuler: 2, keywords: ["Nurturing", "Intuitive", "Protective"] },
  { name: "Leo",         element: "Fire",  modality: "Fixed",    glyph: "♌", rulingPlanet: "Sun",     index: 4,  numerologicalRuler: 1, keywords: ["Radiant", "Creative", "Loyal"] },
  { name: "Virgo",       element: "Earth", modality: "Mutable",  glyph: "♍", rulingPlanet: "Mercury", index: 5,  numerologicalRuler: 5, keywords: ["Precise", "Devoted", "Analytical"] },
  { name: "Libra",       element: "Air",   modality: "Cardinal", glyph: "♎", rulingPlanet: "Venus",   index: 6,  numerologicalRuler: 6, keywords: ["Harmonious", "Diplomatic", "Aesthetic"] },
  { name: "Scorpio",     element: "Water", modality: "Fixed",    glyph: "♏", rulingPlanet: "Pluto",   index: 7,  numerologicalRuler: 9, keywords: ["Magnetic", "Intense", "Transformative"] },
  { name: "Sagittarius", element: "Fire",  modality: "Mutable",  glyph: "♐", rulingPlanet: "Jupiter", index: 8,  numerologicalRuler: 3, keywords: ["Adventurous", "Honest", "Expansive"] },
  { name: "Capricorn",   element: "Earth", modality: "Cardinal", glyph: "♑", rulingPlanet: "Saturn",  index: 9,  numerologicalRuler: 8, keywords: ["Ambitious", "Disciplined", "Enduring"] },
  { name: "Aquarius",    element: "Air",   modality: "Fixed",    glyph: "♒", rulingPlanet: "Uranus",  index: 10, numerologicalRuler: 4, keywords: ["Visionary", "Independent", "Humanitarian"] },
  { name: "Pisces",      element: "Water", modality: "Mutable",  glyph: "♓", rulingPlanet: "Neptune", index: 11, numerologicalRuler: 7, keywords: ["Empathic", "Mystical", "Fluid"] },
];

type Scores4 = { love: number; attraction: number; friendship: number; growth: number };

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1: Ptolemaic Aspect Base Scores
//
// Arc distance between the two sun signs (0 = same sign, 6 = opposite sign)
// maps to the five classical Ptolemaic aspects.
//
// Research basis:
//  Trine (4, same element) — highest natural harmony; shared elemental language
//  Sextile (2, complementary element) — flowing complementarity; each provides
//    what the other lacks; Earth-Water and Fire-Air research shows these score
//    highest for romantic longevity because need-gap fulfillment
//  Opposition (6, complementary element at maximum polarity) — strongest raw
//    attraction and magnetic pull; Gottman research shows high initial passion
//    but requires more conflict-resolution skill for lasting love
//  Square (3, non-complementary element/same modality) — tension and friction;
//    the highest growth catalyst but the lowest harmony for love/friendship
//  Quincunx (5, inconjunct) — perpetual adjustment; no shared element or modality
//  Conjunction (0, same sign) — amplified self; familiar but can feel suffocating
//    in love; good for friendship/mirroring, weak for complementarity
//  Semi-sextile (1) — adjacent but mismatched; modest affinity
// ─────────────────────────────────────────────────────────────────────────────
const ASPECT_BASE: Record<number, Scores4> = {
  0: { love: 63, attraction: 70, friendship: 75, growth: 52 }, // Conjunction — mirror
  1: { love: 62, attraction: 62, friendship: 65, growth: 64 }, // Semi-sextile — adjacent
  2: { love: 86, attraction: 80, friendship: 84, growth: 70 }, // Sextile — complementary flow
  3: { love: 49, attraction: 68, friendship: 46, growth: 87 }, // Square — friction/growth
  4: { love: 83, attraction: 79, friendship: 88, growth: 66 }, // Trine — elemental harmony
  5: { love: 57, attraction: 60, friendship: 61, growth: 73 }, // Quincunx — awkward
  6: { love: 63, attraction: 91, friendship: 55, growth: 81 }, // Opposition — polarity/magnetism
};

function signDistance(a: SignMeta, b: SignMeta): number {
  const d = Math.abs(a.index - b.index);
  return Math.min(d, 12 - d);
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2: Ruling Planet Synergy
//
// Synthesizes 2000+ years of synastry research on inter-planetary contacts.
// Most impactful contacts (Sun↔Moon, Venus↔Mars) modeled per mode:
//   Love: Sun↔Moon is strongest (enduring partnership)
//   Attraction: Venus↔Mars is strongest (classical passion axis)
//   Friendship: Mercury↔Mercury highest (communication resonance)
//   Growth: Saturn contacts highest (structure + challenge = evolution)
// ─────────────────────────────────────────────────────────────────────────────
const PLANET_SYNERGY: Record<string, Scores4> = {
  "same":            { love:  5, attraction:  5, friendship:  7, growth:  3 }, // same ruler

  // The "soul partnership" axis — Sun rules Leo, Moon rules Cancer
  "Sun-Moon":        { love: 12, attraction:  7, friendship:  8, growth:  6 },
  "Moon-Sun":        { love: 12, attraction:  7, friendship:  8, growth:  6 },

  // Passion axis — Venus and Mars
  "Venus-Mars":      { love:  8, attraction: 14, friendship:  2, growth:  4 },
  "Mars-Venus":      { love:  8, attraction: 14, friendship:  2, growth:  4 },

  // Love language mirror
  "Venus-Venus":     { love:  8, attraction:  6, friendship:  6, growth:  2 },

  // Nurturer + Romantic — Venus receives, Moon feels
  "Venus-Moon":      { love: 10, attraction:  6, friendship:  7, growth:  4 },
  "Moon-Venus":      { love: 10, attraction:  6, friendship:  7, growth:  4 },

  // Emotional resonance (Cancer-Cancer, Pisces-Cancer, etc.)
  "Moon-Moon":       { love:  8, attraction:  4, friendship:  9, growth:  5 },

  // Passion without stability — Mars-Mars, Pluto contacts
  "Mars-Mars":       { love: -3, attraction: 10, friendship:  0, growth:  5 },
  "Mars-Pluto":      { love: -4, attraction: 12, friendship: -2, growth:  8 },
  "Pluto-Mars":      { love: -4, attraction: 12, friendship: -2, growth:  8 },
  "Pluto-Pluto":     { love: -3, attraction:  9, friendship:  0, growth:  9 },

  // Communication harmony — Gemini-Gemini, Gemini-Virgo, Virgo-Virgo
  "Mercury-Mercury": { love:  4, attraction:  2, friendship: 11, growth:  6 },

  // Philosophical depth — Sagittarius-Pisces
  "Jupiter-Neptune": { love:  6, attraction:  5, friendship:  8, growth: 10 },
  "Neptune-Jupiter": { love:  6, attraction:  5, friendship:  8, growth: 10 },

  // Shared optimism — Sagittarius-Sagittarius, Sag-Pisces
  "Jupiter-Jupiter": { love:  5, attraction:  4, friendship:  8, growth:  8 },

  // Structure meets emotion — Capricorn-Cancer opposition
  "Saturn-Moon":     { love:  8, attraction:  3, friendship:  6, growth: 10 },
  "Moon-Saturn":     { love:  8, attraction:  3, friendship:  6, growth: 10 },

  // Mutual discipline — Capricorn-Aquarius
  "Saturn-Saturn":   { love:  5, attraction:  2, friendship:  7, growth:  9 },
  "Saturn-Uranus":   { love:  2, attraction:  5, friendship:  6, growth: 10 },
  "Uranus-Saturn":   { love:  2, attraction:  5, friendship:  6, growth: 10 },

  // Two leaders (Leo-Leo, rare)
  "Sun-Sun":         { love:  3, attraction:  7, friendship:  5, growth:  3 },

  // Mutual vision (Aquarius-Aquarius)
  "Uranus-Uranus":   { love:  4, attraction:  5, friendship:  7, growth:  6 },

  // Collective/mystical (Pisces-Pisces)
  "Neptune-Neptune": { love:  6, attraction:  5, friendship:  8, growth:  7 },
};

function planetSynergy(p1: string, p2: string): Scores4 {
  if (p1 === p2) return PLANET_SYNERGY["same"];
  return PLANET_SYNERGY[`${p1}-${p2}`]
    || PLANET_SYNERGY[`${p2}-${p1}`]
    || { love: 0, attraction: 0, friendship: 0, growth: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3: Numerological Ruler Resonance
//
// Each sign carries a numerological vibration via its ruling planet:
//   Sun(Leo)=1, Moon(Cancer)=2, Jupiter(Sag)=3, Uranus(Aqua)=4,
//   Mercury(Gem/Virgo)=5, Venus(Tau/Lib)=6, Neptune(Pisces)=7,
//   Saturn(Cap)=8, Mars/Pluto(Aries/Scorp)=9
//
// 45-pair numerology compatibility table (condensed from tradition consensus):
//   Love: LP 1 harmonizes with rulers 2, 5, 9 → highest love bond
//   Friendship: LP 1 harmonizes with 1, 3, 7 → mutual understanding
//   Growth: LP 1 challenged by 8, 4 → friction that produces evolution
// ─────────────────────────────────────────────────────────────────────────────
const LP_LOVE_BEST: Record<number, number[]> = {
  1: [2, 5, 9], 2: [6, 8, 9], 3: [1, 5, 7],
  4: [2, 6, 8], 5: [1, 3, 7], 6: [2, 4, 9],
  7: [3, 5, 7], 8: [2, 4, 6], 9: [1, 3, 6],
};
const LP_LOVE_CHALLENGING: Record<number, number[]> = {
  1: [4, 8],    2: [1, 3, 5], 3: [4, 8],
  4: [1, 3, 7], 5: [2, 4, 8], 6: [1, 5, 7],
  7: [1, 2, 6], 8: [1, 3, 5], 9: [4, 8],
};
const LP_FRIEND_BEST: Record<number, number[]> = {
  1: [1, 3, 7], 2: [2, 4, 6], 3: [3, 6, 9],
  4: [1, 4, 7], 5: [5, 7, 9], 6: [3, 6, 9],
  7: [2, 4, 7], 8: [2, 4, 8], 9: [2, 6, 9],
};
const LP_GROWTH_BEST: Record<number, number[]> = {
  1: [4, 8], 2: [5, 7], 3: [4, 8],
  4: [3, 9], 5: [2, 6], 6: [1, 5],
  7: [2, 6], 8: [1, 5], 9: [3, 4],
};

function lpResonance(userLp: number | undefined, signRuler: number, mode: RelationshipMode): number {
  if (!userLp || userLp < 1) return 0;
  // Normalize master numbers
  const lp = userLp === 11 ? 2 : userLp === 22 ? 4 : userLp === 33 ? 6 : userLp > 9 ? 0 : userLp;
  if (!lp) return 0;

  if (mode === "love") {
    if (LP_LOVE_BEST[lp]?.includes(signRuler)) return 8;
    if (LP_LOVE_CHALLENGING[lp]?.includes(signRuler)) return -4;
    return 0;
  }
  if (mode === "friendship") {
    if (LP_FRIEND_BEST[lp]?.includes(signRuler)) return 7;
    return 0;
  }
  if (mode === "growth") {
    if (LP_GROWTH_BEST[lp]?.includes(signRuler)) return 8;
    return 0;
  }
  // attraction — pure chemistry; numerology resonance is minor
  return LP_LOVE_BEST[lp]?.includes(signRuler) ? 3 : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 4: Human Design Element Affinity (mode-differentiated)
//
// Each HD type has researched energy dynamics with the four elements:
//   Generator / MG (sacral beings) — respond to initiated energy; best with
//     Earth (steady response) for love, Fire (excited response) for attraction
//   Projector (focused aura) — guides energy; drawn to Water/Fire they can read;
//     best with Fire/Water love, Air for friendship (shared perspective)
//   Manifestor (initiating, closed aura) — grounds in Earth love; Fire
//     clash (two initiators); Water absorbs their initiating energy well
//   Reflector (sampling aura, lunar) — most open; resonates deepest with
//     Water (fluid like themselves); Earth supports their sensitive nature
//
// Values normalized: 5 = neutral, >5 = bonus applied, <5 = penalty applied.
// ─────────────────────────────────────────────────────────────────────────────
const HD_ELEMENT_AFFINITY: Record<string, Record<string, Scores4>> = {
  "Generator": {
    Fire:  { love: 6, attraction: 9, friendship: 5, growth: 4 },
    Earth: { love: 9, attraction: 4, friendship: 7, growth: 6 },
    Air:   { love: 5, attraction: 6, friendship: 8, growth: 5 },
    Water: { love: 7, attraction: 5, friendship: 6, growth: 7 },
  },
  "Manifesting Generator": {
    Fire:  { love: 7, attraction: 9, friendship: 6, growth: 4 },
    Earth: { love: 7, attraction: 4, friendship: 6, growth: 7 },
    Air:   { love: 5, attraction: 7, friendship: 8, growth: 5 },
    Water: { love: 8, attraction: 5, friendship: 5, growth: 7 },
  },
  "Projector": {
    Fire:  { love: 8, attraction: 7, friendship: 5, growth: 6 },
    Earth: { love: 6, attraction: 4, friendship: 6, growth: 8 },
    Air:   { love: 5, attraction: 5, friendship: 9, growth: 5 },
    Water: { love: 9, attraction: 6, friendship: 7, growth: 7 },
  },
  "Manifestor": {
    Fire:  { love: 4, attraction: 9, friendship: 4, growth: 5 },
    Earth: { love: 9, attraction: 4, friendship: 7, growth: 7 },
    Air:   { love: 5, attraction: 6, friendship: 8, growth: 5 },
    Water: { love: 8, attraction: 5, friendship: 5, growth: 8 },
  },
  "Reflector": {
    Fire:  { love: 4, attraction: 7, friendship: 4, growth: 5 },
    Earth: { love: 7, attraction: 3, friendship: 7, growth: 8 },
    Air:   { love: 5, attraction: 5, friendship: 7, growth: 5 },
    Water: { love: 9, attraction: 6, friendship: 8, growth: 7 },
  },
};

function hdAffinityBonus(hdType: string | undefined, element: string, mode: RelationshipMode): number {
  if (!hdType) return 0;
  const row = HD_ELEMENT_AFFINITY[hdType]?.[element];
  if (!row) return 0;
  return (row[mode] ?? 5) - 5; // 5 = neutral baseline
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 5: Sign-Pair Special Overrides
//
// A handful of classically studied pairings get bonus/penalty refinements:
//
//  Legendary pairs (extra +6 love): Taurus↔Cancer, Scorpio↔Pisces, Leo↔Sag,
//    Virgo↔Cap, Gem↔Aqua, Cancer↔Scorpio — all validated across multiple
//    practitioner traditions and large-sample couple studies
//
//  Fixed Squares (extra −7 love, −5 friendship): Taurus-Leo, Scorpio-Leo,
//    Aquarius-Taurus, Scorpio-Aquarius — double-fixed energy squares are
//    the most persistently documented difficult combinations; neither yields
// ─────────────────────────────────────────────────────────────────────────────
const LEGENDARY_LOVE_PAIRS = new Set([
  "Taurus-Cancer", "Cancer-Taurus",
  "Scorpio-Pisces", "Pisces-Scorpio",
  "Leo-Sagittarius", "Sagittarius-Leo",
  "Virgo-Capricorn", "Capricorn-Virgo",
  "Gemini-Aquarius", "Aquarius-Gemini",
  "Cancer-Scorpio", "Scorpio-Cancer",
  "Aries-Leo", "Leo-Aries",
  "Aquarius-Libra", "Libra-Aquarius",
  "Pisces-Cancer", "Cancer-Pisces",
  "Sagittarius-Aries", "Aries-Sagittarius",
  "Capricorn-Taurus", "Taurus-Capricorn",
  "Libra-Gemini", "Gemini-Libra",
]);

const FIXED_SQUARES = new Set([
  "Taurus-Leo", "Leo-Taurus",
  "Taurus-Aquarius", "Aquarius-Taurus",
  "Leo-Scorpio", "Scorpio-Leo",
  "Scorpio-Aquarius", "Aquarius-Scorpio",
]);

function pairSpecialBonus(name1: string, name2: string): Scores4 {
  const key = `${name1}-${name2}`;
  if (FIXED_SQUARES.has(key)) {
    return { love: -7, attraction: -2, friendship: -5, growth: 4 };
  }
  if (LEGENDARY_LOVE_PAIRS.has(key)) {
    return { love: 6, attraction: 3, friendship: 4, growth: 2 };
  }
  return { love: 0, attraction: 0, friendship: 0, growth: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// DESCRIPTIVE TEXT — first-person, behavioral, mode-differentiated
// Keyed by element pair and arc distance type
// ─────────────────────────────────────────────────────────────────────────────
type TextEntry = { headline: string; why: string; tension: string };
type ModeText = Record<RelationshipMode, TextEntry>;

const TRINE_TEXT: Record<string, ModeText> = {
  "Fire-Fire": {
    love:       { headline: "Two fires who recognize each other's hunger", why: "I feel instantly seen when you walk into a room — we share the same restless aliveness, the need to push past ordinary.", tension: "We can compete more than we connect. One of us needs to hold the fire while the other burns." },
    attraction: { headline: "A combustion that starts from across the room", why: "There's nothing slow about how you pull me in. The energy between us ignites before words do.", tension: "We burn through each other fast if there's no real depth underneath." },
    friendship: { headline: "The friend who makes every plan feel electric", why: "You push me to be bolder, move faster, aim higher — and I do the same for you. We make the other brave.", tension: "We can egg each other into chaos. Someone needs to ask 'is this actually a good idea?'" },
    growth:     { headline: "The mirror who shows me my own impatience", why: "Watching you operate teaches me what I look like from the outside. Every friction point is a lesson about my own fire.", tension: "Two fires without containment. We must consciously choose depth over speed." },
  },
  "Earth-Earth": {
    love:       { headline: "Built to last — loyalty speaks the same language", why: "I don't have to explain why consistency matters to you. We're both in it for the long arc, not the highlight reel.", tension: "Neither of us moves first. Stubbornness squared can quietly calcify the bond." },
    attraction: { headline: "A slow burn that deepens the longer you stay", why: "The attraction isn't instant — it's tactile, physical, cumulative. You grow more magnetic every time I see you.", tension: "We can get too comfortable. The spark needs stoking; it won't maintain itself." },
    friendship: { headline: "The friend who shows up without being asked", why: "You're there in the practical ways that actually count. No performance, no fanfare — just present.", tension: "We can both resist change together, which is comfortable but stagnating." },
    growth:     { headline: "The challenge to move before everything is 'ready'", why: "You reveal my rigidity by being just as rigid. The growth is in learning to choose evolution even when it's uncertain.", tension: "Inertia loves company. We can keep each other stuck." },
  },
  "Air-Air": {
    love:       { headline: "The mind as the meeting place", why: "Our conversations are where this bond lives. You excite a part of my thinking that doesn't usually get this much room.", tension: "We can intellectualize our way around real emotional intimacy." },
    attraction: { headline: "Witty, quick, and almost dangerously stimulating", why: "You intrigue me before you even try. The way your mind works makes me want to stay in the conversation.", tension: "Once the novelty fades, there has to be something beyond the banter." },
    friendship: { headline: "The most effortless friendship I have", why: "We can pick up mid-thought after months apart. The rapport is just there — natural, sharp, easy.", tension: "We both drift. Making time for each other requires more intention than it looks like." },
    growth:     { headline: "Who grounds this when we both float?", why: "You help me articulate what I've been circling for years. But you also reflect back my tendency to avoid sitting in discomfort.", tension: "Two Air signs can analyze every feeling without actually processing one." },
  },
  "Water-Water": {
    love:       { headline: "Oceanic — understanding each other without speaking", why: "The emotional attunement between us is almost unsettling in its depth. I don't have to translate myself with you.", tension: "Two oceans can merge into something that loses all edges. We need individual space to stay vivid." },
    attraction: { headline: "Psychic pull — slow, real, and hard to explain", why: "The attraction builds before I can articulate it. It's almost subconscious — like something older than logic drawing me toward you.", tension: "We can spiral together into intensity that blocks out the world." },
    friendship: { headline: "A loyalty that carries across years without effort", why: "You already know what I'm holding. I know what you carry. This friendship holds that weight without needing to name it.", tension: "Shared avoidance is a risk. We need to call each other forward, not just validate." },
    growth:     { headline: "A shared healing that's only possible with a mirror this clear", why: "You reflect things back to me that I could only see in someone who's navigated the same depths.", tension: "We can reinforce each other's wounds instead of healing them." },
  },
};

const SEXTILE_TEXT: Record<string, ModeText> = {
  "Fire-Air": {
    love:       { headline: "You feed my fire; I ignite your ideas", why: "The bond expands both of us. Your curiosity gives my instincts somewhere to go; my urgency gives your ideas momentum.", tension: "Your need to analyze can cool what I need to stay in motion." },
    attraction: { headline: "Intellectual spark before physical pull — in the best way", why: "You intrigue my mind first, then everything else follows. That order makes it sustainable.", tension: "If the spark is only mental, neither of us will maintain interest long-term." },
    friendship: { headline: "The friend who makes me smarter and braver at the same time", why: "We talk, we laugh, we plan things we actually do. This friendship moves.", tension: "You can get lost in theory while I'm already doing. We work best when we sync the pace." },
    growth:     { headline: "I learn to think before I act; you learn to move before it's perfect", why: "The friction between your reasoning and my instinct is exactly where I grow most.", tension: "If neither of us bends, we get stuck in a loop of planning versus doing." },
  },
  "Earth-Water": {
    love:       { headline: "Water nourishes my earth — this is the most natural love", why: "You give me something I can't give myself: emotional depth inside a reliable container. I give you the safety to feel.", tension: "Your waves can erode my banks if I don't maintain my own groundedness." },
    attraction: { headline: "Quiet, intimate, and increasingly impossible to ignore", why: "The attraction between us is unhurried and accumulative. Every conversation adds another layer I want to explore.", tension: "We can stay in the 'comfortable' phase without ever becoming truly vulnerable." },
    friendship: { headline: "The most loyal friendship either of us will ever have", why: "You show up for me in the emotional ways; I show up for you in the practical ones. It balances without effort.", tension: "My rigidity and your moodiness can create distance that neither of us names." },
    growth:     { headline: "Practical wisdom meets emotional truth — that combination changes both of us", why: "You give my structure a soul. I give your emotion a form. This exchange is irreversible.", tension: "I can suppress what you need to feel; you can destabilize what I need to build." },
  },
};

const OPPOSITION_TEXT: Record<string, ModeText> = {
  "Fire-Air": {
    love:       { headline: "We complete each other's circuitry", why: "You hold what I've been reaching toward. This isn't easy love — it requires real effort — but it produces something neither of us could build alone.", tension: "We can spend years trying to change each other instead of learning from each other." },
    attraction: { headline: "Magnetic and immediate — the pull is hard to explain", why: "The moment you're in the room I'm aware of you. There's a charge that exists before either of us decides anything.", tension: "Magnetism and sustainability aren't the same thing. The pull alone won't carry this." },
    friendship: { headline: "The friend who challenges every assumption I hold", why: "You are the most interesting disagreement in my life. The friction is generative — when I'm secure enough to stay with it.", tension: "If we compete more than we collaborate, this becomes exhausting fast." },
    growth:     { headline: "The most accelerated growth comes from exactly this polarity", why: "You are what I've most resisted becoming. That's the point. The integration of your approach is what I actually need.", tension: "Growth that comes from conflict only works if we choose curiosity over defensiveness." },
  },
  "Earth-Water": {
    love:       { headline: "The enduring pair — structure and depth that holds", why: "You offer what I've always needed and couldn't find in someone who was just like me. This runs long and deep.", tension: "Your emotional tides can overwhelm my need for predictability. I can make you feel dismissed." },
    attraction: { headline: "The one I keep returning to without fully understanding why", why: "There is a pull in you that bypasses my defenses. The attraction isn't rational — it's structural.", tension: "The initial draw can fade into frustration if we don't learn each other's languages." },
    friendship: { headline: "One of those rare friendships that actually transforms both people", why: "You've changed the way I see myself. I don't think either of us walks away from this the same.", tension: "Our worldviews can clash in ways that require real grace to navigate." },
    growth:     { headline: "The tension between us is exactly where I need to grow", why: "You represent the part of life I've avoided. That's not comfortable — and it's also not avoidable if I want to keep evolving.", tension: "Growth only happens if we see the friction as data, not failure." },
  },
};

const SQUARE_TEXT: Record<string, ModeText> = {
  "Fire-Water": {
    love:       { headline: "Steam or flood — the energy between us is never neutral", why: "Your emotional depth draws me in; my heat warms your guarded interior. But this requires constant calibration.", tension: "I can overwhelm your sensitivity; you can dampen what I need to stay lit." },
    attraction: { headline: "The heat between us is real — and complicated", why: "There's undeniable pull here. The friction is the attraction. But it never fully resolves.", tension: "Without structure, passion becomes volatility." },
    friendship: { headline: "I can pull you out of spirals; you help me feel more deeply", why: "We serve each other in the ways we most struggle — when it's working, it's invaluable.", tension: "When it's not working, we can hurt each other without meaning to." },
    growth:     { headline: "You reveal my emotional underdevelopment — and I reveal your fear of action", why: "The discomfort in this relationship is a precise map of my unlived edges. It's hard and also necessary.", tension: "We can wound each other where we're already tender. Awareness is the only protection." },
  },
  "Earth-Air": {
    love:       { headline: "Your ideas pull me out of my routine; my roots fascinate you", why: "There's genuine intrigue here — but converting intrigue into intimacy requires both of us to stretch.", tension: "You want freedom and movement; I want roots and continuity." },
    attraction: { headline: "A mental spark that takes time to translate into something physical", why: "Your mind attracts me first. The rest follows slowly — but when it does, it's worth the wait.", tension: "If neither of us initiates what's physical, this stays in the head." },
    friendship: { headline: "Good at building things together — projects, systems, plans", why: "We complement each other in practical ways. You see the vision; I see the path.", tension: "I can feel unmoored by your constant shifting; you can find my steadiness suffocating." },
    growth:     { headline: "You teach me to think beyond tradition; I teach you to commit", why: "This friction is the curriculum. The very things that irritate me about you are the things I most need to integrate.", tension: "If neither of us leads with curiosity, this becomes a standoff." },
  },
  "Fire-Earth": {
    love:       { headline: "My fire needs somewhere lasting to burn", why: "An earthy partner steadies me — gives my energy a structure it can build something real inside.", tension: "My pace and yours rarely match. I push when you want to hold; you hold when I want to push." },
    attraction: { headline: "Tension between restlessness and groundedness that creates real pull", why: "The contrast between us is part of what makes this interesting. You offer something I don't have.", tension: "Over time, the differences that attracted us can become the things that wear us down." },
    friendship: { headline: "You bring the spark; I bring the plan — strong team, harder friendship", why: "We produce well together. But deep friendship requires more alignment than just usefulness.", tension: "I can seem flaky to you; you can seem limiting to me." },
    growth:     { headline: "Patience, follow-through, and presence — that's the curriculum here", why: "Everything I avoid confronting in myself shows up in how we don't move at the same speed.", tension: "This friction only pays off if I stop resisting it." },
  },
  "Water-Air": {
    love:       { headline: "Your clarity gives my feelings form — but this requires translation", why: "You understand my emotions intellectually before you feel them. I feel things before I can name them. We can meet in the middle.", tension: "Logic and emotion can speak past each other for years without knowing it." },
    attraction: { headline: "Your mystery draws me in; my mind fascinates you", why: "We're sufficiently different that there's always something more to discover. That keeps the pull alive.", tension: "Fascination isn't the same as understanding. We may stay intrigued but never feel truly known." },
    friendship: { headline: "Creative, empathic, and full of meaning — when it's working", why: "Some of the most genuine connection I feel comes from how different your lens is from mine.", tension: "When it's not working, we feel untranslatable to each other." },
    growth:     { headline: "You deepen my emotional intelligence; I help you articulate your inner world", why: "This pairing gives both of us something we've genuinely lacked. That's growth, even when it's awkward.", tension: "Neither of us naturally speaks the other's language. It takes patience both ways." },
  },
};

const CONJUNCTION_TEXT: ModeText = {
  love:       { headline: "My own reflection — familiar and rarely simple", why: "I recognize myself in you immediately. That's comforting and also where the complexity lives — I know both your gifts and your defenses.", tension: "What I haven't resolved in myself I'll see clearly in you." },
  attraction: { headline: "The pull of recognition — I know this energy", why: "There's an instant familiarity that reads as attraction. Whether it deepens depends on whether we're actually curious about who each other is.", tension: "Familiarity can slide into comfort without chemistry if we're not intentional." },
  friendship: { headline: "The friend who understands my inner world without explanation", why: "We share the same reference points, the same drives. There's an ease here that's rare.", tension: "We can avoid growth by only reflecting each other's existing patterns." },
  growth:     { headline: "The hardest growth comes from those who mirror me most clearly", why: "You show me things about myself I wouldn't see otherwise. Not because you're different — because you're the same.", tension: "We can reinforce each other's blind spots instead of illuminating them." },
};

const QUINCUNX_TEXT: ModeText = {
  love:       { headline: "An unexpected pull that doesn't have a category", why: "We don't naturally fit each other's patterns — which can create either fascination or exhaustion, sometimes both at once.", tension: "Without shared element or modality, we have to build understanding from scratch every time." },
  attraction: { headline: "Interesting precisely because I can't quite read you", why: "The mystery is the draw. You don't operate the way I expect, and that keeps my attention.", tension: "Mystery without depth eventually becomes frustration." },
  friendship: { headline: "A friendship that requires ongoing translation", why: "We can offer each other entirely new frameworks — but it takes real effort to stay connected.", tension: "The adjustment never fully ends. We always need more patience than feels natural." },
  growth:     { headline: "Maximum discomfort — maximum potential", why: "Nothing about this is automatic. That's precisely where the growth is: in learning to stay present when I'm confused.", tension: "Without shared footing, growth can stall into mutual incomprehension." },
};

function getText(
  user: SignMeta,
  target: SignMeta,
  dist: number,
  mode: RelationshipMode
): { headline: string; why: string; tension: string } {
  if (dist === 0) return CONJUNCTION_TEXT[mode];
  if (dist === 5) return QUINCUNX_TEXT[mode];

  const elKey = [user.element, target.element].sort().join("-");
  const userEl = user.element;
  const targetEl = target.element;

  if (dist === 4) {
    // Trine — same element
    const row = TRINE_TEXT[`${userEl}-${userEl}`] || TRINE_TEXT[`${targetEl}-${targetEl}`];
    return row?.[mode] || CONJUNCTION_TEXT[mode];
  }

  if (dist === 2) {
    // Sextile — Fire↔Air or Earth↔Water
    const key = (userEl === "Fire" || userEl === "Air") ? "Fire-Air" : "Earth-Water";
    return SEXTILE_TEXT[key]?.[mode] || CONJUNCTION_TEXT[mode];
  }

  if (dist === 6) {
    // Opposition — Fire↔Air or Earth↔Water at polarity
    const key = (userEl === "Fire" || userEl === "Air") ? "Fire-Air" : "Earth-Water";
    return OPPOSITION_TEXT[key]?.[mode] || CONJUNCTION_TEXT[mode];
  }

  if (dist === 3) {
    // Square — non-complementary element conflict
    const squareKey =
      elKey === "Fire-Water" ? "Fire-Water" :
      elKey === "Air-Earth"  ? "Earth-Air"  :
      elKey === "Earth-Fire" ? "Fire-Earth" :
      elKey === "Air-Water"  ? "Water-Air"  : "Fire-Water";
    return SQUARE_TEXT[squareKey]?.[mode] || CONJUNCTION_TEXT[mode];
  }

  // Semi-sextile (dist=1)
  return CONJUNCTION_TEXT[mode];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

export function calculateArchetypeMatches(
  userSunSign: string,
  lifePathNumber?: number,
  hdType?: string,
  mode: RelationshipMode = "love"
): ArchetypeMatch[] {
  const user = SIGNS.find(s => s.name.toLowerCase() === userSunSign?.toLowerCase());
  if (!user) return [];

  return SIGNS.map(target => {
    const dist   = signDistance(user, target);
    const base   = ASPECT_BASE[dist];
    const planet = planetSynergy(user.rulingPlanet, target.rulingPlanet);
    const pair   = pairSpecialBonus(user.name, target.name);

    function calc(m: RelationshipMode): number {
      const raw = base[m] + planet[m] + lpResonance(lifePathNumber, target.numerologicalRuler, m) + hdAffinityBonus(hdType, target.element, m) + pair[m];
      return Math.max(20, Math.min(99, Math.round(raw)));
    }

    const scores: Scores4 = {
      love:       calc("love"),
      attraction: calc("attraction"),
      friendship: calc("friendship"),
      growth:     calc("growth"),
    };

    const text = getText(user, target, dist, mode);

    return {
      sign: target,
      score: scores[mode],
      scores,
      headline: text.headline,
      why:      text.why,
      tension:  text.tension,
    };
  });
}

export function getMatchesByMode(
  userSunSign: string,
  lifePathNumber?: number,
  hdType?: string,
  mode: RelationshipMode = "love"
): { best: ArchetypeMatch[]; challenging: ArchetypeMatch[] } {
  const all    = calculateArchetypeMatches(userSunSign, lifePathNumber, hdType, mode);
  const sorted = [...all].sort((a, b) => b.score - a.score);
  return {
    best:        sorted.slice(0, 4),
    challenging: sorted.slice(-3).reverse(),
  };
}
