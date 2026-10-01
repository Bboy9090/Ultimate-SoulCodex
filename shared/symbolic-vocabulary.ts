export type SymbolicAxis =
  | "analysis"
  | "consistency"
  | "directness"
  | "freedom"
  | "harmony"
  | "independence"
  | "partnership"
  | "recognition"
  | "sensitivity"
  | "speed"
  | "stability"
  | "structure";

export interface CanonicalSymbolicPattern {
  word: string;
  drive: string;
  gift: string;
  shadow: string;
  relationship: string;
  action: string;
  axes: SymbolicAxis[];
}

export const CANONICAL_SIGN_PATTERNS: Readonly<Record<string, CanonicalSymbolicPattern>> = {
  Aries: {
    word: "Pioneer",
    drive: "initiating action directly",
    gift: "courage and momentum",
    shadow: "moving faster than context",
    relationship: "may need honesty and room for direct action",
    action: "Separate urgency from importance before acting.",
    axes: ["speed", "directness"],
  },
  Taurus: {
    word: "Anchor",
    drive: "building stability",
    gift: "patience and durable follow-through",
    shadow: "holding position after conditions change",
    relationship: "may need consistency and tangible trust",
    action: "Identify one place where flexibility protects the larger commitment.",
    axes: ["stability", "consistency"],
  },
  Gemini: {
    word: "Messenger",
    drive: "connecting information and ideas",
    gift: "adaptability and verbal perspective",
    shadow: "scattering attention across too many signals",
    relationship: "may need conversation and mental responsiveness",
    action: "Finish one question before opening another.",
    axes: ["analysis", "freedom"],
  },
  Cancer: {
    word: "Keeper",
    drive: "protecting emotional safety and belonging",
    gift: "care and responsiveness",
    shadow: "carrying other people's needs",
    relationship: "may need reciprocity and reliable belonging",
    action: "Name the need before managing the atmosphere.",
    axes: ["sensitivity", "partnership"],
  },
  Leo: {
    word: "Radiant",
    drive: "expressing identity visibly",
    gift: "warmth and creative leadership",
    shadow: "using recognition as proof of worth",
    relationship: "may need appreciation without compulsory performance",
    action: "Make one meaningful move that does not depend on applause.",
    axes: ["recognition", "independence"],
  },
  Virgo: {
    word: "Refiner",
    drive: "practical improvement and careful refinement",
    gift: "precise and useful problem solving",
    shadow: "analysis expanding after enough information exists",
    relationship: "may need reliability, clarity, and respect for effort",
    action: "Define what is good enough before refining again.",
    axes: ["analysis", "structure"],
  },
  Libra: {
    word: "Mediator",
    drive: "fair exchange and relational balance",
    gift: "diplomacy and relational awareness",
    shadow: "delaying conflict until resentment grows",
    relationship: "may need mutuality and respectful negotiation",
    action: "State the uncomfortable preference before harmony becomes avoidance.",
    axes: ["harmony", "partnership"],
  },
  Scorpio: {
    word: "Alchemist",
    drive: "testing truth and protecting depth",
    gift: "focus and loyal depth",
    shadow: "suspicion remaining active past its evidence",
    relationship: "may need privacy and earned trust",
    action: "Separate what is known from what is feared before escalating.",
    axes: ["sensitivity", "directness"],
  },
  Sagittarius: {
    word: "Seeker",
    drive: "seeking meaning and expansion",
    gift: "broad perspective and optimism",
    shadow: "moving to the next horizon before depth develops",
    relationship: "may need truth and room to grow",
    action: "Finish one meaningful commitment before chasing the next possibility.",
    axes: ["freedom", "speed"],
  },
  Capricorn: {
    word: "Architect",
    drive: "building through discipline",
    gift: "strategy and endurance",
    shadow: "measuring worth mainly through output",
    relationship: "may need respect and dependable commitments",
    action: "Protect recovery as part of the plan rather than a reward after collapse.",
    axes: ["structure", "stability"],
  },
  Aquarius: {
    word: "Reformer",
    drive: "challenging defaults through independent systems thinking",
    gift: "originality and pattern perspective",
    shadow: "using detachment when stakes rise",
    relationship: "may need intellectual freedom and authentic difference",
    action: "Translate the idea into one human-scale action.",
    axes: ["independence", "analysis"],
  },
  Pisces: {
    word: "Dreamer",
    drive: "translating feeling into meaning",
    gift: "empathy and imaginative translation",
    shadow: "weakening boundaries while helping",
    relationship: "may need gentleness and clear emotional boundaries",
    action: "Identify which feeling is yours before deciding what to carry.",
    axes: ["sensitivity", "freedom"],
  },
};

