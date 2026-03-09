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
  };
}
