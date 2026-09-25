import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVED_HUMAN_DESIGN_CORE_VERIFICATION,
  createHumanDesignTrustRecord,
  createVerifiedHumanDesignTrustRecord,
  getVerifiedHumanDesignField,
  mayUseHumanDesignForCompatibility,
} from "../server/services/human-design-trust";

test("unknown birth time keeps Human Design unresolved", () => {
  const record = createHumanDesignTrustRecord({ birthTimeKnown: false });

  assert.equal(record.status, "unresolved");
  assert.equal(record.engine, null);
  assert.equal(getVerifiedHumanDesignField(record, "type"), null);
  assert.equal(mayUseHumanDesignForCompatibility(record), false);
});

test("calculated values remain candidates rather than authoritative facts", () => {
  const record = createHumanDesignTrustRecord({
    birthTimeKnown: true,
    inputTimestampUtc: "1990-09-17T15:11:00.000Z",
    calculatedAt: "2026-08-03T16:00:00.000Z",
    candidate: {
      type: "Reflector",
      strategy: "To Wait a Lunar Cycle",
      authority: "Lunar Authority",
      profile: "2/5",
    },
  });

  assert.equal(record.status, "calculated_unverified");
  assert.equal(record.candidate.type, "Reflector");
  assert.equal(getVerifiedHumanDesignField(record, "type"), null);
  assert.equal(getVerifiedHumanDesignField(record, "authority"), null);
  assert.equal(mayUseHumanDesignForCompatibility(record), false);
  assert.match(record.limitations.join(" "), /independent reference comparison/i);
});

test("invalid timestamps fail closed", () => {
  assert.throws(
    () =>
      createHumanDesignTrustRecord({
        birthTimeKnown: true,
        inputTimestampUtc: "not-a-date",
        candidate: { type: "Generator" },
      }),
    /human_design_input_timestamp_invalid/,
  );
});

test("blank candidate strings are discarded", () => {
  const record = createHumanDesignTrustRecord({
    birthTimeKnown: true,
    inputTimestampUtc: "1990-09-17T15:11:00.000Z",
    calculatedAt: "2026-08-03T16:00:00.000Z",
    candidate: { type: "   ", profile: "2/5" },
  });

  assert.equal(record.status, "calculated_unverified");
  assert.equal(record.candidate.type, undefined);
  assert.equal(record.candidate.profile, "2/5");
});


test("qualified Human Design core becomes verified only through the approved receipt", () => {
  const record = createVerifiedHumanDesignTrustRecord({
    birthTimeKnown: true,
    inputTimestampUtc: "1990-09-17T15:11:00.000Z",
    calculatedAt: "2026-09-19T23:03:08.000Z",
    candidate: {
      type: "Reflector",
      strategy: "To Wait a Lunar Cycle",
      authority: "Lunar Authority",
      profile: "2/5",
    },
  });

  assert.equal(record.status, "verified");
  assert.equal(record.engine, "soulcodex-hd-geocentric-v1");
  assert.equal(
    record.verificationReceiptId,
    "35474994858:human-design-repair-audit",
  );
  assert.equal(getVerifiedHumanDesignField(record, "type"), "Reflector");
  assert.equal(getVerifiedHumanDesignField(record, "profile"), "2/5");
  assert.equal(mayUseHumanDesignForCompatibility(record), true);
  assert.match(record.limitations.join(" "), /Variables/i);
  assert.match(record.limitations.join(" "), /Incarnation Cross/i);
});

test("incomplete Human Design candidates cannot receive verified promotion", () => {
  for (const candidate of [
    {},
    { type: "Generator" },
    {
      type: "Generator",
      strategy: "To Respond",
      authority: "Sacral Authority",
    },
  ]) {
    const record = createVerifiedHumanDesignTrustRecord({
      birthTimeKnown: true,
      inputTimestampUtc: "1990-09-17T15:11:00.000Z",
      candidate,
    });

    assert.equal(record.status, "calculated_unverified");
    assert.equal(mayUseHumanDesignForCompatibility(record), false);
  }
});