export const CANONICAL_NUMBER_PATTERNS: Readonly<Record<number, CanonicalSymbolicPattern>> = {
  1: {
    word: "Initiator",
    drive: "self-directed initiation",
    gift: "pioneering independence",
    shadow: "mistaking support for interference",
    relationship: "may need autonomy without isolation",
    action: "Lead clearly while leaving room for collaboration.",
    axes: ["independence", "directness"],
  },
  2: {
    word: "Harmonizer",
    drive: "partnership",
    gift: "cooperation and sensitivity",
    shadow: "over-adjusting to preserve peace",
    relationship: "may need mutuality",
    action: "State one preference before adapting to everyone else.",
    axes: ["partnership", "harmony"],
  },
  3: {
    word: "Creator",
    drive: "expression",
    gift: "creative communication",
    shadow: "using activity to avoid depth",
    relationship: "may need room to be heard",
    action: "Finish and share one expression rather than polishing ten possibilities.",
    axes: ["recognition", "freedom"],
  },
  4: {
    word: "Builder",
    drive: "structure",
    gift: "building systems that last",
    shadow: "confusing control with safety",
    relationship: "may need dependable expectations",
    action: "Keep the structure and loosen one unnecessary rule.",
    axes: ["structure", "consistency"],
  },
  5: {
    word: "Explorer",
    drive: "freedom and experience",
    gift: "adaptability",
    shadow: "resisting repetition required for mastery",
    relationship: "may need movement without chaos",
    action: "Choose one commitment that creates more freedom later.",
    axes: ["freedom", "speed"],
  },
  6: {
    word: "Steward",
    drive: "responsibility and care",
    gift: "service and stewardship",
    shadow: "carrying duties never clearly accepted",
    relationship: "may need reciprocity",
    action: "Return one responsibility to its rightful owner.",
    axes: ["partnership", "consistency"],
  },
  7: {
    word: "Analyst",
    drive: "investigation and understanding",
    gift: "private mastery and depth",
    shadow: "waiting for impossible certainty",
    relationship: "may need privacy and intellectual trust",
    action: "Set a decision deadline before gathering another layer.",
    axes: ["analysis", "independence"],
  },
  8: {
    word: "Executive",
    drive: "material effectiveness",
    gift: "leadership and execution",
    shadow: "using achievement as the only measure",
    relationship: "may need respect without domination",
    action: "Define the ethical boundary before pursuing the result.",
    axes: ["structure", "recognition"],
  },
  9: {
    word: "Integrator",
    drive: "completion and contribution",
    gift: "large-context humanitarian perspective",
    shadow: "overextending for the larger mission",
    relationship: "may need boundaries around service",
    action: "Finish one cycle before volunteering for another.",
    axes: ["partnership", "stability"],
  },
  11: {
    word: "Visionary",
    drive: "vision and inspiration",
    gift: "unusual perspective translated for others",
    shadow: "treating intensity as certainty",
    relationship: "may need grounding around strong impressions",
    action: "Ground the insight in one observable test.",
    axes: ["sensitivity", "analysis"],
  },
  22: {
    word: "Master Builder",
    drive: "large-scale structure",
    gift: "turning vision into durable form",
    shadow: "making scale personally crushing",
    relationship: "may need sustainable delegation",
    action: "Reduce the vision to the next testable structure.",
    axes: ["structure", "stability"],
  },
  33: {
    word: "Teacher",
    drive: "service through example",
    gift: "compassionate leadership",
    shadow: "becoming responsible for everyone else's growth",
    relationship: "may need compassionate boundaries",
    action: "Teach the principle without taking over the person's work.",
    axes: ["partnership", "sensitivity"],
  },
};

export function canonicalSignPattern(sign: unknown): CanonicalSymbolicPattern | null {
  if (typeof sign !== "string") return null;
  const normalized = sign.trim().toLowerCase();
  const key = Object.keys(CANONICAL_SIGN_PATTERNS).find(
    (candidate) => candidate.toLowerCase() === normalized,
  );
  return key ? CANONICAL_SIGN_PATTERNS[key] ?? null : null;
}

export function canonicalNumberPattern(value: unknown): CanonicalSymbolicPattern | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? CANONICAL_NUMBER_PATTERNS[parsed] ?? null : null;
}
