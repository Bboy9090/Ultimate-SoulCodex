/**
 * packages/core/soulcodex-v1/index.ts
 *
 * Public surface of the canonical Soul Codex v1 core package.
 */

// ── Public output contract ────────────────────────────────────────────────────
export type { SoulCodexOutputV1, AntiGenericContext } from "./types.js";

// ── Anti-generic engine ───────────────────────────────────────────────────────
export {
  getBehavioralStatements,
  getContradictionHint,
  checkNarrative,
  runAntiGenericPass,
  assertDistinctOutputs,
  runSoulCodexEngine,
} from "./engine/generate.js";

// ── Scoring primitives ────────────────────────────────────────────────────────
export { scoreStatement, selectBest, REJECT_THRESHOLD } from "./engine/distinctiveness.js";
export type { AntiGenericScoreBreakdown as ScoreBreakdown } from "./engine/distinctiveness.js";

// ── Content ───────────────────────────────────────────────────────────────────
export {
  ALL_BANNED_PHRASES as BANNED_PHRASES,
  HARD_REJECT_PHRASES,
  containsBannedPhrase,
  totalPenaltyScore,
} from "./content/banned-language.js";
export type { BannedEntry } from "./content/banned-language.js";

export { CONTRADICTION_PAIRS, pickContradiction, scoreContradiction, formatContradictionHint } from "./content/contradictions.js";
export type { ContradictionPair } from "./content/contradictions.js";

export { STATEMENTS, getCandidates } from "./content/statements/index.js";
export type { Statement, StatementSection } from "./content/statements/index.js";
