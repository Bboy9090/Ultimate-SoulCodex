import type {
  SoulProfile,
  FullChart,
  NumerologyProfile,
  MirrorProfile,
  ElementBalance,
  MoralCompass,
  HumanDesignProfile,
  TimelinePhase,
} from "../types/soulcodex";

export type CodexSynthesis = {
  archetype: string;
  topThemes: string[];
  coreNature: string;
  stressPattern: string;
  decisionStyle: string;
  relationshipStyle: string;
  blindSpot: string;
  growthEdge: string;
  currentPhaseMeaning: string;
  practicalGuidance: string[];
};

const SIGN_TRAITS: Record<string, { drive: string; shadow: string; element: string }> = {
  Aries:       { drive: "initiating action and leading from the front", shadow: "impatience and burning out others", element: "fire" },
  Taurus:      { drive: "building stability and protecting what matters", shadow: "stubbornness disguised as loyalty", element: "earth" },
  Gemini:      { drive: "gathering information and connecting ideas", shadow: "scattering focus across too many interests", element: "air" },
  Cancer:      { drive: "protecting and nurturing the people I choose", shadow: "absorbing other people's emotions as my own", element: "water" },
  Leo:         { drive: "creating something meaningful and being seen for it", shadow: "needing approval to feel legitimate", element: "fire" },
  Virgo:       { drive: "precision, improvement, and real service", shadow: "over-analyzing until action becomes impossible", element: "earth" },
  Libra:       { drive: "creating harmony and finding the fair answer", shadow: "avoiding confrontation until resentment builds", element: "air" },
  Scorpio:     { drive: "going deep, seeing truth, and maintaining control", shadow: "holding onto pain longer than it serves me", element: "water" },
  Sagittarius: { drive: "seeking meaning and expanding what I understand", shadow: "running from depth by chasing the next horizon", element: "fire" },
  Capricorn:   { drive: "building legacy through discipline and mastery", shadow: "measuring my worth only by output", element: "earth" },
  Aquarius:    { drive: "thinking differently and challenging the default", shadow: "detaching emotionally when things get real", element: "air" },
  Pisces:      { drive: "feeling everything and translating it into something beautiful", shadow: "dissolving my boundaries when someone needs me", element: "water" },
};

const LIFE_PATH_THEMES: Record<number, { theme: string; drive: string }> = {
  1:  { theme: "Independence", drive: "self-reliance and pioneering" },
  2:  { theme: "Partnership", drive: "cooperation and emotional sensitivity" },
  3:  { theme: "Expression", drive: "creativity and communication" },
  4:  { theme: "Structure", drive: "building systems that last" },
  5:  { theme: "Freedom", drive: "adaptability and experience" },
  6:  { theme: "Responsibility", drive: "service, family, and healing" },
  7:  { theme: "Analysis", drive: "seeking truth through investigation" },
  8:  { theme: "Power", drive: "material mastery and leadership" },
  9:  { theme: "Legacy", drive: "humanitarian purpose and completion" },
  11: { theme: "Intuition", drive: "visionary insight and spiritual leadership" },
  22: { theme: "Master Building", drive: "turning vision into large-scale reality" },
  33: { theme: "Master Teaching", drive: "uplifting others through lived example" },
};

const HD_TYPE_TRAITS: Record<string, { strength: string; risk: string }> = {
  Manifestor:          { strength: "initiating without waiting for permission", risk: "alienating people by moving without informing them" },
  Generator:           { strength: "sustained energy when doing work that excites me", risk: "saying yes to things that drain me out of obligation" },
  "Manifesting Generator": { strength: "multi-tasking and fast pivoting", risk: "abandoning things before they compound" },
  Projector:           { strength: "seeing how systems and people actually work", risk: "giving advice nobody asked for and burning out from bitterness" },
  Reflector:           { strength: "sensing the health of any environment instantly", risk: "losing my own identity by absorbing the group" },
};

