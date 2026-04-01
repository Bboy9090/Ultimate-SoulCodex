/**
 * Shadow & Pattern Tools — the honest ones.
 * Shadow Pattern, Energy Leak, Inner Conflict, "Why This Keeps Happening", "Stop Doing This".
 */

import type { CodexToolResult, ProfileInput } from "./types";
import { extractCore } from "./types";

export function shadowPattern(profile: ProfileInput): CodexToolResult {
  const core = extractCore(profile);

  const patterns = [
    { name: "Over-responsibility", behavior: "Taking on more than necessary to feel needed", correction: "Drop one commitment this week that isn't yours" },
    { name: "Avoidance through busyness", behavior: "Staying busy to avoid facing an uncomfortable truth", correction: "Sit still for 10 minutes. The thing you're avoiding will surface. Let it." },
    { name: "Control through preparation", behavior: "Over-planning to create a feeling of safety", correction: "Act on your current plan. Stop refining it." },
    { name: "Delayed confrontation", behavior: "Letting tension build until it explodes or you leave", correction: "Address the smallest irritation today, not the biggest — build the habit" },
    { name: "Performance over presence", behavior: "Showing capability instead of showing up honestly", correction: "Tell one person how you actually feel instead of what you think they need to hear" },
    { name: "Self-reliance as armor", behavior: "Refusing help to maintain the illusion of not needing anyone", correction: "Ask for one specific thing from someone you trust" },
    { name: "Intellectualizing feelings", behavior: "Explaining your emotions instead of feeling them", correction: "Next time you start analyzing a feeling, stop. Breathe. Name it in one word." },
    { name: "Reactive generosity", behavior: "Giving to others to avoid dealing with your own needs", correction: "Before you help someone today, check if you've helped yourself first" },
  ];

  const shadows = core.shadows || [];
  let matched = patterns[0];

  if (shadows.length > 0) {
    const shadowStr = shadows.join(" ").toLowerCase();
    matched = patterns.find(p => shadowStr.includes(p.name.toLowerCase().split(" ")[0])) || patterns[(new Date().getDate() + (core.birthDate ? new Date(core.birthDate).getDate() : 0)) % patterns.length];
  } else {
    matched = patterns[(new Date().getDate() + (core.birthDate ? new Date(core.birthDate).getDate() : 0)) % patterns.length];
  }

  return {
    tool: "shadow_pattern",
    title: "Shadow Pattern",
    observation: `**${matched.name}**\n${matched.behavior}${core.moonSign ? `\n\nYour ${core.moonSign} Moon amplifies this — ${core.moonSign === "Scorpio" || core.moonSign === "Cancer" || core.moonSign === "Pisces" ? "you feel it intensely but hide it well" : core.moonSign === "Aries" || core.moonSign === "Leo" || core.moonSign === "Sagittarius" ? "you push past it with activity" : "you rationalize it away"}.` : ""}`,
    meaning: `This pattern shows up when ${core.stressPattern || "pressure builds and you default to your strongest coping mechanism"}. ${core.blindSpot ? `Your blind spot here: ${core.blindSpot}.` : ""}`,
    action: `**Correction:** ${matched.correction}`,
    extras: { patternName: matched.name },
  };
}

