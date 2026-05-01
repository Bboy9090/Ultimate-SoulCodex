import type { SoulSignals, Synthesis, Archetype } from "../types";
import { stressNotes } from "./elements";
import { deriveMoralCode } from "./moral";

const LIFE_PATH_DESC: Record<number, string> = {
  1:  "I clear paths by initiating immediately, even when the direction is unknown, often leaving unfinished logic behind.",
  2:  "I fill the gaps in others' work before I'm asked, which keeps the group moving but drains my own energy reserves.",
  3:  "I think through articulation and expression, sometimes committing to ideas before I've fully vetted them.",
  4:  "I build systems when chaos arises, creating order that protects me but can feel rigid to those around me.",
  5:  "I shift direction the moment stagnation sets in, preserving my autonomy at the cost of long-term stability.",
  6:  "I carry responsibility for others' moods when things feel off, protecting the peace while ignoring my own capacity.",
  7:  "I check out quietly when conversations stay surface-level, preserving my depth but creating distance from the room.",
  8:  "I scale every project I touch, seeking impact so large it sometimes misses the human detail in the foundation.",
  9:  "I extract wisdom at the end of cycles, wrapping up others' work while struggling to start anything of my own.",
  11: "I pick up on micro-signals that others miss, reacting to tensions before they are even named by the room.",
  22: "I build at a scale most won't attempt, sacrificing the small comforts of today for a structure that outlives me.",
  33: "I absorb the weight of those around me, healing the collective while my own system is near a breaking point.",
};

const SOCIAL_ENERGY_DESC: Record<string, string> = {
  steady:    "I show up with consistent predictability, stabilizing my circle even when my own internal signal is fluctuating.",
  bursts:    "I operate in high-intensity cycles, giving everything until I hit a wall and vanish without warning.",
  sensitive: "I monitor my environment for micro-shifts in energy, deciding where I stand based on the room's unspoken tension.",
};

function buildMyPattern(s: SoulSignals, arc: Archetype, v: number): string {
  const name = s.name || "I";
  const nameRef = name !== "I" ? `${name}, I` : "I";
  const variants: string[] = [];

  const sunVariants: Record<string, string[]> = {
    Aries: [
      `${nameRef} move first when I feel a delay, figuring out the direction only after I'm already in motion.`,
      `${nameRef} operate on a short-fuse trigger, initiating action the moment I detect hesitation in others.`,
      `${nameRef} ignore the permission of others when an impulse hits, clearing a path that sometimes leaves the team behind.`
    ],
    Taurus: [
      `${nameRef} anchor to the long-game when things get chaotic, refusing to move until the stability is guaranteed.`,
      `${nameRef} prioritize the physical foundation over speed, holding my position even when the world demands change.`,
      `${nameRef} move at the speed of stone, committing so deeply to a path that I struggle to pivot even when it's necessary.`
    ],
    Leo: [
      `${nameRef} lead with massive heart when I feel seen, but I crash and withdraw if my contribution goes unacknowledged.`,
      `${nameRef} over-perform when the stakes are high, trading my internal peace for the external validation of the room.`,
      `${nameRef} operate with intensity when I have an audience, but my function drops to zero when I'm forced to work in the shadows.`
    ],
    Virgo: [
      `${nameRef} audit every detail when I detect an error, falling into an analysis loop that prevents the project from ever feeling finished.`,
      `${nameRef} see the gaps in everything I touch, fixing the structure but often missing the flow of the moment.`,
      `${nameRef} map every move before I take it, choosing precision over momentum even when speed is the actual requirement.`
    ],
    Scorpio: [
      `${nameRef} monitor the hidden layers of the room, choosing my words so carefully that I sometimes miss the window to speak.`,
      `${nameRef} go dark the moment I feel my privacy is invaded, protecting my signal at the cost of total isolation.`,
      `${nameRef} wait for the real truth to surface, ignoring the surface-level noise until the actual signal reveals itself.`
    ]
  };

  const lpVariants: Record<number, string[]> = {
    1: [
      "I clear paths by initiating immediately, clearing a way that didn't exist two minutes ago.",
      "I act as the starting point, moving before the consensus is reached to avoid being trapped by others' fear.",
      "I act the moment I see a target, ignoring the map to trust my internal navigation."
    ],
    4: [
      "I build systems when chaos arises, creating a logic that I can scale even when the environment is hostile.",
      "I demand a foundation before I can see the roof, refusing to move on hollow ideas that lack structural truth.",
      "I organize the disorder around me until it follows a pattern I can control."
    ],
    7: [
      "I check out quietly when things don’t go deeper — most people don’t even notice when I’m gone.",
      "I disappear mid-conversation once I feel the energy drop, preserving my signal for something real.",
      "I monitor the frequency of the room and vanish the moment it becomes predictable."
    ],
    9: [
      "I extract wisdom at the end of cycles, wrapping up what others started so it doesn't stay broken.",
      "I see the exit before I see the entrance, positioning myself to close what is no longer serving.",
      "I finish the stories that others leave open, even when it costs me my own beginning."
    ]
  };

  const sunPool = sunVariants[s.sunSign] || [`${nameRef} operate with my ${s.sunSign} signature, acting when my core trigger is hit.`];
  const lpPool  = lpVariants[s.lifePath] || [LIFE_PATH_DESC[s.lifePath]];

  // Pick ONE hit line (1-2 sentences max)
  const sunLine = sunPool[v % sunPool.length];
  const lpLine  = lpPool[v % lpPool.length];

  // Logic: Return the sunLine if it's punchy, otherwise the lpLine. 
  // We want ONE line that hits hard.
  return sunLine.length > 50 ? sunLine : lpLine;
}

