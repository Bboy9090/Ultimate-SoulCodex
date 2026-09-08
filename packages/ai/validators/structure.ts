export interface StructureResult {
  pass: boolean;
  hasBehavior: boolean;
  hasValue: boolean;
  hasConsequence: boolean;
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

export function structureCheck(text: string): StructureResult {
  const hasBehavior = BEHAVIOR_PATTERNS.some(p => p.test(text));
  const hasValue = VALUE_PATTERNS.some(p => p.test(text));
  const hasConsequence = CONSEQUENCE_PATTERNS.some(p => p.test(text));

  return {
    pass: hasBehavior && hasValue,
    hasBehavior,
    hasValue,
    hasConsequence,
  };
}
