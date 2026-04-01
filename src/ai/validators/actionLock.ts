/**
 * Action Lock — ensures every output ends with a concrete, time-bound action.
 *
 * If an output doesn't end with a clear "do this today" instruction,
 * the Action Lock generates one from the content.
 *
 * Rule: No floating philosophy. Every section lands in action.
 */

const ACTION_INDICATORS = [
  /do this today/i,
  /today[,:]\s/i,
  /before (the day ends|noon|tonight|bed|tomorrow)/i,
  /right now/i,
  /this week/i,
  /your (next|one) (move|step|action)/i,
  /start by/i,
  /first step/i,
  /pick one/i,
  /choose one/i,
  /send the/i,
  /have the conversation/i,
  /make the call/i,
  /write down/i,
  /block \d+ minutes/i,
  /set a (deadline|boundary|timer)/i,
  /cancel one/i,
  /say (no|yes) to/i,
  /stop (doing|saying|waiting)/i,
  /delete|remove|unsubscribe/i,
];

export function hasActionLock(text: string): boolean {
  const lastBlock = text.slice(-500);
  return ACTION_INDICATORS.some(p => p.test(lastBlock));
}

/**
 * Generates a "Do this today" line from text content analysis.
 * Falls back to universal actions if no specific action can be derived.
 */
export function generateActionLock(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes("conversation") || lower.includes("talk to") || lower.includes("tell")) {
    return "**Do this today:** Have the conversation you've been rehearsing in your head. 30 seconds of honesty beats days of mental replay.";
  }
  if (lower.includes("decision") || lower.includes("choose") || lower.includes("decide")) {
    return "**Do this today:** Write down the two options. Circle one. Set a 24-hour deadline to act on it.";
  }
  if (lower.includes("boundary") || lower.includes("say no") || lower.includes("overcommit")) {
    return "**Do this today:** Decline one thing you already resent agreeing to. One sentence. No explanation needed.";
  }
  if (lower.includes("stress") || lower.includes("overwhelm") || lower.includes("exhausted") || lower.includes("drained")) {
    return "**Do this today:** Cancel one non-essential thing from your schedule. Use that time to do nothing.";
  }
  if (lower.includes("pattern") || lower.includes("repeat") || lower.includes("cycle") || lower.includes("again")) {
    return "**Do this today:** Name the pattern out loud. Then do one thing differently than you did last time.";
  }
  if (lower.includes("avoid") || lower.includes("procrastinat") || lower.includes("delay")) {
    return "**Do this today:** Start the thing you're avoiding. Not finish it — just start. 10 minutes is enough.";
  }
  if (lower.includes("relationship") || lower.includes("partner") || lower.includes("friend")) {
    return "**Do this today:** Tell one person one honest thing about how you're feeling. Not a monologue — one sentence.";
  }
  if (lower.includes("work") || lower.includes("career") || lower.includes("project")) {
    return "**Do this today:** Identify the single most important task. Give it 90 minutes of undivided attention before anything else.";
  }

  const universals = [
    "**Do this today:** Pick the one thing that's been sitting on your mind the longest. Take the smallest possible action on it.",
    "**Do this today:** Before you go to sleep, write down the one thing you know you need to do but haven't. Tomorrow, do it first.",
    "**Do this today:** Identify what's draining you most right now. Remove one instance of it from your day.",
  ];

  const idx = new Date().getDate() % universals.length;
  return universals[idx];
}

/**
 * Ensures text ends with an action lock. Appends one if missing.
 */
export function enforceActionLock(text: string): string {
  if (hasActionLock(text)) return text;
  const actionLine = generateActionLock(text);
  return `${text}\n\n${actionLine}`;
}