export function energyLeak(profile: ProfileInput): CodexToolResult {
  const core = extractCore(profile);

  const leaks = [
    { source: "Repeated overcommitment", pattern: "Saying yes without checking capacity", action: "Pause new commitments for 48 hours" },
    { source: "Unresolved conversation", pattern: "Carrying the weight of something unsaid", action: "Say the thing. Thirty seconds of discomfort beats days of mental replay" },
    { source: "Decision paralysis", pattern: "Cycling through options without choosing", action: "Set a 24-hour deadline. Pick. Move." },
    { source: "Emotional absorption", pattern: "Taking on others' stress as your own", action: "Ask: 'Is this mine?' If not, put it down physically — change rooms, take a walk" },
    { source: "Perfectionism loop", pattern: "Refining instead of releasing", action: "Ship the 80% version. The last 20% is ego, not quality" },
    { source: "Digital consumption", pattern: "Scrolling instead of resting", action: "Replace 30 minutes of screen time with actual silence" },
  ];

  const idx = (new Date().getDate() + new Date().getHours() + (core.birthDate ? new Date(core.birthDate).getDate() : 0)) % leaks.length;
  const leak = leaks[idx];

  return {
    tool: "energy_leak",
    title: "Energy Leak Detected",
    observation: `**Source:** ${leak.source}\n**Pattern:** ${leak.pattern}`,
    meaning: `${core.primaryElement ? `Your ${core.primaryElement} element processes energy through ${core.primaryElement === "Earth" ? "the body — you feel drained physically before you notice it mentally" : core.primaryElement === "Water" ? "emotion — you absorb others' states" : core.primaryElement === "Fire" ? "action — when you can't move, you burn out internally" : core.primaryElement === "Air" ? "thought — mental overload hits before physical fatigue" : "cycles — watch for imbalance across body and mind"}.` : "When this pattern runs unchecked, it compounds daily."} ${core.hdType ? `Your ${core.hdType} design has ${core.hdType === "Projector" ? "limited sustainable energy — this leak hits you harder than most" : core.hdType === "Generator" || core.hdType === "Manifesting Generator" ? "deep reserves but only for what genuinely excites you — everything else drains fast" : core.hdType === "Manifestor" ? "bursts of initiating power — leaks fragment that power" : "reflective capacity — you're amplifying someone else's leak"}.` : ""}`,
    action: leak.action,
    extras: { leakSource: leak.source },
  };
}

export function innerConflict(profile: ProfileInput): CodexToolResult {
  const core = extractCore(profile);

  let part1 = "Wants stability, structure, and predictability";
  let part2 = "Wants freedom, variety, and self-expression";
  let resolution = "Build a structure that has flexibility built into it. Routine with room to improvise.";

  if (core.sunSign && core.moonSign) {
    const fire = ["Aries", "Leo", "Sagittarius"];
    const earth = ["Taurus", "Virgo", "Capricorn"];
    const air = ["Gemini", "Libra", "Aquarius"];
    const water = ["Cancer", "Scorpio", "Pisces"];

    const sunElement = fire.includes(core.sunSign) ? "fire" : earth.includes(core.sunSign) ? "earth" : air.includes(core.sunSign) ? "air" : "water";
    const moonElement = fire.includes(core.moonSign) ? "fire" : earth.includes(core.moonSign) ? "earth" : air.includes(core.moonSign) ? "air" : "water";

    if (sunElement !== moonElement) {
      const tensions: Record<string, { p1: string; p2: string; res: string }> = {
        "fire-earth": { p1: `Your ${core.sunSign} Sun wants to charge ahead`, p2: `Your ${core.moonSign} Moon needs security first`, res: "Take bold action — but not until the practical foundation is stable" },
        "fire-water": { p1: `Your ${core.sunSign} Sun runs on instinct and confidence`, p2: `Your ${core.moonSign} Moon runs on emotion and intuition`, res: "Let your feelings inform your direction, not override it" },
        "fire-air": { p1: `Your ${core.sunSign} Sun wants to act NOW`, p2: `Your ${core.moonSign} Moon wants to think it through`, res: "Set a 2-hour window: plan first, then execute without second-guessing" },
        "earth-water": { p1: `Your ${core.sunSign} Sun values tangible results`, p2: `Your ${core.moonSign} Moon values emotional truth`, res: "Not everything needs to produce a result. Some things just need to be felt" },
        "earth-air": { p1: `Your ${core.sunSign} Sun trusts what's proven`, p2: `Your ${core.moonSign} Moon needs intellectual stimulation`, res: "Build on what works, but leave room for experiments" },
        "water-air": { p1: `Your ${core.sunSign} Sun feels deeply`, p2: `Your ${core.moonSign} Moon analyzes endlessly`, res: "Feel first, then think. Not the other way around" },
      };

      const key1 = `${sunElement}-${moonElement}`;
      const key2 = `${moonElement}-${sunElement}`;
      const tension = tensions[key1] || tensions[key2];
      if (tension) {
        part1 = tension.p1;
        part2 = tension.p2;
        resolution = tension.res;
      }
    }
  }

  return {
    tool: "inner_conflict",
    title: "Inner Conflict",
    observation: `**Part 1:** ${part1}\n\n**Part 2:** ${part2}`,
    meaning: `These two drives aren't enemies — they're competing priorities. ${core.hdType ? `Your ${core.hdType} design resolves this through ${core.hdAuthority || core.hdStrategy || "your inner authority"}, not logic.` : "The resolution isn't choosing one over the other."}`,
    action: `**Resolution:** ${resolution}`,
  };
}

