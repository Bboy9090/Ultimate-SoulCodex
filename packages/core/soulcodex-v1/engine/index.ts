import type { EngineToneMode, SoulCodexEngineOutput } from "./types";
import { loadEngineLibraries } from "./loaders";
import { applyContradictionRules } from "./contradictions";
import { buildDailyGuidance } from "./dailyGuidance";
import { selectStatements } from "./statementSelector";
import { extractActiveSources, mapTraitSignals } from "./traitMapper";
import { ENGINE_SECTION_KEYS, type EngineSectionKey } from "./sectionMap";

export function runSoulCodexEngine(input: {
  toneMode: EngineToneMode;
  astrology?: Record<string, unknown> | null;
  human_design?: Record<string, unknown> | null;
  numerology?: Record<string, unknown> | null;
}): SoulCodexEngineOutput {
  const libs = loadEngineLibraries();

  const traitSignalsRaw = mapTraitSignals(
    {
      astrology: input.astrology,
      human_design: input.human_design,
      numerology: input.numerology,
    },
    libs.matrix,
  );

  const trait_signals = applyContradictionRules(traitSignalsRaw, libs.contradictionRules);
  const active_sources = extractActiveSources(trait_signals);

  const bannedPhrases = libs.bannedLanguage.phrases ?? [];

  const statements_by_section: Record<string, any> = {};
  for (const key of ENGINE_SECTION_KEYS) {
    const pool = (libs.statements as any)[key] ?? [];
    statements_by_section[key] = selectStatements({
      toneMode: input.toneMode,
      activeSources: active_sources,
      traitSignals: trait_signals,
      statements: pool,
      bannedPhrases,
      max: 4,
      minConfidence: "medium",
    });
  }

  const daily_guidance = buildDailyGuidance({
    toneMode: input.toneMode,
    traits: trait_signals,
    dailyStatements: libs.statements.daily_guidance ?? [],
  });

  return {
    tone_mode: input.toneMode,
    active_sources,
    trait_signals,
    statements_by_section,
    daily_guidance,
  };
}

