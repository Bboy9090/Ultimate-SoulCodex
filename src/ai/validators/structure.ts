export interface StructureResult {
  pass: boolean;
  hasBehavior: boolean;
  hasValue: boolean;
  hasConsequence: boolean;
  hasRepetition: boolean;
  repetitionGroups: string[];
}

const BEHAVIOR_PATTERNS = [
  /when i/i,
  /i tend to/i,
  /i default to/i,
  /i notice/i,
  /i push/i,
  /i avoid/i,
  /i struggle/i,
  /my instinct is/i,
  /i shut down/i,
  /i overcommit/i,
  /i retreat/i,
];

const VALUE_PATTERNS = [
  /i value/i,
  /important to me/i,
  /i care about/i,
  /i need/i,
  /i protect/i,
  /matters to me/i,
  /non-negotiable/i,
  /i won't tolerate/i,
];

const CONSEQUENCE_PATTERNS = [
  /which means/i,
  /so i/i,
  /this makes me/i,
  /the result is/i,
  /that leads to/i,
  /because of this/i,
  /in practice/i,
];

function normalizeSentence(value: string): string {
  return value
    .toLowerCase()
    .replace(/\d+(?:\.\d+)?/g, "#")
    .replace(/[^a-z#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function openingStem(value: string, words = 5): string {
  return normalizeSentence(value).split(" ").slice(0, words).join(" ");
}

function repetitionGroups(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 24);

  if (sentences.length < 4) return [];

  const exact = new Map<string, number>();
  const stems = new Map<string, number>();

  for (const sentence of sentences) {
    const normalized = normalizeSentence(sentence);
    if (!normalized) continue;
    exact.set(normalized, (exact.get(normalized) ?? 0) + 1);

    const stem = openingStem(sentence);
    if (stem.split(" ").length >= 4) {
      stems.set(stem, (stems.get(stem) ?? 0) + 1);
    }
  }

  const groups: string[] = [];
  for (const [sentence, count] of exact) {
    if (count >= 2) groups.push(`exact:${sentence}`);
  }
  for (const [stem, count] of stems) {
    if (count >= 3) groups.push(`opening:${stem}`);
  }
  return groups;
}

export function structureCheck(text: string): StructureResult {
  const hasBehavior = BEHAVIOR_PATTERNS.some(p => p.test(text));
  const hasValue = VALUE_PATTERNS.some(p => p.test(text));
  const hasConsequence = CONSEQUENCE_PATTERNS.some(p => p.test(text));
  const repeats = repetitionGroups(text);
  const hasRepetition = repeats.length > 0;

  return {
    pass: hasBehavior && hasValue && !hasRepetition,
    hasBehavior,
    hasValue,
    hasConsequence,
    hasRepetition,
    repetitionGroups: repeats,
  };
}
