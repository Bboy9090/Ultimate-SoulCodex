import type { LifeEventCategory, LifeEventDecode, LifeEventInput, LifeEventIntensity } from "./types.js";

type Classification = {
  category: LifeEventCategory;
  intensity: LifeEventIntensity;
  evidence: string[];
};

const CATEGORY_KEYWORDS: Record<LifeEventCategory, string[]> = {
  breakup: ["breakup", "broke up", "separation", "divorce", "split", "ended things"],
  betrayal: ["betray", "betrayed", "cheat", "cheated", "lied", "dishonest", "backstab", "secret", "affair"],
  burnout: ["burnout", "burned out", "exhausted", "overwhelmed", "drained", "can't keep up", "no energy"],
  job_change: ["job", "laid off", "fired", "quit", "resigned", "promotion", "new role", "career", "workplace"],
  conflict: ["argument", "fight", "conflict", "tension", "blow up", "resentment", "confrontation"],
  opportunity: ["opportunity", "offer", "invited", "chance", "opening", "breakthrough", "new door"],
  move: ["move", "moved", "relocate", "relocation", "new city", "new place", "apartment", "house"],
  loss: ["loss", "died", "death", "grief", "funeral", "passed away", "mourning"],
  health: ["health", "diagnosis", "sick", "ill", "hospital", "injury", "panic", "anxiety", "depression"],
  identity_shift: ["identity", "reinvent", "rebuild", "who i am", "new version", "awakening", "shift"],
  unknown: [],
};

const INTENSITY_HIGH = [
  "devastated",
  "traumatized",
  "can't eat",
  "cant eat",
  "can't sleep",
  "cant sleep",
  "panic",
  "suicidal",
  "hospital",
  "collapsed",
];
const INTENSITY_MEDIUM = ["stressed", "overwhelmed", "anxious", "scared", "angry", "grief", "hurt"];

function normalize(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, " ").trim();
}

function safeText(input: LifeEventInput): string {
  const t = typeof input.text === "string" ? input.text : "";
  return t.trim();
}

function classify(input: LifeEventInput): Classification {
  const text = normalize(safeText(input));
  const evidence: string[] = [];

  // Strong hint: category_hint (if present) wins unless the text is empty.
  if (input.category_hint && input.category_hint !== "unknown" && text.length > 0) {
    evidence.push(`category_hint:${input.category_hint}`);
    return { category: input.category_hint, intensity: inferIntensity(text), evidence };
  }

  const scores = new Map<LifeEventCategory, number>();
  const add = (cat: LifeEventCategory, n: number, ev: string) => {
    scores.set(cat, (scores.get(cat) ?? 0) + n);
    evidence.push(ev);
  };

  for (const [category, kws] of Object.entries(CATEGORY_KEYWORDS) as Array<[LifeEventCategory, string[]]>) {
    if (category === "unknown") continue;
    for (const kw of kws) {
      if (text.includes(kw)) add(category, 2, `kw:${category}:${kw}`);
    }
  }

  // Extra disambiguation nudges.
  if (text.includes("relationship") || text.includes("partner")) add("breakup", 1, "nudge:relationship");
  if (text.includes("trust") || text.includes("secret")) add("betrayal", 1, "nudge:trust");
  if (text.includes("manager") || text.includes("company") || text.includes("salary")) add("job_change", 1, "nudge:work");
  if (text.includes("diagnosed") || text.includes("symptom")) add("health", 1, "nudge:health");

  let best: LifeEventCategory = "unknown";
  let bestScore = 0;
  for (const [cat, score] of scores.entries()) {
    if (score > bestScore) {
      best = cat;
      bestScore = score;
    }
  }

  // If there's no useful signal, fall back to unknown.
  if (bestScore === 0 || text.length < 3) {
    return { category: "unknown", intensity: "low", evidence: evidence.length ? evidence : ["fallback:unknown"] };
  }

  return { category: best, intensity: inferIntensity(text), evidence };
}

function inferIntensity(text: string): LifeEventIntensity {
  const t = normalize(text);
  for (const kw of INTENSITY_HIGH) if (t.includes(kw)) return "high";
  for (const kw of INTENSITY_MEDIUM) if (t.includes(kw)) return "medium";
  if (t.length > 220) return "medium";
  return "low";
}

