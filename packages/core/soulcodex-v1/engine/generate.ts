/**
 * packages/core/soulcodex-v1/engine/generate.ts
 *
 * Canonical anti-generic engine — public API.
 * This is the long-term truth source.  All consumers should import from here
 * (or from the package index).  soulcodex/anti-generic/ is deprecated.
 *
 * Does NOT modify SoulCodexOutputV1 shape.
 */

import { getCandidates, type StatementSection } from "../content/statements/index.js";
import { selectBest } from "./distinctiveness.js";
import { pickContradiction, formatContradictionHint } from "../content/contradictions.js";
import { containsBannedPhrase, HARD_REJECT_PHRASES } from "../content/banned-language.js";
import type { AntiGenericContext } from "../types.js";
export { runSoulCodexEngine } from "./index.js";

export type { StatementSection } from "../content/statements/index.js";
export type { AntiGenericScoreBreakdown as ScoreBreakdown } from "./distinctiveness.js";
export type { ContradictionPair } from "../content/contradictions.js";
export type { AntiGenericContext } from "../types.js";

/**
 * Return top-scored behavioral statements for a given section.
 * Used to enrich trigger / prescription / strength copy before the narrator prompt.
 */
export function getBehavioralStatements(
  section: StatementSection,
  ctx: AntiGenericContext,
  maxCount = 3,
): string[] {
  const candidates = getCandidates(
    section,
    ctx.themeTags,
    ctx.stressElement,
    ctx.decisionStyle,
    ctx.socialEnergy,
  );
  const selected = selectBest(
    candidates,
    ctx.themeTags,
    ctx.stressElement,
    ctx.decisionStyle,
    ctx.socialEnergy,
    maxCount,
  );
  return selected.map(s => s.text);
}

/**
 * Return a formatted contradiction hint string for injection into the narrator prompt.
 */
export function getContradictionHint(ctx: AntiGenericContext): string {
  const pair = pickContradiction(
    ctx.themeTags,
    ctx.stressElement,
    ctx.decisionStyle,
    ctx.socialEnergy,
  );
  return formatContradictionHint(pair);
}

/**
 * Run the banned-language filter on a completed narrative.
 */
export function checkNarrative(text: string): {
  pass: boolean;
  bannedFound: string[];
  hardRejects: string[];
} {
  const { matches } = containsBannedPhrase(text);
  const bannedFound = matches.map(m => m.phrase);
  const hardRejects = bannedFound.filter(p => HARD_REJECT_PHRASES.includes(p));
  return {
    pass: hardRejects.length === 0,
    bannedFound,
    hardRejects,
  };
}

/**
 * Convenience: run the full anti-generic pass in one call.
 * Returns everything the narrator prompt needs from this engine.
 */
export function runAntiGenericPass(ctx: AntiGenericContext): {
  contradictionHint: string;
  behavioralStatements: string[];
} {
  return {
    contradictionHint:    getContradictionHint(ctx),
    behavioralStatements: getBehavioralStatements("pressure_pattern", ctx, 3),
  };
}

/**
 * Smoke-test helper: assert two contexts with same Sun sign but different
 * behavioral inputs produce different statement selections.
 */
export function assertDistinctOutputs(
  ctxA: AntiGenericContext,
  ctxB: AntiGenericContext,
  section: StatementSection = "pressure_pattern",
): boolean {
  const a = getBehavioralStatements(section, ctxA, 2);
  const b = getBehavioralStatements(section, ctxB, 2);
  return JSON.stringify(a) !== JSON.stringify(b);
}
