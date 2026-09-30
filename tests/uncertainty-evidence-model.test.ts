import assert from "node:assert/strict";
import test from "node:test";
import { synthesisModeForEvidenceState } from "../packages/core/placement/types";
import {
  generateFoundationOfflineCodexProfile,
  synthesizeRangeStableFoundationProfile,
  type VerifiedAstrologyForSynthesis,
} from "../client/src/lib/foundationOfflineCodex";
import { getSynthesisAstrologySign } from "../client/src/lib/profileVerificationReconciliation";

const rangeEvidence = {
  resolutionMinutes: 1,
  testedValues: 1440,
  rangeStartLocal: "2000-03-15T00:00",
  rangeEndLocal: "2000-03-15T23:59",
};

function stable(sign: string) {
  return {
    sign,
    verificationStatus: "calculated",
    evidenceState: "stable_across_range" as const,
    rangeEvidence,
    conditionalValues: [{ value: sign, startLocalTime: "00:00", endLocalTime: "23:59" }],
  };
}

function conditional(values: Array<{ value: string; startLocalTime: string; endLocalTime: string }>) {
  return {
    sign: null,
    verificationStatus: "unresolved",
    evidenceState: "conditional" as const,
    rangeEvidence,
    conditionalValues: values,
  };
}

test("canonical evidence states map to synthesis behavior", () => {
  assert.equal(synthesisModeForEvidenceState("verified"), "use");
  assert.equal(synthesisModeForEvidenceState("stable_across_range"), "use");
  assert.equal(synthesisModeForEvidenceState("conditional"), "branch_only");
  assert.equal(synthesisModeForEvidenceState("unavailable"), "exclude");
});

test("missing full birth name keeps name numerology unavailable", () => {
  const local = generateFoundationOfflineCodexProfile({
    name: "Display Name",
    fullBirthName: "",
    birthDate: "2000-03-15",
    birthTime: "",
    birthLocation: "Savannah, Georgia",
    timezone: "America/New_York",
    latitude: "32.0809",
    longitude: "-81.0912",
  }, { generatedAt: "2026-09-30T08:00:00.000Z", currentYear: 2026 });

  assert.equal(local.numerologyData.lifePath, 11);
  assert.equal(local.numerologyData.expression, null);
  assert.equal(local.numerologyData.soulUrge, null);
  assert.equal(local.numerologyData.personality, null);
  assert.equal(local.numerologyData.maturity, null);
  assert.equal(local.numerologyData.evidenceStates.expression, "unavailable");
  assert.match(local.biography, /full birth name was not supplied/i);
});

test("stable-across-range placements may influence synthesis while conditional Moon and Rising do not", () => {
  const local = generateFoundationOfflineCodexProfile({
    name: "Range Test",
    fullBirthName: "",
    birthDate: "2000-03-15",
    birthTime: "",
    birthLocation: "Savannah, Georgia",
    timezone: "America/New_York",
    latitude: "32.0809",
    longitude: "-81.0912",
  }, { generatedAt: "2026-09-30T08:00:00.000Z", currentYear: 2026 });

  const astrology: VerifiedAstrologyForSynthesis = {
    sun: stable("Pisces"),
    moon: conditional([
      { value: "Cancer", startLocalTime: "00:00", endLocalTime: "12:14" },
      { value: "Leo", startLocalTime: "12:15", endLocalTime: "23:59" },
    ]),
    rising: conditional([
      { value: "Aries", startLocalTime: "00:00", endLocalTime: "01:59" },
      { value: "Taurus", startLocalTime: "02:00", endLocalTime: "03:59" },
    ]),
    planets: {
      sun: stable("Pisces"),
      moon: conditional([
        { value: "Cancer", startLocalTime: "00:00", endLocalTime: "12:14" },
        { value: "Leo", startLocalTime: "12:15", endLocalTime: "23:59" },
      ]),
      mercury: stable("Pisces"),
      venus: stable("Aquarius"),
      mars: stable("Aries"),
    },
  };

  assert.equal(getSynthesisAstrologySign(astrology as any, "sun"), "Pisces");
  assert.equal(getSynthesisAstrologySign(astrology as any, "moon"), null);
  assert.equal(getSynthesisAstrologySign(astrology as any, "rising"), null);

  const result = synthesizeRangeStableFoundationProfile(local, astrology, "2026-09-30T08:00:00.000Z", {
    status: "range_analyzed",
    evidenceState: "conditional",
    components: {
      type: {
        evidenceState: "stable_across_range",
        value: "Reflector",
        rangeEvidence,
      },
      authority: {
        evidenceState: "conditional",
        value: null,
        rangeEvidence,
      },
    },
  });

  assert.match(result.biography, /Stable placements:/);
  assert.match(result.biography, /Sun Pisces/);
  assert.match(result.biography, /Mercury Pisces/);
  assert.match(result.biography, /Moon and Ascendant vary across the day/i);
  assert.doesNotMatch(result.biography, /Moon Cancer|Moon Leo|Aries Rising|Taurus Rising/);
  assert.ok(result.archetypeData.themes.some((theme) => /Sun Pisces · stable across range/.test(theme)));
  assert.ok(result.archetypeData.themes.some((theme) => /type: Reflector · stable across range/.test(theme)));
  assert.equal(result.archetypeData.themes.some((theme) => /authority/.test(theme)), false);
});