function buildDecode(category: LifeEventCategory, intensity: LifeEventIntensity, input: LifeEventInput): LifeEventDecode {
  const phase = input.phase ? String(input.phase) : undefined;
  const driver = input.driver ? String(input.driver) : undefined;

  const contextBits = [phase ? `phase:${phase}` : null, driver ? `driver:${driver}` : null].filter(Boolean);
  const context = contextBits.length ? ` Context: ${contextBits.join(", ")}.` : "";

  const baseMeaning =
    category === "unknown"
      ? `This event reads as a pattern-change signal rather than a single category.${context}`
      : `This event is most consistent with "${category}". It's a stress-test of boundaries, priorities, and self-trust.${context}`;

  const common = {
    meaning: baseMeaning,
    next_steps: [
      "Name what changed in one sentence.",
      "List the immediate constraints (time, money, energy, safety).",
      "Choose the smallest action that reduces risk in the next 24 hours.",
    ],
    avoid: ["Making permanent decisions while flooded", "Over-explaining to people who are not safe", "Reopening the wound for more data"],
    decision_rule: "If it increases clarity and reduces future regret, it’s a yes; if it increases chaos, it’s a no.",
    follow_up_questions: ["What exactly happened (one paragraph, no backstory)?", "What would 'stable' look like in 2 weeks?", "What boundary is now non-negotiable?"],
  } satisfies Omit<LifeEventDecode, "category" | "intensity">;

  const byCategory: Partial<Record<LifeEventCategory, Omit<LifeEventDecode, "category" | "intensity">>> = {
    breakup: {
      meaning: `A relationship chapter closed or is closing. The task is separation-with-integrity: grieve, detach, and stop negotiating with the past.${context}`,
      next_steps: [
        "Stop contact for 72 hours (unless safety/legal requires otherwise).",
        "Write the 3 non-negotiables you ignored.",
        "Tell one friend the facts and the boundary you’re keeping.",
      ],
      avoid: ["Closure-chasing", "Re-reading old messages to self-harm", "Trying to be 'the cool one' while bleeding"],
      decision_rule: "If contact reopens the wound without changing the structure, it’s a no.",
      follow_up_questions: ["What was the last clear boundary violation?", "What are you afraid will happen if you let it end?", "What do you need to recover your sleep/food routine?"],
    },
    betrayal: {
      meaning: `Trust was violated. The task is to make reality explicit: what happened, what it means, and what access is now removed.${context}`,
      next_steps: ["Document what you know (dates, actions, receipts).", "Reduce access: information, money, intimacy, proximity.", "Set one boundary in writing."],
      avoid: ["Arguing for honesty", "Trading your dignity for partial truth", "Explaining your standards to a person who benefits from ignoring them"],
      decision_rule: "Access follows evidence, not promises.",
      follow_up_questions: ["What is the clearest lie or concealment?", "What access did they have that they no longer get?", "What proof would be required to rebuild trust (if any)?"],
    },
    burnout: {
      meaning: `Your output exceeded your recovery. The task is capacity repair, not motivation hacks.${context}`,
      next_steps: ["Cut one commitment this week.", "Pick a daily shutdown time and keep it 5 days straight.", "Sleep first; then nutrition; then movement."],
      avoid: ["Adding new productivity systems", "Self-criticism as fuel", "Saying yes to keep people calm"],
      decision_rule: "If it costs recovery you don’t have, it’s unaffordable.",
      follow_up_questions: ["What are the top 2 energy leaks?", "What obligation can be renegotiated?", "What is the minimum viable day for the next 7 days?"],
    },
    job_change: {
      meaning: `Work structure is shifting. The task is to protect leverage: skills, reputation, cash runway, and decision clarity.${context}`,
      next_steps: ["List your 3 marketable skills in plain language.", "Update one resume/portfolio item today.", "Define your next role by constraints, not fantasy."],
      avoid: ["Numbing with applications with no strategy", "Burning bridges for short-term relief", "Taking a role that repeats the exact stress pattern"],
      decision_rule: "Choose the job that buys time and reduces repeating the same trap.",
      follow_up_questions: ["What pattern do you refuse to repeat in the next role?", "What runway do you have (weeks)?", "What is the one non-negotiable in the next contract?"],
    },
    conflict: {
      meaning: `A relationship or system is in active friction. The task is to move from emotion to terms: what you will and won’t do.${context}`,
      next_steps: ["Write your position in 3 sentences.", "Ask for a specific change with a deadline.", "If it’s unsafe, exit instead of negotiating."],
      avoid: ["Debating while dysregulated", "Trying to win instead of setting terms", "Recruiting allies to avoid the hard conversation"],
      decision_rule: "If the pattern repeats after a clear request, enforce the boundary.",
      follow_up_questions: ["What is the recurring trigger?", "What is the smallest behavioral change you need?", "What consequence will you actually follow through on?"],
    },
    opportunity: {
      meaning: `An opening appeared. The task is to evaluate fit and cost, not just excitement.${context}`,
      next_steps: ["Define success metrics before saying yes.", "Ask what resources/support come with it.", "Set a decision deadline."],
      avoid: ["Saying yes to earn approval", "Underestimating time cost", "Assuming unclear roles will clarify later"],
      decision_rule: "If the terms are vague, delay; if the terms are clean, decide fast.",
      follow_up_questions: ["What would make this a clean yes?", "What’s the hidden cost (time/identity/reputation)?", "What’s the downside scenario and can you absorb it?"],
    },
    move: {
      meaning: `Environment is changing. The task is to reduce chaos: logistics, routines, and a stable base.${context}`,
      next_steps: ["Create a 10-item essentials list for week one.", "Lock your sleep setup (bed, dark, quiet).", "Choose one daily routine to keep unchanged."],
      avoid: ["Over-planning instead of booking essentials", "Trying to recreate your old life immediately", "Neglecting admin (mail, bills, documents)"],
      decision_rule: "Stability first; optimization later.",
      follow_up_questions: ["What is the single biggest stressor about the move?", "What routine will anchor you?", "What support can you ask for this week?"],
    },
    loss: {
      meaning: `Something ended that cannot be negotiated back. The task is grief-with-structure: allow the feeling, protect the body, keep basic life running.${context}`,
      next_steps: ["Tell one person what you need (ride, food, company).", "Protect sleep and hydration for 7 days.", "Schedule one small ritual of remembrance."],
      avoid: ["Making major life decisions from raw grief", "Isolating completely", "Using work to outrun mourning"],
      decision_rule: "Today’s goal is stability, not closure.",
      follow_up_questions: ["What support would actually help this week?", "What responsibility can be paused?", "What simple ritual would honor what was lost?"],
    },
    health: {
      meaning: `Your body or nervous system is sending a limit signal. The task is to stabilize and get accurate information.${context}`,
      next_steps: ["Get proper evaluation if symptoms are persistent or severe.", "Track symptoms daily (time, triggers, severity).", "Reduce stimulants and restore basic routines."],
      avoid: ["Self-diagnosing from panic", "Ignoring red flags", "Using willpower to override recovery"],
      decision_rule: "Treat uncertainty like a risk: gather data, reduce exposure, stabilize.",
      follow_up_questions: ["What symptoms and how long?", "What makes it better or worse?", "What professional support is available to you?"],
    },
    identity_shift: {
      meaning: `Your self-definition is changing. The task is to make the next identity concrete through choices and constraints.${context}`,
      next_steps: ["Write the old identity in 5 words and release it.", "Pick one behavior that proves the new identity.", "Remove one habit that keeps you in the old role."],
      avoid: ["Announcing change without changing structure", "Trying to convince skeptics", "Keeping the same environment and expecting a new outcome"],
      decision_rule: "Identity changes after repeated actions, not insight.",
      follow_up_questions: ["What feels non-true now?", "What commitment would make this real?", "What environment change would support the shift?"],
    },
  };

  const chosen = byCategory[category] ?? common;

  // Intensity tuning: make "high" more stabilizing; make "low" more action-oriented.
  if (intensity === "high") {
    return {
      category,
      intensity,
      meaning: chosen.meaning,
      next_steps: ["Stabilize first (sleep, food, safety).", ...chosen.next_steps.slice(0, 2)],
      avoid: [...new Set(["Escalating the situation to get certainty", ...chosen.avoid])],
      decision_rule: "Do not decide from shock. Stabilize, then decide.",
      follow_up_questions: ["Are you safe right now?", ...chosen.follow_up_questions.slice(0, 2)],
    };
  }

  if (intensity === "low") {
    return {
      category,
      intensity,
      meaning: chosen.meaning,
      next_steps: chosen.next_steps,
      avoid: chosen.avoid,
      decision_rule: chosen.decision_rule,
      follow_up_questions: chosen.follow_up_questions,
    };
  }

  return { category, intensity, ...chosen };
}

export function decodeLifeEvent(input: LifeEventInput): LifeEventDecode {
  const text = safeText(input);
  const cls = classify({ ...input, text });
  return buildDecode(cls.category, cls.intensity, input);
}