const PHASE_MEANINGS: Record<string, { meaning: string; focus: string }> = {
  Ignition:     { meaning: "starting something from scratch, raw energy", focus: "commit to one direction before the spark fades" },
  Exposure:     { meaning: "becoming visible, testing ideas in public", focus: "stop editing and let people respond to the real thing" },
  Construction: { meaning: "building foundations, slow deliberate work", focus: "finish what matters before starting something new" },
  Expansion:    { meaning: "scaling what works, saying yes to growth", focus: "expand without losing the standards that got you here" },
  Friction:     { meaning: "tension is revealing what needs to change", focus: "don't run from the discomfort — it's showing you exactly what to fix" },
  Refinement:   { meaning: "cutting what doesn't work, sharpening what does", focus: "reduce noise and protect your best output" },
  Integration:  { meaning: "absorbing lessons, resting with new awareness", focus: "stop doing and let the understanding land" },
  Legacy:       { meaning: "building for others, passing something forward", focus: "think beyond yourself — what survives without you?" },
};

export function synthesizeCodex(profile: SoulProfile): CodexSynthesis {
  const sun = profile.chart?.sun?.sign || "Unknown";
  const moon = profile.chart?.moon?.sign || "Unknown";
  const rising = profile.chart?.rising?.sign;
  const lifePath = profile.numerology?.lifePath || 0;
  const driver = profile.mirror?.driver || "";
  const stress = profile.mirror?.shadowTrigger || "";
  const decision = profile.mirror?.decisionStyle || "";
  const phase = profile.timeline?.currentPhase || "Integration";
  const hd = profile.humanDesign;

  const themes = deriveThemes(profile);
  const archetype = deriveArchetype(profile, themes);

  return {
    archetype,
    topThemes: themes,
    coreNature: buildCoreNature(sun, moon, rising, lifePath, driver, hd),
    stressPattern: buildStressPattern(stress, moon, profile.elements, hd),
    decisionStyle: buildDecisionStyle(decision, driver, hd),
    relationshipStyle: buildRelationshipStyle(profile),
    blindSpot: buildBlindSpot(profile),
    growthEdge: buildGrowthEdge(profile, themes),
    currentPhaseMeaning: buildCurrentPhaseMeaning(phase, themes),
    practicalGuidance: buildPracticalGuidance(profile, phase, themes),
  };
}

function deriveThemes(profile: SoulProfile): string[] {
  const themes = new Map<string, number>();

  const add = (theme: string, score = 1) => {
    if (!theme) return;
    themes.set(theme, (themes.get(theme) || 0) + score);
  };

  const sunSign = profile.chart?.sun?.sign;
  const moonSign = profile.chart?.moon?.sign;
  const risingSign = profile.chart?.rising?.sign;
  const lp = profile.numerology?.lifePath || 0;

  if (sunSign) {
    const t = SIGN_TRAITS[sunSign];
    if (t) {
      add(t.drive.split(" and ")[0].replace(/^[a-z]/, c => c.toUpperCase()), 3);
    }
  }

  if (risingSign) {
    const t = SIGN_TRAITS[risingSign];
    if (t) {
      add(t.drive.split(" and ")[0].replace(/^[a-z]/, c => c.toUpperCase()), 2);
    }
  }

  if (moonSign) {
    const t = SIGN_TRAITS[moonSign];
    if (t) {
      add(t.drive.split(",")[0].replace(/^[a-z]/, c => c.toUpperCase()), 2);
    }
  }

  const lpData = LIFE_PATH_THEMES[lp];
  if (lpData) {
    add(lpData.theme, 3);
  }

  if (profile.mirror?.driver) add(profile.mirror.driver, 2);
  if (profile.mirror?.shadowTrigger) add("Self-awareness", 1);

  profile.morals?.values?.forEach(v => add(v, 1));

  const el = profile.elements;
  if (el) {
    const dominant = Object.entries(el).sort((a, b) => b[1] - a[1])[0];
    if (dominant && dominant[1] > 2) {
      const elMap: Record<string, string> = { fire: "Drive", earth: "Stability", air: "Mental speed", water: "Emotional depth" };
      add(elMap[dominant[0]] || dominant[0], 2);
    }
  }

  if (profile.humanDesign?.type) {
    const hdt = HD_TYPE_TRAITS[profile.humanDesign.type];
    if (hdt) add(hdt.strength.split(" and ")[0].replace(/^[a-z]/, c => c.toUpperCase()), 2);
  }

  return Array.from(themes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([theme]) => theme);
}

