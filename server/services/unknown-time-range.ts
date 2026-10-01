import {
  resolveCivilTimeStrict,
  type EvidenceState,
  type ConditionalValueRange,
  type RangeEvidence,
} from "@soulcodex/core";
import { calculateAstrology } from "./astrology-production";
import { calculateHumanDesign, type HumanDesignResolved } from "../../packages/astrology/human-design";

export interface RangeFieldResult<T = string> {
  evidenceState: EvidenceState;
  value: T | null;
  conditionalValues: Array<ConditionalValueRange & { rawValue?: T }>;
  rangeEvidence: RangeEvidence;
  reason: string;
}

export interface UnknownTimeAstrologyRange {
  mode: "unknown_birth_time_range";
  date: string;
  timezone: string;
  resolutionMinutes: 1;
  planets: Record<string, RangeFieldResult<string>>;
  ascendant: RangeFieldResult<string>;
  houses: { evidenceState: "unavailable"; reason: string };
  midheaven: { evidenceState: "unavailable"; reason: string };
}

export interface UnknownTimeHumanDesignRange {
  mode: "unknown_birth_time_range";
  date: string;
  timezone: string;
  resolutionMinutes: 1;
  components: {
    type: RangeFieldResult<string>;
    strategy: RangeFieldResult<string>;
    authority: RangeFieldResult<string>;
    profile: RangeFieldResult<string>;
    definition: RangeFieldResult<string>;
    centers: RangeFieldResult<string>;
    channels: RangeFieldResult<string>;
    gates: RangeFieldResult<string>;
    incarnationCross: RangeFieldResult<string>;
  } | null;
  reason?: string;
}

function minuteLabel(minute: number): string {
  const hour = Math.floor(minute / 60);
  const min = minute % 60;
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}


type RangeValueRow<T> = {
  minute: number;
  value: T;
  utcOffsetMinutes: number | null;
};

export type CivilInstantSample = {
  minute: number;
  utcIso: string;
  utcOffsetMinutes: number | null;
};

export type CivilInstantPlan = {
  samples: CivilInstantSample[];
  validLocalMinutes: number;
  nonexistentLocalMinutes: number;
  ambiguousLocalMinutes: number;
  invalidLocalMinutes: number;
};

export function enumerateCivilInstants(birthDate: string, timezone: string): CivilInstantPlan {
  const samples: CivilInstantSample[] = [];
  let validLocalMinutes = 0;
  let nonexistentLocalMinutes = 0;
  let ambiguousLocalMinutes = 0;
  let invalidLocalMinutes = 0;

  for (let minute = 0; minute < 1440; minute += 1) {
    const resolution = resolveCivilTimeStrict(
      birthDate,
      minuteLabel(minute),
      timezone,
    );

    if (resolution.status === "nonexistent") {
      nonexistentLocalMinutes += 1;
      continue;
    }

    if (resolution.status === "invalid") {
      invalidLocalMinutes += 1;
      continue;
    }

    validLocalMinutes += 1;
    if (resolution.status === "ambiguous") ambiguousLocalMinutes += 1;

    const candidates = resolution.status === "valid" && resolution.utc
      ? [resolution.utc.toISOString()]
      : resolution.candidates;

    candidates.forEach((utcIso, index) => {
      const offset = resolution.candidateUtcOffsetsMinutes[index];
      samples.push({
        minute,
        utcIso,
        utcOffsetMinutes: Number.isFinite(offset) ? offset : null,
      });
    });
  }

  samples.sort((left, right) => Date.parse(left.utcIso) - Date.parse(right.utcIso));

  return {
    samples,
    validLocalMinutes,
    nonexistentLocalMinutes,
    ambiguousLocalMinutes,
    invalidLocalMinutes,
  };
}

function utcMinuteInput(utcIso: string): { birthDate: string; birthTime: string } | null {
  const instant = new Date(utcIso);
  if (Number.isNaN(instant.getTime())) return null;

  // The public chart calculators currently accept minute precision. If a
  // historical timezone reconstruction lands on a sub-minute instant, range
  // analysis fails closed instead of truncating that evidence.
  if (instant.getUTCSeconds() !== 0 || instant.getUTCMilliseconds() !== 0) {
    return null;
  }

  return {
    birthDate: instant.toISOString().slice(0, 10),
    birthTime: `${String(instant.getUTCHours()).padStart(2, "0")}:${String(
      instant.getUTCMinutes(),
    ).padStart(2, "0")}`,
  };
}

