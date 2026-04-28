import type { SoulSignals, Synthesis, Archetype } from "../types";
import { stressNotes } from "./elements";
import { deriveMoralCode } from "./moral";

const LIFE_PATH_DESC: Record<number, string> = {
  1:  "I initiate. I move first and figure out the rest in motion.",
  2:  "I hold things together — I see what others miss and fill the gaps.",
  3:  "Expression is my engine. I think best by articulating.",
  4:  "I build systems. Structure isn't a cage — it's how I create.",
  5:  "I need movement and room to change direction. Stagnation is the real risk.",
  6:  "I carry responsibility naturally, often more than I should.",
  7:  "I need depth. Surface-level anything drains me fast.",
  8:  "I'm built for impact at scale. Small games bore me.",
  9:  "I contribute at the end of cycles — wrapping up what others started.",
  11: "My sensitivity is precision. I pick up what others miss.",
  22: "I think at a scale most people don't attempt.",
  33: "I carry others' weight as if it were my own — that's both my gift and my cost.",
};

const SOCIAL_ENERGY_DESC: Record<string, string> = {
  steady:    "I show up consistently — people know what they get from me.",
  bursts:    "I work in intense cycles and need recovery built in.",
  sensitive: "I absorb my environment, which means I'm deliberate about where I put myself.",
};

function buildCoreEssence(s: SoulSignals, arc: Archetype, v: number): string {
  const parts: string[] = [];

  const sunVariants: Record<string, string[]> = {
    Aries: [
      `My ${s.sunSign} sun drives me to move first and figure it out in motion.`,
      `I operate on a short-fuse trigger. I don't wait for permission to start.`,
      `The impulse to act is my primary signal. If I'm not moving, I'm not thinking.`
    ],
    Taurus: [
      `My ${s.sunSign} nature is about the long-game. I build things that don't move.`,
      `I prioritize stability over speed. I don't change direction unless the reason is physical.`,
      `I move at the speed of stone. Once I've committed, the trajectory is locked.`
    ],
    Leo: [
      `My ${s.sunSign} sun drives me to lead and be seen, but the cost is a constant need for external validation that I hide behind confidence.`,
      `I operate with massive heart and intensity, but I crash spectacularly when I feel unappreciated or unseen.`,
      `I am a natural sun, but I struggle to function in the shadows — I over-perform until I burn out.`
    ],
    Virgo: [
      `My ${s.sunSign} nature is about the details, but my cost is a loop of over-analysis that prevents me from ever feeling finished.`,
      `I see the error in everything. My precision is my asset, but it makes the world feel noisy and broken when I can't fix it.`,
      `I audit every move. I am accurate, but I miss the flow because I'm too busy mapping the structure.`
    ],
  };

  const lpVariants: Record<number, string[]> = {
    1: [
      "I initiate. I move first and figure out the rest in motion.",
      "I am the starting point. I don't look for a path; I clear one.",
      "Independence is my primary driver. I don't wait for a consensus."
    ],
    4: [
      "I build systems. Structure isn't a cage — it's how I create.",
      "I need a foundation before I can see the roof. I don't trust hollow ideas.",
      "I organize chaos until it has a logic I can scale."
    ],
    9: [
      "I contribute at the end of cycles — wrapping up what others started.",
      "I see the exit before I see the entrance. I am built for completions.",
      "I extract the wisdom from what's already finished."
    ]
  };

  if (s.sunSign && s.moonSign && s.sunSign !== s.moonSign) {
    parts.push(`My ${s.sunSign} sun shapes how I act. My ${s.moonSign} moon shapes what I feel and need.`);
  } else if (s.sunSign) {
    const sVar = sunVariants[s.sunSign] || [`My ${s.sunSign} nature runs through everything — how I work and what I protect.`];
    parts.push(sVar[v % sVar.length]);
  }

  const lpText = lpVariants[s.lifePath] || [LIFE_PATH_DESC[s.lifePath]];
  if (lpText) {
    parts.push(lpText[v % lpText.length] || lpText[0]);
  }

  const eText = SOCIAL_ENERGY_DESC[s.socialEnergy];
  if (eText) parts.push(eText);

  // Inject Archetype role for divergence
  const roleHooks: Record<string, string[]> = {
    Architect: [
      "As an Architect, I prioritize the structural truth over the immediate feeling.",
      "I am an Architect; I don't build until the logic is flawless.",
      "My role as an Architect means I see the gaps in the foundation before I see the view."
    ],
    Explorer: [
      "As an Explorer, I value the data of the unknown over the safety of the map.",
      "I move as an Explorer—territory matters more to me than stability.",
      "My nature is to keep the horizon moving; once a place is known, it becomes a cage."
    ],
  };
  const rh = roleHooks[arc.role] || [`As a ${arc.role}, I naturally gravitate toward my core functions.`];
  parts.push(rh[v % rh.length]);

  return parts.join(" ");
}

