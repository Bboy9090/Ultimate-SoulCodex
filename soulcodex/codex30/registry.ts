import type { Codex30Input, Signal } from "./types";
import { astrologySignals }   from "./systems/astrology";
import { aspectSignals }      from "./systems/aspects";
import { numerologySignals }  from "./systems/numerology";
import { humanDesignSignals } from "./systems/humanDesign";
import { moralCompassSignals } from "./systems/moralCompass";

export function collectSignals(input: Codex30Input): Signal[] {
  const verified =
    input?.profile?.meta?.confidence?.badge === "verified" ||
    input?.profile?.confidence?.badge === "verified";

  const all: Signal[] = [
    ...astrologySignals(input.fullChart ?? input.profile, verified),
    ...aspectSignals(input.fullChart ?? {}, verified),
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
