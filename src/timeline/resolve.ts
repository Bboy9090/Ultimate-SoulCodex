/**
 * src/timeline/resolve.ts
 *
 * Resolves the final phase from a ScoreBreakdown, applies tie-breaker logic,
 * and assembles the structured output expected by consumers.
 */

import {
  PHASES,
  HYBRID_PAIRS,
  type Phase,
  type ConfidenceLabel,
} from "./rules";
import { scoreTimeline, type TimelineInput, type ScoreBreakdown } from "./score";

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface PhaseOutput {
  /** Primary resolved phase. */
  phase: Phase;
  /** Secondary phase, set only when a hybrid is returned. */
  secondaryPhase?: Phase;
  /** Final per-phase integer scores. */
  scores: Record<Phase, number>;
  /** Ordered list of human-readable scoring contributions. */
  reasons: string[];
  /** One-line summary of what this phase is about. */
  focus: string;
  /** Concrete actions to take during this phase. */
  do: string[];
  /** Things to avoid during this phase. */
  dont: string[];
  /** Phase that is most likely to follow. */
  nextPhase: Phase;
  /** Short, grounded narrative (no mystical filler). */
  narrative: string;
}

// ---------------------------------------------------------------------------
// Phase content library
// ---------------------------------------------------------------------------

interface PhaseContent {
  focus: string;
  do: string[];
  dont: string[];
  nextPhase: Phase;
  narrativeTemplate: (
    primary: Phase,
    secondary: Phase | undefined,
    scores: Record<Phase, number>
  ) => string;
}

