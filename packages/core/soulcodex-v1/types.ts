/**
 * packages/core/soulcodex-v1/types.ts
 *
 * Canonical public output contract for the Soul Codex v1 pipeline.
 * This is the ONLY authoritative definition of SoulCodexOutputV1.
 * routes.ts and any consumer MUST import from here, never from soulcodex/codex30/types.ts.
 */

export interface SoulCodexOutputV1 {
  codename: string;
  archetype: string;
  badges: {
    confidenceLabel: string;
    reason: string;
  };
  topThemes: Array<{
    tag: string;
    score: number;
    sources: string[];
  }>;
  strengths: string[];
  shadows: string[];
  triggers: string[];
  prescriptions: string[];
  narrative: string;
  debug?: {
    signals: unknown[];
    themeScores: Array<{
      tag: string;
      score: number;
      sources: string[];
    }>;
  };
}

/** Context passed from the request into the anti-generic engine */
export interface AntiGenericContext {
  themeTags: string[];
  stressElement?: string;
  decisionStyle?: string;
  socialEnergy?: string;
}
