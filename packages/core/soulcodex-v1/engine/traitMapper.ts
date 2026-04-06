import type { EngineConfidence, MirrorAnswers, SourceSystem, TraitMappingMatrix, TraitSignal } from "./types";
import { analyzeMirror, mirrorAnswersSchema, mirrorToTraitSignals } from "./mirror";

type SoulCodexEngineInput = {
  astrology?: Record<string, unknown> | null;
  human_design?: Record<string, unknown> | null;
  numerology?: Record<string, unknown> | null;
  mirror?: unknown;
};

function asNumber(x: unknown): number | null {
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string" && x.trim()) {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function pick(obj: Record<string, unknown> | null | undefined, key: string): unknown {
  if (!obj) return undefined;
  return obj[key];
}

function uniqueSources(sources: SourceSystem[]): SourceSystem[] {
  const out: SourceSystem[] = [];
  for (const s of sources) if (!out.includes(s)) out.push(s);
  return out;
}

function mergeConfidence(a: EngineConfidence, b: EngineConfidence): EngineConfidence {
  const rank: Record<EngineConfidence, number> = { low: 0, medium: 1, high: 2 };
  return rank[a] >= rank[b] ? a : b;
}

function upgradeConfidenceForConvergence(conf: EngineConfidence, sourceCount: number): EngineConfidence {
  if (sourceCount >= 2 && conf === "medium") return "high";
  if (sourceCount >= 2 && conf === "low") return "medium";
  return conf;
}

export function mapTraitSignals(input: SoulCodexEngineInput, matrix: TraitMappingMatrix): TraitSignal[] {
  const astro = (input.astrology ?? null) as Record<string, unknown> | null;
  const hd = (input.human_design ?? null) as Record<string, unknown> | null;
  const num = (input.numerology ?? null) as Record<string, unknown> | null;

  const signals: TraitSignal[] = [];

  // Mirror signals are explicit user behavioral inputs. They should always be applied when present.
  try {
    const parsed: MirrorAnswers | null =
      input.mirror && typeof input.mirror === "object" ? mirrorAnswersSchema.parse(input.mirror) : null;
    if (parsed) {
      const profile = analyzeMirror(parsed);
      signals.push(...mirrorToTraitSignals(profile));
    }
  } catch {
    // ignore invalid mirror shape — engine remains deterministic and resilient
  }

  for (const entry of matrix.entries) {
    const srcObj = entry.source === "astrology" ? astro : entry.source === "human_design" ? hd : num;
    const rawVal = pick(srcObj, entry.signal_key);
    const n = asNumber(rawVal);
    if (n == null) continue;

    // If the input signal is present, emit a scaled trait value (matrix entry provides direction + intensity).
    // Keep deterministic: clamp to [-10, 10].
    const scaled = Math.max(-10, Math.min(10, Math.round((n >= 1 ? 1 : -1) * entry.value)));
    signals.push({
      trait_key: entry.trait_key,
      value: scaled,
      confidence: entry.confidence,
      sources: [entry.source],
    });
  }

  return consolidateSignals(signals);
}

export function consolidateSignals(signals: TraitSignal[]): TraitSignal[] {
  const byKey = new Map<string, TraitSignal>();

  for (const s of signals) {
    const prev = byKey.get(s.trait_key);
    if (!prev) {
      byKey.set(s.trait_key, { ...s, sources: uniqueSources(s.sources) });
      continue;
    }

    const mergedSources = uniqueSources([...prev.sources, ...s.sources]);
    const mergedValue = Math.max(-10, Math.min(10, prev.value + s.value));
    const mergedConfidence = upgradeConfidenceForConvergence(mergeConfidence(prev.confidence, s.confidence), mergedSources.length);

    byKey.set(s.trait_key, {
      trait_key: s.trait_key,
      value: mergedValue,
      confidence: mergedConfidence,
      sources: mergedSources,
      notes: prev.notes ?? s.notes,
    });
  }

  return [...byKey.values()].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

export function extractActiveSources(signals: TraitSignal[]): SourceSystem[] {
  const out: SourceSystem[] = [];
  for (const s of signals) for (const src of s.sources) if (!out.includes(src)) out.push(src);
  return out;
}