function buildStressPattern(s: SoulSignals, arc: Archetype, v: number): string {
  const notes = stressNotes(s.stressElement);
  
  const pressureVariants: Record<string, string[]> = {
    fight: [
      "I push harder and confront whatever is in my way.",
      "Pressure triggers my combat mode. I escalate until the obstacle breaks.",
      "I don't retreat; I accelerate into the friction to end it faster."
    ],
    freeze: [
      "I lock up and wait until I can think clearly.",
      "My system pauses to prevent a catastrophic error. I go dark until I have a map.",
      "I prioritize data over action when the environment is hostile. I wait."
    ],
    adapt: [
      "I shift strategy and find another angle fast.",
      "I stop answering messages when things feel off. I tell myself I'm protecting my peace, but I'm actually just avoiding the confrontation.",
      "I am highly adaptable, but I struggle to maintain a core identity—I sometimes forget who I was before the change."
    ],
    withdraw: [
      "I pull back, protect my space, and recharge alone.",
      "I vanish when the signal gets too noisy. My cost is isolation; I protect my peace until it becomes a cage.",
      "I go dark. I read every message, but I don't respond until I've processed the energy, which can take days."
    ],
    perform: [
      "I raise my game and refuse to let the pressure win.",
      "Chaos is my stage. I become sharper, but the cost is a massive crash once the lights go out.",
      "I over-perform when stressed, but I stop taking care of my physical needs entirely during the crisis."
    ],
  };

  const pVariants = pressureVariants[s.pressureStyle] || [pressureVariants.adapt[0]];
  const pNote = pVariants[v % pVariants.length];
  
  return `${notes} ${pNote}`;
}

function buildRelationshipPattern(s: SoulSignals, arc: Archetype, v: number): string {
  const social: Record<string, string[]> = {
    steady: [
      "I show up consistently — people know what they get from me.",
      "I value endurance over intensity. I am the through-line in my circle.",
      "Reliability is my primary social currency. I don't vanish."
    ],
    bursts: [
      "I connect intensely, then need space to recharge.",
      "My social energy is a limited battery. I give everything, then go dark.",
      "I am high-impact and low-frequency. I don't do 'medium' presence."
    ],
    sensitive: [
      "I absorb other people's energy, so I choose who I let in carefully.",
      "I read the room before I speak. My filter is always on high-alert.",
      "Environment is everything. If the energy is wrong, I can't function."
    ],
  };

  const decision: Record<string, string[]> = {
    gut: [
      "I trust my gut in relationships and commit fast when it feels right.",
      "I don't need a list of reasons. If the resonance is there, I'm in.",
      "Logic is secondary to the immediate internal signal."
    ],
    analysis: [
      "I weigh everything carefully before letting someone close.",
      "I audit the history and the potential before I invest my heart.",
      "I don't trust the first impression. I need to see the data over time."
    ],
  };

  const sVariants = social[s.socialEnergy] || [social.steady[0]];
  const dVariants = decision[s.decisionStyle] || [decision.gut[0]];
  
  const s1 = sVariants[v % sVariants.length];
  const d1 = dVariants[v % dVariants.length];
  
  return `${s1} ${d1}`;
}

