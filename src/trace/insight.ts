import type { InsightTrace } from "../types/soulcodex";

export type { InsightTrace };

export type TraceSignal = {
  source: string;
  reason: string;
};

export function buildTrace(signals: TraceSignal[]): InsightTrace[] {
  return signals.map((s) => ({
    system: s.source,
    explanation: s.reason,
  }));
}