function compactRanges<T>(
  values: Array<RangeValueRow<T>>,
  serialize: (value: T) => string,
): Array<ConditionalValueRange & { rawValue?: T }> {
  if (!values.length) return [];
  const ranges: Array<ConditionalValueRange & { rawValue?: T }> = [];
  let start = values[0].minute;
  let previous = values[0].minute;
  let current = values[0].value;
  let currentKey = serialize(current);
  let currentOffset = values[0].utcOffsetMinutes;

  const push = () => {
    ranges.push({
      value: currentKey,
      rawValue: current,
      startLocalTime: minuteLabel(start),
      endLocalTime: minuteLabel(previous),
      utcOffsetMinutes: currentOffset,
    });
  };

  for (let index = 1; index < values.length; index += 1) {
    const row = values[index];
    const key = serialize(row.value);
    if (
      key !== currentKey ||
      row.minute !== previous + 1 ||
      row.utcOffsetMinutes !== currentOffset
    ) {
      push();
      start = row.minute;
      current = row.value;
      currentKey = key;
      currentOffset = row.utcOffsetMinutes;
    }
    previous = row.minute;
  }
  push();
  return ranges;
}

function classifyRange<T>(
  values: Array<RangeValueRow<T>>,
  metadata: Omit<RangeEvidence, "testedValues">,
  expectedValues: number,
  serialize: (value: T) => string,
  labels: { stable: string; conditional: string; unavailable: string },
): RangeFieldResult<T> {
  const rangeEvidence: RangeEvidence = {
    ...metadata,
    testedValues: values.length,
    expectedValues,
  };
  if (
    expectedValues === 0 ||
    (metadata.invalidLocalMinutes ?? 0) > 0 ||
    values.length !== expectedValues
  ) {
    return {
      evidenceState: "unavailable",
      value: null,
      conditionalValues: [],
      rangeEvidence,
      reason: labels.unavailable,
    };
  }

  const keys = new Set(values.map((row) => serialize(row.value)));
  if (keys.size === 1) {
    return {
      evidenceState: "stable_across_range",
      value: values[0].value,
      conditionalValues: compactRanges(values, serialize),
      rangeEvidence,
      reason: labels.stable,
    };
  }

  return {
    evidenceState: "conditional",
    value: null,
    conditionalValues: compactRanges(values, serialize),
    rangeEvidence,
    reason: labels.conditional,
  };
}

function placementCandidateSign(placement: any): string | null {
  const sign = placement?.internalCandidate?.sign;
  return typeof sign === "string" && sign.trim() ? sign.trim() : null;
}

export function calculateUnknownTimeAstrologyRange(input: {
  birthDate: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}): UnknownTimeAstrologyRange {
  const civilPlan = enumerateCivilInstants(input.birthDate, input.timezone);
  const expectedValues =
    civilPlan.invalidLocalMinutes === 0 ? civilPlan.samples.length : 0;
  const metadata: Omit<RangeEvidence, "testedValues"> = {
    resolutionMinutes: 1,
    rangeStartLocal: `${input.birthDate}T00:00`,
    rangeEndLocal: `${input.birthDate}T23:59`,
    timezone: input.timezone,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    expectedValues,
    validLocalMinutes: civilPlan.validLocalMinutes,
    nonexistentLocalMinutes: civilPlan.nonexistentLocalMinutes,
    ambiguousLocalMinutes: civilPlan.ambiguousLocalMinutes,
    invalidLocalMinutes: civilPlan.invalidLocalMinutes,
  };
  const keys = ["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto"] as const;
  const values = Object.fromEntries(
    keys.map((key) => [key, [] as Array<RangeValueRow<string>>]),
  ) as Record<typeof keys[number], Array<RangeValueRow<string>>>;
  const rising: Array<RangeValueRow<string>> = [];

  for (const sample of civilPlan.samples) {
    const utcInput = utcMinuteInput(sample.utcIso);
    if (!utcInput) continue;

    const chart = calculateAstrology({
      birthDate: utcInput.birthDate,
      birthTime: utcInput.birthTime,
      timezone: "Etc/UTC",
      latitude: input.latitude,
      longitude: input.longitude,
    });
    for (const key of keys) {
      const sign = placementCandidateSign(chart.planets?.[key]);
      if (sign) {
        values[key].push({
          minute: sample.minute,
          value: sign,
          utcOffsetMinutes: sample.utcOffsetMinutes,
        });
      }
    }
    const risingSign = placementCandidateSign(chart.rising);
    if (risingSign) {
      rising.push({
        minute: sample.minute,
        value: risingSign,
        utcOffsetMinutes: sample.utcOffsetMinutes,
      });
    }
  }

  const planets = Object.fromEntries(keys.map((key) => [
    key,
    classifyRange(values[key], metadata, expectedValues, String, {
      stable: `${key} remains in one zodiac sign across every valid civil instant represented by the supplied date and timezone.`,
      conditional: `${key} changes sign during the civil day; interpretation must branch by birth-time window.`,
      unavailable: `${key} could not be evaluated for every minute of the civil day.`,
    }),
  ])) as Record<string, RangeFieldResult<string>>;

  const ascendant = input.latitude === undefined || input.longitude === undefined
    ? {
        evidenceState: "unavailable" as const,
        value: null,
        conditionalValues: [],
        rangeEvidence: { ...metadata, testedValues: 0 },
        reason: "Birth location is required to enumerate possible Ascendants. Soul Codex will not insert a default location.",
      }
    : classifyRange(rising, metadata, expectedValues, String, {
        stable: "Ascendant is invariant across the full day at minute resolution.",
        conditional: "Ascendant varies across the day. Use the listed windows only as rectification branches, not certified chart data.",
        unavailable: "Ascendant could not be evaluated across every possible birth minute.",
      });

  return {
    mode: "unknown_birth_time_range",
    date: input.birthDate,
    timezone: input.timezone,
    resolutionMinutes: 1,
    planets,
    ascendant,
    houses: {
      evidenceState: "unavailable",
      reason: "Houses require an exact birth time and verified Ascendant. They do not contribute to synthesis while birth time is unknown.",
    },
    midheaven: {
      evidenceState: "unavailable",
      reason: "Midheaven is time-sensitive and remains unavailable until birth time is supplied and verified.",
    },
  };
}

