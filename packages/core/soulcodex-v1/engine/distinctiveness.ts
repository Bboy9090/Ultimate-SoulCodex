/**
 * Distinctiveness Scoring Model
 *
 * Weights:
 *   behavioral_specificity  0.25
 *   distinguishing_power    0.25
 *   contradiction_depth     0.15
 *   phase_relevance         0.15
 *   action_usefulness       0.10
 *   language_originality    0.10
 */

import type { Statement } from "../content/statements/index";
import { totalPenaltyScore } from "../content/banned-language";

export const REJECT_THRESHOLD = 0.35;

const BEHAVIORAL_VERBS = [
  "go ", "move ", "say ", "act ", "delay ", "freeze ", "accelerate ", "compress ",
  "absorb ", "snap ", "manage ", "cut ", "hold ", "carry ", "track ", "read ",
  "build ", "ship ", "lock ", "name ", "tell ", "write ", "show ", "help ",
  "process ", "deliver ", "avoid ", "hide ", "repeat ", "stop ", "need ",
];

const ACTION_VERBS = [
  "lock ", "tell ", "write ", "ship ", "name ", "identify ", "describe ",
  "define ", "delay ", "do ", "say ", "choose ", "decide ", "pick ",
];

const GENERIC_OPENERS = [
  "you are a ", "you are someone who ", "you tend to ", "you always ",
  "you never ", "you have a gift", "you are known",
];

function hasBehavioralVerb(text: string): boolean {
  const lower = text.toLowerCase();
  return BEHAVIORAL_VERBS.some(v => lower.includes(v));
}

function hasActionVerb(text: string): boolean {
  const lower = text.toLowerCase();
  return ACTION_VERBS.some(v => lower.includes(v));
}

function hasGenericOpener(text: string): boolean {
  const lower = text.toLowerCase();
  return GENERIC_OPENERS.some(o => lower.startsWith(o));
}

export interface AntiGenericScoreBreakdown {
  behavioral_specificity: number;
  distinguishing_power:   number;
  contradiction_depth:    number;
  phase_relevance:        number;
  action_usefulness:      number;
  language_originality:   number;
  final: number;
  rejected: boolean;
  rejectedReason?: string;
}

export function scoreStatement(
  s: Statement,
  themeTags: string[],
  stressElement?: string,
  decisionStyle?: string,
  socialEnergy?: string,
  usedFrames: string[] = [],
): AntiGenericScoreBreakdown {
  const banPenalty = totalPenaltyScore(s.text);
  if (banPenalty >= 1) {
    return { behavioral_specificity: 0, distinguishing_power: 0, contradiction_depth: 0,
             phase_relevance: 0, action_usefulness: 0, language_originality: 0,
             final: 0, rejected: true, rejectedReason: "banned_phrase" };
  }

  if (!hasBehavioralVerb(s.text)) {
    return { behavioral_specificity: 0, distinguishing_power: 0, contradiction_depth: 0,
             phase_relevance: 0, action_usefulness: 0, language_originality: 0,
             final: 0, rejected: true, rejectedReason: "no_behavioral_verb" };
  }

  let behavSpec = s.distinctiveness_base;
  if (s.generic_risk > 0.5) behavSpec *= (1 - (s.generic_risk - 0.5));

  let tagOverlap = s.tags.filter(t => themeTags.includes(t)).length;
  let boostCount = 0;
  if (s.behaviorBoosts) {
    const bkey = (k: string, v?: string) => v && s.behaviorBoosts!.includes(`${k}:${v}`);
    if (bkey("stressElement", stressElement)) boostCount++;
    if (bkey("decisionStyle",  decisionStyle))  boostCount++;
    if (bkey("socialEnergy",   socialEnergy))   boostCount++;
  }
  let penaltyTags = s.penalizeIf ? s.penalizeIf.filter(t => themeTags.includes(t)).length : 0;
  const distPower = Math.min(1, (tagOverlap * 0.2 + boostCount * 0.3) - penaltyTags * 0.15);

  const contradDepth = s.has_contradiction ? 1 : 0.2;

  const top3 = themeTags.slice(0, 3);
  const phaseRel = s.tags.some(t => top3.includes(t)) ? 1 : 0.4;

  const actionUse = (s.section === "action_truth" || hasActionVerb(s.text)) ? 1 : 0.4;

  let langOrig = 1;
  langOrig -= banPenalty * 0.8;
  if (hasGenericOpener(s.text)) langOrig -= 0.3;
  const opener3 = s.text.trim().split(/\s+/).slice(0, 3).join(" ").toLowerCase();
  if (usedFrames.includes(opener3)) langOrig -= 0.4;
  langOrig = Math.max(0, langOrig);

  const final =
    behavSpec    * 0.25 +
    distPower    * 0.25 +
    contradDepth * 0.15 +
    phaseRel     * 0.15 +
    actionUse    * 0.10 +
    langOrig     * 0.10;

  const rejected = final < REJECT_THRESHOLD;

  return {
    behavioral_specificity: behavSpec,
    distinguishing_power:   distPower,
    contradiction_depth:    contradDepth,
    phase_relevance:        phaseRel,
    action_usefulness:      actionUse,
    language_originality:   langOrig,
    final,
    rejected,
    rejectedReason: rejected ? "below_threshold" : undefined,
  };
}

export function selectBest(
  candidates: Statement[],
  themeTags: string[],
  stressElement?: string,
  decisionStyle?: string,
  socialEnergy?: string,
  maxCount = 3,
): Statement[] {
  const usedFrames: string[] = [];
  const scored = candidates
    .map(s => ({
      statement: s,
      score: scoreStatement(s, themeTags, stressElement, decisionStyle, socialEnergy, usedFrames),
    }))
    .filter(x => !x.score.rejected)
    .sort((a, b) => b.score.final - a.score.final);

  const result: Statement[] = [];
  for (const x of scored) {
    if (result.length >= maxCount) break;
    const opener3 = x.statement.text.trim().split(/\s+/).slice(0, 3).join(" ").toLowerCase();
    if (!usedFrames.includes(opener3)) {
      result.push(x.statement);
      usedFrames.push(opener3);
    }
  }
  return result;
}
