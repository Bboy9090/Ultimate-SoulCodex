import type { SoulProfile } from "../types/soulcodex";
import { synthesizeCodex, type CodexSynthesis } from "./synthesize";

export type ReadingStep = {
  id: string;
  title: string;
  body: string;
};

export type SoulReading = {
  archetype: string;
  steps: ReadingStep[];
};

const SIGN_TRAITS: Record<string, { drive: string; shadow: string }> = {
  Aries:       { drive: "initiating action and leading from the front", shadow: "impatience and burning out others" },
  Taurus:      { drive: "building stability and protecting what matters", shadow: "stubbornness disguised as loyalty" },
  Gemini:      { drive: "gathering information and connecting ideas", shadow: "scattering focus across too many interests" },
  Cancer:      { drive: "protecting and nurturing the people I choose", shadow: "absorbing other people's emotions as my own" },
  Leo:         { drive: "creating something meaningful and being seen for it", shadow: "needing approval to feel legitimate" },
  Virgo:       { drive: "precision, improvement, and real service", shadow: "over-analyzing until action becomes impossible" },
  Libra:       { drive: "creating harmony and finding the fair answer", shadow: "avoiding confrontation until resentment builds" },
  Scorpio:     { drive: "going deep, seeing truth, and maintaining control", shadow: "holding onto pain longer than it serves me" },
  Sagittarius: { drive: "seeking meaning and expanding what I understand", shadow: "running from depth by chasing the next horizon" },
  Capricorn:   { drive: "building legacy through discipline and mastery", shadow: "measuring my worth only by output" },
  Aquarius:    { drive: "thinking differently and challenging the default", shadow: "detaching emotionally when things get real" },
  Pisces:      { drive: "feeling everything and translating it into something beautiful", shadow: "dissolving my boundaries when someone needs me" },
};

const MERCURY_MIND: Record<string, string> = {
  Aries:       "My mind moves fast. I decide quickly and get frustrated when others need time to catch up. I think in actions, not abstractions.",
  Taurus:      "My mind works slowly and deliberately. I chew on ideas until they feel solid. Rushing me produces worse results, not faster ones.",
  Gemini:      "My mind runs on multiple tracks at once. I connect information across domains and get bored when something stops being interesting.",
  Cancer:      "My thinking is shaped by how I feel. I remember the emotional texture of a conversation more than the facts of it.",
  Leo:         "I think in terms of impact. Every idea gets filtered through one question: does this matter? If not, I lose interest fast.",
  Virgo:       "My mind works by analyzing and refining. When something feels wrong I don't ignore it — I mentally pick it apart until I understand it.",
  Libra:       "I think by weighing both sides. I can argue any position convincingly, which sometimes makes it hard to commit to my own opinion.",
  Scorpio:     "My mind goes straight to what's hidden. I hear what people aren't saying. I investigate before I trust.",
  Sagittarius: "My thinking is expansive. I connect philosophy to action and get impatient with details that don't serve the big picture.",
  Capricorn:   "My mind is strategic. I think in steps, timelines, and outcomes. I don't waste mental energy on things I can't act on.",
  Aquarius:    "I think differently from most people and I know it. My mind works by questioning the default and designing alternatives.",
  Pisces:      "My thinking is intuitive. I know things before I can explain them. Logic comes after the feeling, not before it.",
};

const MOON_EMOTIONAL: Record<string, string> = {
  Aries:       "Emotionally I react fast and intensely. The feeling hits, I respond, and then I process. I don't hold grudges — but I also don't forget.",
  Taurus:      "Emotionally I'm steady until I'm not. It takes a lot to move me, but once I'm hurt the wound goes deep and heals slowly.",
  Gemini:      "I process emotions by talking through them. If I go quiet, something is wrong. Normally I need to verbalize what I feel to understand it.",
  Cancer:      "I feel everything deeply and personally. Other people's moods affect me whether I want them to or not. I protect myself by controlling my environment.",
  Leo:         "I need to feel seen and valued by the people I care about. When I feel ignored or taken for granted, the warmth I give freely starts to shut down.",
  Virgo:       "Emotionally I process quietly before I speak. I don't trust fast emotional reactions — I prefer to observe what people do over time.",
  Libra:       "I process emotions through relationships. How the other person feels matters almost as much as how I feel, which sometimes means I lose my own signal.",
  Scorpio:     "My emotions run deep and I guard them carefully. I test people before I trust them. Once I'm in, I'm fully in — and betrayal changes everything permanently.",
  Sagittarius: "I process heavy emotions by moving — physically, mentally, geographically. Sitting still with pain feels suffocating.",
  Capricorn:   "I compartmentalize emotion. I feel it, I set it aside, and I get back to work. The cost is that the feelings stack up until something forces them out.",
  Aquarius:    "I observe my emotions more than I feel them. I can describe exactly what's happening inside me, but translating that into vulnerability with another person is harder.",
  Pisces:      "I absorb emotion from everyone around me. The challenge is knowing which feelings are mine and which I picked up from someone else.",
};

