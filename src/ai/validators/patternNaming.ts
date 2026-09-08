/**
 * Pattern Naming System — labels behaviors with memorable names.
 *
 * When the user sees "The Overthink → Delay → Regret Loop," they recognize
 * themselves instantly. Named patterns stick. Unnamed patterns repeat.
 */

export interface NamedPattern {
  name: string;
  shortName: string;
  description: string;
  trigger: string;
  cost: string;
  interrupt: string;
}

const PATTERNS: NamedPattern[] = [
  {
    name: "The Overthink → Delay → Regret Loop",
    shortName: "Overthink-Delay",
    description: "You analyze until the window closes, then regret not acting",
    trigger: "A decision with no perfect option",
    cost: "Missed opportunities and growing frustration with yourself",
    interrupt: "Set a 24-hour decision deadline. Pick the 70% option. Move.",
  },
  {
    name: "The Over-Responsibility Trap",
    shortName: "Over-Responsibility",
    description: "You take on what belongs to others because it feels easier than saying no",
    trigger: "Someone else's problem landing in your space",
    cost: "Exhaustion and resentment that leaks into everything else",
    interrupt: "Before saying yes, ask: 'Is this actually mine to carry?'",
  },
  {
    name: "The Comfort Cling",
    shortName: "Comfort-Cling",
    description: "You hold onto something that stopped working because the familiar feels safer than the unknown",
    trigger: "Any situation that requires releasing control or certainty",
    cost: "Stagnation disguised as stability",
    interrupt: "Name what you're holding onto. Ask: 'Is this serving me or just familiar?'",
  },
  {
    name: "The Performance Loop",
    shortName: "Performance-Loop",
    description: "You show competence instead of vulnerability because being seen as capable feels safer than being seen as human",
    trigger: "Any moment where honesty would reveal imperfection",
    cost: "People trust your output but don't actually know you",
    interrupt: "Tell one person one real thing today. Not your achievements — your actual state.",
  },
  {
    name: "The Silent Build → Abrupt Exit",
    shortName: "Silent-Exit",
    description: "You tolerate small issues until they become intolerable, then you leave suddenly",
    trigger: "Accumulated minor grievances without communication",
    cost: "Relationships end in confusion. The other person never saw it coming.",
    interrupt: "Address the irritation when it's small — one sentence, same day",
  },
  {
    name: "The Preparation Illusion",
    shortName: "Prep-Illusion",
    description: "You mistake planning for progress. Research, notes, lists — but no execution.",
    trigger: "Fear of failure disguised as thoroughness",
    cost: "Months pass. The plan is perfect. Nothing happened.",
    interrupt: "Close the plan. Open the work. Start the hardest part first.",
  },
  {
    name: "The Reactive Yes",
    shortName: "Reactive-Yes",
    description: "You agree to things in the moment, then resent them later",
    trigger: "Social pressure, guilt, or the desire to be liked",
    cost: "A calendar full of obligations you never chose",
    interrupt: "Default response: 'Let me check and get back to you.' Buy 24 hours.",
  },
  {
    name: "The Control Substitution",
    shortName: "Control-Sub",
    description: "When life feels chaotic, you control the wrong thing — organizing, cleaning, optimizing details that don't matter",
    trigger: "Feeling powerless about something large",
    cost: "Energy spent on the small while the real issue grows",
    interrupt: "Ask: 'Am I doing this because it matters, or because it's the only thing I can control?'",
  },
  {
    name: "The Emotional Intellectualizer",
    shortName: "Intellectualizer",
    description: "You explain your feelings instead of feeling them. You understand anger but don't let yourself be angry.",
    trigger: "Any strong emotion that threatens composure",
    cost: "Feelings don't go away when explained — they go underground",
    interrupt: "When you catch yourself analyzing a feeling, stop. Name it in one word. Sit with it for 60 seconds.",
  },
  {
    name: "The Comparison Drift",
    shortName: "Comparison-Drift",
    description: "You check how others are doing instead of checking how you're doing",
    trigger: "Uncertainty about your own progress",
    cost: "You build toward someone else's definition of success",
    interrupt: "Close the feed. Open a blank page. Write: 'What do I actually want?' Answer honestly.",
  },
  {
    name: "The Help Refusal",
    shortName: "Help-Refusal",
    description: "You do things alone that would be easier with help, because asking feels like weakness",
    trigger: "Any task that reveals you don't have it all figured out",
    cost: "Everything takes twice as long and you resent people for not noticing",
    interrupt: "Ask one person for one specific thing. Not 'I need help' — a concrete request.",
  },
  {
    name: "The Urgency Addiction",
    shortName: "Urgency-Addict",
    description: "You only act under pressure. Without a deadline, nothing moves.",
    trigger: "Calm periods that feel unproductive",
    cost: "Chronic stress becomes the only fuel. When it stops, so do you.",
    interrupt: "Create one artificial deadline today for something that has no external pressure.",
  },
];

