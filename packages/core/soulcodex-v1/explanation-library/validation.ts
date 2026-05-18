import { EXTENDED_BANNED } from "../content/banned-language.js";
import {
  explanationLibrarySchema,
  type ExplanationEntry,
  type ExplanationLibrary,
} from "./schema.js";

const deterministicPatterns: Array<{ code: string; pattern: RegExp }> = [
  { code: "deterministic_always", pattern: /\byou always\b/i },
  { code: "deterministic_never", pattern: /\byou never\b/i },
  { code: "deterministic_will", pattern: /\byou will\b/i },
  { code: "deterministic_doomed", pattern: /\bdoomed\b/i },
  { code: "deterministic_guaranteed", pattern: /\bguaranteed\b/i },
];

const medicalDiagnosisPatterns: Array<{ code: string; pattern: RegExp }> = [
  { code: "diagnosis_anxiety_disorder", pattern: /\banxiety disorder\b/i },
  { code: "diagnosis_depression", pattern: /\bdepression\b/i },
  { code: "diagnosis_adhd", pattern: /\badhd\b/i },
  { code: "diagnosis_autism", pattern: /\bautism\b/i },
  { code: "diagnosis_personality_disorder", pattern: /\bpersonality disorder\b/i },
  { code: "diagnosis_trauma_disorder", pattern: /\btrauma disorder\b/i },
];

export type ExplanationLanguageViolation = {
  entryId: string;
  field: string;
  code: string;
  snippet: string;
};

function explainableTextByField(entry: ExplanationEntry): Array<{ field: string; value: string }> {
  return [
    { field: "name", value: entry.name },
    { field: "technicalMeaning", value: entry.technicalMeaning },
    { field: "plainEnglishMeaning", value: entry.plainEnglishMeaning },
    { field: "whyItMatters", value: entry.whyItMatters },
    { field: "growthMove", value: entry.growthMove },
    { field: "confidence.note", value: entry.confidence.note },
    ...entry.howItShowsUp.map((value) => ({ field: "howItShowsUp", value })),
    ...entry.gift.map((value) => ({ field: "gift", value })),
    ...entry.shadow.map((value) => ({ field: "shadow", value })),
  ];
}

function findMatches(
  entryId: string,
  field: string,
  text: string,
  violations: ExplanationLanguageViolation[]
) {
  const lower = text.toLowerCase();

  for (const entry of EXTENDED_BANNED) {
    if (lower.includes(entry.phrase.toLowerCase())) {
      violations.push({
        entryId,
        field,
        code: "banned_phrase",
        snippet: entry.phrase,
      });
    }
  }

  for (const rule of deterministicPatterns) {
    const match = text.match(rule.pattern);
    if (match) {
      violations.push({
        entryId,
        field,
        code: rule.code,
        snippet: match[0],
      });
    }
  }

  for (const rule of medicalDiagnosisPatterns) {
    const match = text.match(rule.pattern);
    if (match) {
      violations.push({
        entryId,
        field,
        code: rule.code,
        snippet: match[0],
      });
    }
  }
}

export function collectExplanationLanguageViolations(
  entries: ExplanationLibrary
): ExplanationLanguageViolation[] {
  const violations: ExplanationLanguageViolation[] = [];

  for (const entry of entries) {
    const fields = explainableTextByField(entry);
    for (const section of fields) {
      findMatches(entry.id, section.field, section.value, violations);
    }
  }

  return violations;
}

export function validateExplanationLibrary(raw: unknown): {
  entries: ExplanationLibrary;
  violations: ExplanationLanguageViolation[];
} {
  const entries = explanationLibrarySchema.parse(raw);
  const violations = collectExplanationLanguageViolations(entries);
  return { entries, violations };
}
