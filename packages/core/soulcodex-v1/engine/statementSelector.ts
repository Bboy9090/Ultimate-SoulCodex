import type { EngineToneMode, EngineConfidence, SourceSystem, Statement, TraitSignal } from "./types.js";

export type SelectStatementsInput = {
  toneMode: EngineToneMode;
  activeSources: SourceSystem[];
  traitSignals: TraitSignal[];
  statements: Statement[];
  bannedPhrases: string[];
  max: number;
  minConfidence?: EngineConfidence; // default: "medium"
};

function confidenceRank(c: EngineConfidence): number {
  return c === "high" ? 3 : c === "medium" ? 2 : 1;
}

function uniq<T>(items: T[]): T[] {
  const out: T[] = [];
  for (const i of items) if (!out.includes(i)) out.push(i);
  return out;
}

function normalizeText(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function containsBanned(text: string, bannedPhrases: string[]): boolean {
  const t = text.toLowerCase();
  return bannedPhrases.some((p) => {
    const needle = String(p || "").trim().toLowerCase();
    return needle ? t.includes(needle) : false;
  });
}

function overlapScore(statement: Statement, activeSources: SourceSystem[]): number {
  if (!statement.source_support?.length) return 0;
  let score = 0;
  for (const s of statement.source_support) {
    if (activeSources.includes(s)) score += 1;
  }
  return score;
}

function traitTagScore(statement: Statement, traitSignals: TraitSignal[]): number {
  if (!statement.tags?.length) return 0;
  const traitKeys = new Set(traitSignals.map((t) => t.trait_key));
  let score = 0;
  for (const tag of statement.tags) {
    if (traitKeys.has(tag)) score += 1;
  }
  return score;
}

function tonePreferenceScore(statementTone: EngineToneMode, requested: EngineToneMode): number {
  if (statementTone === requested) return 2;
  if (requested !== "clean" && statementTone === "clean") return 1;
  return 0;
}

export function selectStatements(input: SelectStatementsInput): Statement[] {
  const min = input.minConfidence ?? "medium";
  const minRank = confidenceRank(min);

  const candidates = input.statements
    .map((s) => ({
      ...s,
      text: normalizeText(s.text),
    }))
    .filter((s) => confidenceRank(s.confidence) >= minRank)
    .filter((s) => !containsBanned(s.text, input.bannedPhrases));

  const scored = candidates
    .map((s) => {
      const score =
        confidenceRank(s.confidence) * 10 +
        overlapScore(s, input.activeSources) * 4 +
        traitTagScore(s, input.traitSignals) * 2 +
        tonePreferenceScore(s.tone, input.toneMode) * 3;
      return { s, score };
    })
    .sort((a, b) => b.score - a.score);

  const out: Statement[] = [];
  const usedIds = new Set<string>();
  const usedTags = new Set<string>();

  for (const { s } of scored) {
    if (out.length >= input.max) break;
    if (usedIds.has(s.id)) continue;

    const tags = uniq((s.tags ?? []).filter(Boolean));
    const hasCollision = tags.some((t) => usedTags.has(t));
    if (hasCollision) continue;

    out.push(s);
    usedIds.add(s.id);
    for (const t of tags) usedTags.add(t);
  }

  return out;
}

