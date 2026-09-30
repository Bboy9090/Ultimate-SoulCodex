import { calculateAstrology } from "./astrology-production";
import { calculateHumanDesign } from "../../packages/astrology/human-design";
import type {
  ConditionalValueRange,
  EvidenceState,
  RangeEvidence,
  SynthesisEvidenceMode,
} from "@soulcodex/core";
import { synthesisModeForEvidenceState } from "@soulcodex/core";

const PLANET_KEYS = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
] as const;

type PlanetKey = typeof PLANET_KEYS[number];

export interface RangeResolvedValue {
  evidenceState: EvidenceState;
  synthesisMode: SynthesisEvidenceMode;
  value: string | null;
  conditionalValues: ConditionalValueRange[];
  rangeEvidence: RangeEvidence;
  reason: string;
}

export interface UnknownTimeAstrologyRange {
  birthTimeStatus: "unknown";
  planets: Record<PlanetKey, RangeResolvedValue>;
  ascendant: RangeResolvedValue;
  houses: RangeResolvedValue;
  midheaven: RangeResolvedValue;
  unlocks: string[];
}

export interface HumanDesignRangeField {
  evidenceState: EvidenceState;
  synthesisMode: SynthesisEvidenceMode;
  value: string | null;
  possibleValues: string[];
  reason: string;
}

export interface UnknownTimeHumanDesignRange {
  birthTimeStatus: "unknown";
  fields: {
    type: HumanDesignRangeField;
    strategy: HumanDesignRangeField;
    authority: HumanDesignRangeField;
    profile: HumanDesignRangeField;
    definition: HumanDesignRangeField;
    centers: HumanDesignRangeField;
    channels: HumanDesignRangeField;
    gates: HumanDesignRangeField;
    incarnationCross: HumanDesignRangeField;
  };
  rangeEvidence: RangeEvidence;
  unlocks: string[];
}

