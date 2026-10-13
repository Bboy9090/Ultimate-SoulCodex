import type { UltimateCodexSynthesis } from "./ultimateCodexSynthesis";

/** Scope interaction state to chart content, not object references or access tier. */
export function natalChartIdentity(
  astrology: Record<string, any>,
  synthesis: Pick<UltimateCodexSynthesis, "placements" | "houseCusps" | "supportingPoints" | "aspects">,
): string {
  return JSON.stringify([
    astrology?.rising?.internalCandidate?.longitude ?? null,
    synthesis.placements,
    synthesis.houseCusps,
    synthesis.supportingPoints,
    synthesis.aspects,
  ]);
}
