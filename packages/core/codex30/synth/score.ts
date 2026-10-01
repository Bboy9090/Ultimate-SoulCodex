import type { Signal, ThemeScore, SystemId } from "../types.js";

const USER_STATED_SYSTEMS = new Set<SystemId>(["moralCompass"]);

const SYMBOLIC_SYSTEM_WEIGHT: Record<SystemId, number> = {
  astrology: 0.55,
  aspects: 0.50,
  numerology: 0.55,
  humanDesign: 0.55,
  elements: 0.65,
  moralCompass: 1,
};

function signalContribution(signal: Signal): number {
  const confW = signal.confidence === "high" ? 1 : signal.confidence === "medium" ? 0.7 : 0.45;
  const polW = signal.polarity === "strength" ? 1 : signal.polarity === "shadow" ? 0.8 : 0.9;
  const boundedIntensity = Math.max(0, Math.min(1, Number(signal.intensity) || 0));
  return 100 * boundedIntensity * confW * polW;
}

export function scoreThemes(signals: Signal[]): ThemeScore[] {
  const perTag = new Map<
    string,
    Map<SystemId, { score: number; sources: Set<string> }>
  >();

  for (const signal of signals) {
    const base = signalContribution(signal);
    if (base <= 0) continue;

    for (const tag of signal.tags) {
      const systems = perTag.get(tag) ?? new Map<SystemId, { score: number; sources: Set<string> }>();
      const weighted = base * SYMBOLIC_SYSTEM_WEIGHT[signal.system];
      const current = systems.get(signal.system);

      // One system gets one vote per theme. Repeated aspects/placements can add
      // provenance, but they cannot inflate the score simply by emitting more rows.
      if (!current || weighted > current.score) {
        systems.set(signal.system, {
          score: weighted,
          sources: new Set([signal.id]),
        });
      } else {
        current.sources.add(signal.id);
      }

      perTag.set(tag, systems);
    }
  }

  const scored = Array.from(perTag.entries()).map(([tag, systems]) => {
    const direct = Array.from(systems.entries())
      .filter(([system]) => USER_STATED_SYSTEMS.has(system))
      .map(([, value]) => value.score);

    const symbolic = Array.from(systems.entries())
      .filter(([system]) => !USER_STATED_SYSTEMS.has(system))
      .map(([, value]) => value.score)
      .sort((a, b) => b - a);

    // Cross-system symbolic agreement can reinforce a theme, but with sharply
    // diminishing returns. Symbolic-only themes are capped below a strong direct
    // behavioral signal so calculated symbolism cannot outrank lived self-report
    // merely through source volume.
    const symbolicAggregate = symbolic.reduce(
      (sum, value, index) => sum + value * (index === 0 ? 1 : index === 1 ? 0.5 : 0.25),
      0,
    );
    const directAggregate = direct.reduce((sum, value) => sum + value, 0);
    const score = directAggregate > 0
      ? directAggregate + Math.min(symbolicAggregate, 25)
      : Math.min(symbolicAggregate, 75);

    return {
      tag,
      score: Math.round(score),
      sources: Array.from(systems.values()).flatMap((value) => Array.from(value.sources)),
    };
  });

  scored.sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag));
  return scored.slice(0, 12);
}
