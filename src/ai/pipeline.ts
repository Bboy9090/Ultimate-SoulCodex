import { clarityCheck, stripVaguePhrases } from "./validators/clarityValidator";
import { structureCheck } from "./validators/structure";
import { rewritePrompt } from "./validators/rewrite";
import { runBlandnessFilter, stripBannedPhrases } from "../../soulcodex/validators/blandnessFilter";
import { buildRewriteLayerPrompt } from "./soulCodexEngine";
import { precisionRewrite } from "./validators/precisionRewrite";
import { enforceActionLock } from "./validators/actionLock";

export interface ValidationReport {
  originalText: string;
  finalText: string;
  clarityOk: boolean;
  clarityScore: number;
  clarityProblems: string[];
  structurePass: boolean;
  blandnessPass: boolean;
  bannedFound: string[];
  rewroteText: boolean;
  precisionRewrites: number;
  actionLocked: boolean;
}

/**
 * Validates AI-generated text through the full filter pipeline.
 * Pipeline order: blandness strip → clarity strip → structure check → LLM rewrite (if needed) → final clarity pass.
 * If rewriteFn is provided, it will be called to rewrite vague text via LLM.
 */
export async function validateAndClean(
  text: string,
  rewriteFn?: (prompt: string) => Promise<string>,
): Promise<ValidationReport> {
  let current = text;

  // Layer 1: Precision Rewrite — deterministic vague-to-specific (no LLM)
  const precision = precisionRewrite(current);
  current = precision.text;

  // Layer 2: Blandness filter — strip banned mystical phrases
  const blandness = runBlandnessFilter(current);
  if (blandness.bannedFound.length > 0) {
    current = stripBannedPhrases(current);
  }

  // Layer 3: Clarity check — strip remaining vague phrases
  let clarity = clarityCheck(current);
  if (!clarity.ok) {
    current = stripVaguePhrases(current);
    clarity = clarityCheck(current);
  }

  // Layer 4: Structure check
  const structure = structureCheck(current);

  let rewroteText = false;

  // Layer 5: LLM rewrite (if available and needed)
  if (rewriteFn && (!clarity.ok || !structure.pass)) {
    try {
      const prompt = rewritePrompt(current);
      const rewritten = await rewriteFn(prompt);
      if (rewritten && rewritten.length > current.length * 0.5) {
        const rewrittenClarity = clarityCheck(rewritten);
        if (rewrittenClarity.score >= clarity.score) {
          current = stripBannedPhrases(rewritten);
          current = stripVaguePhrases(current);
          clarity = clarityCheck(current);
          rewroteText = true;
        }
      }
    } catch (e) {
      console.error("[AI Pipeline] Rewrite failed:", e);
    }
  }

  // Layer 6: Engine rewrite for sub-85 scores
  if (rewriteFn && clarity.ok && clarity.score < 85) {
    try {
      const enginePrompt = buildRewriteLayerPrompt(current);
      const polished = await rewriteFn(enginePrompt);
      if (polished && polished.length > current.length * 0.5) {
        const polishedClarity = clarityCheck(polished);
        if (polishedClarity.score >= clarity.score) {
          current = stripBannedPhrases(polished);
          current = stripVaguePhrases(current);
          clarity = polishedClarity;
          rewroteText = true;
        }
      }
    } catch (e) {
      console.error("[AI Pipeline] Engine rewrite layer failed:", e);
    }
  }

  // Layer 7: Action Lock — ensure every output ends with a concrete action
  const actionLocked = current !== enforceActionLock(current);
  current = enforceActionLock(current);

  return {
    originalText: text,
    finalText: current,
    clarityOk: clarity.ok,
    clarityScore: clarity.score,
    clarityProblems: clarity.problems,
    structurePass: structure.pass,
    blandnessPass: blandness.pass,
    bannedFound: blandness.bannedFound,
    rewroteText,
    precisionRewrites: precision.rewrites,
    actionLocked,
  };
}
