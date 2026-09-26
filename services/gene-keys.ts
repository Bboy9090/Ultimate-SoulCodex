// Gene Keys is not production-governed in Soul Codex yet.
// The previous implementation contained only a partial corpus and fabricated
// fallback entries for gates 11-64, so it must not emit identity claims.
export function calculateGeneKeys(
  sunGate: number,
  earthGate: number,
  moonGate: number,
  personalityData?: unknown,
): never {
  void sunGate;
  void earthGate;
  void moonGate;
  void personalityData;
  throw new Error('gene_keys_unavailable:complete_governed_corpus_required');
}