function minuteLabel(minute: number): string {
  const bounded = Math.max(0, Math.min(1439, minute));
  const hour = Math.floor(bounded / 60);
  const mins = bounded % 60;
  return `${String(hour).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function rangeMeta(
  birthDate: string,
  timezone: string,
  latitude?: number,
  longitude?: number,
): RangeEvidence {
  return {
    resolutionMinutes: 1,
    rangeStartLocal: `${birthDate}T00:00`,
    rangeEndLocal: `${birthDate}T23:59`,
    timezone,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    testedValues: 1440,
  };
}

function compressWindows(values: Array<string | null>): ConditionalValueRange[] {
  const windows: ConditionalValueRange[] = [];
  let current: string | null = null;
  let start = 0;

  for (let minute = 0; minute <= values.length; minute += 1) {
    const next = minute < values.length ? values[minute] : null;
    if (minute === 0) {
      current = next;
      start = 0;
      continue;
    }
    if (next === current) continue;

    if (current) {
      windows.push({
        value: current,
        startLocalTime: minuteLabel(start),
        endLocalTime: minuteLabel(minute - 1),
      });
    }
    current = next;
    start = minute;
  }
  return windows;
}

function classifyRange(
  values: Array<string | null>,
  rangeEvidence: RangeEvidence,
  unavailableReason: string,
): RangeResolvedValue {
  const usable = values.filter((value): value is string => Boolean(value));
  const unique = Array.from(new Set(usable));
  if (unique.length === 0) {
    return {
      evidenceState: "unavailable",
      synthesisMode: "exclude",
      value: null,
      conditionalValues: [],
      rangeEvidence,
      reason: unavailableReason,
    };
  }

  if (unique.length === 1 && usable.length === values.length) {
    return {
      evidenceState: "stable_across_range",
      synthesisMode: synthesisModeForEvidenceState("stable_across_range"),
      value: unique[0],
      conditionalValues: [{
        value: unique[0],
        startLocalTime: "00:00",
        endLocalTime: "23:59",
      }],
      rangeEvidence,
      reason: "The value is identical at every minute across the full unknown-time range.",
    };
  }

  return {
    evidenceState: "conditional",
    synthesisMode: synthesisModeForEvidenceState("conditional"),
    value: null,
    conditionalValues: compressWindows(values),
    rangeEvidence,
    reason: "More than one legitimate value occurs across the full unknown-time range.",
  };
}

export function calculateUnknownTimeAstrologyRange(input: {
  birthDate: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}): UnknownTimeAstrologyRange {
  const rangeEvidence = rangeMeta(
    input.birthDate,
    input.timezone,
    input.latitude,
    input.longitude,
  );
  const values: Record<PlanetKey, Array<string | null>> = Object.fromEntries(
    PLANET_KEYS.map((key) => [key, []]),
  ) as Record<PlanetKey, Array<string | null>>;
  const ascendantValues: Array<string | null> = [];

  for (let minute = 0; minute < 1440; minute += 1) {
    const chart = calculateAstrology({
      birthDate: input.birthDate,
      birthTime: minuteLabel(minute),
      timezone: input.timezone,
      latitude: input.latitude,
      longitude: input.longitude,
    });

    for (const key of PLANET_KEYS) {
      values[key].push(chart.planets?.[key]?.internalCandidate?.sign ?? null);
    }
    ascendantValues.push(chart.rising?.internalCandidate?.sign ?? null);
  }

  const planets = Object.fromEntries(
    PLANET_KEYS.map((key) => [
      key,
      classifyRange(
        values[key],
        rangeEvidence,
        `${key} could not be calculated across the supplied date/timezone range.`,
      ),
    ]),
  ) as Record<PlanetKey, RangeResolvedValue>;

  const ascendant = input.latitude === undefined || input.longitude === undefined
    ? {
        evidenceState: "unavailable" as const,
        synthesisMode: "exclude" as const,
        value: null,
        conditionalValues: [],
        rangeEvidence,
        reason: "Birthplace coordinates are required to calculate the Ascendant range.",
      }
    : classifyRange(
        ascendantValues,
        rangeEvidence,
        "Ascendant range could not be calculated safely.",
      );

  const unavailableGeometry = (label: string): RangeResolvedValue => ({
    evidenceState: "unavailable",
    synthesisMode: "exclude",
    value: null,
    conditionalValues: [],
    rangeEvidence,
    reason: `${label} requires an exact birth time before Soul Codex can certify chart geometry.`,
  });

  return {
    birthTimeStatus: "unknown",
    planets,
    ascendant,
    houses: unavailableGeometry("Houses"),
    midheaven: unavailableGeometry("Midheaven"),
    unlocks: [
      "Exact birth time verifies Ascendant, houses, Midheaven, planetary houses, and exact degrees.",
      "Conditional planetary signs become a single certified placement once the birth time is known.",
    ],
  };
}

function normalizeCenters(centers: any): string {
  if (!centers || typeof centers !== "object") return "";
  return Object.entries(centers)
    .filter(([, value]: any) => value?.defined === true)
    .map(([name]) => name)
    .sort()
    .join("|");
}

function normalizeChannels(channels: any): string {
  if (!Array.isArray(channels)) return "";
  return channels
    .filter((channel) => channel?.defined === true)
    .map((channel) => Array.isArray(channel?.gates) ? [...channel.gates].sort((a, b) => a - b).join("-") : "")
    .filter(Boolean)
    .sort()
    .join("|");
}

function normalizeGates(gates: any): string {
  if (!Array.isArray(gates)) return "";
  return [...new Set(gates.map(Number).filter(Number.isFinite))]
    .sort((a, b) => a - b)
    .join("|");
}

function classifyHdField(values: string[], label: string): HumanDesignRangeField {
  const unique = Array.from(new Set(values.filter(Boolean)));
  if (unique.length === 0) {
    return {
      evidenceState: "unavailable",
      synthesisMode: "exclude",
      value: null,
      possibleValues: [],
      reason: `${label} could not be resolved across the full-day sweep.`,
    };
  }
  if (unique.length === 1 && values.length === 1440) {
    return {
      evidenceState: "stable_across_range",
      synthesisMode: "use",
      value: unique[0],
      possibleValues: unique,
      reason: `${label} is identical at every minute across the full unknown-time range.`,
    };
  }
  return {
    evidenceState: "conditional",
    synthesisMode: "branch_only",
    value: null,
    possibleValues: unique,
    reason: `${label} changes across the day and remains unresolved without a birth time.`,
  };
}

export function calculateUnknownTimeHumanDesignRange(input: {
  birthDate: string;
  timezone: string;
  latitude: number;
  longitude: number;
}): UnknownTimeHumanDesignRange {
  const rangeEvidence = rangeMeta(
    input.birthDate,
    input.timezone,
    input.latitude,
    input.longitude,
  );
  const fieldValues = {
    type: [] as string[],
    strategy: [] as string[],
    authority: [] as string[],
    profile: [] as string[],
    definition: [] as string[],
    centers: [] as string[],
    channels: [] as string[],
    gates: [] as string[],
    incarnationCross: [] as string[],
  };

  for (let minute = 0; minute < 1440; minute += 1) {
    const result = calculateHumanDesign({
      name: "Private profile",
      birthDate: input.birthDate,
      birthTime: minuteLabel(minute),
      birthLocation: "Resolved birthplace",
      timezone: input.timezone,
      latitude: String(input.latitude),
      longitude: String(input.longitude),
    });
    if (result.status !== "resolved") continue;

    fieldValues.type.push(result.type);
    fieldValues.strategy.push(result.strategy);
    fieldValues.authority.push(result.authority);
    fieldValues.profile.push(result.profile);
    fieldValues.definition.push(result.definition);
    fieldValues.centers.push(normalizeCenters(result.centers));
    fieldValues.channels.push(normalizeChannels(result.channels));
    fieldValues.gates.push(normalizeGates(result.activatedGates));
    fieldValues.incarnationCross.push(result.incarnationCross);
  }

  return {
    birthTimeStatus: "unknown",
    fields: {
      type: classifyHdField(fieldValues.type, "Human Design Type"),
      strategy: classifyHdField(fieldValues.strategy, "Human Design Strategy"),
      authority: classifyHdField(fieldValues.authority, "Human Design Authority"),
      profile: classifyHdField(fieldValues.profile, "Human Design Profile"),
      definition: classifyHdField(fieldValues.definition, "Human Design Definition"),
      centers: classifyHdField(fieldValues.centers, "Human Design Centers"),
      channels: classifyHdField(fieldValues.channels, "Human Design Channels"),
      gates: classifyHdField(fieldValues.gates, "Human Design Gates"),
      incarnationCross: classifyHdField(fieldValues.incarnationCross, "Human Design Incarnation Cross"),
    },
    rangeEvidence,
    unlocks: [
      "A birth time verifies every Human Design field that changes across the day.",
      "Only fields identical across all 1,440 minute values may influence synthesis without an exact birth time.",
    ],
  };
}
