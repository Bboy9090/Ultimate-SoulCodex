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

  if (tags.includes("precision"))         triggers.push("Reflection prompt: notice whether vague promises or unfinished work create friction for you.");
  if (tags.includes("privacy"))           triggers.push("Reflection prompt: notice when privacy helps you think clearly versus when withdrawal costs connection.");
  if (tags.includes("truth"))             triggers.push("Reflection prompt: notice how ambiguity, inconsistency, or perceived dishonesty affects your decisions.");
  if (tags.includes("social_sensitivity"))triggers.push("Reflection prompt: compare how different social environments affect your attention and energy.");
  if (tags.includes("order"))             triggers.push("Reflection prompt: notice when structure supports you and when rigidity gets in the way.");
  if (tags.includes("freedom"))           triggers.push("Reflection prompt: notice where autonomy improves your judgment and where coordination still matters.");
  if (tags.includes("intensity"))         triggers.push("Reflection prompt: notice when depth is useful and when intensity makes a simple situation heavier.");
  if (tags.includes("legacy"))            triggers.push("Reflection prompt: compare short-term relief with the longer-term outcome you actually want.");

  prescriptions.push("Experiment: choose one build target and finish a small, observable piece before adding another.");
  prescriptions.push("Experiment: reduce one source of input for a day and compare whether focused output improves.");
  prescriptions.push("Experiment: set one clear boundary in a low-risk situation and observe the result.");

  if (tags.includes("precision") || tags.includes("craft")) {
    prescriptions.push("Experiment: give one task uninterrupted attention and compare quality with your usual pace.");
  }
  if (tags.includes("emotion_depth") || tags.includes("healing")) {
    prescriptions.push("Experiment: take a short reflection pause before producing or responding, then compare the outcome.");
  }

  return {
    strengths,
    shadows,
    triggers,
    prescriptions: prescriptions.slice(0, 5)
  };
}

export function pickCodename(themes: ThemeScore[]): string {
  if (themes.length === 0) return "Synthesis Pending";
  const top1 = themes[0]?.tag;
  const top2 = themes[1]?.tag;

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

  if (!top1) return "Synthesis Pending";
  return (top2 ? map[top1]?.[top2] : undefined) ?? map[top1]?.default ?? `Symbolic ${top1.replace(/_/g, " ")} theme`;
}
