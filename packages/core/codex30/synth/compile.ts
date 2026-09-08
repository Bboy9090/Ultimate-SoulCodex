import type { Signal, ThemeScore } from "../types.js";

export function compileBulletLists(signals: Signal[], themes: ThemeScore[]) {
  const strengths: string[] = [];
  const shadows: string[]   = [];
  const triggers: string[]  = [];
  const prescriptions: string[] = [];

  const topStrength = signals
    .filter(s => s.polarity === "strength")
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 6);

  const topShadow = signals
    .filter(s => s.polarity === "shadow")
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 6);

  for (const s of topStrength) strengths.push(s.label);
  for (const s of topShadow)   shadows.push(s.label);

  const tags = themes.slice(0, 8).map(t => t.tag);

  if (tags.includes("precision"))         triggers.push("Sloppy work, vague promises, and people who won't follow through.");
  if (tags.includes("privacy"))           triggers.push("Intrusion, forced openness, and being observed while you're still building.");
  if (tags.includes("truth"))             triggers.push("Lies, manipulation, and 'word salad' excuses that waste your time.");
  if (tags.includes("social_sensitivity"))triggers.push("Noisy environments and chaotic people when you're already at capacity.");
  if (tags.includes("order"))             triggers.push("Chaos imposed by others when you've built a system that works.");
  if (tags.includes("freedom"))           triggers.push("Being boxed into someone else's timeline or decision framework.");
  if (tags.includes("intensity"))         triggers.push("Shallow conversations that go nowhere and energy spent on performance.");
  if (tags.includes("legacy"))            triggers.push("Short-term thinking that trades the future for comfort right now.");

  prescriptions.push("Pick one build target and finish it. Your nervous system trusts completion over accumulation.");
  prescriptions.push("Reduce input this week. Less scrolling, more making. Information is not progress.");
  prescriptions.push("Say no once without explaining yourself. The explanation is optional.");

  if (tags.includes("precision") || tags.includes("craft")) {
    prescriptions.push("Do one thing with full attention. Quality over speed this cycle.");
  }
  if (tags.includes("emotion_depth") || tags.includes("healing")) {
    prescriptions.push("Process before you produce. Thirty minutes of reflection before output.");
  }

  return {
    strengths,
    shadows,
    triggers,
    prescriptions: prescriptions.slice(0, 5)
  };
}

export function pickCodename(themes: ThemeScore[]): string {
  const top1 = themes[0]?.tag ?? "legacy";
  const top2 = themes[1]?.tag ?? "craft";

  const map: Record<string, Record<string, string>> = {
    precision: {
      legacy:     "The Quiet Blade Architect",
      intensity:  "The Precision Furnace",
      privacy:    "The Hidden Calibration Engine",
      truth:      "The Clean Signal Operator",
      default:    "The Quiet Blade Architect"
    },
    legacy: {
      precision:  "The Immortal Forge Builder",
      intensity:  "The Deep Vein Operator",
      craft:      "The Slow Burn Builder",
      default:    "The Immortal Forge Builder"
    },
    privacy: {
      intensity:  "The Hidden Lighthouse",
      truth:      "The Sealed Oracle",
      precision:  "The Inner Chamber Architect",
      default:    "The Hidden Lighthouse"
    },
    intensity: {
      craft:      "The Calm Volcano",
      truth:      "The Steady Thermal Core",
      legacy:     "The Pressure Sculptor",
      default:    "The Calm Volcano"
    },
    intuition: {
      healing:    "The Signal Reader",
      privacy:    "The Quiet Sonar",
      emotion_depth: "The Tuned Receiver",
      default:    "The Signal Reader"
    },
    service: {
      precision:  "The Exacting Servant",
      healing:    "The Repair Architect",
      order:      "The Reliable Foundation",
      default:    "The Exacting Servant"
    },
    truth: {
      courage:    "The Straight Line Operator",
      boundaries: "The No-Bullshit Compass",
      precision:  "The Clean Signal Operator",
      default:    "The Straight Line Operator"
    },
    craft: {
      legacy:     "The Patient Builder",
      precision:  "The Silent Craftsman",
      discipline: "The Obsessive Maker",
      default:    "The Patient Builder"
    }
  };

  return map[top1]?.[top2] ?? map[top1]?.default ?? "The Quiet Storm Architect";
}