function buildContradiction(s: SoulSignals, v: number): string {
  const contradictions: string[] = [];
  
  const ds = s.mirrorProfile.decisionStyle;
  const es = s.mirrorProfile.energyStyle;
  const dr = s.mirrorProfile.driver;
  const st = s.mirrorProfile.shadowTrigger;

  if (ds.includes("Action") && es.includes("Solitude")) {
    contradictions.push("I move with high-speed precision, but I need total isolation to decide where to point that momentum.");
  }
  
  if (dr.includes("Peace") && st.includes("Authority")) {
    contradictions.push("I crave sanctuary and quiet, yet I am the first to initiate a confrontation when my autonomy is threatened.");
  }
  
  if (dr.includes("Legacy") && es.includes("Integrity")) {
    contradictions.push("I am built to create something massive, but I'll burn the whole project down if it lacks structural truth.");
  }

  const general = [
    "I want total freedom, yet I build rigid systems to protect my time.",
    "I crave deep connection, but I cut people off the second they become predictable.",
    "I prioritize the long-game, but I'm restless in the day-to-day execution.",
    "I trust my intuition completely, yet I over-analyze the data until I'm paralyzed."
  ];
  
  return contradictions.length > 0 ? contradictions[v % contradictions.length] : general[v % general.length];
}

function buildLifeConsequence(s: SoulSignals, v: number): string {
  const consequences: string[] = [];
  
  if (s.pressureStyle === "fight" && s.socialEnergy === "bursts") {
    consequences.push("This is why people trust you quickly—but don't always stay once the intensity peaks.");
  }
  
  if (s.pressureStyle === "withdraw" && s.decisionStyle === "analysis") {
    consequences.push("This is why you outgrow environments faster than you expect; you've already mentally exited before you say goodbye.");
  }

  const general = [
    "This is why you have fewer projects than everyone else—but the ones you finish define you.",
    "This is why you get opportunities, but don't always hold onto them once the novelty fades.",
    "This is why you feel like an outsider even in rooms you built yourself.",
    "This is why you are the first person people call in a crisis, and the first they forget when things are calm."
  ];
  
  return consequences.length > 0 ? consequences[v % consequences.length] : general[v % general.length];
}

function buildPatternInterruption(s: SoulSignals, v: number): string {
  const breaks: string[] = [];
  
  if (s.pressureStyle === "fight") {
    breaks.push("The few times I choose precision over volume, it feels like I'm losing momentum—but the resistance vanishes instantly.");
    breaks.push("I've tried to 'calm down' mid-conflict, but I usually just fall back into escalation once the stakes rise.");
  }
  
  if (s.pressureStyle === "withdraw") {
    breaks.push("When I name the friction before I vanish, it feels exposed and dangerous—but the environment stabilizes faster than my silence ever could.");
    breaks.push("The door only opens when I'm already exhausted from holding the silence.");
  }

  const general = [
    "The loop only breaks when I act before the analysis feels 'safe'—which is never.",
    "I've tried to respond faster, but the silence pulls me back in whenever I feel misaligned.",
    "Everything stabilizes when I prioritize the immediate task over the long-term anxiety—but I only do this when I'm forced.",
    "The friction dissolves when I choose direct clarity over the safety of silence, even if it feels like I'm breaking a rule."
  ];
  
  return breaks.length > 0 ? breaks[v % breaks.length] : general[v % general.length];
}