function deriveArchetype(profile: SoulProfile, themes: string[]): string {
  const joined = themes.join(" ").toLowerCase();
  const lp = profile.numerology?.lifePath || 0;
  const sunSign = profile.chart?.sun?.sign || "";
  const hdType = profile.humanDesign?.type || "";

  if (joined.includes("precision") && joined.includes("legacy")) return "Quiet Stone Elder";
  if (joined.includes("drive") && joined.includes("intensity")) return "Storm Catalyst";
  if (joined.includes("self-awareness") && (joined.includes("going deep") || joined.includes("boundaries"))) return "Iron Oracle";
  if (joined.includes("building") && joined.includes("stability")) return "Foundation Architect";
  if (joined.includes("feeling") && joined.includes("emotional depth")) return "Deep Current";
  if (joined.includes("freedom") && joined.includes("mental speed")) return "Wind Strategist";
  if (joined.includes("initiating") && joined.includes("drive")) return "First Flame";
  if (joined.includes("creating") && joined.includes("expression")) return "Living Signal";

  if (lp === 9) return "Legacy Architect";
  if (lp === 1) return "Iron Pioneer";
  if (lp === 7) return "Truth Surgeon";
  if (lp === 4) return "Foundation Architect";
  if (lp === 8) return "Power Builder";

  if (hdType === "Projector") return "Pattern Reader";
  if (hdType === "Manifestor") return "First Mover";

  if (sunSign === "Virgo") return "Precision Engine";
  if (sunSign === "Scorpio") return "Deep Current";
  if (sunSign === "Capricorn") return "Quiet Stone Elder";

  return "Soul Architect";
}

function buildCoreNature(
  sun: string,
  moon: string,
  rising: string | undefined,
  lifePath: number,
  driver: string,
  hd?: HumanDesignProfile,
): string {
  const sunTrait = SIGN_TRAITS[sun];
  const moonTrait = SIGN_TRAITS[moon];
  const lpData = LIFE_PATH_THEMES[lifePath];

  const parts: string[] = [];

  if (sunTrait) {
    parts.push(`I lead with ${sun} instincts — ${sunTrait.drive}.`);
  }

  if (moonTrait && moon !== sun) {
    parts.push(`Emotionally, my ${moon} instincts mean ${moonTrait.drive.replace(/^[A-Z]/, c => c.toLowerCase())}.`);
  }

  if (rising && SIGN_TRAITS[rising]) {
    parts.push(`People first see my ${rising} exterior — ${SIGN_TRAITS[rising].drive.replace(/^[A-Z]/, c => c.toLowerCase())}.`);
  }

  if (lpData) {
    parts.push(`Life Path ${lifePath} wires me for ${lpData.drive}.`);
  }

  if (hd?.type && HD_TYPE_TRAITS[hd.type]) {
    parts.push(`As a ${hd.type}, my strength is ${HD_TYPE_TRAITS[hd.type].strength}.`);
  }

  if (driver) {
    parts.push(`My core behavioral driver is ${driver}.`);
  }

  return parts.join(" ");
}

