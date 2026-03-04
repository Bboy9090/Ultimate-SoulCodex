import type { UserInputs, SoulSignals, SoulProfile, CompatibilityScore } from "./types";
import { calcLifePath } from "./compute/numerology";
import { chooseArchetype } from "./compute/archetype";
import { synthesize } from "./compute/synthesis";
import { compatibility } from "./compute/compatibility";

export type { UserInputs, SoulSignals, SoulProfile, CompatibilityScore };

export function buildSoulProfile(inputs: UserInputs, overrides?: Partial<SoulSignals>): {
  profile: SoulProfile;
  signals: SoulSignals;
} {
  const lifePath = overrides?.lifePath ?? calcLifePath(inputs.birthData.birthDate);

  const signals: SoulSignals = {
    sunSign: overrides?.sunSign,
    moonSign: overrides?.moonSign,
    risingSign: overrides?.risingSign,
    lifePath,
    stressElement: inputs.stressElement,
    decisionStyle: inputs.decisionStyle,
    pressureStyle: inputs.pressureStyle,
    nonNegotiables: inputs.nonNegotiables,
    goals: inputs.goals,
    socialEnergy: inputs.socialEnergy,
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
