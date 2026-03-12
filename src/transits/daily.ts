import type { TimelinePhase } from "../../services/timeline/types";

export interface DailyCardInput {
  phase: TimelinePhase | string;
  decisionStyle?: string;
}

export interface DailyCard {
  phase: TimelinePhase;
  focus: string;
  actions: string[];
  avoid: string[];
  decisionAdvice: string;
  date: string;
}

const PHASE_GUIDANCE: Record<TimelinePhase, { focus: string; actions: string[]; avoid: string[] }> = {
  Ignition: {
    focus: "Start the one thing you've been circling.",
    actions: [
      "Pick one clear goal and write it down.",
      "Take the first visible action within 48 hours.",
      "Tell someone your intention to create accountability.",
    ],
    avoid: [
      "Don't over-plan before acting — momentum beats perfection.",
      "Don't dilute energy across too many new projects at once.",
    ],
  },
  Exposure: {
    focus: "Bring hidden patterns, skills, or truths into the open.",
    actions: [
      "Surface something you've been reluctant to show publicly.",
      "Ask for honest feedback on work or ideas you value.",
      "Study recurring themes in your decisions.",
    ],
    avoid: [
      "Don't retreat further into privacy — this phase rewards visibility.",
      "Don't suppress insights that feel inconvenient.",
    ],
  },
  Construction: {
    focus: "Build systems, skills, and foundations that compound over time.",
    actions: [
      "Identify one process or structure that needs to be formalized.",
      "Show up consistently — repetition builds the foundation here.",
      "Measure progress with concrete metrics, not feelings.",
    ],
    avoid: [
      "Don't skip steps or look for shortcuts in foundational work.",
      "Don't start anything new that would fracture your current focus.",
    ],
  },
  Expansion: {
    focus: "Scale, extend reach, and capitalize on built momentum.",
    actions: [
      "Look for where current efforts can be multiplied, not just continued.",
      "Say yes to credible opportunities that align with your direction.",
      "Expand your network or audience in one deliberate way.",
    ],
    avoid: [
      "Don't confuse expansion with scattered activity.",
      "Don't expand before the foundation from the previous phase is solid.",
    ],
  },
  Friction: {
    focus: "Confront resistance to identify what's weak and what's worth keeping.",
    actions: [
      "Name the specific friction point — vague resistance solves nothing.",
      "Treat obstacles as diagnostic information about structural gaps.",
      "Address conflicts directly rather than managing around them.",
    ],
    avoid: [
      "Don't interpret all difficulty as a signal to quit.",
      "Don't use busyness to avoid the real pressure point.",
    ],
  },
  Refinement: {
    focus: "Improve precision, remove excess, and elevate quality.",
    actions: [
      "Audit one current system and remove what's redundant.",
      "Raise the quality bar on something you've been treating as good enough.",
      "Do less, but do it better — concentrate effort.",
    ],
    avoid: [
      "Don't mistake refinement for stagnation — you're optimizing, not retreating.",
      "Don't add new features or scope while refining what exists.",
    ],
  },
  Integration: {
    focus: "Synthesize experience into durable understanding and practice.",
    actions: [
      "Articulate what you've actually learned from recent events.",
      "Connect disparate parts of your work into a unified approach.",
      "Rest strategically — integration requires consolidation, not acceleration.",
    ],
    avoid: [
      "Don't rush into the next project before processing what just happened.",
      "Don't ignore relationship or collaborative dimensions of your work.",
    ],
  },
  Legacy: {
    focus: "Contribute to something larger and build what outlasts you.",
    actions: [
      "Identify one thing you're building that will matter beyond this year.",
      "Transfer knowledge or skill to someone else.",
      "Make a strategic decision with a five-year horizon, not a five-month one.",
    ],
    avoid: [
      "Don't sacrifice long-term positioning for short-term comfort.",
      "Don't work in isolation — legacy requires witnesses and collaborators.",
    ],
  },
};

const DECISION_ADVICE: Record<string, string> = {
  calm_logic:     "Your clearest thinking lands between 10am and noon. Lock big decisions into that window.",
  sleep_on_it:    "Don't finalize anything today that you haven't slept on. Your best answer will come tonight.",
  quiet_instinct: "The first signal you got this morning is probably right. Trust it before the noise builds.",
  willpower:      "Commit early and hold the line. Second-guessing costs you more energy than following through.",
  gut_yes_no:     "If you can't feel a clear yes, it's a no. Trust the silence.",
  analysis:       "Map the decision before noon, choose by 2pm. More data after that won't help you.",
  gut:            "Your intuition is ahead of your logic today. Move on the feeling.",
  consensus:      "Check your thinking with one trusted person before acting. One voice, not five.",
  impulse:        "Notice which impulses have energy and which have anxiety. Act on energy. Pause on anxiety.",
  avoidance:      "Pick the thing you've been avoiding longest. Address it first — the rest is easier after.",
};

const DEFAULT_DECISION_ADVICE =
  "Give your decision time to breathe before committing. Clarity comes after the noise settles.";

export function dailyCard(input: DailyCardInput): DailyCard {
  // Integration is the default fallback: it is the most universally applicable phase —
  // synthesizing experience and preparing for what comes next — and is safe to show
  // when the caller provides an unrecognized phase name.
  const resolvedPhase: TimelinePhase =
    (input.phase as TimelinePhase) in PHASE_GUIDANCE
      ? (input.phase as TimelinePhase)
      : "Integration";
  const guidance = PHASE_GUIDANCE[resolvedPhase];
  const decisionAdvice =
    (input.decisionStyle ? DECISION_ADVICE[input.decisionStyle] : undefined) ??
    DEFAULT_DECISION_ADVICE;

  return {
    phase: resolvedPhase,
    focus: guidance.focus,
    actions: guidance.actions,
    avoid: guidance.avoid,
    decisionAdvice,
    date: new Date().toISOString().slice(0, 10),
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
  return transits.transits
    .slice(0, 3)
    .map((t) => ({
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
      transits: buildTransitDetails(transits),
      decisionAdvice: buildDecisionAdvice(input.decisionStyle, transits),
    };
  }

  return {
    focus: `Focus on the themes of the ${input.phase} phase.`,
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
