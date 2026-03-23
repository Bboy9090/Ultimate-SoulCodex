export const bannedPhrases = [
  "i see the same pattern",
  "this shows up across contexts",
  "something about",
  "points toward",
  "opens a door",
  "opportunity if you choose",
  "this energy",
  "in many ways",
  "in different contexts",
  "something deeper",
  "a reminder to",
  "adapt and grow",
  "opens a small door",
  "trust the process",
  "lean into",
  "moving through",
  "this is a time of",
  "invites you to",
  "calls you to",
  "resonates with",
  "speaks to",
  "a period of",
  "a season of",
  "the energy of",
  "a powerful time",
  "a beautiful reminder",
  "a gentle reminder",
  "holds space for",
  "brings an opportunity",
  "points to",
  "pointing at",
  "pointing back",
  "life is asking",
  "this phase is asking",
  "phase is asking",
  "something new",
  "something inside",
  "a sense of",
  "revolves around",
  "phase energy",
  "the energy moves",
];

export interface ClarityResult {
  ok: boolean;
  problems: string[];
  score: number;
}

export function clarityCheck(text: string): ClarityResult {
  const lower = text.toLowerCase();
  const problems: string[] = [];

  for (const phrase of bannedPhrases) {
    if (lower.includes(phrase)) {
      problems.push(phrase);
    }
  }

  const totalWords = text.split(/\s+/).length;
  const vagueRatio = problems.length / Math.max(totalWords / 50, 1);
  const score = Math.max(0, 100 - vagueRatio * 25);

  return {
    ok: problems.length === 0,
    problems,
    score: Math.round(score),
  };
}

export function stripVaguePhrases(text: string): string {
  let cleaned = text;
  for (const phrase of bannedPhrases) {
    const regex = new RegExp(phrase, "gi");
    cleaned = cleaned.replace(regex, "");
  }
  return cleaned.replace(/\s{2,}/g, " ").replace(/\.\s*\./g, ".").trim();
}
