export const DIAMOND_SECTION_ORDER = [
  "Pattern",
  "Why",
  "Need",
  "Gift",
  "Cost",
  "Action",
  "Evidence",
] as const;

export type DiamondSection = (typeof DIAMOND_SECTION_ORDER)[number];

export interface DiamondValidationResult {
  valid: boolean;
  missing: DiamondSection[];
  violations: string[];
}

const UNSUPPORTED_CERTAINTY = [
  /you are this way because of your childhood/i,
  /this happened because your parents/i,
  /you definitely have/i,
  /your unresolved .* means/i,
  /your unknown .* means/i,
];

const SYSTEM_DUMP = /astrology.*numerology.*human design|numerology.*astrology.*human design/i;

export function validateDiamondOutput(text: string): DiamondValidationResult {
  const missing = DIAMOND_SECTION_ORDER.filter(
    (section) => !new RegExp(`\\*\\*${section}\\*\\*`, "i").test(text)
  );
  const violations: string[] = [];

  if (SYSTEM_DUMP.test(text)) {
    violations.push("Stacks symbolic systems instead of synthesizing one clear pattern.");
  }

  for (const pattern of UNSUPPORTED_CERTAINTY) {
    if (pattern.test(text)) {
      violations.push("Claims unsupported biography or interprets unresolved data.");
      break;
    }
  }

  const action = text.match(/\*\*Action\*\*([\s\S]*?)(?=\*\*Evidence\*\*|$)/i)?.[1]?.trim();
  if (!action || action.length < 12) {
    violations.push("Provides no concrete next step.");
  }

  const evidence = text.match(/\*\*Evidence\*\*([\s\S]*)$/i)?.[1]?.trim();
  if (!evidence || evidence.length < 8) {
    violations.push("Hides or omits evidence and uncertainty.");
  }

  if (text.length > 4200) {
    violations.push("Exceeds the Foundation depth budget without progressive disclosure.");
  }

  return { valid: missing.length === 0 && violations.length === 0, missing, violations };
}

export const DIAMOND_CLARITY_CONTRACT = `
DIAMOND CLARITY CONTRACT

The goal is maximum clarity through meaningful depth.
Do not maximize word count. Do not stack labels.
Synthesize the strongest supported pattern into one human explanation.

Every substantive reading must use exactly this sequence:

**Pattern**
Name the observable repeat behavior.

**Why**
Explain the mechanism that keeps it repeating.
Do not invent childhood, trauma, motives, or biography.

**Need**
Describe what the pattern may be protecting or seeking.
Use conditional language when the evidence is interpretive.

**Gift**
Show what this pattern does well when balanced.

**Cost**
Show the practical consequence when the pattern is overused.

**Action**
Give one specific move the user can take now.

**Evidence**
List the verified or deterministic inputs used.
List unresolved inputs that were excluded.
Explain confidence in plain language.

DIAMOND TEST:
The user must leave understanding themselves or another person more clearly.
If a sentence adds information without adding understanding, remove it.
`;
