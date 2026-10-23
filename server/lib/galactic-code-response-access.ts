/**
 * Galactic Code response projection. Never send raw fingerprint material
 * or deep interpretive layers to an unentitled client.
 */
import type { GalacticCodeResult } from "../../shared/galactic-code/types";

export type GalacticCodePublicBrief = Pick<
  GalacticCodeResult,
  "version" | "coverage" | "codename" | "designation" | "tagline" | "primaryFunction" | "sourceCoverage"
>;

export function projectGalacticCodeForTier(
  result: GalacticCodeResult,
  tier: "free" | "plus",
): GalacticCodePublicBrief | GalacticCodeResult {
  if (tier === "plus") return result;
  return {
    version: result.version,
    coverage: result.coverage,
    codename: result.codename,
    designation: result.designation,
    tagline: result.tagline,
    primaryFunction: result.primaryFunction,
    sourceCoverage: result.sourceCoverage,
  };
}
