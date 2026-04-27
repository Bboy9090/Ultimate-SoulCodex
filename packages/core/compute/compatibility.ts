import type { SoulSignals, CompatibilityScore, CompatibilityDimension } from "../types.js";

function scoreMatch(a: string | undefined, b: string | undefined): number {
  if (!a || !b) return 50;
  return a.toLowerCase() === b.toLowerCase() ? 90 : 55;
}

function scoreSame(a: string, b: string): number {
  return a === b ? 85 : 50;
}

function overlapCount(a: string[], b: string[]): number {
  const set = new Set(a.map((s) => s.toLowerCase()));
  return b.filter((s) => set.has(s.toLowerCase())).length;
}

export function compatibility(a: SoulSignals, b: SoulSignals): CompatibilityScore {
  const identity: CompatibilityDimension = {
    label: "Identity",
    score: Math.round((scoreMatch(a.sunSign, b.sunSign) + scoreMatch(a.moonSign, b.moonSign)) / 2),
    note:
      a.sunSign === b.sunSign
        ? "You share the same sun sign — you'll understand each other's drive."
        : "Different sun signs means different core drives; respect that gap.",
  };

  const stress: CompatibilityDimension = {
    label: "Stress",
    score: scoreSame(a.stressElement, b.stressElement),
    note:
      a.stressElement === b.stressElement
        ? "You stress the same way — you'll get each other, but you can also spiral together."
        : `One of you goes ${a.stressElement}, the other goes ${b.stressElement} — learn each other's shutdown signals.`,
  };

  const valuesOverlap = overlapCount(a.nonNegotiables, b.nonNegotiables);
  const valuesScore = Math.min(100, 40 + valuesOverlap * 20);
  const values: CompatibilityDimension = {
    label: "Values",
    score: valuesScore,
    note:
      valuesOverlap >= 2
        ? "Your deal-breakers line up — that's a strong foundation."
        : "Your non-negotiables differ; talk about them early.",
  };

  const decisions: CompatibilityDimension = {
    label: "Decisions",
    score: scoreSame(a.decisionStyle, b.decisionStyle),
    note:
      a.decisionStyle === b.decisionStyle
        ? "You make decisions the same way — fewer surprises."
        : `One decides by ${a.decisionStyle}, the other by ${b.decisionStyle} — expect friction when stakes are high.`,
  };

  const overall = Math.round(
    (identity.score + stress.score + values.score + decisions.score) / 4
  );

  const friction: string[] = [];
  if (identity.score < 60) friction.push("Core drives differ — you'll need to translate for each other.");
  if (stress.score < 60) friction.push("You handle pressure differently — don't take the other's shutdown personally.");
  if (values.score < 60) friction.push("Your boundaries don't match — negotiate them before a crisis.");
  if (decisions.score < 60) friction.push("Decision pace mismatch — agree on a process before big calls.");

  const synergy: string[] = [];
  if (identity.score >= 75) synergy.push("Your identities complement each other well.");
  if (stress.score >= 75) synergy.push("You can support each other through tough times naturally.");
  if (values.score >= 75) synergy.push("Shared values make trust easy to build.");
  if (decisions.score >= 75) synergy.push("You make decisions at a similar speed and style.");

  return {
    overall,
    dimensions: { identity, stress, values, decisions },
    friction,
    synergy,
  };
}
