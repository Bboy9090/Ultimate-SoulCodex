/**
 * Deterministic fallback engine.
 *
 * When both AI providers fail, this generates guidance from profile data alone.
 * No LLM needed. The app keeps speaking with surgical accuracy.
 */

import type { AIRequest } from "../src/types/ai";
import { extractVerifiedAstrology } from "../server/lib/verified-astrology";

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

function validLifePath(value: unknown): number | "" {
  const candidate =
    typeof value === "number"
      ? value
      : typeof value === "object" && value !== null
        ? Number((value as any).number ?? (value as any).value)
        : Number(value);
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].includes(candidate)
    ? candidate
    : "";
}

function verifiedHumanDesign(profile: any): {
  type: string;
  strategy: string;
  authority: string;
} {
  const hd = profile?.humanDesignData;
  if (!hd || hd.status !== "verified") {
    return { type: "", strategy: "", authority: "" };
  }
  return {
    type: typeof hd.type === "string" ? hd.type : "",
    strategy: typeof hd.strategy === "string" ? hd.strategy : "",
    authority: typeof hd.authority === "string" ? hd.authority : "",
  };
}

function extractCoreData(profile: any) {
  const numData = profile?.numerologyData || profile || {};
  const elemData = profile?.elementalMedicineData || {};
  const archData = profile?.archetypeData || profile?.archetype || {};
  const verifiedAstrology = extractVerifiedAstrology(profile);
  const humanDesign = verifiedHumanDesign(profile);

  return {
    name: profile?.name || "You",
    archetype:
      archData?.archetype ||
      archData?.name ||
      (typeof profile?.archetype === "string"
        ? profile.archetype
        : profile?.archetype?.name) ||
      "your archetype",
    sunSign: verifiedAstrology.sun || "",
    moonSign: verifiedAstrology.moon || "",
    risingSign: verifiedAstrology.rising || "",
    lifePath: validLifePath(numData?.lifePath ?? numData?.lifePathNumber ?? profile?.lifePath),
    hdType: humanDesign.type,
    hdStrategy: humanDesign.strategy,
    hdAuthority: humanDesign.authority,
    primaryElement: elemData?.primaryElement || archData?.element || profile?.element || "",
    themes: Array.isArray(archData?.themes)
      ? archData.themes
      : Array.isArray(profile?.themes?.topThemes)
        ? profile.themes.topThemes
        : [],
    strengths: Array.isArray(archData?.strengths) ? archData.strengths : [],
    shadows: Array.isArray(archData?.shadows) ? archData.shadows : [],
    stressPattern: profile?.synthesis?.stressPattern || "",
    myPattern: profile?.synthesis?.myPattern || "",
    unresolvedAstrology: verifiedAstrology.unresolved,
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
  const supported = [
    d.myPattern,
    d.stressPattern,
    d.themes[0] ? `A supported symbolic theme in this profile is ${d.themes[0]}.` : "",
  ].filter(Boolean);
  return supported.length
    ? supported.join(" ")
    : "The saved profile does not contain enough evidence-backed behavioral material for a specific fallback interpretation.";
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
      `Your verified ${d.sunSign} Sun and ${d.moonSign} Moon are both available as symbolic lenses. Compare the identity and emotional themes they describe against what is actually happening rather than treating either placement as a fixed behavior claim.`
    );
  } else {
    lines.push(
      d.myPattern ||
        `The current saved profile emphasizes ${topTheme}. No verified Sun/Moon interaction is available here, so the fallback will not invent one.`
    );
  }

  lines.push("");
  lines.push(`### THE MECHANICS`);
  if (d.hdType) {
    lines.push(
      `Verified Human Design core: ${d.hdType}${d.hdStrategy ? ` · Strategy: ${d.hdStrategy}` : ""}${d.hdAuthority ? ` · Authority: ${d.hdAuthority}` : ""}. Treat this as a symbolic decision framework, not a diagnosis or command.`
    );
  } else {
    lines.push(
      `No verified Human Design core is available in this profile. The saved phase is ${phase}; use it only as a planning label, and rely on observable behavior rather than an invented decision mechanism.`
    );
  }

  lines.push("");
  lines.push(`### THE STRIKE`);
  lines.push(`**Do this now:** ${focus}. Keep the action small enough to observe the result before adding another interpretation.`);

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
  lines.push(
    d.themes[1]
      ? `**Observation**: The saved profile includes the symbolic theme "${d.themes[1]}". Use it as a reflection prompt, not evidence that today's conditions caused a particular mood.`
      : `**Observation**: No current-day astrological evidence was supplied to this fallback, so it will not invent a daily cosmic condition.`
  );
  lines.push("");
  lines.push(`**The Shift**: Choose one observable task and define what "done" means before starting it.`);
  lines.push("");
  lines.push(`**Action**: Complete one bounded task, then record whether it reduced friction or created new information.`);

  return {
    title: "Daily Codex Failsafe",
    content: lines.join("\n"),
  };
}

function dailyHoroscopeFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);

  const lines: string[] = [];
  lines.push(`## 🌌 DAILY ASTROLOGY FALLBACK`);
  lines.push(
    "Current transit evidence is unavailable in deterministic fallback mode, so Soul Codex will not invent a planetary condition for today."
  );
  if (d.sunSign) {
    lines.push(
      `Your verified natal Sun is ${d.sunSign}. That is a static birth-chart fact; any meaning attached to it remains symbolic and is not evidence about today's events.`
    );
  }
  if (d.moonSign) {
    lines.push(
      `Your verified natal Moon is ${d.moonSign}. Use its interpretation only as a reflection lens, not as a claim about your present mood.`
    );
  }
  lines.push("");
  lines.push(
    `**Action**: Use one observable condition from your actual day—deadline, energy level, conversation, or unfinished task—to choose the next step.`
  );

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
      `**Emotional Lens**: Your verified ${d.moonSign} Moon can be used as a symbolic lens for emotional processing. Keep only the interpretation that matches observed experience; the placement itself does not prove a behavior.`
    );
  }

  if (d.hdType) {
    sections.push(
      `**System Logic**: Verified Human Design core: ${d.hdType}${d.hdStrategy ? ` · ${d.hdStrategy}` : ""}${d.hdAuthority ? ` · ${d.hdAuthority}` : ""}. Treat the system as a symbolic experiment and compare it against lived decisions.`
    );
  }

  if (d.lifePath) {
    sections.push(
      `**Long-Game**: Life Path ${d.lifePath} is a deterministic numerology result. Its interpretation is symbolic; use it as a planning lens rather than a prediction.`
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
    `**RECOGNITION**: I can separate what is verified, what is calculated, and what is only interpretive.`,
    `**FOCUS**: ${d.themes[0] ? `Use "${d.themes[0]}" as a reflection prompt` : "Choose one observable priority"}.`,
    `**DO**:`,
    `- Zero-out one lingering obligation.`,
    `- Close the tabs that are leaking my attention.`,
    d.hdAuthority
      ? `- If useful, test the verified Human Design authority "${d.hdAuthority}" against the actual result of the decision.`
      : `- Use the decision evidence you actually have; no Human Design authority is verified here.`,
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
    my_pattern: d.myPattern ||
      (d.sunSign
        ? `My verified natal Sun is ${d.sunSign}; I treat its meaning as a symbolic lens and test it against lived behavior.`
        : `I do not have enough verified behavioral evidence for a specific identity claim in fallback mode.`),
    how_i_move: d.hdType
      ? `My verified Human Design core is ${d.hdType}${d.hdStrategy ? ` with strategy ${d.hdStrategy}` : ""}; I use it as an experiment, not a command.`
      : `No verified Human Design movement strategy is available in this fallback.`,
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