function buildStressPattern(
  stress: string,
  moon: string,
  elements?: ElementBalance,
  hd?: HumanDesignProfile,
): string {
  const moonTrait = SIGN_TRAITS[moon];
  const parts: string[] = [];

  if (stress) {
    parts.push(`Under stress, my default is ${stress.toLowerCase()}.`);
  } else {
    parts.push("Under stress, I speed up mentally before the pressure shows externally.");
  }

  if (moonTrait) {
    parts.push(`My ${moon} emotional wiring means the pressure shows up as ${moonTrait.shadow}.`);
  }

  if (elements) {
    const sorted = Object.entries(elements).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0];
    const weak = sorted[sorted.length - 1];
    if (dominant[0] === "air" && dominant[1] > 2) {
      parts.push("High air means my mind races first — I overthink before I feel.");
    } else if (dominant[0] === "fire" && dominant[1] > 2) {
      parts.push("High fire means I react fast — sometimes too fast to read the room.");
    } else if (dominant[0] === "water" && dominant[1] > 2) {
      parts.push("High water means I absorb stress from my environment before I realize it.");
    } else if (dominant[0] === "earth" && dominant[1] > 2) {
      parts.push("High earth means I dig in and resist change, even when the change is overdue.");
    }
  }

  if (hd?.type && HD_TYPE_TRAITS[hd.type]) {
    parts.push(`My ${hd.type} risk under pressure: ${HD_TYPE_TRAITS[hd.type].risk}.`);
  }

  return parts.join(" ");
}

function buildDecisionStyle(
  decision: string,
  driver: string,
  hd?: HumanDesignProfile,
): string {
  const parts: string[] = [];

  if (decision) {
    parts.push(`My decisions work best when I use ${decision.toLowerCase()}.`);
  }

  if (hd?.authority) {
    parts.push(`My Human Design authority is ${hd.authority} — that's the signal I should trust when the logic is unclear.`);
  }

  if (hd?.strategy) {
    parts.push(`My strategy is to ${hd.strategy.toLowerCase()}.`);
  }

  if (driver) {
    parts.push(`I lose clarity when I'm forced to act against my core driver of ${driver.toLowerCase()}.`);
  }

  return parts.join(" ") || "I make decisions best when I have space to process without external pressure.";
}

function buildRelationshipStyle(profile: SoulProfile): string {
  const values = profile.morals?.values || [];
  const intolerances = profile.morals?.intolerances || [];
  const venus = profile.chart?.venus?.sign;
  const moon = profile.chart?.moon?.sign;

  const parts: string[] = [];

  if (values.length > 0) {
    parts.push(`In relationships, I value ${values.slice(0, 3).join(", ")}.`);
  } else {
    parts.push("In relationships, I value honesty and consistency.");
  }

  if (venus && SIGN_TRAITS[venus]) {
    parts.push(`My Venus in ${venus} means I connect through ${SIGN_TRAITS[venus].drive.replace(/^[A-Z]/, c => c.toLowerCase())}.`);
  }

  if (moon && SIGN_TRAITS[moon]) {
    parts.push(`My ${moon} Moon needs ${SIGN_TRAITS[moon].drive.split(",")[0].toLowerCase()} to feel safe.`);
  }

  if (intolerances.length > 0) {
    parts.push(`What wears me down: ${intolerances.slice(0, 2).join(" and ")}.`);
  } else {
    parts.push("Repetition, control, and dishonesty wear me down quickly.");
  }

  return parts.join(" ");
}

function buildBlindSpot(profile: SoulProfile): string {
  const decision = profile.mirror?.decisionStyle?.toLowerCase() || "";
  const shadow = profile.mirror?.shadowTrigger || "";
  const sunTrait = SIGN_TRAITS[profile.chart?.sun?.sign || ""];
  const hd = profile.humanDesign;

  if (decision.includes("logic") || decision.includes("analyz")) {
    return `I mistake overthinking for preparation. The analysis feels productive, but it delays action. Clarity often comes faster from movement than from more data.${hd?.type === "Projector" ? " As a Projector, I compound this by waiting for invitations that may never come." : ""}`;
  }

  if (decision.includes("impulse") || decision.includes("gut")) {
    return `I trust instinct so much that I skip the two-minute pause that would save me from preventable mistakes. Speed is my asset, but it's also where I miscalculate.`;
  }

  if (shadow.toLowerCase().includes("control")) {
    return `I tighten my grip when things feel uncertain, which pushes away the people and opportunities that need space to arrive.`;
  }

  if (sunTrait) {
    return `My ${profile.chart?.sun?.sign} shadow is ${sunTrait.shadow}. I don't always see it happening in real time, which is exactly what makes it a blind spot.`;
  }

  return "My blind spot is confusing familiarity with correctness — I default to what I know even when the situation has changed.";
}

