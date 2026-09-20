import { calculateHumanDesign } from "@soulcodex/astrology";
import {
  APPROVED_HUMAN_DESIGN_CORE_VERIFICATION,
  createVerifiedHumanDesignTrustRecord,
} from "./human-design-trust";

export interface VerifiedHumanDesignCoreInput {
  birthDate: string;
  birthTime?: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  inputTimestampUtc?: string | null;
}

export interface VerifiedHumanDesignCoreSnapshot {
  status: "verified";
  policyId: "HUMAN-DESIGN-CORE-v1";
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definedCenters: string[];
  definedChannels: number[][];
  activations: NonNullable<
    Extract<ReturnType<typeof calculateHumanDesign>, { status: "resolved" }>["activations"]
  >;
  trust: Extract<
    ReturnType<typeof createVerifiedHumanDesignTrustRecord>,
    { status: "verified" }
  >;
  limitations: readonly string[];
}

export function calculateVerifiedHumanDesignCore(
  input: VerifiedHumanDesignCoreInput,
): VerifiedHumanDesignCoreSnapshot | null {
  if (
    !input.birthTime ||
    input.latitude === undefined ||
    input.longitude === undefined ||
    !input.inputTimestampUtc
  ) {
    return null;
  }

  const result = calculateHumanDesign({
    name: "Verification profile",
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthLocation: "Verified coordinates",
    timezone: input.timezone,
    latitude: String(input.latitude),
    longitude: String(input.longitude),
  });

  if (result.status !== "resolved") return null;

  const definedCenters = Object.entries(result.centers)
    .filter(([, center]) => center.defined)
    .map(([name]) => name)
    .sort();

  const definedChannels = result.channels
    .filter((channel) => channel.defined)
    .map((channel) => [...channel.gates].sort((a, b) => a - b))
    .sort((left, right) => left[0] - right[0] || left[1] - right[1]);

  const trust = createVerifiedHumanDesignTrustRecord({
    birthTimeKnown: true,
    inputTimestampUtc: input.inputTimestampUtc,
    candidate: {
      type: result.type,
      strategy: result.strategy,
      authority: result.authority,
      profile: result.profile,
    },
  });
  if (trust.status !== "verified") return null;

  return {
    status: "verified",
    policyId: APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.policyId,
    type: result.type,
    strategy: result.strategy,
    authority: result.authority,
    profile: result.profile,
    definedCenters,
    definedChannels,
    activations: result.activations,
    trust,
    limitations: Object.freeze([
      "Verified core excludes Variables and Incarnation Cross naming.",
      "Human Design interpretation remains a symbolic framework rather than scientific personality measurement.",
    ]),
  };
}