test("structurally inconsistent Human Design candidates cannot receive verified promotion", () => {
  for (const candidate of [
    {
      type: "Generator",
      strategy: "To Inform",
      authority: "Sacral Authority",
      profile: "2/5",
    },
    {
      type: "Reflector",
      strategy: "To Wait a Lunar Cycle",
      authority: "Sacral Authority",
      profile: "2/5",
    },
    {
      type: "Generator",
      strategy: "To Respond",
      authority: "Sacral Authority",
      profile: "0/7",
    },
  ]) {
    const record = createVerifiedHumanDesignTrustRecord({
      birthTimeKnown: true,
      inputTimestampUtc: "1990-09-17T15:11:00.000Z",
      candidate,
    });

    assert.equal(record.status, "calculated_unverified");
  }
});

test("approved Human Design receipt is exact and complete", () => {
  assert.equal(APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.status, "approved");
  assert.equal(APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.fixtureCount, 20);
  assert.equal(APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.activationCount, 520);
  assert.equal(APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.exactGateMatches, 520);
  assert.equal(APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.exactGateLineMatches, 520);
  assert.equal(APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.typeMatches, 20);
  assert.equal(APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.authorityMatches, 20);
  assert.equal(APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.profileMatches, 20);
  assert.equal(APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.centerSetMatches, 20);
  assert.equal(APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.channelSetMatches, 20);
  assert.equal(
    APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.exactCandidateSha,
    "d57b747658668492d72869e8a973d5708e21d09d",
  );
});


test("historical tzdb conversions remain calculated but cannot receive verified promotion", () => {
  const record = createVerifiedHumanDesignTrustRecord({
    birthTimeKnown: true,
    inputTimestampUtc: "1879-03-14T10:36:32.000Z",
    calculatedAt: "2026-09-25T04:30:00.000Z",
    candidate: {
      type: "Generator",
      strategy: "To Respond",
      authority: "Sacral Authority",
      profile: "1/3",
    },
    timeConversion: {
      timezone: "Europe/Berlin",
      utcOffsetMinutes: 53.4666666667,
      conversionMethod: "standard-iana-tzdb",
      runtimeTzdbVersion: "2026b",
      provenanceStatus: "historical_tzdb_unverified",
      historicalTimeRequiresIndependentSource: true,
    },
  });

  assert.equal(record.status, "calculated_unverified");
  assert.equal(mayUseHumanDesignForCompatibility(record), false);
  assert.match(record.limitations.join(" "), /historical civil-time conversion/i);
});

test("modern tzdb conversions may still receive verified promotion", () => {
  const record = createVerifiedHumanDesignTrustRecord({
    birthTimeKnown: true,
    inputTimestampUtc: "1990-09-17T15:11:00.000Z",
    calculatedAt: "2026-09-25T04:30:00.000Z",
    candidate: {
      type: "Reflector",
      strategy: "To Wait a Lunar Cycle",
      authority: "Lunar Authority",
      profile: "2/5",
    },
    timeConversion: {
      timezone: "America/New_York",
      utcOffsetMinutes: -240,
      conversionMethod: "standard-iana-tzdb",
      runtimeTzdbVersion: "2026b",
      provenanceStatus: "modern_tzdb",
      historicalTimeRequiresIndependentSource: false,
    },
  });

  assert.equal(record.status, "verified");
});


test("estimated birth time cannot receive verified Human Design promotion", () => {
  const record = createVerifiedHumanDesignTrustRecord({
    birthTimeKnown: true,
    inputTimestampUtc: "1990-09-17T15:00:00.000Z",
    calculatedAt: "2026-09-25T05:00:00.000Z",
    candidate: {
      type: "Reflector",
      strategy: "To Wait a Lunar Cycle",
      authority: "Lunar Authority",
      profile: "2/5",
    },
    timeConversion: {
      timezone: "America/New_York",
      utcOffsetMinutes: -240,
      conversionMethod: "standard-iana-tzdb",
      runtimeTzdbVersion: "2026b",
      provenanceStatus: "modern_tzdb",
      historicalTimeRequiresIndependentSource: false,
      birthTimeAccuracy: "estimated",
      birthTimeUncertaintyMinutes: 30,
      birthTimeQualityRequiresReview: true,
    },
  });

  assert.equal(record.status, "calculated_unverified");
  assert.equal(mayUseHumanDesignForCompatibility(record), false);
  assert.match(record.limitations.join(" "), /estimated/i);
  assert.match(record.limitations.join(" "), /±30 minutes/i);
});