const MARS_STRESS: Record<string, string> = {
  Aries:       "When pressure rises I get direct and aggressive. I confront the source of the problem immediately, sometimes before I fully understand it.",
  Taurus:      "Under pressure I dig in. I get stubborn, slow down, and refuse to move until I'm ready. Rushing me under stress makes everything worse.",
  Gemini:      "When stressed my mind fragments. I start multiple solutions at once, talk faster, and scatter my energy across too many responses.",
  Cancer:      "Under pressure I withdraw and protect. I pull away from people, get quiet, and replay the situation internally until I feel safe again.",
  Leo:         "Under stress I either perform harder or shut down completely. There's no middle gear. I need to feel respected even when things are falling apart.",
  Virgo:       "When pressure rises my mind speeds up. I begin reviewing conversations, searching for the precise moment something changed. Analysis becomes a loop.",
  Libra:       "Under stress I freeze between options. The need to make the right choice paralyzes me, and I end up making no choice at all.",
  Scorpio:     "When stressed I go cold. I stop sharing, start observing, and wait for the other person to reveal their real position before I respond.",
  Sagittarius: "Under pressure I want to escape. I look for the exit — a trip, a new project, a conversation change — anything to break the tension.",
  Capricorn:   "When stressed I work harder. I bury the emotion in productivity. The problem is I sometimes solve the wrong problem because I'm avoiding the real one.",
  Aquarius:    "Under pressure I detach. I analyze the situation from the outside, which gives me clarity but makes other people feel like I don't care.",
  Pisces:      "When stressed I absorb everything. The boundary between my feelings and the situation dissolves, and I can't tell what's real anymore.",
};

const LP_PURPOSE: Record<number, string> = {
  1:  "My path is about learning to stand alone and trust my own direction, even when no one else can see where I'm going.",
  2:  "My path is about partnership — not dependency, but learning to create something with another person that neither could build alone.",
  3:  "My path is about expression. The things I hold inside need a form — a voice, a project, a creation that makes the internal external.",
  4:  "My path is about building structures that outlast the moment. Not for recognition, but because I need to create order from chaos.",
  5:  "My path is about freedom and experience. I learn by doing, not by studying. Routine kills something essential in me.",
  6:  "My path is about responsibility and service. I'm drawn to fix, heal, and improve the lives of people I care about — sometimes at my own expense.",
  7:  "My path is about truth-seeking. Surface answers frustrate me. I need to understand why things work, not just that they work.",
  8:  "My path is about mastering the material world. Money, power, and influence aren't shallow to me — they're tools for building something real.",
  9:  "My path isn't about collecting achievements. It's about building something meaningful and leaving behind work that improves people's lives.",
  11: "My path is about visionary insight. I see possibilities that others miss, but the challenge is grounding those visions into something others can follow.",
  22: "My path is about turning vision into reality at scale. I'm not here to dream — I'm here to build the dream into something that stands.",
  33: "My path is about teaching through lived example. People learn from what I do, not what I say.",
};

