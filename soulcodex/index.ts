import type { UserInputs, SoulSignals, SoulProfile, CompatibilityScore } from "./types";
import { calcLifePath } from "./compute/numerology";
import { chooseArchetype } from "./compute/archetype";
import { synthesize } from "./compute/synthesis";
import { compatibility } from "./compute/compatibility";
import { analyzeMirror } from "../src/mirror/analyze";

export type { UserInputs, SoulSignals, SoulProfile, CompatibilityScore };

export function buildSoulProfile(inputs: UserInputs, overrides?: Partial<SoulSignals>): {
  profile: SoulProfile;
  signals: SoulSignals;
} {
  const lifePath = overrides?.lifePath ?? calcLifePath(inputs.birthData.birthDate);
  const mirrorProfile = analyzeMirror(inputs.mirror);

  const signals: SoulSignals = {
    sunSign: overrides?.sunSign,
    moonSign: overrides?.moonSign,
    risingSign: overrides?.risingSign,
    lifePath,
    mirrorProfile,
    nonNegotiables: inputs.nonNegotiables,
    goals: inputs.goals,
  };

  const archetype = chooseArchetype(signals);
  const synthesis = synthesize(signals);

  return {
    profile: { archetype, synthesis, signals },
    signals,
  };
}

export function compareProfiles(a: SoulSignals, b: SoulSignals): CompatibilityScore {
  return compatibility(a, b);
}
