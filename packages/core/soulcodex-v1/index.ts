/**
 * packages/core/soulcodex-v1/index.ts
 *
 * Public surface of the canonical Soul Codex v1 core package.
 */

// ── Public output contract ────────────────────────────────────────────────────
export type { SoulCodexOutputV1, AntiGenericContext } from "./types";

// ── Anti-generic engine ───────────────────────────────────────────────────────
export {
  getBehavioralStatements,
  getContradictionHint,
  checkNarrative,
  runAntiGenericPass,
  assertDistinctOutputs,
} from "./engine/generate";

// ── Scoring primitives ────────────────────────────────────────────────────────
export { scoreStatement, selectBest, REJECT_THRESHOLD } from "./engine/distinctiveness";
export type { ScoreBreakdown } from "./engine/distinctiveness";

// ── Content ───────────────────────────────────────────────────────────────────
export {
  ALL_BANNED_PHRASES as BANNED_PHRASES,
  HARD_REJECT_PHRASES,
  containsBannedPhrase,
  totalPenaltyScore,
} from "./content/banned-language";
export type { BannedEntry } from "./content/banned-language";

export { CONTRADICTION_PAIRS, pickContradiction, scoreContradiction, formatContradictionHint } from "./content/contradictions";
export type { ContradictionPair } from "./content/contradictions";

export { STATEMENTS, getCandidates } from "./content/statements/index";
export type { Statement, StatementSection } from "./content/statements/index";
