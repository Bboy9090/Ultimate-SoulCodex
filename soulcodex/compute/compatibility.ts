import type { SoulSignals, CompatibilityScore, CompatibilityDimension } from "../types";

function scoreMatch(a: string | undefined, b: string | undefined): number {
  if (!a || !b) return 50;
  return a.toLowerCase() === b.toLowerCase() ? 90 : 55;
}

function signalOverlap(a: string[] | undefined, b: string[] | undefined): number {
  if (!a?.length || !b?.length) return 0;
  const left = new Set(a.map((value) => value.toLowerCase()));
  return b.filter((value) => left.has(value.toLowerCase())).length;
}

function scoreSignalSets(a: string[] | undefined, b: string[] | undefined): number {
  if (!a?.length || !b?.length) return 50;
  return signalOverlap(a, b) > 0 ? 85 : 50;
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
      !a.sunSign || !b.sunSign
        ? "Verified Sun-sign evidence is incomplete, so this identity comparison stays neutral."
        : a.sunSign === b.sunSign
          ? "You share the same Sun sign, so the same symbolic identity lens is active for both profiles."
          : "Your verified Sun signs differ, so this symbolic identity lens describes different emphases.",
  };

  const stress: CompatibilityDimension = {
    label: "Stress",
    score: scoreSignalSets(a.stressElement, b.stressElement),
    note:
      !a.stressElement?.length || !b.stressElement?.length
        ? "There is not enough shared stress-response evidence yet to compare this dimension."
        : signalOverlap(a.stressElement, b.stressElement) > 0
          ? "You share at least one stress-response signal, which can make each other's pressure patterns easier to recognize."
          : `Your recorded stress-response signals differ (${a.stressElement.join(", ")} vs ${b.stressElement.join(", ")}); learn each other's shutdown and escalation cues.`,
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
    score: scoreSignalSets(a.decisionStyle, b.decisionStyle),
    note:
      !a.decisionStyle?.length || !b.decisionStyle?.length
        ? "There is not enough direct decision-style evidence yet to compare this dimension."
        : signalOverlap(a.decisionStyle, b.decisionStyle) > 0
          ? "You share at least one decision-style signal, so part of your decision process should feel familiar to each other."
          : `Your recorded decision styles differ (${a.decisionStyle.join(", ")} vs ${b.decisionStyle.join(", ")}); agree on a process before high-stakes calls.`,
  };

  const overall = Math.round(
    (identity.score + stress.score + values.score + decisions.score) / 4
  );

  const friction: string[] = [];
  if (identity.score < 60) friction.push("Core drives differ — you'll need to translate for each other.");
  if (a.stressElement?.length && b.stressElement?.length && stress.score < 60) {
    friction.push("You handle pressure differently — don't take the other's shutdown personally.");
  }
  if (values.score < 60) friction.push("Your boundaries don't match — negotiate them before a crisis.");
  if (a.decisionStyle?.length && b.decisionStyle?.length && decisions.score < 60) {
    friction.push("Decision pace mismatch — agree on a process before big calls.");
  }

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