function buildStressPattern(s: SoulSignals, arc: Archetype, v: number): string {
  const notes = stressNotes(s.stressElement);
  
  const pressureVariants: Record<string, string[]> = {
    fight: [
      "I push harder and confront the obstacle directly, escalating the tension until the blockage breaks.",
      "I trigger combat mode the moment I feel restricted, accelerating into the friction to end the delay.",
      "I don't retreat when cornered; I increase my intensity until the environment yields to my momentum."
    ],
    freeze: [
      "I lock my system when I can't see the exit, waiting in the silence until I have a map of the room.",
      "I go dark when the signal gets too noisy, pausing all action to prevent a catastrophic error.",
      "I prioritize observation over action when the environment is hostile, waiting for a clear vector before I move."
    ],
    adapt: [
      "I shift my angle the moment a path is blocked, finding a new way around without stopping.",
      "I stop answering messages when things feel misaligned, avoiding the confrontation while telling myself I'm protecting my peace.",
      "I mirror the needs of the room when I'm under pressure, sometimes losing my own signal in the process."
    ],
    withdraw: [
      "I vanish when the signal gets too noisy, protecting my space at the cost of isolation.",
      "I go dark when I'm overwhelmed, reading every message but refusing to respond until I've processed the energy.",
      "I pull back into my inner chamber when I detect a threat, preferring the safety of silence over the risk of being seen."
    ],
    perform: [
      "I raise my game and act sharper when the lights are on, but I crash spectacularly once the crisis ends.",
      "I treat chaos as a stage, over-performing until I've completely ignored my own physical requirements.",
      "I become the hero when things go wrong, but I trade my long-term health for the immediate victory."
    ],
  };

  const pVariants = pressureVariants[s.pressureStyle] || [pressureVariants.adapt[0]];
  const pNote = pVariants[v % pVariants.length];
  
  return `${notes} ${pNote}`;
}

