/**
 * Behavioral statement library.
 *
 * Each statement is:
 *   - first-person behavioral (not a label, not an adjective)
 *   - keyed by signal tags + optional behavioral inputs
 *   - scored for distinctiveness so the engine can prefer sharper copy
 *
 * Sections:
 *   core_pattern      — default operating mode
 *   pressure_pattern  — behavior under stress
 *   blind_spot        — consistent miss
 *   action_truth      — what to do differently NOW
 *   relationship_pattern — how they connect / disconnect
 */

export type StatementSection =
  | "core_pattern"
  | "pressure_pattern"
  | "blind_spot"
  | "action_truth"
  | "relationship_pattern";

export interface Statement {
  id: string;
  text: string;
  section: StatementSection;
  /** Theme tags (from scoreThemes) that activate this statement */
  tags: string[];
  /** Signal requirements — all must match for statement to qualify */
  requireAll?: string[];
  /** At least one of these must match */
  requireAny?: string[];
  /** Presence of these tags reduces this statement's score */
  penalizeIf?: string[];
  /**
   * stressElement / decisionStyle / socialEnergy matches boost score.
   * Format: "stressElement:earth", "decisionStyle:gut", "socialEnergy:introvert"
   */
  behaviorBoosts?: string[];
  /** 0-1: base distinctiveness score (pre-signal matching) */
  distinctiveness_base: number;
  /** 0-1: likelihood this fits many people with trivial edits */
  generic_risk: number;
  /** Whether this statement captures a surface/hidden tension */
  has_contradiction: boolean;
}

