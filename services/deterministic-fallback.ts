/**
 * Deterministic fallback engine.
 *
 * When both AI providers fail, this generates guidance from profile data alone.
 * No LLM needed. The app keeps speaking with surgical accuracy.
 */

import type { AIRequest } from "../src/types/ai";

interface FallbackResult {
  title: string;
  content: string;
}

interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  house: number;
}

interface Alignment {
  type: string;
  planets: string[];
  orb: number;
}

interface PersonalTransit {
  planet: string;
  aspect: string;
  house: number;
}

interface DailyHoroscopeData {
  date: string;
  horoscope: string;
  planets: PlanetPosition[];
  alignments: Alignment[];
  personalTransits: PersonalTransit[];
  moonPhase: { phase: string; percentage: number };
  personalDayNumber: number;
}

export function deterministicFallback(input: AIRequest): FallbackResult {
  switch (input.promptType) {
    case "soul_guide":
      return soulGuideFallback(input.profile, input.timeline, input.dailyCard);
    case "daily_guidance":
      return dailyGuidanceFallback(input.profile);
    case "daily_horoscope":
      return dailyHoroscopeFallback(input.profile);
    case "codex_reading":
      return codexReadingFallback(input.profile);
    case "biography":
      return biographyFallback(input.profile);
    case "today_card":
      return todayCardFallback(input.profile);
    case "compatibility":
      return compatibilityFallback(input.profile);
    default:
      return genericFallback(input.profile);
  }
}

function extractCoreData(profile: any) {
  const astro = profile?.astrologyData || profile || {};
  const numData = profile?.numerologyData || profile || {};
  const hdData = profile?.humanDesignData || profile || {};
  const elemData = profile?.elementalMedicineData || {};
  const archData = profile?.archetypeData || profile?.archetype || {};

  return {
    name: profile?.name || "You",
    archetype:
      archData?.archetype ||
      archData?.name ||
      (typeof profile?.archetype === "string"
        ? profile.archetype
        : profile?.archetype?.name) ||
      "your archetype",
    sunSign: astro?.sunSign || profile?.sunSign || "",
    moonSign: astro?.moonSign || profile?.moonSign || "",
    risingSign: astro?.risingSign || profile?.risingSign || "",
    lifePath: numData?.lifePath || profile?.lifePath || "",
    hdType: hdData?.type || profile?.hdType || "",
    hdStrategy: hdData?.strategy || "",
    hdAuthority: hdData?.authority || "",
    primaryElement: elemData?.primaryElement || archData?.element || profile?.element || "",
    themes: archData?.themes || profile?.themes?.topThemes || [],
    strengths: archData?.strengths || [],
    shadows: archData?.shadows || [],
    stressPattern: profile?.synthesis?.stressPattern || "",
    myPattern: profile?.synthesis?.myPattern || "",
  };
}

/**
 * HIGH-FIDELITY BEHAVIORAL ENGINE
 * Injects surgical behavioral nuances based on specific sign combinations.
 */
function getSurgicalNuance(d: any): string {
  if (d.sunSign === "Capricorn" && d.moonSign === "Pisces") {
    return "I build rigid structures to protect my soft interior. I work until I'm exhausted to avoid feeling my own sensitivity.";
  }
  if (d.sunSign === "Leo" && d.moonSign === "Scorpio") {
    return "I crave the spotlight but keep my true intentions hidden. My power comes from the tension between my public warmth and private intensity.";
  }
  if (d.sunSign === "Virgo" && d.moonSign === "Gemini") {
    return "I am a nervous system in search of an anchor. My mind moves at a speed that my physical form cannot always support.";
  }
  if (d.sunSign === "Taurus" && d.moonSign === "Aries") {
    return "I am a fortress that strikes with precision. I demand stability, but I have a short fuse for anything that feels like a delay.";
  }
  if (d.sunSign === "Aquarius" && d.moonSign === "Cancer") {
    return "I am a visionary with a heavy heart. I want to save the future, but I am often pulled back by the nostalgia of what I've lost.";
  }
  if (d.hdType === "Projector" && d.sunSign === "Aries") {
    return "I have the vision to lead but not the sustained energy to labor. I burn out when I try to run the race I've already finished in my mind.";
  }
  if (d.hdType === "Manifesting Generator") {
    return "I move fast to find what works, skipping steps that others find essential. My frustration comes from having to go back and fix the foundations I rushed past.";
  }
  if (d.hdType === "Manifestor") {
    return "I am designed to impact, not to be liked. My presence alone changes the room, and I feel trapped when I have to ask for permission.";
  }
  if (d.hdType === "Reflector") {
    return "I am a mirror of my environment. I do not have a fixed center, only a lunar cycle that reveals the truth of where I am standing.";
  }
  return `As a ${d.archetype}, I process life through a lens of ${d.themes[0] || "accuracy"} and ${d.themes[1] || "depth"}. My default is to ${d.shadows[0] || "over-analyze"} when I feel pressured.`;
}