const PHASE_CONTENT: Record<Phase, PhaseContent> = {
  Ignition: {
    focus: "Starting new cycles and committing to direction.",
    do: [
      "Pick one clear goal and write it down.",
      "Take the first visible action within 48 hours.",
      "Tell at least one person your intention to create accountability.",
    ],
    dont: [
      "Don't over-plan before acting — momentum beats perfection here.",
      "Don't dilute energy across too many new projects at once.",
    ],
    nextPhase: "Expansion",
    narrativeTemplate: (p, s) =>
      s
        ? `This period scores highest in ${p} and ${s}. Conditions favor launching something new while expanding what already exists. Pick a primary initiative and move on it; the energy supports bold starts.`
        : `Scoring points clearly toward ${p}. This is a window for starting fresh — committing to a direction and putting early stakes in the ground. Move fast on the things you've been holding back.`,
  },

  Exposure: {
    focus: "Bringing hidden patterns, skills, or truths into the open.",
    do: [
      "Surface something you've been reluctant to show publicly.",
      "Ask for honest feedback on work or ideas you value.",
      "Study what recurring themes keep showing up in your decisions.",
    ],
    dont: [
      "Don't retreat further into privacy — this phase rewards visibility.",
      "Don't suppress insights that feel inconvenient.",
    ],
    nextPhase: "Integration",
    narrativeTemplate: (p, s) =>
      s
        ? `Scores land in ${p} and ${s}. You're in a stretch where things hidden tend to surface. Use that: put something real in front of an audience, or dig into what's been driving your patterns.`
        : `The ${p} phase is indicated. Patterns, truths, and suppressed material tend to come into focus during this window. Lean into transparency rather than away from it.`,
  },

  Construction: {
    focus: "Building systems, skills, and foundations that compound over time.",
    do: [
      "Identify one process or structure that needs to be formalized.",
      "Show up consistently — repetition builds the foundation here.",
      "Measure progress with concrete metrics, not feelings.",
    ],
    dont: [
      "Don't skip steps or look for shortcuts in foundational work.",
      "Don't start anything new that would fracture your current focus.",
    ],
    nextPhase: "Expansion",
    narrativeTemplate: (p, s) =>
      s
        ? `Scores converge on ${p} and ${s}. The work now is foundational — building systems and structures that will support future growth. Discipline and consistency are the leverage points.`
        : `${p} phase scores dominate. This is not a sprint; it's a construction window. Focus on the unglamorous, structural work that makes the next phase possible.`,
  },

  Expansion: {
    focus: "Scaling, extending reach, and capitalizing on built momentum.",
    do: [
      "Look for where current efforts can be multiplied, not just continued.",
      "Say yes to credible opportunities that align with your direction.",
      "Expand your network or audience in one deliberate way.",

    ],
    dont: [
      "Don't confuse expansion with scattered activity.",
      "Don't expand before the foundation from the previous phase is solid.",
    ],
    nextPhase: "Friction",
    narrativeTemplate: (p, s) =>
      s
        ? `${p} and ${s} share the top scores. Conditions support growth and outward movement. Extend what works, reach further, and take on more where the infrastructure is already in place.`
        : `${p} is the clear phase. The conditions favor outward movement and scaling. What was built can now be extended; what was started can now gain speed.`,
  },

  Friction: {
    focus: "Confronting resistance to identify what's weak and what's worth keeping.",
    do: [
      "Name the specific friction point — vague resistance solves nothing.",
      "Treat obstacles as diagnostic information about structural gaps.",
      "Address conflicts directly rather than managing around them.",
    ],
    dont: [
      "Don't interpret all difficulty as a signal to quit.",
      "Don't use busyness to avoid the real pressure point.",
    ],
    nextPhase: "Refinement",
    narrativeTemplate: (p, s) =>
      s
        ? `Scores point to ${p} and ${s}. Expect pressure, pushback, or internal resistance. That's not a bad sign — it's diagnostic. Use the friction to locate what needs to be restructured or eliminated.`
        : `${p} phase is dominant. This is a period of real resistance. The correct response is not to wait it out but to engage it: find the structural weakness the friction is pointing at and address it.`,
  },

  Refinement: {
    focus: "Improving precision, removing excess, and elevating quality.",
    do: [
      "Audit one current system and remove what's redundant.",
      "Raise the quality bar on something you've been treating as good enough.",
      "Do less, but do it better — concentrate effort.",
    ],
    dont: [
      "Don't mistake refinement for stagnation — you're optimising, not retreating.",
      "Don't add new features or scope while refining what exists.",
    ],
    nextPhase: "Integration",
    narrativeTemplate: (p, s) =>
      s
        ? `${p} and ${s} lead the scores. This stretch rewards careful work, not speed. Tighten what exists, remove noise, and raise the standard — the investment pays off in the next phase.`
        : `${p} is the primary phase. The emphasis is on precision and quality over quantity. Audit what you've built, strip what's weak, and make what remains excellent.`,
  },

  Integration: {
    focus: "Synthesizing experience into durable understanding and practice.",
    do: [
      "Articulate what you've actually learned from recent events.",
      "Connect disparate parts of your work into a unified approach.",
      "Rest strategically — integration requires consolidation, not acceleration.",
    ],
    dont: [
      "Don't rush into the next project before processing what just happened.",
      "Don't ignore relationship or collaborative dimensions of your work.",
    ],
    nextPhase: "Legacy",
    narrativeTemplate: (p, s) =>
      s
        ? `Scores align around ${p} and ${s}. This is a consolidation period — a time to synthesise what you've been through and make it stick. Slow down intentionally to absorb what happened.`
        : `${p} phase is indicated. The work here is internal and connective: pulling threads together, extracting what's durable, and preparing for what comes next.`,
  },

  Legacy: {
    focus: "Contributing to something larger and building what outlasts you.",
    do: [
      "Identify one thing you're building that will matter beyond this year.",
      "Transfer knowledge or skill to someone else.",
      "Make a strategic decision with a five-year horizon, not a five-month one.",
    ],
    dont: [
      "Don't sacrifice long-term positioning for short-term comfort.",
      "Don't work in isolation — legacy requires witnesses and collaborators.",
    ],
    nextPhase: "Ignition",
    narrativeTemplate: (p, s) =>
      s
        ? `${p} and ${s} dominate the scores. Long-game thinking is active. Decisions made now carry outsized forward weight. Prioritise what compounds: reputation, relationships, and structural contribution.`
        : `${p} phase leads. This is a period where the quality of your decisions has lasting consequences. Act with the end in mind: what do you want to have built when you look back at this stretch?`,
  },
};

// ---------------------------------------------------------------------------
// Tie-breaker logic
// ---------------------------------------------------------------------------

/**
 * Returns the Phase with the highest score, or `null` if multiple phases are
 * tied.
 */
