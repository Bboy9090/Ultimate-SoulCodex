export type LifeEventCategory =
  | "breakup"
  | "betrayal"
  | "burnout"
  | "job_change"
  | "conflict"
  | "opportunity"
  | "move"
  | "loss"
  | "health"
  | "identity_shift"
  | "unknown";

export type LifeEventIntensity = "low" | "medium" | "high";

export type LifeEventInput = {
  /** Freeform user description. */
  text: string;
  /** Optional user-selected label; used as a strong hint (not required). */
  category_hint?: LifeEventCategory;
  /** Optional explicit context from the rest of the app. */
  phase?: string;
  driver?: string;
  /** ISO timestamp if client has it; used only for display. */
  occurred_at?: string;
};

export type LifeEventDecode = {
  category: LifeEventCategory;
  intensity: LifeEventIntensity;
  /** Plain English: why this pattern is showing up now. */
  meaning: string;
  /** Concrete next actions. */
  next_steps: string[];
  /** Things to avoid that make the pattern worse. */
  avoid: string[];
  /** A single sentence decision heuristic. */
  decision_rule: string;
  /** Optional: short prompt the UI can show to get more specific. */
  follow_up_questions: string[];
};

