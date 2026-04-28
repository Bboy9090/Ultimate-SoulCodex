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

  const reactionMap: any = { fix: "fight", analyze: "adapt", talk: "perform", withdraw: "withdraw" };
  const drainMap: any = { chaos: "air", repetition: "earth", lies: "metal", misunderstood: "water" };

  const signals: SoulSignals = {
    sunSign: overrides?.sunSign,
    moonSign: overrides?.moonSign,
    risingSign: overrides?.risingSign,
    lifePath,
    mirrorProfile,
    nonNegotiables: inputs.nonNegotiables,
    goals: inputs.goals,
    seed: [
      inputs.birthData.name,
      inputs.birthData.birthDate,
      inputs.mirror.reaction.join(""),
      inputs.mirror.drain.join(""),
    ].join("|"),
    pressureStyle: inputs.mirror.reaction.map(r => reactionMap[r]).filter(Boolean) as any,
    stressElement: inputs.mirror.drain.map(d => drainMap[d]).filter(Boolean) as any,
    decisionStyle: ["analysis"], // fallback
    socialEnergy: ["steady"],    // fallback
  };

  const archetype = chooseArchetype(signals);
  const synthesis = synthesize(signals, archetype);

  return {
    profile: { archetype, synthesis, signals },
    signals,
  };
}

export function compareProfiles(a: SoulSignals, b: SoulSignals): CompatibilityScore {
  return compatibility(a, b);
}