function stableStringSet(values: string[]): string {
  return [...values].sort().join("|");
}

function centerSignature(result: HumanDesignResolved): string {
  return stableStringSet(Object.entries(result.centers)
    .filter(([, center]) => center.defined)
    .map(([name]) => name));
}

function channelSignature(result: HumanDesignResolved): string {
  return stableStringSet(result.channels
    .filter((channel) => channel.defined)
    .map((channel) => `${[...channel.gates].sort((a,b)=>a-b).join("-")}:${channel.name}`));
}

function gateSignature(result: HumanDesignResolved): string {
  return [...result.activatedGates].sort((a,b)=>a-b).join(",");
}

export function calculateUnknownTimeHumanDesignRange(input: {
  birthDate: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}): UnknownTimeHumanDesignRange {
  if (input.latitude === undefined || input.longitude === undefined) {
    return {
      mode: "unknown_birth_time_range",
      date: input.birthDate,
      timezone: input.timezone,
      resolutionMinutes: 1,
      components: null,
      reason: "Birth location is required for the Human Design range sweep. No default city or coordinates are inserted.",
    };
  }

  const civilPlan = enumerateCivilInstants(input.birthDate, input.timezone);
  const expectedValues =
    civilPlan.invalidLocalMinutes === 0 ? civilPlan.samples.length : 0;
  const metadata: Omit<RangeEvidence, "testedValues"> = {
    resolutionMinutes: 1,
    rangeStartLocal: `${input.birthDate}T00:00`,
    rangeEndLocal: `${input.birthDate}T23:59`,
    timezone: input.timezone,
    latitude: input.latitude,
    longitude: input.longitude,
    expectedValues,
    validLocalMinutes: civilPlan.validLocalMinutes,
    nonexistentLocalMinutes: civilPlan.nonexistentLocalMinutes,
    ambiguousLocalMinutes: civilPlan.ambiguousLocalMinutes,
    invalidLocalMinutes: civilPlan.invalidLocalMinutes,
  };

  const rows: Array<{
    minute: number;
    utcOffsetMinutes: number | null;
    chart: HumanDesignResolved;
  }> = [];
  for (const sample of civilPlan.samples) {
    const utcInput = utcMinuteInput(sample.utcIso);
    if (!utcInput) continue;

    const result = calculateHumanDesign({
      name: "Private profile",
      birthDate: utcInput.birthDate,
      birthTime: utcInput.birthTime,
      birthLocation: "Resolved birthplace",
      timezone: "Etc/UTC",
      latitude: String(input.latitude),
      longitude: String(input.longitude),
    });
    if (result.status === "resolved") {
      rows.push({
        minute: sample.minute,
        utcOffsetMinutes: sample.utcOffsetMinutes,
        chart: result,
      });
    }
  }

  const field = (
    pick: (chart: HumanDesignResolved) => string,
    label: string,
  ) => classifyRange(
    rows.map(({ minute, utcOffsetMinutes, chart }) => ({
      minute,
      utcOffsetMinutes,
      value: pick(chart),
    })),
    metadata,
    expectedValues,
    String,
    {
      stable: `${label} is identical across every possible birth minute and may be used with stable-across-range provenance.`,
      conditional: `${label} changes across the day and is withheld from synthesis until birth time is known.`,
      unavailable: `${label} could not be evaluated for every possible birth minute.`,
    },
  );

  return {
    mode: "unknown_birth_time_range",
    date: input.birthDate,
    timezone: input.timezone,
    resolutionMinutes: 1,
    components: {
      type: field((chart) => chart.type, "Type"),
      strategy: field((chart) => chart.strategy, "Strategy"),
      authority: field((chart) => chart.authority, "Authority"),
      profile: field((chart) => chart.profile, "Profile"),
      definition: field((chart) => chart.definition, "Definition"),
      centers: field(centerSignature, "Defined Centers"),
      channels: field(channelSignature, "Defined Channels"),
      gates: field(gateSignature, "Activated Gates"),
      incarnationCross: field((chart) => chart.incarnationCross, "Incarnation Cross"),
    },
  };
}
