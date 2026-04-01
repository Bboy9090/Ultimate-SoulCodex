/**
 * Precision Rewrite Engine — deterministic vague-to-specific text processor.
 *
 * Catches vague sentences and replaces them with concrete alternatives.
 * No LLM needed. Runs in the pipeline before any AI rewrite layer.
 *
 * Targets the exact problem: "sounds deep but says nothing."
 */

interface RewriteRule {
  pattern: RegExp;
  replacement: string | ((match: string, ...groups: string[]) => string);
}

const VAGUE_SENTENCE_PATTERNS: RewriteRule[] = [
  { pattern: /you may feel (some |a )?tension/gi, replacement: "you're dealing with conflicting expectations from two directions" },
  { pattern: /a shift is (happening|occurring|taking place)/gi, replacement: "something you relied on is changing — name it" },
  { pattern: /energy is (present|available|around you)/gi, replacement: "you have momentum right now — use it on one specific thing" },
  { pattern: /a door is opening/gi, replacement: "an option is becoming available — decide if you want it before it decides for you" },
  { pattern: /the universe (is |wants |has )/gi, replacement: "the situation " },
  { pattern: /trust the process/gi, replacement: "keep doing the work even when results aren't visible yet" },
  { pattern: /lean into/gi, replacement: "move toward" },
  { pattern: /hold space for/gi, replacement: "make room for" },
  { pattern: /you are being called to/gi, replacement: "the situation requires you to" },
  { pattern: /invites you to/gi, replacement: "requires you to" },
  { pattern: /external forces mirror your internal/gi, replacement: "what's happening around you is triggering an old pattern" },
  { pattern: /embrace (the |this |your )/gi, replacement: "accept " },
  { pattern: /sit with (the |this |your )?(discomfort|uncertainty|feeling)/gi, replacement: "notice the discomfort without reacting to it for 10 minutes" },
  { pattern: /on a deeper level/gi, replacement: "specifically" },
  { pattern: /at a soul level/gi, replacement: "at the core of this" },
  { pattern: /this (energy|phase|period) is asking/gi, replacement: "what's needed right now is" },
  { pattern: /you are being (tested|challenged)/gi, replacement: "the current situation is harder than usual" },
  { pattern: /your (inner|higher) (self|wisdom) (knows|is telling you)/gi, replacement: "you already know the answer" },
  { pattern: /the stars (are |suggest |indicate )/gi, replacement: "the patterns suggest " },
  { pattern: /forces are at play/gi, replacement: "multiple pressures are active" },
  { pattern: /i see the same pattern show(ing)? up across contexts/gi, replacement: "this pattern repeats — in decisions, relationships, and how you handle pressure" },
  { pattern: /something about (this|that|you)/gi, replacement: "specifically, " },
  { pattern: /in many ways/gi, replacement: "" },
  { pattern: /in different contexts/gi, replacement: "at work, in relationships, and in how you spend time alone" },
  { pattern: /a powerful time/gi, replacement: "a period where your decisions carry more weight than usual" },
  { pattern: /a beautiful reminder/gi, replacement: "a clear signal" },
  { pattern: /speaks to/gi, replacement: "reveals" },
  { pattern: /resonates with/gi, replacement: "connects to" },
  { pattern: /a season of/gi, replacement: "a period requiring" },
  { pattern: /a period of/gi, replacement: "a stretch of" },
];

export function precisionRewrite(text: string): { text: string; rewrites: number } {
  let current = text;
  let count = 0;

  for (const rule of VAGUE_SENTENCE_PATTERNS) {
    const before = current;
    if (typeof rule.replacement === "string") {
      current = current.replace(rule.pattern, rule.replacement);
    } else {
      current = current.replace(rule.pattern, rule.replacement);
    }
    if (current !== before) count++;
  }

  current = current.replace(/\s{2,}/g, " ").replace(/\.\s*\./g, ".").trim();

  return { text: current, rewrites: count };
}

/**
 * "Where This Shows Up" enhancer.
 * For any behavioral statement, maps it to real-life domains.
 */
export function addWhereThisShowsUp(behaviorDescription: string): string {
  const lower = behaviorDescription.toLowerCase();

  const domains: string[] = [];

  if (lower.includes("avoid") || lower.includes("delay") || lower.includes("procrastinat")) {
    domains.push("the conversations you keep postponing");
    domains.push("the projects sitting at 80% done");
  }
  if (lower.includes("control") || lower.includes("rigid") || lower.includes("structure")) {
    domains.push("how you react when plans change unexpectedly");
    domains.push("the way you micromanage details others don't care about");
  }
  if (lower.includes("overcommit") || lower.includes("too much") || lower.includes("exhaust")) {
    domains.push("the things you agreed to this week that you already regret");
    domains.push("how full your calendar looks vs. how productive you actually feel");
  }
  if (lower.includes("emotion") || lower.includes("feel") || lower.includes("react")) {
    domains.push("your last difficult conversation — how you responded vs. how you wish you had");
    domains.push("the thing that frustrated you yesterday that you're still thinking about");
  }
  if (lower.includes("decision") || lower.includes("choose") || lower.includes("decide")) {
    domains.push("the decision you've been circling for more than a week");
    domains.push("the last time you said 'I'll think about it' instead of answering");
  }

  if (domains.length === 0) {
    domains.push("your work decisions");
    domains.push("the conversations you keep replaying");
    domains.push("how you spend your first hour each morning");
  }

  return `**Where this shows up:**\n${domains.slice(0, 3).map(d => `• ${d}`).join("\n")}`;
}