function buildGrowthEdge(profile: SoulProfile, themes: string[]): string {
  const parts: string[] = [];
  const lp = profile.numerology?.lifePath || 0;
  const hd = profile.humanDesign;

  if (lp === 9) parts.push("Learning to let go of things I've outgrown, even when they still feel like part of my identity.");
  else if (lp === 1) parts.push("Learning to ask for help without interpreting it as weakness.");
  else if (lp === 4) parts.push("Learning flexibility inside the structure I've built — rigidity breaks what discipline created.");
  else if (lp === 7) parts.push("Learning to trust people as much as I trust data.");
  else if (lp === 5) parts.push("Learning that depth requires staying, not just experiencing.");

  if (hd?.type === "Projector") parts.push("Waiting for recognition without growing bitter is the skill that changes everything.");
  if (hd?.type === "Generator") parts.push("Saying no to what doesn't light me up, even when it pays well or feels safe.");

  const sunTrait = SIGN_TRAITS[profile.chart?.sun?.sign || ""];
  if (sunTrait && parts.length < 2) {
    parts.push(`Moving past my ${profile.chart?.sun?.sign} shadow of ${sunTrait.shadow}.`);
  }

  if (parts.length === 0) {
    parts.push("Staying precise without becoming rigid, and honest without withdrawing too fast from people who are still learning.");
  }

  return parts.join(" ");
}

function buildCurrentPhaseMeaning(phase: string, themes: string[]): string {
  const phaseData = PHASE_MEANINGS[phase];
  if (phaseData) {
    return `I'm in ${phase} — ${phaseData.meaning}. This phase rewards working through ${themes.slice(0, 3).join(", ")} with deliberate pacing and clearer choices. ${phaseData.focus}.`;
  }
  return `My current phase is ${phase}. This phase rewards working through ${themes.slice(0, 3).join(", ")} with slower pacing and clearer choices.`;
}

function buildPracticalGuidance(profile: SoulProfile, phase: string, themes: string[]): string[] {
  const advice: string[] = [];
  const phaseData = PHASE_MEANINGS[phase];

  if (phaseData) {
    advice.push(phaseData.focus.charAt(0).toUpperCase() + phaseData.focus.slice(1) + ".");
  }

  const hd = profile.humanDesign;
  if (hd?.strategy) {
    advice.push(`Follow your ${hd.type} strategy: ${hd.strategy.toLowerCase()}.`);
  }

  const joined = themes.join(" ").toLowerCase();
  if (joined.includes("precision") || joined.includes("improvement")) {
    advice.push("Use your standards to refine, not to punish yourself.");
  }
  if (joined.includes("legacy") || joined.includes("building")) {
    advice.push("Focus on what compounds — small consistent actions over dramatic gestures.");
  }
  if (joined.includes("freedom") || joined.includes("independence")) {
    advice.push("Create structure that supports freedom instead of resisting all structure.");
  }
  if (joined.includes("emotional depth") || joined.includes("feeling")) {
    advice.push("Name the feeling before acting on it — the pause changes everything.");
  }
  if (joined.includes("mental speed") || joined.includes("analysis")) {
    advice.push("Pick one thought thread and follow it to completion before starting the next.");
  }

  if (profile.mirror?.decisionStyle?.toLowerCase().includes("logic")) {
    advice.push("Set a deadline for your analysis — after that, move with what you have.");
  }

  if (advice.length === 0) {
    advice.push("Focus on one grounded action instead of ten half-decisions.");
  }

  return advice.slice(0, 4);
}
