import type { Codex30Input, Signal } from "./types.js";
import { astrologySignals }   from "./systems/astrology.js";
import { aspectSignals }      from "./systems/aspects.js";
import { numerologySignals }  from "./systems/numerology.js";
import { humanDesignSignals } from "./systems/humanDesign.js";
import { moralCompassSignals } from "./systems/moralCompass.js";

function hasVerifiedAstrologyEvidence(chart: any): boolean {
  if (!chart || chart.verification?.complete !== true) return false;

  const sun = chart.planets?.sun ?? chart.sun;
  const moon = chart.planets?.moon ?? chart.moon;
  const placementVerified = (placement: any) =>
    placement?.verificationStatus === "verified" &&
    typeof placement?.sign === "string" &&
    placement.sign.trim().length > 0;

  return placementVerified(sun) && placementVerified(moon);
}

export function collectSignals(input: Codex30Input): Signal[] {
  const chart = input.fullChart ?? input.profile;
  const verifiedAstrology = hasVerifiedAstrologyEvidence(chart);

  const all: Signal[] = [
    ...astrologySignals(chart, verifiedAstrology),
    ...aspectSignals(input.fullChart ?? {}, verifiedAstrology),
    ...numerologySignals(input.profile?.signals ?? input.profile ?? {}),
    ...humanDesignSignals(
      input.profile?.signals?.humanDesign ??
      input.profile?.humanDesign ??
      {}
    )
  ];

  const map = new Map<string, Signal>();
  for (const x of all) map.set(x.id, x);
  return Array.from(map.values());
}


/**
 * Explicit user-assessed reflection context. These signals are intentionally
 * separated from collectSignals() so they cannot alter the stable Codex30
 * identity score or codename.
 */
export function collectSupportingSignals(input: Codex30Input): Signal[] {
  return moralCompassSignals(input.userInputs);
}