function buildLoopSentence(s: SoulSignals, v: number): string {
  const p = s.pressureStyle;
  
  const loops: Record<string, string[]> = {
    fight: [
      "I push early, hit resistance, and only win when I stop trying to out-volume the obstacle.",
      "I escalate quickly, trigger pushback, and only find the exit when I choose precision over force."
    ],
    withdraw: [
      "I avoid the friction, get cornered by the silence, and only break free when I name the tension I'm hiding from.",
      "I delay the decision, lose the window, and only stabilize when I act without waiting for permission."
    ],
    adapt: [
      "I shift too fast, lose my own signal, and only recover when I stop moving and anchor to a single truth.",
      "I mirror the environment, lose my autonomy, and only regain power when I choose a friction point."
    ]
  };
  
  const vList = loops[p] || ["I follow my pattern, face the cost, and only move cleanly when I interrupt the loop."];
  return vList[v % vList.length];
}

function buildPowerMode(s: SoulSignals): string {
  const goalMap: Record<string, string> = {
    "build something":  "I'm driven to create something tangible that lasts.",
    "build_something":  "I'm driven to create something tangible that lasts.",
    "understand life":  "I need to figure out how things work at a deep level.",
    "understand_life":  "I need to figure out how things work at a deep level.",
    "help others":      "I feel most alive when I'm making someone else's life better.",
    "help_others":      "I feel most alive when I'm making someone else's life better.",
    "freedom":          "I need room to move — restrictions drain me.",
    "influence":        "I want to shape how things go, not just participate.",
    "stability":        "I build a foundation first, then expand from safety.",
  };
  const parts = s.goals.map((g) => goalMap[g.toLowerCase()] ?? g);
  return parts.join(" ") || "I'm still discovering what I'm built to build.";
}

function buildGrowthEdges(s: SoulSignals): string[] {
  const edges: string[] = [];
  if (s.stressElement === "air")
    edges.push("Slow down the mental loops — not every thought needs action.");
  if (s.stressElement === "fire")
    edges.push("Channel the anger before it burns a bridge you need.");
  if (s.stressElement === "water")
    edges.push("Let the wave pass before you make a decision from the flood.");
  if (s.stressElement === "earth")
    edges.push("Stubbornness is not the same as strength — learn when to bend.");
  if (s.stressElement === "metal")
    edges.push("Cutting people off feels safe, but it costs more than it saves.");

  if (s.decisionStyle === "avoidance")
    edges.push("Delaying a decision is still a decision — own it.");
  if (s.decisionStyle === "impulse")
    edges.push("Speed is your asset, but a two-minute pause won't kill momentum.");

  if (s.socialEnergy === "sensitive")
    edges.push("Other people's moods are data, not your responsibility.");
  if (s.socialEnergy === "bursts")
    edges.push("Warn people when you need space instead of vanishing.");

  if (edges.length === 0)
    edges.push("Keep testing the edges of what you think you can handle.");

  return edges;
}

export function synthesize(signals: SoulSignals, archetype: Archetype): Synthesis {
  // Deterministic variety key based on the unique seed (name)
  const seedStr = signals.seed + (signals.sunSign || "") + (signals.lifePath || 0);
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const vIdx = Math.abs(hash) % 3; // 0, 1, or 2

  return {
    codename:            `${archetype.name.split(' ')[0]} ${archetype.role}`,
    coreEssence:         buildCoreEssence(signals, archetype, vIdx),
    stressPattern:       buildStressPattern(signals, archetype, vIdx),
    relationshipPattern: buildRelationshipPattern(signals, archetype, vIdx),
    moralCode:           deriveMoralCode(signals.pressureStyle, signals.nonNegotiables),
    powerMode:           buildPowerMode(signals),
    growthEdges:         buildGrowthEdges(signals),
    contradiction:       buildContradiction(signals, vIdx),
    lifeConsequence:     buildLifeConsequence(signals, vIdx),
    patternInterruption: buildPatternInterruption(signals, vIdx),
    loopSentence:        buildLoopSentence(signals, vIdx),
  };
}
