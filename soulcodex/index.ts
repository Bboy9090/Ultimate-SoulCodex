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
  const decisionMap: any = { fix: "impulse", analyze: "analysis", talk: "consensus", withdraw: "avoidance" };
  const drainMap: any = { chaos: "air", repetition: "earth", lies: "metal", misunderstood: "water" };

  const signals: SoulSignals = {
    name: inputs.birthData.name,
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
    pressureStyle: (overrides?.pressureStyle ?? inputs.mirror.reaction.map(r => reactionMap[r]).filter(Boolean)) as any,
    stressElement: (overrides?.stressElement ?? inputs.mirror.drain.map(d => drainMap[d]).filter(Boolean)) as any,
    decisionStyle: (overrides?.decisionStyle ?? inputs.mirror.reaction.map(r => decisionMap[r]).filter(Boolean)) as any,
    // Social cadence is not collected by the Mirror questionnaire. Keep it
    // unresolved unless a caller supplies an explicit supported override.
    socialEnergy: (overrides?.socialEnergy ?? []) as any,
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