function buildRelationshipPattern(s: SoulSignals, arc: Archetype, v: number): string {
  const social: Record<string, string[]> = {
    steady: [
      "I show up consistently, stabilizing my circle even when the environment is fluctuating.",
      "I prioritize endurance over intensity, acting as the through-line in every group I join.",
      "I build reliability over time, refusing to vanish even when the friction is high."
    ],
    bursts: [
      "I connect intensely and give everything, then I hit a wall and vanish to recharge in total isolation.",
      "I operate in high-frequency pulses, bringing massive energy that I can't sustain for long.",
      "I move in and out of people's lives, delivering my impact then withdrawing before I burn out."
    ],
    sensitive: [
      "I monitor other people's energy styles, choosing my circle based on who doesn't drain my battery.",
      "I read the room before I speak, filtering my presence to match the unspoken tension.",
      "I absorb the moods around me, so I protect my borders with extreme deliberation."
    ],
  };

  const decision: Record<string, string[]> = {
    gut: [
      "I trust my internal signal and commit fast when the resonance is there, ignoring the logic to follow the heat.",
      "I don't need a list of reasons to move; I act the moment the gut-feel hits.",
      "I prioritize the immediate internal signal over the long-term data audit."
    ],
    analysis: [
      "I audit the history of a person before I let them close, weighing the data against my long-term goals.",
      "I monitor the potential and the risk before I invest my heart, choosing precision over impulse.",
      "I don't trust the first impression; I wait until I have enough data to prove the logic holds up."
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
    contradictions.push("I move with high-speed precision when I'm active, but I check out completely to decide where that speed is even going.");
  }
  
  if (dr.includes("Peace") && st.includes("Authority")) {
    contradictions.push("I crave sanctuary and quiet, yet I am the first to trigger a confrontation when my autonomy is threatened.");
  }
  
  if (dr.includes("Legacy") && es.includes("Integrity")) {
    contradictions.push("I build massive structures, but I'll burn the whole project down the moment it lacks structural truth.");
  }

  const general = [
    "I build rigid systems to protect my time, yet I claim I want total freedom from all restrictions.",
    "I cut people off the second they become predictable, even as I claim I'm looking for deep connection.",
    "I default to restlessness in the day-to-day execution, even though I claim to be focused on the long-game.",
    "I over-analyze the data until I'm paralyzed, even though I claim I trust my intuition completely."
  ];
  
  return contradictions.length > 0 ? contradictions[v % contradictions.length] : general[v % general.length];
}

function buildLifeConsequence(s: SoulSignals, v: number): string {
  const consequences: string[] = [];
  
  if (s.pressureStyle === "fight" && s.socialEnergy === "bursts") {
    consequences.push("I gain trust quickly through intensity, but I lose it when I vanish to recover from the heat.");
  }
  
  if (s.pressureStyle === "withdraw" && s.decisionStyle === "analysis") {
    consequences.push("I mentally exit environments months before I actually leave, making my eventual departure feel sudden to everyone else.");
  }

  const general = [
    "I finish fewer projects than others, but the ones I complete define the entire industry around me.",
    "I attract opportunities through my signal, but I sabotage them once the novelty fades and the routine sets in.",
    "I feel like an outsider even in the rooms I built myself, because I'm always looking for the next exit.",
    "People call me first in a crisis, but they forget me first when things become stable."
  ];
  
  return consequences.length > 0 ? consequences[v % consequences.length] : general[v % general.length];
}

function buildPatternInterruption(s: SoulSignals, v: number): string {
  const breaks: string[] = [];
  
  if (s.pressureStyle === "fight") {
    breaks.push("The few times I choose precision over volume, the resistance vanishes—but it feels like I'm losing speed.");
    breaks.push("I've tried to 'calm down' mid-conflict, but I fall back into escalation the moment I feel my power is ignored.");
  }
  
  if (s.pressureStyle === "withdraw") {
    breaks.push("When I name the tension before I vanish, the environment stabilizes—but I feel exposed and dangerous.");
    breaks.push("The door only opens for me when I'm already exhausted from holding the silence for so long.");
  }

  const general = [
    "The loop only breaks when I act before the logic feels 'safe', which is a rule I rarely allow myself to break.",
    "I've tried to respond faster, but the silence pulls me back in whenever I feel misaligned with the room.",
    "I prioritize the immediate task over the long-term anxiety only when I'm forced, and then everything stabilizes.",
    "I find clarity when I choose direct honesty over the safety of silence, even when it feels like a violation of my nature."
  ];
  
  return breaks.length > 0 ? breaks[v % breaks.length] : general[v % general.length];
}

function buildLoopSentence(s: SoulSignals, v: number): string {
  const p = s.pressureStyle;
  
  const loops: Record<string, string[]> = {
    fight: [
      "I push early, hit resistance, and only find the win when I stop trying to out-volume the obstacle.",
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
    "build something":  "I create tangible structures that outlast my presence.",
    "build_something":  "I create tangible structures that outlast my presence.",
    "understand life":  "I audit the deep logic of how things work to find the hidden patterns.",
    "understand_life":  "I audit the deep logic of how things work to find the hidden patterns.",
    "help others":      "I act as the medicine for those who have forgotten their own light.",
    "help_others":      "I act as the medicine for those who have forgotten their own light.",
    "freedom":          "I clear my schedule of all restrictions, preserving my autonomy at any cost.",
    "influence":        "I shape the trajectory of projects so they follow my specific vision.",
    "stability":        "I build a heavy foundation first, expanding only when the safety is absolute.",
  };
  const parts = s.goals.map((g) => goalMap[g.toLowerCase()] ?? g);
  return parts.join(" ") || "I discover the specific architecture I was built to build.";
}

function buildGrowthEdges(s: SoulSignals): string[] {
  const edges: string[] = [];
  if (s.stressElement === "air")
    edges.push("My mental loops accelerate under pressure, often creating a noise floor that hides the actual solution.");
  if (s.stressElement === "fire")
    edges.push("My intensity triggers a heat response that can burn through bridges before I've even decided I want to cross them.");
  if (s.stressElement === "water")
    edges.push("I absorb the emotional frequency of the room, which can flood my system and drown out my own logical signal.");
  if (s.stressElement === "earth")
    edges.push("I anchor so deeply to my current position that I can mistake rigidity for strength, even when the environment has shifted.");
  if (s.stressElement === "metal")
    edges.push("I cut ties the moment I feel a misalignment, protecting my border but often leaving me in a vacuum of my own making.");

  if (s.decisionStyle === "avoidance")
    edges.push("I treat the delay of a decision as a safety mechanism, even when the inaction is creating more risk than the choice.");
  if (s.decisionStyle === "impulse")
    edges.push("I prioritize momentum over accuracy, moving fast to outrun the anxiety of the unknown.");

  if (s.socialEnergy === "sensitive")
    edges.push("I carry the unspoken weight of others' moods, acting as a mirror for the room until my own battery is depleted.");
  if (s.socialEnergy === "bursts")
    edges.push("I vanish without a signal when my energy drops, leaving others to interpret my silence as a statement.");

  // Deduplicate and filter
  return Array.from(new Set(edges)).slice(0, 3);
}

function buildRecognitionMoment(s: SoulSignals, v: number): string {
  const recognitionPool: Record<string, string[]> = {
    fight: [
      "I prioritize winning the argument over resolving the tension, even when I know I'm wrong.",
      "I escalate my intensity when I feel ignored, forcing others to react to my volume rather than my logic.",
      "I treat every delay as a personal restriction and react with immediate, sometimes unnecessary, force."
    ],
    withdraw: [
      "I read every message but refuse to respond when I don't have the energy to perform the expected personality.",
      "I go dark the moment I feel my autonomy is threatened, leaving others to deal with the silence I leave behind.",
      "I mentally exit a room the moment it becomes predictable, checking out long before I actually leave."
    ],
    adapt: [
      "I stop answering messages when things feel slightly misaligned, avoiding the confrontation while telling myself I'm protecting my peace.",
      "I mirror the needs of the room so well that I lose my own signal, then I feel resentful that nobody knows the real me.",
      "I delay direct honesty to keep the peace, then I'm surprised when the tension I've been hiding eventually explodes."
    ],
    freeze: [
      "I lock my system when I can't see the perfect move, choosing the safety of paralysis over the risk of being seen as wrong.",
      "I wait for the environment to shift for me instead of taking the initiative to clear my own path.",
      "I hide in the details of a problem to avoid the actual decision that needs to be made."
    ],
    perform: [
      "I over-perform my enthusiasm to hide how depleted I actually feel, trading my long-term energy for a temporary social win.",
      "I become the 'hero' in a crisis so I don't have to address the quiet instability in my own foundation.",
      "I trade my internal peace for external validation, choosing to look successful over actually being stable."
    ]
  };

  const pool = recognitionPool[s.pressureStyle] || recognitionPool.adapt;
  return pool[v % pool.length];
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

  const syn: Synthesis = {
    codename:            `${archetype.name.split(' ')[0]} ${archetype.role}`,
    myPattern:           cleanup(buildMyPattern(signals, archetype, vIdx)),
    stressPattern:       cleanup(buildStressPattern(signals, archetype, vIdx)),
    relationshipPattern: cleanup(buildRelationshipPattern(signals, archetype, vIdx)),
    recognitionMoment:   cleanup(buildRecognitionMoment(signals, vIdx)),
    moralCode:           deriveMoralCode(signals.pressureStyle, signals.nonNegotiables),
    powerMode:           cleanup(buildPowerMode(signals)),
    growthEdges:         buildGrowthEdges(signals).map(cleanup),
    contradiction:       cleanup(buildContradiction(signals, vIdx)),
    lifeConsequence:     cleanup(buildLifeConsequence(signals, vIdx)),
    patternInterruption: cleanup(buildPatternInterruption(signals, vIdx)),
    loopSentence:        cleanup(buildLoopSentence(signals, vIdx)),
  };

  // Clean up moral code notes as well
  syn.moralCode.notes = cleanup(syn.moralCode.notes);

  // Final deduplication check across semantic groups
  const lines = [syn.myPattern, syn.stressPattern, syn.relationshipPattern, syn.contradiction];
  const unique = Array.from(new Set(lines));
  if (unique.length < lines.length) {
    // If we have a direct duplicate, adjust the seed slightly and retry once
    return synthesize({ ...signals, seed: signals.seed + "1" }, archetype);
  }

  return syn;
}

/**
 * FINAL CLEANUP: Removes any raw signals or AI leakage that escaped the router.
 */
function cleanup(text: string): string {
  if (!text) return "";
  
  // 1. Remove greedy system prefixes like 'hj|1221-12-12|fix|chaoschaos' or 'rg | 1990... | talkwithdraw'
  let cleaned = text.replace(/^[a-z]{2,3}\s*\|[^A-Z]+(?=[A-Z])/i, "");
  
  // 2. If it still starts with artifacts
  cleaned = cleaned.replace(/^[a-z|,\s]+(?=[A-Z])/i, "").trim();

  // 3. Purge specific leakage tokens
  const leakage = [
    /chaosrepetition/gi, /talkwithdraw/gi, /chaoschaos/gi,
    /chaos/gi, /repetition/gi, /fix/gi, /withdraw/gi,
    /talk/gi, /analyze/gi, /hj\s*\|/gi, /rg\s*\|/gi
  ];
  
  leakage.forEach(pat => {
    cleaned = cleaned.replace(pat, "");
  });

  // 4. Final Polish
  cleaned = cleaned.replace(/^[,|.\s]+/, "").trim();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