export function generateSoulReading(profile: SoulProfile): SoulReading {
  const synth = synthesizeCodex(profile);

  const sun = profile.chart?.sun?.sign || "Unknown";
  const moon = profile.chart?.moon?.sign || "Unknown";
  const mercury = profile.chart?.mercury?.sign || sun;
  const venus = profile.chart?.venus?.sign || moon;
  const mars = profile.chart?.mars?.sign || sun;
  const lifePath = profile.numerology?.lifePath || 0;
  const phase = profile.timeline?.currentPhase || "Integration";

  const steps: ReadingStep[] = [
    {
      id: "identity",
      title: "Who You Are",
      body: buildIdentityMirror(profile, synth),
    },
    {
      id: "mind",
      title: "How Your Mind Works",
      body: buildMindStyle(mercury, profile.elements),
    },
    {
      id: "emotion",
      title: "Your Emotional System",
      body: buildEmotionalPattern(moon, profile.mirror?.shadowTrigger),
    },
    {
      id: "stress",
      title: "Your Stress Pattern",
      body: buildStressReading(mars, profile.mirror?.shadowTrigger, profile.elements),
    },
    {
      id: "relationships",
      title: "How You Connect",
      body: synth.relationshipStyle,
    },
    {
      id: "blindspot",
      title: "Your Blind Spot",
      body: synth.blindSpot,
    },
    {
      id: "purpose",
      title: "Your Life Path",
      body: buildPurpose(lifePath, synth),
    },
    {
      id: "phase",
      title: "Where You Are Now",
      body: synth.currentPhaseMeaning,
    },
    {
      id: "guidance",
      title: "What To Do Next",
      body: synth.practicalGuidance.join(" "),
    },
  ];

  return { archetype: synth.archetype, steps };
}

function buildIdentityMirror(profile: SoulProfile, synth: CodexSynthesis): string {
  const sun = profile.chart?.sun?.sign || "";
  const moon = profile.chart?.moon?.sign || "";
  const rising = profile.chart?.rising?.sign;
  const lp = profile.numerology?.lifePath || 0;
  const driver = profile.mirror?.driver;

  const sunTrait = sun ? SIGN_TRAITS[sun] : null;
  const parts: string[] = [];

  if (sunTrait) {
    parts.push(`At my core I operate through ${sunTrait.drive}.`);
  }

  if (rising && SIGN_TRAITS[rising]) {
    parts.push(`People first encounter my ${rising} presence — ${SIGN_TRAITS[rising].drive}.`);
  }

  if (driver) {
    parts.push(`My behavioral driver is ${driver.toLowerCase()} — I notice quickly when that's violated and I respond before I can stop myself.`);
  }

  if (synth.topThemes.length >= 2) {
    parts.push(`The themes that keep surfacing in my profile: ${synth.topThemes.slice(0, 3).join(", ")}.`);
  }

  return parts.join(" ") || synth.coreNature;
}

function buildMindStyle(mercury: string, elements?: { earth: number; air: number; fire: number; water: number }): string {
  const mind = MERCURY_MIND[mercury];
  const parts: string[] = [];

  if (mind) parts.push(mind);

  if (elements) {
    const sorted = Object.entries(elements).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0];
    if (dominant[0] === "air" && dominant[1] > 2) {
      parts.push("High air in my chart amplifies this — my thinking is fast, flexible, and sometimes restless.");
    } else if (dominant[0] === "earth" && dominant[1] > 2) {
      parts.push("High earth grounds my thinking — I prefer practical solutions over theoretical ones.");
    }
  }

  return parts.join(" ") || "My mind works by analyzing patterns and looking for what doesn't fit.";
}

function buildEmotionalPattern(moon: string, shadowTrigger?: string): string {
  const emotional = MOON_EMOTIONAL[moon];
  const parts: string[] = [];

  if (emotional) parts.push(emotional);

  if (shadowTrigger) {
    parts.push(`My emotional tripwire is ${shadowTrigger.toLowerCase()}. When that gets pulled, my rational processing shuts down and instinct takes over.`);
  }

  return parts.join(" ") || "I process emotions internally before I express them. What people see is the edited version.";
}

function buildStressReading(mars: string, shadowTrigger?: string, elements?: { earth: number; air: number; fire: number; water: number }): string {
  const stress = MARS_STRESS[mars];
  const parts: string[] = [];

  if (stress) parts.push(stress);

  if (elements) {
    const fireLevel = elements.fire || 0;
    const waterLevel = elements.water || 0;
    if (fireLevel > 2) parts.push("My fire element means the stress response is visible — other people see it before I think I'm showing it.");
    if (waterLevel > 2) parts.push("My water element means stress goes inward first. By the time someone notices, I've already been processing it for hours.");
  }

  return parts.join(" ") || "Under pressure I speed up mentally and try to solve everything at once.";
}

function buildPurpose(lifePath: number, synth: CodexSynthesis): string {
  const purpose = LP_PURPOSE[lifePath];
  const parts: string[] = [];

  if (purpose) parts.push(purpose);

  if (synth.growthEdge) {
    parts.push(synth.growthEdge);
  }

  return parts.join(" ") || "My path is about building something that matters more than speed or approval.";
}
