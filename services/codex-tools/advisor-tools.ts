/**
 * Advisor Tier Tools — the ones that make Soul Codex feel like a private advisor.
 *
 * #101 Before You Act Gate — run decisions/messages through Codex before sending
 * #107 Boundary Script Generator — gives usable language for difficult situations
 * #111 Decision Confidence Meter — quantifies readiness before committing
 * #114 What You're Ignoring — the honest callout
 */

import type { CodexToolResult, ProfileInput } from "./types";
import { extractCore } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// #101 — Before You Act Gate
// ─────────────────────────────────────────────────────────────────────────────

type SignalType = "emotional" | "strategic" | "reactive" | "clear" | "unclear";
type RiskLevel = "low" | "medium" | "high";

interface GateAnalysis {
  signal: SignalType;
  risk: RiskLevel;
  riskReason: string;
  adjustment: string;
}

const REACTIVE_MARKERS = [
  "can't believe", "always", "never", "sick of", "done with", "honestly",
  "whatever", "fine", "I guess", "you always", "you never", "seriously",
  "I'm done", "forget it", "ridiculous", "unbelievable", "I don't care",
  "why do you", "why can't you", "enough", "last time",
];

const EMOTIONAL_MARKERS = [
  "feel", "hurt", "upset", "frustrated", "angry", "sad", "worried",
  "anxious", "overwhelmed", "scared", "disappointed", "betrayed",
  "lonely", "exhausted", "drained", "confused", "hopeless",
  "miss", "need", "wish", "hate", "love",
];

const UNCLEAR_MARKERS = [
  "maybe", "I don't know", "kind of", "sort of", "I think",
  "not sure", "probably", "might", "possibly", "idk",
];

function analyzeText(text: string): GateAnalysis {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const wordCount = words.length;

  let reactiveScore = 0;
  let emotionalScore = 0;
  let unclearScore = 0;

  for (const marker of REACTIVE_MARKERS) {
    if (lower.includes(marker)) reactiveScore++;
  }
  for (const marker of EMOTIONAL_MARKERS) {
    if (lower.includes(marker)) emotionalScore++;
  }
  for (const marker of UNCLEAR_MARKERS) {
    if (lower.includes(marker)) unclearScore++;
  }

  const hasExclamation = text.includes("!");
  const hasAllCaps = /[A-Z]{3,}/.test(text);
  const isLong = wordCount > 80;

  if (hasAllCaps) reactiveScore += 2;
  if (hasExclamation && reactiveScore > 0) reactiveScore++;
  if (isLong) unclearScore++;

  if (reactiveScore >= 2) {
    return {
      signal: "reactive",
      risk: "high",
      riskReason: "This reads as a reaction, not a response. Reactive messages create new problems instead of solving existing ones.",
      adjustment: "Wait 30 minutes. Rewrite in 2 sentences max. Remove the charge — keep the point.",
    };
  }

  if (emotionalScore >= 3) {
    return {
      signal: "emotional",
      risk: "medium",
      riskReason: "High emotional content. The feeling is valid — but sending it raw may shift the conversation from the issue to the emotion.",
      adjustment: "Keep the core feeling (1 sentence). Then state what you need (1 sentence). Delete everything else.",
    };
  }

  if (unclearScore >= 2 || (unclearScore >= 1 && wordCount > 50)) {
    return {
      signal: "unclear",
      risk: "medium",
      riskReason: "The message lacks a clear point. The reader will interpret it differently than you intend.",
      adjustment: "Answer: 'What do I actually want from this conversation?' Then rewrite to state that directly.",
    };
  }

  if (emotionalScore >= 1 && reactiveScore >= 1) {
    return {
      signal: "emotional",
      risk: "medium",
      riskReason: "Mixed emotional and reactive signals. You're processing and reacting at the same time.",
      adjustment: "Process first (journal or voice memo), then respond. The message should come after the processing, not during it.",
    };
  }

  if (wordCount > 100) {
    return {
      signal: "unclear",
      risk: "low",
      riskReason: "This is long. Length often signals unprocessed thinking — you're figuring it out as you write.",
      adjustment: "Cut it in half. If the meaning survives, the other half was noise.",
    };
  }

  return {
    signal: "clear",
    risk: "low",
    riskReason: "The message appears clear and measured.",
    adjustment: "Send it. It's ready.",
  };
}