function soulGuideFallback(
  profile: any,
  timeline?: any,
  dailyCard?: any
): FallbackResult {
  const d = extractCoreData(profile);
  const phase = timeline?.phase || timeline?.currentPhase || "your current phase";
  const focus = dailyCard?.focus || "one grounded next step";
  const topTheme = d.themes[0] || "clarity";
  const nuance = getSurgicalNuance(d);

  const lines: string[] = [];

  lines.push(`## 👁️ THE SURGICAL MIRROR`);
  lines.push(`${nuance}`);
  lines.push("");
  lines.push(`### THE PATTERN`);
  if (d.sunSign && d.moonSign) {
    lines.push(
      `Your ${d.sunSign} Sun demands concrete progress, while your ${d.moonSign} Moon is tracking a subtle emotional leak. This creates a friction point: you are doing the work, but you don't trust the outcome yet.`
    );
  } else {
    lines.push(
      `Your current pattern is centered on ${topTheme}. You are trying to solve a complex problem with a simple tool, which is causing the current stall.`
    );
  }

  lines.push("");
  lines.push(`### THE MECHANICS`);
  if (d.hdType) {
    lines.push(
      `As a ${d.hdType}, your power is in ${d.hdStrategy === "To Respond" ? "response, not initiation" : "invitation and recognition"}. ${d.lifePath ? `Life Path ${d.lifePath} confirms this — ` : ""}stop trying to force the timeline. The harder you push, the more noise you create.`
    );
  } else {
    lines.push(
      `The mechanics are simple: rushing is a trauma response, not a strategy. You are in ${phase}, which requires observation, not over-correction.`
    );
  }

  lines.push("");
  lines.push(`### THE STRIKE`);
  lines.push(`**Do this now:** ${focus}. Do not look at the next three steps. Only the immediate one. Use your ${d.primaryElement || "core"} energy to stabilize before you commit further.`);

  return {
    title: "Codex Failsafe: Deep Alignment",
    content: lines.join("\n"),
  };
}

function dailyGuidanceFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);
  const nuance = getSurgicalNuance(d);

  const lines: string[] = [];
  lines.push(`## ⚓ DAILY ANCHOR`);
  lines.push(`${nuance}`);
  lines.push("");
  lines.push(`**Observation**: Today is pulling you toward ${d.themes[1] || "distraction"}. Your ${d.sunSign || "core"} drive is high, but your focus is fragmented.`);
  lines.push("");
  lines.push(`**The Shift**: Stop the internal debate. Whether you feel like it or not, the architecture of your ${d.archetype} requires one act of discipline before noon.`);
  lines.push("");
  lines.push(`**Strike**: Complete the most avoided task first. No exceptions. No research. Just execution.`);

  return {
    title: "Daily Codex Failsafe",
    content: lines.join("\n"),
  };
}

function dailyHoroscopeFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);

  const lines: string[] = [];
  lines.push(`## 🌌 COSMIC MECHANICS`);
  lines.push(
    d.sunSign
      ? `Your ${d.sunSign} Sun is in high-friction today. This isn't a problem; it's a diagnostic. Where you feel resistance is exactly where you are leaking energy.`
      : `Today's energy is a mirror. If you feel stuck, it's because you are trying to use an old pattern on a new problem.`
  );
  lines.push("");
  lines.push(`**Alignment**: ${d.moonSign ? `Your ${d.moonSign} Moon needs a boundary.` : "Set a firm boundary around your time."} Do not let external noise dictate your internal pace.`);
  lines.push("");
  lines.push(`**Action**: Move the body for 10 minutes. Then do the one thing you said you'd do yesterday.`);

  return {
    title: "Horoscope Failsafe",
    content: lines.join("\n"),
  };
}

function codexReadingFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);
  const nuance = getSurgicalNuance(d);

  const sections: string[] = [];

  sections.push(`## 🧬 THE SOUL BLUEPRINT`);
  sections.push(`${nuance}`);
  sections.push("");
  sections.push(`### IDENTITY ARCHITECTURE`);
  sections.push(`As a ${d.archetype}${d.sunSign ? ` with a ${d.sunSign} Sun` : ""}, you are designed for ${d.themes[0] || "high-fidelity execution"}. You see the gaps before others even see the structure.`);

  if (d.moonSign) {
    sections.push(
      `**Emotional Engine**: Your ${d.moonSign} Moon runs the background process. You absorb more than you admit, which leads to sudden ${d.shadows[0] || "withdrawal"} when the load becomes too high.`
    );
  }

  if (d.hdType) {
    sections.push(
      `**System Logic**: Your ${d.hdType} type is your navigation system. ${d.hdStrategy === "To Respond" ? "Wait for the world to show you where to put your energy." : "Wait for the recognition of your specific genius."} Forcing the world to move at your pace is the quickest way to burnout.`
    );
  }

  if (d.lifePath) {
    sections.push(
      `**Long-Game**: Life Path ${d.lifePath} is the current underneath the waves. It pulls you toward ${d.themes[2] || "legacy"}. Every small choice either feeds this legacy or dilutes it.`
    );
  }

  return {
    title: "Codex Profile Failsafe",
    content: sections.join("\n\n"),
  };
}

function todayCardFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);
  
  const lines: string[] = [
    `**RECOGNITION**: I am the architect of my own focus.`,
    `**FOCUS**: ${d.themes[0] || "Absolute Integrity"}.`,
    `**DO**:`,
    `- Zero-out one lingering obligation.`,
    `- Close the tabs that are leaking my attention.`,
    `- Trust the ${d.hdAuthority || "internal"} signal.`,
    `**DONT**:`,
    `- Accept a "maybe" when I know it's a "no."`,
    `- Rushing the foundational work.`,
    `**WATCHOUT**: Impatience with the slow speed of others.`
  ];

  return {
    title: "Today's Failsafe Guidance",
    content: lines.join("\n"),
  };
}

function biographyFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);
  
  const bio = {
    codename: d.archetype,
    motto: `Surgical accuracy. Zero compromise.`,
    my_pattern: `I operate through the ${d.archetype} lens, using ${d.sunSign || "precise"} logic and ${d.moonSign || "deep"} intuition to build what matters.`,
    how_i_move: `As a ${d.hdType || d.archetype}, I move when the signal is clear. I don't follow the crowd; I follow the blueprint.`,
    what_i_wont_tolerate: "Vagueness, generic advice, and misaligned energy.",
    what_im_building: `A legacy of ${d.themes[1] || "truth"} and ${d.themes[2] || "impact"}.`
  };

  return {
    title: "Biography Failsafe",
    content: JSON.stringify(bio),
  };
}

function compatibilityFallback(profile: any): FallbackResult {
  return {
    title: "Compatibility Failsafe",
    content:
      "Compatibility analysis requires a dual-profile sync. Ensure both soul blueprints are fully loaded into the Codex to reveal the friction points and harmonic resonances between your specific placements.",
  };
}

function genericFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);
  const strengths = d.strengths?.length ? d.strengths : deterministicArchetypeProfile(d).strengths;
  return {
    title: "Codex Failsafe",
    content: `Your profile (${d.archetype}) is active. AI interpretation is currently paused to protect signal integrity. Use your core strengths—${strengths.slice(0, 2).join(" and ")}—to navigate the current complexity. One act of absolute truth is better than a thousand generic guesses.`,
  };
}

/**
 * Deterministic archetype profile.
 *
 * Produces strong, non-empty strengths / shadows / first-person bio / purpose
 * from birth-derived signals ALONE (sun, moon, life path, element). Used to
 * guarantee the core reading never ships empty arrays, generic stubs, or
 * placeholder text when AI keys are absent or the archetype generator returns
 * nothing. AI, when available, enhances this — it does not rescue it.
 */
interface ArchetypeProfileInput {
  sunSign?: string;
  moonSign?: string;
  lifePath?: number | string;
  element?: string;
  archetypeName?: string;
}

const SUN_STRENGTHS: Record<string, string[]> = {
  Aries: ["Decisive initiative", "Raw courage", "Momentum under pressure"],
  Taurus: ["Unshakable persistence", "Grounded reliability", "Patient craftsmanship"],
  Gemini: ["Quick synthesis", "Verbal agility", "Adaptive curiosity"],
  Cancer: ["Emotional intelligence", "Protective loyalty", "Deep memory"],
  Leo: ["Natural leadership", "Generous warmth", "Creative confidence"],
  Virgo: ["Precision analysis", "Practical service", "Pattern detection"],
  Libra: ["Diplomatic balance", "Aesthetic judgment", "Fair-mindedness"],
  Scorpio: ["Strategic depth", "Emotional endurance", "Penetrating focus"],
  Sagittarius: ["Expansive vision", "Honest directness", "Restless optimism"],
  Capricorn: ["Long-game discipline", "Structural thinking", "Quiet authority"],
  Aquarius: ["Original thinking", "Principled independence", "Systems vision"],
  Pisces: ["Deep empathy", "Imaginative range", "Intuitive attunement"],
};

