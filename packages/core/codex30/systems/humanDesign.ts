import type { Signal } from "../types.js";

const TYPE_TAGS: Record<string, string[]> = {
  reflector: ["social_sensitivity", "intuition", "privacy"],
  projector: ["leadership", "precision", "boundaries"],
  generator: ["craft", "discipline", "service"],
  manifesting_generator: ["craft", "courage", "innovation"],
  manifestor: ["leadership", "freedom", "intensity"],
};

const TYPE_EXPLANATIONS: Record<string, string> = {
  reflector: "A Reflector reading is best treated as a hypothesis about environmental sensitivity, not a fixed identity. In daily life, this may look like feeling clearer in some rooms and depleted in others, needing more time before major decisions, and noticing group tension before anyone names it. The benefit is strong situational awareness. The tradeoff is mistaking the atmosphere around you for a permanent truth about yourself. Other people may read your changing response as inconsistency when you may actually be registering changing conditions. A grounded experiment is to compare how the same decision feels across several days and environments before treating one moment as final.",
  projector: "A Projector reading points toward selective attention and guidance rather than endless output. In daily life, this may look like spotting inefficiency quickly, seeing what another person could improve, and becoming exhausted when you try to prove your value through constant labor. The benefit is precision and perspective. The tradeoff is offering insight before it is welcome or measuring worth by recognition. Other people may read your need for pacing as low commitment when the deeper issue may be energy allocation. A grounded experiment is to choose one place where your insight is clearly requested and notice whether the same effort lands differently.",
  generator: "A Generator reading emphasizes sustained engagement with work that feels responsive rather than forced. In daily life, this may look like building momentum once something genuinely interests you, becoming dependable through repetition, and feeling stuck when obligation replaces meaningful response. The benefit is durable energy and craft. The tradeoff is staying too long because you can keep going. Other people may mistake endurance for consent. A grounded experiment is to separate what you can continue from what you still want to continue.",
  manifesting_generator: "A Manifesting Generator reading emphasizes fast experimentation, multiple interests, and nonlinear progress. In daily life, this may look like skipping ahead, learning through motion, changing methods quickly, and returning later to repair steps that were rushed. The benefit is speed and inventive problem-solving. The tradeoff is frustration, unfinished foundations, or confusing other people with abrupt pivots. Other people may read your changes as unreliability when you may be testing for fit. A grounded experiment is to announce the pivot and complete one stabilizing step before starting the next branch.",
  manifestor: "A Manifestor reading emphasizes initiation and the need to move without excessive control from others. In daily life, this may look like acting before consensus forms, resisting micromanagement, and withdrawing when every move requires permission. The benefit is independent momentum. The tradeoff is creating avoidable resistance when people are affected but uninformed. Other people may read privacy as hostility when you may be protecting autonomy. A grounded experiment is to inform the people affected by your decision without turning that information into a request for permission.",
};

export function humanDesignSignals(hd: any): Signal[] {
  if (!hd?.type) return [];
  const raw = String(hd.type).toLowerCase().replace(/\s+/g, "_");
  const tags = TYPE_TAGS[raw] ?? ["courage", "craft"];
  const label = TYPE_EXPLANATIONS[raw]
    ?? `This ${hd.type} interpretation may describe pacing, rest needs, and decision timing, but it should be tested against lived experience. Notice when the pattern helps, what it costs when overused, how other people may misread it, and which practical adjustment creates more clarity.`;

  return [{
    id: `hd.type.${raw}`,
    system: "humanDesign",
    label,
    evidence: [`Human Design type entered or calculated as ${hd.type}. This is symbolic interpretation, not verified psychology.`],
    intensity: 0.75,
    polarity: "neutral",
    confidence: "low",
    tags,
  }];
}