export function beforeYouAct(
  profile: ProfileInput,
  text: string
): CodexToolResult {
  const core = extractCore(profile);
  const analysis = analyzeText(text);

  const signalLabel: Record<SignalType, string> = {
    reactive: "Reactive — this is a reaction, not a response",
    emotional: "Emotional — valid feeling, risky delivery",
    strategic: "Strategic — calculated and directed",
    clear: "Clear — measured and ready",
    unclear: "Unclear — the point is buried",
  };

  const riskLabel: Record<RiskLevel, string> = {
    low: "Low — safe to send",
    medium: "Medium — consider adjustments",
    high: "High — delay recommended",
  };

  let personalNote = "";
  if (analysis.signal === "reactive" && core.moonSign) {
    personalNote = `Your ${core.moonSign} Moon is likely driving this reaction. That's the signal to slow down, not speed up.`;
  } else if (analysis.signal === "emotional" && core.hdType) {
    personalNote = `As a ${core.hdType}, your ${core.hdAuthority || core.hdStrategy || "inner authority"} should make this call — not the emotion.`;
  } else if (analysis.signal === "unclear" && core.stressPattern) {
    personalNote = `This may be your stress pattern (${core.stressPattern.toLowerCase()}) expressing itself as over-explanation.`;
  } else if (analysis.signal === "clear") {
    personalNote = core.sunSign ? `Your ${core.sunSign} Sun is thinking clearly here. Trust it.` : "Your instinct is tracking. Move forward.";
  }

  return {
    tool: "before_you_act",
    title: "Before You Act",
    observation: `**Signal:** ${signalLabel[analysis.signal]}\n**Risk:** ${riskLabel[analysis.risk]}`,
    meaning: `${analysis.riskReason}${personalNote ? `\n\n${personalNote}` : ""}`,
    action: analysis.adjustment,
    extras: {
      signal: analysis.signal,
      risk: analysis.risk,
      wordCount: text.split(/\s+/).length,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// #107 — Boundary Script Generator
// ─────────────────────────────────────────────────────────────────────────────

type BoundarySituation =
  | "overcommitment"
  | "unwanted_request"
  | "emotional_labor"
  | "time_pressure"
  | "relationship_tension"
  | "work_boundary"
  | "general";

interface BoundaryScript {
  situation: BoundarySituation;
  script: string;
  explanation: string;
  whatNotToSay: string;
}

const BOUNDARY_SCRIPTS: Record<BoundarySituation, BoundaryScript[]> = {
  overcommitment: [
    { situation: "overcommitment", script: "I can't take that on right now. I need to protect what's already on my plate.", explanation: "Short, clear, no justification. The reason is built in: you're full.", whatNotToSay: "Don't say 'I'm sorry, I just have so much going on...' — apologizing invites negotiation." },
    { situation: "overcommitment", script: "I'm at capacity. I'd rather do fewer things well than more things badly.", explanation: "Frames the no as a quality standard, not a weakness.", whatNotToSay: "Don't list everything you're doing. They don't need your resume — they need your answer." },
  ],
  unwanted_request: [
    { situation: "unwanted_request", script: "That doesn't work for me. Let me know if there's another way I can help.", explanation: "Direct without slamming the door. Offers alternatives without caving.", whatNotToSay: "Don't say 'I would, but...' — that signals you could be convinced." },
    { situation: "unwanted_request", script: "I appreciate you thinking of me, but I'm going to pass on this one.", explanation: "Acknowledges them without agreeing. Clean exit.", whatNotToSay: "Don't over-explain. One sentence is a boundary. Three paragraphs is a negotiation." },
  ],
  emotional_labor: [
    { situation: "emotional_labor", script: "I care about you, but I don't have the bandwidth to hold this right now. Can we come back to it when I'm in a better place?", explanation: "Validates the relationship while protecting your energy.", whatNotToSay: "Don't say 'You're always dumping on me' — that escalates instead of resolving." },
    { situation: "emotional_labor", script: "I want to be helpful, but I'm not in the right headspace for this conversation. Can we talk about it tomorrow?", explanation: "Buys time without dismissing them.", whatNotToSay: "Don't pretend to listen when you're not actually present. That erodes trust faster than saying no." },
  ],
  time_pressure: [
    { situation: "time_pressure", script: "I need more time before I can give you a real answer. I'll get back to you by [specific time].", explanation: "Buys space without being vague. The specific time makes it credible.", whatNotToSay: "Don't say 'I'll think about it' with no timeline — that's avoidance, not a boundary." },
  ],
  relationship_tension: [
    { situation: "relationship_tension", script: "I need to say something that might be uncomfortable, but I think it's important for us. Can we talk about [specific thing]?", explanation: "Opens the door to honesty without ambushing them.", whatNotToSay: "Don't lead with accusation ('You always...'). Lead with observation ('I noticed...')." },
    { situation: "relationship_tension", script: "I've been carrying something I need to share. It's not about blame — it's about what I need going forward.", explanation: "Forward-looking framing removes defensiveness.", whatNotToSay: "Don't rehearse a monologue. Say the one honest sentence and let them respond." },
  ],
  work_boundary: [
    { situation: "work_boundary", script: "I can do [A] or [B] by that deadline, but not both. Which is the priority?", explanation: "Puts the choice back on them without saying no.", whatNotToSay: "Don't say 'I'll try' when you know you can't. That creates future failure." },
    { situation: "work_boundary", script: "I'm not available for that outside of work hours. I can look at it first thing tomorrow.", explanation: "Clear line. No apology. No justification.", whatNotToSay: "Don't apologize for having limits. Limits are professional, not personal." },
  ],
  general: [
    { situation: "general", script: "No.", explanation: "Sometimes one word is the entire boundary. You don't owe an essay.", whatNotToSay: "Don't follow 'no' with 'but' — that undoes the entire boundary." },
    { situation: "general", script: "I've thought about it and I'm going to decline. Thank you for understanding.", explanation: "The 'thank you for understanding' assumes agreement — which makes it harder to push back on.", whatNotToSay: "Don't say 'I hope you're not upset.' That invites them to be upset." },
  ],
};

function detectSituation(input: string): BoundarySituation {
  const lower = input.toLowerCase();
  if (lower.includes("too much") || lower.includes("overloaded") || lower.includes("overwhelm") || lower.includes("plate is full")) return "overcommitment";
  if (lower.includes("asked me") || lower.includes("want me to") || lower.includes("favor") || lower.includes("request")) return "unwanted_request";
  if (lower.includes("vent") || lower.includes("always comes to me") || lower.includes("emotional") || lower.includes("drain")) return "emotional_labor";
  if (lower.includes("deadline") || lower.includes("rush") || lower.includes("asap") || lower.includes("time")) return "time_pressure";
  if (lower.includes("relationship") || lower.includes("partner") || lower.includes("friend") || lower.includes("family")) return "relationship_tension";
  if (lower.includes("work") || lower.includes("boss") || lower.includes("colleague") || lower.includes("meeting") || lower.includes("hours")) return "work_boundary";
  return "general";
}

export function boundaryScript(
  profile: ProfileInput,
  situation?: string
): CodexToolResult {
  const core = extractCore(profile);
  const detectedSituation = situation ? detectSituation(situation) : "general";
  const scripts = BOUNDARY_SCRIPTS[detectedSituation] || BOUNDARY_SCRIPTS.general;

  const idx = (new Date().getHours() + (core.birthDate ? new Date(core.birthDate).getDate() : 0)) % scripts.length;
  const selected = scripts[idx];

  let personalNote = "";
  if (core.hdType === "Projector") {
    personalNote = "As a Projector, your energy is limited. Every 'yes' to the wrong thing is a 'no' to your own work.";
  } else if (core.hdType === "Generator" || core.hdType === "Manifesting Generator") {
    personalNote = "As a Generator, check your gut response. If there's no clear 'uh-huh' (yes), it's a no. Trust the body, not the guilt.";
  } else if (core.hdType === "Manifestor") {
    personalNote = "As a Manifestor, inform — don't ask permission. State the boundary, then move on.";
  } else if (core.moonSign) {
    personalNote = `Your ${core.moonSign} Moon may add guilt to this. The guilt is a signal that the boundary matters — not a reason to drop it.`;
  }

  return {
    tool: "boundary_script",
    title: "Boundary Script",
    observation: `**Situation:** ${detectedSituation.replace(/_/g, " ")}\n\n**Say this:**\n> "${selected.script}"`,
    meaning: `${selected.explanation}${personalNote ? `\n\n${personalNote}` : ""}`,
    action: `**What NOT to say:** ${selected.whatNotToSay}`,
    extras: {
      situation: detectedSituation,
      script: selected.script,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// #111 — Decision Confidence Meter
// ─────────────────────────────────────────────────────────────────────────────

interface ConfidenceFactors {
  clarity: number;
  emotional: number;
  information: number;
  pressure: number;
  alignment: number;
}

function assessConfidence(decision: string, core: ReturnType<typeof extractCore>): { score: number; factors: ConfidenceFactors; blockers: string[] } {
  const lower = decision.toLowerCase();
  const blockers: string[] = [];

  let clarity = 60;
  let emotional = 50;
  let information = 55;
  let pressure = 40;
  let alignment = 50;

  if (lower.includes("should i") || lower.includes("what if")) {
    clarity -= 15;
    blockers.push("Framing as a question suggests you haven't committed internally yet");
  }
  if (lower.includes("but") || lower.includes("however") || lower.includes("on the other hand")) {
    clarity -= 10;
    blockers.push("Active competing considerations — you're still weighing");
  }

  if (EMOTIONAL_MARKERS.some(m => lower.includes(m))) {
    emotional -= 15;
    blockers.push("Emotional charge is influencing the analysis");
  }
  if (REACTIVE_MARKERS.some(m => lower.includes(m))) {
    emotional -= 20;
    pressure += 15;
    blockers.push("Reactive language detected — urgency may be manufactured");
  }

  if (lower.includes("don't know") || lower.includes("not sure") || lower.includes("unclear")) {
    information -= 20;
    blockers.push("Key information is missing");
  }

  if (lower.includes("have to") || lower.includes("need to") || lower.includes("deadline") || lower.includes("they want")) {
    pressure += 20;
    blockers.push("External pressure is a factor — separate the 'want to' from the 'have to'");
  }

  if (core.stressPattern) {
    emotional -= 5;
    blockers.push(`Your stress pattern (${core.stressPattern.toLowerCase()}) may be active`);
  }

  if (core.growthEdge && lower.includes(core.growthEdge.toLowerCase().split(" ")[0])) {
    alignment += 15;
  }

  const factors: ConfidenceFactors = {
    clarity: Math.max(0, Math.min(100, clarity)),
    emotional: Math.max(0, Math.min(100, emotional)),
    information: Math.max(0, Math.min(100, information)),
    pressure: Math.max(0, Math.min(100, 100 - pressure)),
    alignment: Math.max(0, Math.min(100, alignment)),
  };

  const score = Math.round(
    (factors.clarity * 0.25 + factors.emotional * 0.2 + factors.information * 0.25 + factors.pressure * 0.15 + factors.alignment * 0.15)
  );

  return { score, factors, blockers: blockers.slice(0, 3) };
}

export function decisionConfidence(
  profile: ProfileInput,
  decision: string
): CodexToolResult {
  const core = extractCore(profile);
  const { score, factors, blockers } = assessConfidence(decision, core);

  const level = score >= 70 ? "Ready" : score >= 50 ? "Approaching" : score >= 30 ? "Not yet" : "Delay";
  const icon = score >= 70 ? "✓" : score >= 50 ? "◐" : score >= 30 ? "△" : "✗";

  const factorLines = [
    `Clarity: ${factors.clarity}%`,
    `Emotional stability: ${factors.emotional}%`,
    `Information quality: ${factors.information}%`,
    `Pressure independence: ${factors.pressure}%`,
    `Values alignment: ${factors.alignment}%`,
  ].join("\n");

  const observation = `**Confidence: ${score}%** ${icon} ${level}\n\n${factorLines}`;

  let meaning = "";
  if (blockers.length > 0) {
    meaning = `**What's blocking clarity:**\n${blockers.map(b => `• ${b}`).join("\n")}`;
  } else {
    meaning = "No major blockers detected. Your assessment appears balanced.";
  }

  if (core.hdType) {
    meaning += `\n\nYour ${core.hdType} authority: ${core.hdAuthority || core.hdStrategy || "trust your inner signal"}. If the confidence score says ready but your body says wait — the body wins.`;
  }

  let action = "";
  if (score >= 70) {
    action = "Make the call. You have enough clarity. Waiting past this point is avoidance, not strategy.";
  } else if (score >= 50) {
    action = "Almost ready. Address the top blocker, then decide within 24 hours. Don't let 'almost' become 'never'.";
  } else if (score >= 30) {
    action = "Not ready yet. Get the missing piece — one conversation, one data point, one night's sleep. Then reassess.";
  } else {
    action = "Delay this decision. The conditions aren't there. Set a date to revisit (3-7 days) so it doesn't drift indefinitely.";
  }

  return {
    tool: "decision_confidence",
    title: "Decision Confidence",
    observation,
    meaning,
    action,
    extras: { score, level, factors, blockers },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// #114 — What You're Ignoring
// ─────────────────────────────────────────────────────────────────────────────

export function whatYoureIgnoring(profile: ProfileInput): CodexToolResult {
  const core = extractCore(profile);

  interface Ignore { observation: string; cost: string; action: string }

  const personalIgnores: Ignore[] = [];

  if (core.blindSpot) {
    personalIgnores.push({
      observation: `You're ignoring your blind spot: ${core.blindSpot.toLowerCase()}`,
      cost: "This pattern runs in the background consuming energy you think is going elsewhere",
      action: "Name it out loud to one person today. Naming it is the first step to changing it.",
    });
  }
  if (core.stressPattern) {
    personalIgnores.push({
      observation: `You're ignoring that your stress pattern (${core.stressPattern.toLowerCase()}) has been active for longer than you're admitting`,
      cost: "Chronic stress patterns don't announce themselves — they normalize. You stop noticing because it becomes your default",
      action: "Rate your stress 1-10 right now. If it's above 5 and you almost said 'it's fine,' that's the proof.",
    });
  }
  if (core.shadows.length > 0) {
    personalIgnores.push({
      observation: `You're ignoring the cost of ${core.shadows[0].toLowerCase()}`,
      cost: "This shadow behavior is protecting something that no longer needs protection — but the protection keeps running",
      action: "Ask: 'What am I protecting by doing this?' If the answer is 'nothing anymore,' stop.",
    });
  }
  if (core.growthEdge) {
    personalIgnores.push({
      observation: `You're ignoring the fact that your growth edge (${core.growthEdge.toLowerCase()}) hasn't been worked on in a while`,
      cost: "Growth edges don't wait patiently. They become resentment, restlessness, or a quiet sense that something is missing",
      action: "Take one step toward it today. Not a big one. Just one.",
    });
  }

  const universalIgnores: Ignore[] = [
    { observation: "You're ignoring the situation that hasn't improved in weeks despite telling yourself it will", cost: "Hope without action is just delay with a better outfit", action: "Name the situation. Set a deadline: if nothing changes by [date], you will [specific action]." },
    { observation: "You're ignoring how tired you actually are", cost: "Running on fumes feels productive until the crash. The crash is not scheduled — it just arrives", action: "Go to bed 45 minutes earlier tonight. Not because you want to. Because you need to." },
    { observation: "You're ignoring the conversation you keep rehearsing in your head instead of having", cost: "Every day you replay it internally costs more energy than 30 seconds of saying it", action: "Send the text. Make the call. Open the conversation. Today." },
    { observation: "You're ignoring the fact that you've outgrown something and you're afraid to admit it", cost: "Staying in things you've outgrown isn't loyalty. It's self-betrayal on a slow timer", action: "Admit it to yourself first. Write it down. You don't have to act on it today — but you have to name it." },
    { observation: "You're ignoring your body's signals — the tension, the poor sleep, the appetite changes", cost: "Your body keeps the score even when your mind won't. Ignoring it doesn't make it quieter", action: "Check in: where am I carrying tension right now? That's the message. Address it physically, not mentally." },
  ];

  const allIgnores = [...personalIgnores, ...universalIgnores];
  const idx = (new Date().getDate() + new Date().getMonth() + (core.birthDate ? new Date(core.birthDate).getDate() : 0)) % allIgnores.length;
  const selected = allIgnores[idx];

  let personalContext = "";
  if (core.moonSign && selected === personalIgnores[0]) {
    personalContext = `Your ${core.moonSign} Moon makes this harder to see because it runs in the emotional background, not the conscious foreground.`;
  } else if (core.hdType) {
    personalContext = `Your ${core.hdType} design means you process this ${core.hdType === "Projector" ? "through recognition — you need someone else to see it before you'll fully believe it yourself" : core.hdType === "Generator" || core.hdType === "Manifesting Generator" ? "through the body — your gut knows even when your mind hasn't caught up" : core.hdType === "Manifestor" ? "through action — you'll only understand it by doing something about it" : "through reflection — sit with it before reacting"}.`;
  }

  return {
    tool: "what_youre_ignoring",
    title: "What You're Ignoring",
    observation: selected.observation,
    meaning: `${selected.cost}${personalContext ? `\n\n${personalContext}` : ""}`,
    action: selected.action,
  };
}