export function whyThisKeepsHappening(profile: ProfileInput): CodexToolResult {
  const core = extractCore(profile);

  let pattern = "You stay in situations past the point of clarity, then leave abruptly";
  let reason = "You value stability but avoid confrontation, so tension builds silently until it becomes unbearable";
  let adjustment = "Address issues when they're small. One uncomfortable sentence today saves a crisis next month";

  if (core.stressPattern && core.blindSpot) {
    pattern = `Your stress pattern (${core.stressPattern}) keeps activating because ${core.blindSpot}`;
    reason = `${core.moonSign ? `Your ${core.moonSign} Moon holds onto the emotional charge long after the situation passes.` : "You process the situation mentally but not emotionally."} ${core.hdType ? `As a ${core.hdType}, you ${core.hdType === "Projector" ? "wait too long for recognition and then burn out" : core.hdType === "Generator" || core.hdType === "Manifesting Generator" ? "say yes before your gut has time to respond" : core.hdType === "Manifestor" ? "initiate without informing, which creates friction" : "absorb the pattern from your environment"}.` : ""}`;
    adjustment = core.growthEdge || "Interrupt the pattern at the earliest signal — not when it's already in motion";
  } else if (core.shadows.length > 0) {
    pattern = `You default to ${core.shadows[0].toLowerCase()} when under pressure`;
    reason = `This is a protective mechanism that worked once but now creates the problem it was meant to prevent`;
    adjustment = `Notice the moment you start ${core.shadows[0].toLowerCase()}. That's the intervention point. Do the opposite for 5 minutes.`;
  }

  return {
    tool: "why_this_keeps_happening",
    title: "Why This Keeps Happening",
    observation: `**Pattern:** ${pattern}`,
    meaning: `**Reason:** ${reason}`,
    action: `**Adjustment:** ${adjustment}`,
  };
}

export function stopDoingThis(profile: ProfileInput): CodexToolResult {
  const core = extractCore(profile);

  const stops = [
    "Over-explaining yourself to people who already understand",
    "Checking your phone within 5 minutes of waking up",
    "Saying 'maybe' when you mean 'no'",
    "Starting your day by reacting to someone else's agenda",
    "Holding onto a decision you already made — stop re-opening it",
    "Comparing your progress to someone in a completely different situation",
    "Waiting for the perfect moment to start the thing you know you need to do",
    "Apologizing for having needs",
    "Working past the point where the quality drops",
    "Having the same conversation in your head instead of having it with the person",
  ];

  const personalStops: string[] = [];
  if (core.stressPattern) personalStops.push(`Defaulting to ${core.stressPattern.toLowerCase()} when a simpler response would work`);
  if (core.blindSpot) personalStops.push(`Ignoring the fact that ${core.blindSpot.toLowerCase()}`);
  if (core.shadows.length > 0) personalStops.push(`Using ${core.shadows[0].toLowerCase()} as a coping strategy when it costs more than it protects`);

  const allStops = [...personalStops, ...stops];
  const idx = (new Date().getDate() + (core.birthDate ? new Date(core.birthDate).getDate() : 0)) % allStops.length;
  const selected = allStops[idx];

  return {
    tool: "stop_doing_this",
    title: "Stop Doing This",
    observation: selected,
    meaning: `This is costing you more than you think. ${core.lifePath ? `Life Path ${core.lifePath} says your energy is meant for ${Number(core.lifePath) <= 3 ? "creation and expression" : Number(core.lifePath) <= 6 ? "building and service" : "depth and mastery"} — not this.` : "Every minute spent here is a minute not spent on what actually matters."}`,
    action: `Stop. Today. Not gradually — now. Replace it with one minute of doing nothing.`,
  };
}