/**
 * Detects and names patterns from text content or profile data.
 */
export function detectPatterns(
  text: string,
  profileShadows?: string[],
  stressPattern?: string
): NamedPattern[] {
  const lower = text.toLowerCase();
  const detected: NamedPattern[] = [];

  const keywords: Record<string, string[]> = {
    "Overthink-Delay": ["overthink", "analyze", "can't decide", "paralysis", "delay", "too long", "stuck", "indecisive"],
    "Over-Responsibility": ["too much", "carry", "responsible", "their problem", "take on", "should help", "everyone else"],
    "Comfort-Cling": ["holding on", "can't let go", "familiar", "comfortable", "afraid to leave", "staying because"],
    "Performance-Loop": ["prove", "show them", "competent", "capable", "performing", "pretending", "fine"],
    "Silent-Exit": ["tolerate", "building up", "last straw", "suddenly", "done", "can't anymore"],
    "Prep-Illusion": ["planning", "preparing", "research", "not ready", "more information", "almost ready"],
    "Reactive-Yes": ["said yes", "agreed", "regret", "shouldn't have", "committed to", "guilt"],
    "Control-Sub": ["control", "organize", "clean", "detail", "micromanage", "obsess"],
    "Intellectualizer": ["understand why", "makes sense", "logically", "rationally", "analyze feelings", "process"],
    "Comparison-Drift": ["compare", "others are", "they have", "behind", "their success", "social media"],
    "Help-Refusal": ["alone", "myself", "don't need", "figure it out", "independent", "weakness"],
    "Urgency-Addict": ["deadline", "pressure", "last minute", "only when", "need urgency", "procrastinate"],
  };

  for (const pattern of PATTERNS) {
    const kws = keywords[pattern.shortName] || [];
    const matchCount = kws.filter(kw => lower.includes(kw)).length;
    if (matchCount >= 2) detected.push(pattern);
  }

  if (profileShadows && profileShadows.length > 0) {
    const shadowStr = profileShadows.join(" ").toLowerCase();
    for (const pattern of PATTERNS) {
      if (detected.includes(pattern)) continue;
      const kws = keywords[pattern.shortName] || [];
      if (kws.some(kw => shadowStr.includes(kw))) detected.push(pattern);
    }
  }

  if (stressPattern) {
    const sp = stressPattern.toLowerCase();
    if (sp.includes("overth") || sp.includes("mental")) {
      const p = PATTERNS.find(p => p.shortName === "Overthink-Delay");
      if (p && !detected.includes(p)) detected.push(p);
    }
    if (sp.includes("control") || sp.includes("rigid")) {
      const p = PATTERNS.find(p => p.shortName === "Control-Sub");
      if (p && !detected.includes(p)) detected.push(p);
    }
  }

  return detected.slice(0, 3);
}

/**
 * Formats detected patterns for output.
 */
export function formatPatterns(patterns: NamedPattern[]): string {
  if (patterns.length === 0) return "";

  return patterns.map(p => (
    `**Pattern: ${p.name}**\n${p.description}\n• Trigger: ${p.trigger}\n• Cost: ${p.cost}\n• Interrupt: ${p.interrupt}`
  )).join("\n\n");
}

/**
 * Returns a single daily pattern callout based on profile data.
 */
export function dailyPatternCallout(
  shadows: string[],
  stressPattern: string,
  date: Date = new Date()
): NamedPattern | null {
  const idx = (date.getDate() + date.getMonth()) % PATTERNS.length;
  const candidate = PATTERNS[idx];

  if (shadows.length > 0 || stressPattern) {
    const detected = detectPatterns(
      shadows.join(" ") + " " + stressPattern,
      shadows,
      stressPattern
    );
    if (detected.length > 0) return detected[0];
  }

  return candidate;
}
