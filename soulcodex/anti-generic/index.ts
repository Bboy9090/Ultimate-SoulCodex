/**
 * Anti-Generic Engine — Public API
 *
 * Called from soulcodex/codex30/synth/compile.ts (bullet list enrichment)
 * and soulcodex/codex30/prompts/narrator.ts (contradiction injection).
 *
 * Does NOT modify CodexSynthesis shape — output contract is unchanged.
 */

import { getCandidates, type StatementSection } from "./statements/index";
import { selectBest } from "./distinctiveness";
import { pickContradiction, formatContradictionHint } from "./contradictions";
import { containsBannedPhrase, HARD_REJECT_PHRASES } from "./banned-language";

export type { Statement, StatementSection } from "./statements/index";
export type { ScoreBreakdown } from "./distinctiveness";
export type { ContradictionPair } from "./contradictions";

export interface AntiGenericContext {
  themeTags: string[];
  stressElement?: string;
  decisionStyle?: string;
  socialEnergy?: string;
}

/**
 * Return the top-scored behavioral statements for a given section.
 * Used to enrich trigger / prescription / strength copy in compile.ts.
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
 * Returns { pass, bannedFound } for logging / rewrite-trigger decisions.
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
 * Quick smoke-test helper: given two users with the same Sun sign but
 * different behavioral inputs, assert their statement selections differ.
 * Returns true if outputs differ (distinctiveness confirmed).
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