function getTopPhase(scores: Record<Phase, number>): Phase | null {
  const sorted = (Object.entries(scores) as [Phase, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  if (sorted[0][1] === sorted[1][1]) return null; // tied
  return sorted[0][0];
}

/**
 * Returns the hybrid pair that contains the two phases with the highest
 * combined score, or `null` if the top two phases don't form a canonical
 * hybrid.
 */
function findHybrid(
  scores: Record<Phase, number>
): [Phase, Phase] | null {
  const sorted = (Object.entries(scores) as [Phase, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  const top = sorted[0][0];
  const second = sorted[1][0];

  for (const [a, b] of HYBRID_PAIRS) {
    if ((a === top && b === second) || (a === second && b === top)) {
      // Return in canonical order
      return [a, b];
    }
  }
  return null;
}

/**
 * Resolves the dominant phase given the full breakdown and tie-breaker
 * chain: astrology → numerology → themes → hybrid.
 *
 * Returns `{ phase, secondaryPhase?, tieBreakerUsed }`.
 */
function resolveDominantPhase(breakdown: ScoreBreakdown): {
  phase: Phase;
  secondaryPhase?: Phase;
  tieBreakerUsed: string;
} {
  // Fast path: one clear winner
  const top = getTopPhase(breakdown.scores);
  if (top) {
    return { phase: top, tieBreakerUsed: "score" };
  }

  // Tie-breaker 1: strongest single astrology cycle
  if (breakdown.strongestAstrologyPhase) {
    const astroTop = getTopPhase(breakdown.themeScores); // just for reference
    // Use the phase that astrology most directly pointed at
    return {
      phase: breakdown.strongestAstrologyPhase,
      tieBreakerUsed: "astrology",
    };
  }

  // Tie-breaker 2: numerology
  const numTop = getTopPhase(breakdown.numerologyScores);
  if (numTop) {
    return { phase: numTop, tieBreakerUsed: "numerology" };
  }

  // Tie-breaker 3: theme count
  const themeTop = getTopPhase(breakdown.themeScores);
  if (themeTop) {
    return { phase: themeTop, tieBreakerUsed: "themes" };
  }

  // Tie-breaker 4: hybrid pair
  const hybrid = findHybrid(breakdown.scores);
  if (hybrid) {
    return {
      phase: hybrid[0],
      secondaryPhase: hybrid[1],
      tieBreakerUsed: "hybrid",
    };
  }

  // Final fallback: first phase alphabetically by score order
  const fallback = (Object.entries(breakdown.scores) as [Phase, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
  return { phase: fallback, tieBreakerUsed: "fallback" };
}

// ---------------------------------------------------------------------------
// Main public function
// ---------------------------------------------------------------------------

/**
 * Computes a full {@link PhaseOutput} from the provided {@link TimelineInput}.
 *
 * This is the single entry point for consumers.
 *
 * @example
 * ```ts
 * import { resolvePhase } from "./resolve";
 *
 * const result = resolvePhase({
 *   personalYear: 8,
 *   astrologyCycles: ["saturn_strong", "jupiter_return"],
 *   themeTags: ["discipline", "legacy", "leadership"],
 *   confidence: "Verified",
 * });
 * console.log(result.phase); // "Construction" | "Legacy" | …
 * ```
 */
export function resolvePhase(input: TimelineInput): PhaseOutput {
  const breakdown = scoreTimeline(input);
  const { phase, secondaryPhase, tieBreakerUsed } = resolveDominantPhase(breakdown);

  const content = PHASE_CONTENT[phase];
  const narrative = content.narrativeTemplate(phase, secondaryPhase, breakdown.scores);

  const reasonsWithTieBreaker =
    tieBreakerUsed !== "score"
      ? [
          ...breakdown.reasons,
          `Tie-breaker applied: ${tieBreakerUsed}`,
        ]
      : breakdown.reasons;

  return {
    phase,
    ...(secondaryPhase ? { secondaryPhase } : {}),
    scores: breakdown.scores,
    reasons: reasonsWithTieBreaker,
    focus: content.focus,
    do: content.do,
    dont: content.dont,
    nextPhase: content.nextPhase,
    narrative,
  };
}