const SUN_SHADOWS: Record<string, string[]> = {
  Aries: ["Impatience with slower paces", "Acting before the plan is ready"],
  Taurus: ["Resistance to necessary change", "Holding a position past its usefulness"],
  Gemini: ["Scattered focus", "Committing to ideas before vetting them"],
  Cancer: ["Retreating into moods", "Carrying others' emotions as your own"],
  Leo: ["Withdrawing when unacknowledged", "Performing instead of resting"],
  Virgo: ["Analysis loops", "Mistaking criticism for care"],
  Libra: ["Avoiding decisions to keep peace", "Losing your own preference"],
  Scorpio: ["Going cold when threatened", "Controlling what should be released"],
  Sagittarius: ["Overpromising on vision", "Skipping the unglamorous detail"],
  Capricorn: ["Equating rigidity with strength", "Working past your own limits"],
  Aquarius: ["Detaching from feeling", "Defaulting to the contrarian stance"],
  Pisces: ["Dissolving your boundaries", "Escaping instead of confronting"],
};

const LIFE_PATH_PURPOSE: Record<number, string> = {
  1: "To initiate — to clear paths and start what others are afraid to begin.",
  2: "To harmonize — to hold relationships and details together with care.",
  3: "To express — to translate inner experience into language others can feel.",
  4: "To build — to turn chaos into durable structure people can rely on.",
  5: "To liberate — to test limits and bring change wherever stagnation sets in.",
  6: "To steward — to take responsibility for the wellbeing of your circle.",
  7: "To understand — to seek the truth beneath the surface and name it.",
  8: "To scale — to build impact large enough to outlast you.",
  9: "To complete — to extract wisdom and close cycles others leave open.",
  11: "To illuminate — to sense what others miss and bring it into the light.",
  22: "To master-build — to construct at a scale most won't attempt.",
  33: "To heal — to carry weight for the collective and return it as care.",
};

function reduceLifePath(lp: number | string | undefined): number {
  const n = typeof lp === "string" ? parseInt(lp, 10) : lp;
  if (!n || Number.isNaN(n)) return 0;
  if (n === 11 || n === 22 || n === 33) return n;
  let v = n;
  while (v > 9) v = String(v).split("").reduce((a, c) => a + Number(c), 0);
  return v;
}

export function deterministicArchetypeProfile(input: ArchetypeProfileInput): {
  strengths: string[];
  shadows: string[];
  bio: string;
  purpose: string;
} {
  const sun = input.sunSign && SUN_STRENGTHS[input.sunSign] ? input.sunSign : "";
  const lp = reduceLifePath(input.lifePath);
  const element = input.element || "";
  const archetype = input.archetypeName || "your archetype";

  const strengths = sun
    ? [...SUN_STRENGTHS[sun]]
    : ["Self-awareness", "Resilience under pressure", "Pattern recognition"];
  const shadows = sun
    ? [...SUN_SHADOWS[sun]]
    : ["Over-protecting your own energy", "Hesitating past the right moment"];

  const purpose = LIFE_PATH_PURPOSE[lp] || "To turn self-understanding into deliberate, grounded action.";

  const bioParts: string[] = [];
  if (sun) {
    bioParts.push(`I lead with ${sun} ${element ? `${element}-toned ` : ""}energy: ${strengths[0].toLowerCase()} and ${strengths[1].toLowerCase()}.`);
  } else {
    bioParts.push(`I move through life as ${archetype}, leaning on ${strengths[0].toLowerCase()} and ${strengths[1].toLowerCase()}.`);
  }
  if (input.moonSign) {
    bioParts.push(`My ${input.moonSign} Moon runs the emotional engine underneath, shaping how I recover and what I protect.`);
  }
  if (lp) {
    bioParts.push(`Life Path ${lp} pulls me toward one thing: ${purpose.replace(/^To /, "to ").replace(/\.$/, "")}.`);
  }
  bioParts.push(`My growth edge is the same as my gift — ${shadows[0].toLowerCase()}.`);

  return {
    strengths,
    shadows,
    bio: bioParts.join(" "),
    purpose,
  };
}
