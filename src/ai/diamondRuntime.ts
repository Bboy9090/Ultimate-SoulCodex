import { validateDiamondOutput } from "./diamondClarity";

export const SAFE_DIAMOND_REFUSAL = `**Pattern**
The first response did not meet Soul Codex clarity standards.

**Why**
It lacked enough supported structure to reach a trustworthy conclusion.

**Need**
This protects you from receiving polished certainty without adequate evidence.

**Gift**
The system can stop instead of pretending an incomplete answer is reliable.

**Cost**
You receive less detail now rather than a confident but unsupported reading.

**Action**
Ask one narrower question or complete the missing profile information.

**Evidence**
The runtime clarity validator rejected the generated response. No unresolved placement was promoted into interpretation.`;

export interface DiamondRuntimeResult {
  content: string;
  valid: boolean;
  violations: string[];
}

export function enforceDiamondRuntimeOutput(text: string): DiamondRuntimeResult {
  const validation = validateDiamondOutput(text);
  return {
    content: validation.valid ? text : SAFE_DIAMOND_REFUSAL,
    valid: validation.valid,
    violations: [
      ...validation.missing.map((section) => `Missing ${section}`),
      ...validation.violations,
    ],
  };
}