export const STATEMENTS: Statement[] = [
  // ── core_pattern ───────────────────────────────────────────────────────────
  {
    id: "cp-001",
    text: "I work well until I have to depend on someone else's timeline — that's when the friction starts.",
    section: "core_pattern",
    tags: ["precision", "order"],
    behaviorBoosts: ["stressElement:earth", "decisionStyle:calm_logic"],
    distinctiveness_base: 0.75,
    generic_risk: 0.2,
    has_contradiction: false,
  },
  {
    id: "cp-002",
    text: "I go quiet instead of saying I'm hurt. By the time I say something, the window has already closed.",
    section: "core_pattern",
    tags: ["privacy", "emotion_depth"],
    behaviorBoosts: ["stressElement:water", "decisionStyle:sleep_on_it"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: true,
  },
  {
    id: "cp-003",
    text: "I generate fast and audit slower. The gap between those two speeds is where I lose things.",
    section: "core_pattern",
    tags: ["intensity", "precision"],
    behaviorBoosts: ["stressElement:fire", "decisionStyle:gut"],
    distinctiveness_base: 0.8,
    generic_risk: 0.2,
    has_contradiction: true,
  },
  {
    id: "cp-004",
    text: "I know what I think before I know how I feel. By the time the emotion arrives, I've already made the decision.",
    section: "core_pattern",
    tags: ["truth", "precision"],
    behaviorBoosts: ["decisionStyle:calm_logic", "stressElement:air"],
    distinctiveness_base: 0.8,
    generic_risk: 0.25,
    has_contradiction: true,
  },
  {
    id: "cp-005",
    text: "I carry more than I show. What I reveal is a fraction of what's actually running.",
    section: "core_pattern",
    tags: ["privacy", "intensity"],
    distinctiveness_base: 0.7,
    generic_risk: 0.3,
    has_contradiction: true,
  },
  {
    id: "cp-006",
    text: "I say what I mean, usually once. I don't repeat myself — I update my read of the person.",
    section: "core_pattern",
    tags: ["truth", "boundaries"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: false,
  },
  {
    id: "cp-007",
    text: "I help because I'm good at it, not because I need to be needed. The distinction matters to me.",
    section: "core_pattern",
    tags: ["service", "precision"],
    distinctiveness_base: 0.8,
    generic_risk: 0.25,
    has_contradiction: false,
  },
  {
    id: "cp-008",
    text: "My output looks effortless because the effort is scheduled and invisible.",
    section: "core_pattern",
    tags: ["craft", "discipline"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: false,
  },
  {
    id: "cp-009",
    text: "I pick up on what's actually wrong, not what's being presented. This is useful and sometimes exhausting.",
    section: "core_pattern",
    tags: ["intuition", "healing"],
    distinctiveness_base: 0.75,
    generic_risk: 0.3,
    has_contradiction: true,
  },
  {
    id: "cp-010",
    text: "I need structure I designed. Someone else's structure feels like a constraint, not support.",
    section: "core_pattern",
    tags: ["order", "freedom"],
    behaviorBoosts: ["socialEnergy:introvert"],
    distinctiveness_base: 0.75,
    generic_risk: 0.25,
    has_contradiction: false,
  },
  {
    id: "cp-011",
    text: "I make decisions based on what I'd still stand behind in ten years. Short-term pressure doesn't move me.",
    section: "core_pattern",
    tags: ["legacy", "courage"],
    distinctiveness_base: 0.7,
    generic_risk: 0.3,
    has_contradiction: false,
  },
  {
    id: "cp-012",
    text: "I don't need a title to take charge — I need a gap where something important is being mishandled.",
    section: "core_pattern",
    tags: ["leadership", "truth"],
    distinctiveness_base: 0.8,
    generic_risk: 0.2,
    has_contradiction: false,
  },
  {
    id: "cp-013",
    text: "My self-respect is tied to execution quality, not how I feel about the work. The two rarely track together.",
    section: "core_pattern",
    tags: ["discipline", "craft"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: true,
  },
  {
    id: "cp-014",
    text: "I over-explain when I'm uncertain. The more unsure I am, the longer the explanation gets.",
    section: "core_pattern",
    tags: ["precision", "truth"],
    behaviorBoosts: ["decisionStyle:calm_logic"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },
  {
    id: "cp-015",
    text: "I move in short, intense bursts and then go dark. The cycle is predictable to me and invisible to everyone else.",
    section: "core_pattern",
    tags: ["intensity", "privacy"],
    behaviorBoosts: ["socialEnergy:introvert", "stressElement:fire"],
    distinctiveness_base: 0.85,
    generic_risk: 0.2,
    has_contradiction: true,
  },
  {
    id: "cp-016",
    text: "I delay action until I've mapped the failure modes. Speed feels like recklessness, not confidence.",
    section: "core_pattern",
    tags: ["precision", "order"],
    behaviorBoosts: ["decisionStyle:sleep_on_it", "stressElement:earth"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: false,
  },
  {
    id: "cp-017",
    text: "I process in private. By the time I speak, I've already run the decision through twelve layers.",
    section: "core_pattern",
    tags: ["privacy", "emotion_depth"],
    behaviorBoosts: ["decisionStyle:quiet_instinct", "socialEnergy:introvert"],
    distinctiveness_base: 0.8,
    generic_risk: 0.2,
    has_contradiction: false,
  },
  {
    id: "cp-018",
    text: "I think out loud, then act on whatever crystallized during the conversation — including with strangers.",
    section: "core_pattern",
    tags: ["truth", "social_sensitivity"],
    behaviorBoosts: ["stressElement:air", "decisionStyle:calm_logic", "socialEnergy:extrovert"],
    distinctiveness_base: 0.8,
    generic_risk: 0.25,
    has_contradiction: false,
  },
  {
    id: "cp-019",
    text: "I read the room fast but won't move until I can see the full picture. These two speeds cause friction.",
    section: "core_pattern",
    tags: ["intuition", "order"],
    behaviorBoosts: ["stressElement:earth", "decisionStyle:gut"],
    distinctiveness_base: 0.8,
    generic_risk: 0.2,
    has_contradiction: true,
  },
  {
    id: "cp-020",
    text: "I appear flexible. My preferences are rigid, but I keep them private until they're violated.",
    section: "core_pattern",
    tags: ["freedom", "privacy"],
    behaviorBoosts: ["stressElement:air"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: true,
  },

  // ── pressure_pattern ───────────────────────────────────────────────────────
  {
    id: "pp-001",
    text: "When I'm overwhelmed I go quiet and disappear into logistics. It looks productive. It's avoidance.",
    section: "pressure_pattern",
    tags: ["order", "privacy"],
    behaviorBoosts: ["stressElement:earth", "stressElement:water"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: true,
  },
  {
    id: "pp-002",
    text: "Under pressure I accelerate instead of pausing. I make more decisions to feel less helpless.",
    section: "pressure_pattern",
    tags: ["intensity", "courage"],
    behaviorBoosts: ["stressElement:fire", "decisionStyle:gut"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: true,
  },
  {
    id: "pp-003",
    text: "I go practical under pressure. I clean things, list things, fix problems that aren't the real one.",
    section: "pressure_pattern",
    tags: ["order", "precision"],
    behaviorBoosts: ["stressElement:earth"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: true,
  },
  {
    id: "pp-004",
    text: "I intellectualize when I'm threatened. I get articulate about exactly why I'm not upset.",
    section: "pressure_pattern",
    tags: ["truth", "precision"],
    behaviorBoosts: ["stressElement:air", "decisionStyle:calm_logic"],
    distinctiveness_base: 0.95,
    generic_risk: 0.05,
    has_contradiction: true,
  },
  {
    id: "pp-005",
    text: "I freeze when I can't map the outcome. Action feels like guessing, and I don't guess.",
    section: "pressure_pattern",
    tags: ["precision", "order"],
    behaviorBoosts: ["decisionStyle:sleep_on_it"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: false,
  },
  {
    id: "pp-006",
    text: "I absorb everyone's tension and then finally snap about something unrelated.",
    section: "pressure_pattern",
    tags: ["social_sensitivity", "emotion_depth"],
    behaviorBoosts: ["stressElement:water"],
    distinctiveness_base: 0.85,
    generic_risk: 0.2,
    has_contradiction: true,
  },
  {
    id: "pp-007",
    text: "I go silent when I'm hurt. Everyone reads this as composure. It is not composure.",
    section: "pressure_pattern",
    tags: ["privacy", "intensity"],
    behaviorBoosts: ["stressElement:fire"],
    distinctiveness_base: 0.95,
    generic_risk: 0.05,
    has_contradiction: true,
  },
  {
    id: "pp-008",
    text: "I manage my face when I'm struggling. The performance is good. The internal cost is not.",
    section: "pressure_pattern",
    tags: ["privacy", "discipline"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: true,
  },
  {
    id: "pp-009",
    text: "Under pressure I say things I normally filter. This is useful or destructive depending on the room.",
    section: "pressure_pattern",
    tags: ["truth", "boundaries"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: true,
  },
  {
    id: "pp-010",
    text: "I cut things off when I'm stressed instead of renegotiating. This works short-term and complicates long-term.",
    section: "pressure_pattern",
    tags: ["boundaries", "freedom"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: true,
  },
  {
    id: "pp-011",
    text: "I compress instead of releasing. The explosion later is disproportionate to what actually triggered it.",
    section: "pressure_pattern",
    tags: ["intensity", "emotion_depth"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: true,
  },
  {
    id: "pp-012",
    text: "I start tracking everyone else's state as a way to avoid tracking my own.",
    section: "pressure_pattern",
    tags: ["healing", "social_sensitivity"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: true,
  },
  {
    id: "pp-013",
    text: "I become more susceptible to other people's moods when I'm already at capacity.",
    section: "pressure_pattern",
    tags: ["social_sensitivity", "emotion_depth"],
    behaviorBoosts: ["socialEnergy:introvert"],
    distinctiveness_base: 0.8,
    generic_risk: 0.2,
    has_contradiction: false,
  },
  {
    id: "pp-014",
    text: "I talk through problems with people who aren't involved. This helps me think but delays resolution.",
    section: "pressure_pattern",
    tags: ["truth", "social_sensitivity"],
    behaviorBoosts: ["stressElement:air", "socialEnergy:extrovert"],
    distinctiveness_base: 0.8,
    generic_risk: 0.2,
    has_contradiction: true,
  },
  {
    id: "pp-015",
    text: "I get sharp when stressed — tighter, faster, harder to interrupt. It works until it isolates me.",
    section: "pressure_pattern",
    tags: ["precision", "intensity"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: true,
  },

  // ── blind_spot ──────────────────────────────────────────────────────────────
  {
    id: "bs-001",
    text: "I assume everyone else is tracking the same variables I am. They are not.",
    section: "blind_spot",
    tags: ["precision", "truth"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },
  {
    id: "bs-002",
    text: "I expect people to ask before assuming I'm fine. They don't — they accept the performance.",
    section: "blind_spot",
    tags: ["privacy", "service"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: true,
  },
  {
    id: "bs-003",
    text: "I mistake emotional volume for emotional accuracy. Feeling strongly is not the same as being right.",
    section: "blind_spot",
    tags: ["intensity", "emotion_depth"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },
  {
    id: "bs-004",
    text: "I calibrate for honesty and under-calibrate for timing. Truth without timing is noise.",
    section: "blind_spot",
    tags: ["truth", "precision"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },
  {
    id: "bs-005",
    text: "I solve problems before checking whether the other person wanted them solved.",
    section: "blind_spot",
    tags: ["service", "precision"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },
  {
    id: "bs-006",
    text: "I hold myself to a standard I haven't stated clearly enough for anyone else to meet.",
    section: "blind_spot",
    tags: ["order", "precision"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },
  {
    id: "bs-007",
    text: "I plan so far forward that I miss what's actionable today.",
    section: "blind_spot",
    tags: ["legacy", "order"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: false,
  },
  {
    id: "bs-008",
    text: "I withhold half-finished work until it's ready, which delays feedback I actually need.",
    section: "blind_spot",
    tags: ["craft", "precision"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: true,
  },
  {
    id: "bs-009",
    text: "I trust my first read of people and don't update it well when new evidence arrives.",
    section: "blind_spot",
    tags: ["intuition", "truth"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: false,
  },
  {
    id: "bs-010",
    text: "I absorb group energy and call it my own opinion later.",
    section: "blind_spot",
    tags: ["social_sensitivity", "healing"],
    behaviorBoosts: ["stressElement:water"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },

  // ── action_truth ────────────────────────────────────────────────────────────
  {
    id: "at-001",
    text: "Lock one decision today that I've been over-analyzing. The analysis is not improving the outcome.",
    section: "action_truth",
    tags: ["precision", "order"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: false,
  },
  {
    id: "at-002",
    text: "Tell one person what I actually need — not what I can manage without. What I actually need.",
    section: "action_truth",
    tags: ["privacy", "service"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },
  {
    id: "at-003",
    text: "Delay one response by twelve hours and see if what I was going to say still serves the conversation.",
    section: "action_truth",
    tags: ["truth", "intensity"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: false,
  },
  {
    id: "at-004",
    text: "Do the thing for myself first. The version of me that helps from depletion is less accurate.",
    section: "action_truth",
    tags: ["service", "healing"],
    distinctiveness_base: 0.8,
    generic_risk: 0.2,
    has_contradiction: false,
  },
  {
    id: "at-005",
    text: "Write down the next step, not the vision. The vision is not the blocker.",
    section: "action_truth",
    tags: ["legacy", "order"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },
  {
    id: "at-006",
    text: "Ship the eighty percent version. The remaining twenty percent isn't quality — it's permission anxiety.",
    section: "action_truth",
    tags: ["craft", "precision"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },
  {
    id: "at-007",
    text: "Name the feeling before acting on it. Even privately. Especially privately.",
    section: "action_truth",
    tags: ["intensity", "emotion_depth"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: false,
  },
  {
    id: "at-008",
    text: "Describe my standard to one person and see if they can restate it. If they can't, the standard isn't clear.",
    section: "action_truth",
    tags: ["order", "truth"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },
  {
    id: "at-009",
    text: "Identify which of my opinions came from the room this week and which came from me.",
    section: "action_truth",
    tags: ["social_sensitivity", "truth"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: false,
  },
  {
    id: "at-010",
    text: "Define what structure I would actually accept. 'No structure' usually means 'the wrong structure.'",
    section: "action_truth",
    tags: ["freedom", "order"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: false,
  },

  // ── relationship_pattern ────────────────────────────────────────────────────
  {
    id: "rp-001",
    text: "I am easier to know in writing than in person. This isn't distance — it's compression.",
    section: "relationship_pattern",
    tags: ["privacy", "intensity"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: true,
  },
  {
    id: "rp-002",
    text: "I offer a lot once and rarely twice. This isn't coldness; it's calibration.",
    section: "relationship_pattern",
    tags: ["truth", "boundaries"],
    distinctiveness_base: 0.9,
    generic_risk: 0.1,
    has_contradiction: true,
  },
  {
    id: "rp-003",
    text: "I show closeness through usefulness. If I'm not helping I'm not sure how else to signal I care.",
    section: "relationship_pattern",
    tags: ["service", "precision"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: true,
  },
  {
    id: "rp-004",
    text: "I track everyone's state automatically. I've read the room before I've introduced myself.",
    section: "relationship_pattern",
    tags: ["social_sensitivity", "intuition"],
    distinctiveness_base: 0.85,
    generic_risk: 0.15,
    has_contradiction: false,
  },
  {
    id: "rp-005",
    text: "I need people who can sit with my full presence without trying to manage it.",
    section: "relationship_pattern",
    tags: ["intensity", "freedom"],
    distinctiveness_base: 0.85,
    generic_risk: 0.2,
    has_contradiction: false,
  },
];

/** Return statements eligible for a given section, filtered by tag overlap */
export function getCandidates(
  section: StatementSection,
  themeTags: string[],
  stressElement?: string,
  decisionStyle?: string,
  socialEnergy?: string,
): Statement[] {
  return STATEMENTS.filter(s => {
    if (s.section !== section) return false;
    if (s.requireAll && !s.requireAll.every(t => themeTags.includes(t))) return false;
    if (s.requireAny && !s.requireAny.some(t => themeTags.includes(t))) return false;
    // Must share at least one tag with current themes
    return s.tags.some(t => themeTags.includes(t));
  });
}
