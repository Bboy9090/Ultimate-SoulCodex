import { clarityCheck, stripVaguePhrases } from "./validators/clarityValidator";
import { structureCheck } from "./validators/structure";
import { rewritePrompt } from "./validators/rewrite";
import { runBlandnessFilter, stripBannedPhrases } from "@soulcodex/core";

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
}

/**
 * Validates AI-generated text through the full filter pipeline.
 * Returns the cleaned text and a report.
 * If rewriteFn is provided, it will be called to rewrite vague text via LLM.
 */
export async function validateAndClean(
  text: string,
  rewriteFn?: (prompt: string) => Promise<string>,
): Promise<ValidationReport> {
  let current = text;

  const blandness = runBlandnessFilter(current);
  if (blandness.bannedFound.length > 0) {
    current = stripBannedPhrases(current);
  }

  let clarity = clarityCheck(current);
  if (!clarity.ok) {
    current = stripVaguePhrases(current);
    clarity = clarityCheck(current);
  }

  const structure = structureCheck(current);

  let rewroteText = false;

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
  };
}
