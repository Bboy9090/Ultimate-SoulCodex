/**
 * Deterministic fallback engine.
 *
 * When both AI providers fail, this generates guidance from profile data alone.
 * No LLM needed. The app keeps speaking.
 */

import type { AIRequest } from "../src/types/ai";

interface FallbackResult {
  title: string;
  content: string;
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

function soulGuideFallback(
  profile: any,
  timeline?: any,
  dailyCard?: any
): FallbackResult {
  const d = extractCoreData(profile);
  const phase = timeline?.phase || timeline?.currentPhase || "your current phase";
  const focus = dailyCard?.focus || "one grounded next step";
  const topTheme = d.themes[0] || "clarity";

  const lines: string[] = [];

  lines.push(`**Observation**`);
  if (d.sunSign && d.moonSign) {
    lines.push(
      `Your ${d.sunSign} Sun wants to push forward, but your ${d.moonSign} Moon is processing something unresolved. That tension is showing up as indecision or restlessness.`
    );
  } else {
    lines.push(
      `Your strongest pattern right now points to ${topTheme}. Your profile keeps returning to this theme when life gets noisy.`
    );
  }

  lines.push("");
  lines.push(`**Meaning**`);
  if (d.hdType) {
    lines.push(
      `As a ${d.hdType}${d.hdStrategy ? ` (Strategy: ${d.hdStrategy})` : ""}, you're not built to force decisions. ${d.lifePath ? `Life Path ${d.lifePath} reinforces this — ` : ""}the pattern is to simplify before acting, not to stack more options.`
    );
  } else if (d.lifePath) {
    lines.push(
      `Life Path ${d.lifePath} means your pattern is to ${topTheme}. When pressure builds, your default is to speed up instead of narrow down. That costs clarity.`
    );
  } else {
    lines.push(
      `Your ${d.archetype} profile works best when life is simplified instead of overloaded. The pattern that matters most right now is ${topTheme}.`
    );
  }

  lines.push("");
  lines.push(`**Action**`);
  if (d.primaryElement) {
    lines.push(
      `Your ${d.primaryElement} element says: ground yourself physically before making any decision. You are in ${phase}. ${focus}. Do one thing clearly before trying to solve everything at once.`
    );
  } else {
    lines.push(
      `You are in ${phase}. The best move right now is ${focus}. Do one thing clearly before trying to solve everything at once.`
    );
  }

  return {
    title: "Backup guidance from your Codex",
    content: lines.join("\n"),
  };
}

function dailyGuidanceFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);

  const lines: string[] = [];
  lines.push(`**Observation**`);
  if (d.sunSign) {
    lines.push(
      `My ${d.sunSign} Sun is pushing me to act today${d.moonSign ? `, but my ${d.moonSign} Moon needs me to check how I actually feel first` : ""}.`
    );
  } else {
    lines.push(
      `Today pulls me between what feels urgent and what actually matters. My default is to react to the loudest signal.`
    );
  }

  lines.push("");
  lines.push(`**Meaning**`);
  if (d.lifePath) {
    lines.push(
      `Life Path ${d.lifePath} says this is about building deliberately, not reacting quickly. ${d.hdType ? `As a ${d.hdType}, my strategy is clear: ${d.hdStrategy ? d.hdStrategy.toLowerCase() : "wait for the right signal"}.` : ""}`
    );
  } else {
    lines.push(
      `The pattern is clear: rushing creates noise, not progress. Today is about choosing one thing and finishing it.`
    );
  }

  lines.push("");
  lines.push(`**Action**`);
  if (d.primaryElement) {
    lines.push(
      `My ${d.primaryElement} element says: tend to the body first. Eat, move, breathe — then decide. Pick one task and complete it before noon.`
    );
  } else {
    lines.push(
      `Pick one task that matters and complete it before noon. Everything else can wait.`
    );
  }

  return {
    title: "Daily guidance from your Codex",
    content: lines.join("\n"),
  };
}

function dailyHoroscopeFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);

  const lines: string[] = [];
  lines.push(`**Observation**`);
  lines.push(
    d.sunSign
      ? `My ${d.sunSign} drive is active today${d.moonSign ? ` — but my ${d.moonSign} Moon is pulling me toward reflection instead of action` : ""}.`
      : `Today's pull is between action and reflection. My default is to keep busy instead of sitting with what's actually on my mind.`
  );

  lines.push("");
  lines.push(`**Meaning**`);
  lines.push(
    d.lifePath
      ? `Life Path ${d.lifePath} says: the tension between doing and being is the work right now. Don't resolve it — hold it.`
      : `The tension I feel isn't a problem to solve — it's information about what matters most today.`
  );

  lines.push("");
  lines.push(`**Action**`);
  lines.push(
    d.primaryElement
      ? `My ${d.primaryElement} element needs attention today. Start with something physical — a walk, a meal, a stretch — before opening the laptop.`
      : `Start with something physical before diving into mental work. Move the body, then move the plan.`
  );

  return {
    title: "Daily reading from your Codex",
    content: lines.join("\n"),
  };
}

function codexReadingFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);

  const sections: string[] = [];

  sections.push(`As a ${d.archetype}${d.sunSign ? ` with a ${d.sunSign} Sun` : ""}, I'm built for cutting through complexity and finding what matters.`);

  if (d.moonSign) {
    sections.push(
      `My ${d.moonSign} Moon means my emotional processing happens internally — I look calm on the surface while running full analysis underneath.`
    );
  }

  if (d.hdType) {
    sections.push(
      `My ${d.hdType} Human Design${d.hdStrategy ? ` (Strategy: ${d.hdStrategy})` : ""} shapes how I interact with the world — ${d.hdType === "Generator" || d.hdType === "Manifesting Generator" ? "I have sustained energy but only for what genuinely lights me up. Everything else drains me faster than it should." : d.hdType === "Projector" ? "I see what others miss, but I burn out when I try to keep up with the pace around me. My power is in guidance, not labor." : d.hdType === "Manifestor" ? "I initiate without permission. That's my strength and my friction point — people feel left behind when I move without informing." : "I absorb the energy around me. In the right environment I amplify everything good. In the wrong one, I take on everyone else's stress."}.`
    );
  }

  if (d.lifePath) {
    sections.push(
      `Life Path ${d.lifePath} runs underneath everything — it shapes the decisions I gravitate toward and the patterns I keep repeating.`
    );
  }

  if (d.primaryElement) {
    sections.push(
      `My ${d.primaryElement} element shows up in how I handle stress physically. When I'm off-balance, my body tells me before my mind catches up.`
    );
  }

  if (d.strengths.length > 0) {
    sections.push(
      `My strongest edges are ${d.strengths.slice(0, 3).join(", ")}. These work best when I simplify instead of trying to do everything at once.`
    );
  }

  return {
    title: "Codex reading from your profile",
    content: sections.join("\n\n"),
  };
}

function biographyFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);
  
  const bio = {
    codename: d.archetype,
    motto: "In alignment, I find my power.",
    my_pattern: `I act through my ${d.archetype} signature, using my ${d.sunSign || "core"} drive to cut through noise and find what matters.`,
    how_i_move: `As a ${d.hdType || d.archetype}, I move best when I follow my internal signal${d.hdStrategy ? ` (${d.hdStrategy})` : ""}.`,
    what_i_wont_tolerate: "I refuse to be defined by external noise or misaligned expectations.",
    what_im_building: `I am constructing a life of ${d.themes[1] || "purpose"} and ${d.themes[2] || "alignment"}.`
  };

  return {
    title: "Profile from your Codex",
    content: JSON.stringify(bio),
  };
}

function compatibilityFallback(profile: any): FallbackResult {
  return {
    title: "Compatibility reading",
    content:
      "Your compatibility analysis requires both profiles to be loaded. Complete both profiles and try again — the reading draws on specific placements from each person's Big 3, Human Design, and Element data.",
  };
}

function genericFallback(profile: any): FallbackResult {
  const d = extractCoreData(profile);
  return {
    title: "Guidance from your Codex",
    content: `Your Codex profile is available${d.sunSign ? ` (${d.sunSign} Sun` : ""}${d.moonSign ? `, ${d.moonSign} Moon` : ""}${d.sunSign ? `)` : ""}. Live AI interpretation is temporarily paused — use your current phase and daily card as the strongest signals for now. Focus on one clear action rather than spreading your attention.`,
  };
}
