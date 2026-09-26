import { extractVerifiedAstrology } from "../lib/verified-astrology";

interface ArchetypeData {
  title: string;
  description: string;
  strengths: string[];
  shadows: string[];
  themes: string[];
  guidance: string;
}

type SymbolicPattern = {
  word: string;
  drive: string;
  gift: string;
  shadow: string;
  action: string;
};

const unresolvedArchetype: ArchetypeData = {
  title: "Archetype unresolved",
  description:
    "Your Soul Codex is still assembling the governed layers needed for a responsible synthesis. No substitute archetype is assigned while those layers are unresolved.",
  strengths: [],
  shadows: [],
  themes: [],
  guidance:
    "Use supported facts as reflection prompts and leave unresolved material open instead of filling it with a generic identity.",
};

const SIGN_PATTERN: Record<string, SymbolicPattern> = {
  aries: { word: "Pioneer", drive: "direct initiation", gift: "courage and momentum", shadow: "speed outrunning context", action: "Separate urgency from importance before acting." },
  taurus: { word: "Anchor", drive: "stability and continuity", gift: "patience and durable follow-through", shadow: "holding position after conditions change", action: "Keep what is dependable while testing one flexible response." },
  gemini: { word: "Messenger", drive: "connection through information", gift: "adaptability and verbal perspective", shadow: "attention scattering across too many signals", action: "Finish one question before opening another." },
  cancer: { word: "Keeper", drive: "emotional safety and belonging", gift: "care and responsiveness", shadow: "carrying needs that are not yours", action: "Name the need before managing the atmosphere." },
  leo: { word: "Radiant", drive: "visible creative expression", gift: "warmth and creative leadership", shadow: "recognition becoming proof of worth", action: "Make one meaningful move that does not depend on applause." },
  virgo: { word: "Refiner", drive: "practical improvement", gift: "precise and useful problem solving", shadow: "analysis expanding after enough information exists", action: "Define what is good enough before refining again." },
  libra: { word: "Mediator", drive: "fair exchange and relational balance", gift: "diplomacy and relational awareness", shadow: "delaying conflict until resentment grows", action: "State the uncomfortable preference before harmony becomes avoidance." },
  scorpio: { word: "Alchemist", drive: "truth, depth, and transformation", gift: "focus and loyal depth", shadow: "suspicion remaining active past its evidence", action: "Separate what is known from what is feared." },
  sagittarius: { word: "Seeker", drive: "meaning and expansion", gift: "broad perspective and optimism", shadow: "moving to the next horizon before depth develops", action: "Finish one meaningful commitment before chasing the next possibility." },
  capricorn: { word: "Architect", drive: "disciplined construction", gift: "strategy and endurance", shadow: "worth becoming tied mainly to output", action: "Protect recovery as part of the plan." },
  aquarius: { word: "Reformer", drive: "independent systems thinking", gift: "originality and pattern perspective", shadow: "detachment replacing contact when stakes rise", action: "Translate the idea into one human-scale action." },
  pisces: { word: "Dreamer", drive: "meaning through sensitivity and imagination", gift: "empathy and imaginative translation", shadow: "boundaries weakening while helping", action: "Identify which feeling is yours before deciding what to carry." },
};

const NUMBER_PATTERN: Record<number, SymbolicPattern> = {
  1: { word: "Initiator", drive: "self-directed initiation", gift: "pioneering independence", shadow: "support feeling like interference", action: "Lead clearly while leaving room for collaboration." },
  2: { word: "Harmonizer", drive: "partnership", gift: "cooperation and sensitivity", shadow: "over-adjustment to preserve peace", action: "State one preference before adapting." },
  3: { word: "Creator", drive: "expression", gift: "creative communication", shadow: "activity replacing depth", action: "Finish and share one expression." },
  4: { word: "Builder", drive: "structure", gift: "durable systems", shadow: "control being mistaken for safety", action: "Keep the structure and loosen one unnecessary rule." },
  5: { word: "Explorer", drive: "freedom and experience", gift: "adaptability", shadow: "necessary repetition feeling like confinement", action: "Choose one commitment that creates more freedom later." },
  6: { word: "Steward", drive: "responsibility and care", gift: "reliable service", shadow: "carrying duties never actually assigned", action: "Return one responsibility to its rightful owner." },
  7: { word: "Analyst", drive: "investigation and understanding", gift: "private mastery and depth", shadow: "waiting for impossible certainty", action: "Set a decision deadline before gathering another layer." },
  8: { word: "Executive", drive: "material effectiveness", gift: "leadership and execution", shadow: "achievement becoming the only measure", action: "Define the ethical boundary before pursuing the result." },
  9: { word: "Integrator", drive: "completion and contribution", gift: "large-context perspective", shadow: "overextension for the larger mission", action: "Finish one cycle before volunteering for another." },
  11: { word: "Visionary", drive: "vision and inspiration", gift: "unusual perspective translated for others", shadow: "intensity being treated as certainty", action: "Ground the insight in one observable test." },
  22: { word: "Master Builder", drive: "large-scale structure", gift: "turning vision into durable form", shadow: "scale becoming personally crushing", action: "Reduce the vision to the next testable structure." },
  33: { word: "Teacher", drive: "service through example", gift: "compassionate leadership", shadow: "becoming responsible for everyone else's growth", action: "Teach the principle without taking over the person's work." },
};

function validNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && NUMBER_PATTERN[parsed] ? parsed : null;
}

function unique(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())).map((value) => value.trim()))];
}

export function synthesizeArchetype(
  astrologyData: unknown,
  numerologyData: any,
  personalityData: any,
): ArchetypeData {
  const verified = extractVerifiedAstrology({ astrologyData });
  const sun = verified.sun?.toLowerCase() ?? null;
  const moon = verified.moon?.toLowerCase() ?? null;
  const rising = verified.rising?.toLowerCase() ?? null;
  const lifePath = validNumber(numerologyData?.lifePath);
  const expression = validNumber(numerologyData?.expression ?? numerologyData?.expressionNumber);
  const soulUrge = validNumber(numerologyData?.soulUrge ?? numerologyData?.soulUrgeNumber);

  const sunPattern = sun ? SIGN_PATTERN[sun] : null;
  const moonPattern = moon ? SIGN_PATTERN[moon] : null;
  const risingPattern = rising ? SIGN_PATTERN[rising] : null;
  const pathPattern = lifePath ? NUMBER_PATTERN[lifePath] : null;
  const expressionPattern = expression ? NUMBER_PATTERN[expression] : null;
  const soulPattern = soulUrge ? NUMBER_PATTERN[soulUrge] : null;

  const supported = [sunPattern, moonPattern, risingPattern, pathPattern, expressionPattern, soulPattern].filter(Boolean);
  if (supported.length === 0) return unresolvedArchetype;

  const titleParts = unique([
    sunPattern ? String(verified.sun) + " " + sunPattern.word : null,
    pathPattern ? "LP" + lifePath + " " + pathPattern.word : null,
    moonPattern ? String(verified.moon) + " Moon " + moonPattern.word : null,
    risingPattern ? String(verified.rising) + " Rising " + risingPattern.word : null,
  ]);
  const title = titleParts.slice(0, 3).join(" × ");

  const sourceSentences = unique([
    sunPattern ? "Verified Sun symbolism emphasizes " + sunPattern.drive + "." : null,
    moonPattern ? "Verified Moon symbolism adds " + moonPattern.drive + "." : null,
    risingPattern ? "Verified Rising symbolism adds " + risingPattern.drive + "." : null,
    pathPattern ? "Life Path " + lifePath + " adds the governed numerology theme of " + pathPattern.drive + "." : null,
    expressionPattern ? "Expression " + expression + " adds an outward-development theme of " + expressionPattern.drive + "." : null,
    soulPattern ? "Soul Urge " + soulUrge + " adds an inner-motivation theme of " + soulPattern.drive + "." : null,
  ]);

  const strengths = unique([
    sunPattern?.gift, moonPattern?.gift, risingPattern?.gift,
    pathPattern?.gift, expressionPattern?.gift, soulPattern?.gift,
  ]);
  const shadows = unique([
    sunPattern?.shadow, moonPattern?.shadow, risingPattern?.shadow,
    pathPattern?.shadow, expressionPattern?.shadow, soulPattern?.shadow,
  ]);
  const themes = unique([
    verified.sun ? "Sun " + verified.sun : null,
    verified.moon ? "Moon " + verified.moon : null,
    verified.rising ? "Rising " + verified.rising : null,
    lifePath ? "Life Path " + lifePath : null,
    expression ? "Expression " + expression : null,
    soulUrge ? "Soul Urge " + soulUrge : null,
  ]);

  return {
    title,
    description:
      sourceSentences.join(" ") +
      " These layers are combined as a symbolic reflection profile, not a fixed or scientifically verified personality diagnosis.",
    strengths,
    shadows,
    themes,
    guidance: unique([
      sunPattern?.action, moonPattern?.action, risingPattern?.action,
      pathPattern?.action, expressionPattern?.action, soulPattern?.action,
    ]).slice(0, 3).join(" "),
  };
}
