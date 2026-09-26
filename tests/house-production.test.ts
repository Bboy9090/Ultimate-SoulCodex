import assert from "node:assert/strict";
import test from "node:test";
import {
  APPROVED_EQUAL_HOUSE_POLICY,
  verifyEqualHouse,
} from "../server/services/house-production";
import {
  calculateIndependentMidheavenReference,
  calculateMidheavenCandidate,
} from "../server/services/house-verification";
import {
  SWISS_EQUAL_HOUSE_FIXTURES,
} from "./fixtures/swiss-equal-house-fixtures";

test("approved Equal House policy is bound to the exact Swiss evidence artifact", () => {
  assert.equal(APPROVED_EQUAL_HOUSE_POLICY.status, "approved");
  assert.equal(APPROVED_EQUAL_HOUSE_POLICY.policyId, "ASTRO-EQUAL-HOUSE-v1");
  assert.equal(APPROVED_EQUAL_HOUSE_POLICY.maximumMidheavenDeltaDegrees, 0.001);
  assert.equal(APPROVED_EQUAL_HOUSE_POLICY.maximumCuspDeltaDegrees, 0.01);
  assert.equal(APPROVED_EQUAL_HOUSE_POLICY.evidenceRunId, "35449945640");
  assert.equal(APPROVED_EQUAL_HOUSE_POLICY.evidenceArtifactId, "10586653891");
  assert.equal(
    APPROVED_EQUAL_HOUSE_POLICY.evidenceCandidateSha,
    "ef242e304747065e3305ea62883cde3589ab895c",
  );
  assert.ok(
    (APPROVED_EQUAL_HOUSE_POLICY.evidenceMaximumCandidateMidheavenDeltaDegrees ?? 99) <=
      APPROVED_EQUAL_HOUSE_POLICY.maximumMidheavenDeltaDegrees,
  );
  assert.ok(
    (APPROVED_EQUAL_HOUSE_POLICY.evidenceMaximumCuspDeltaDegrees ?? 99) <=
      APPROVED_EQUAL_HOUSE_POLICY.maximumCuspDeltaDegrees,
  );
});

test("all 24 Swiss-qualified fixtures verify MC and 12 Equal House cusps", () => {
  for (const fixture of SWISS_EQUAL_HOUSE_FIXTURES) {
    const result = verifyEqualHouse({
      inputTimestamp: fixture.inputTimestamp,
      latitude: fixture.latitude,
      longitude: fixture.longitude,
    });

    assert.equal(result.status, "verified", fixture.id);
    if (result.status !== "verified") continue;
    assert.equal(result.houseSystem, "equal");
    assert.equal(result.cusps.length, 12);
    assert.equal(result.midheaven.verificationStatus, "verified");
    assert.ok(
      result.midheaven.longitudeDeltaDegrees <=
        APPROVED_EQUAL_HOUSE_POLICY.maximumMidheavenDeltaDegrees,
      fixture.id,
    );
    assert.ok(
      result.ascendant.longitudeDeltaDegrees <=
        APPROVED_EQUAL_HOUSE_POLICY.maximumCuspDeltaDegrees,
      fixture.id,
    );
    assert.equal(result.evidence.artifactId, "10586653891");
  }
});

test("Bobby golden fixture preserves Scorpio Ascendant and verified Equal House geometry", () => {
  const fixture = SWISS_EQUAL_HOUSE_FIXTURES.find((row) => row.id === "bobby-bronx");
  assert.ok(fixture);
  const result = verifyEqualHouse(fixture);
  assert.equal(result.status, "verified");
  if (result.status !== "verified") return;
  assert.equal(result.ascendant.sign, "Scorpio");
  assert.equal(result.cusps[0].sign, "Scorpio");
  assert.equal(result.cusps[0].house, 1);
  assert.equal(result.midheaven.sign, "Leo");
});

test("draft house policy cannot promote MC or cusps", () => {
  const fixture = SWISS_EQUAL_HOUSE_FIXTURES[0];
  const result = verifyEqualHouse(fixture, {
    policy: {
      ...APPROVED_EQUAL_HOUSE_POLICY,
      status: "draft",
      approvedAt: undefined,
    },
  });
  assert.equal(result.status, "unresolved");
  assert.equal(result.reason, "policy_not_approved");
});

test("non-independent MC reference is rejected", () => {
  const fixture = SWISS_EQUAL_HOUSE_FIXTURES[0];
  const result = verifyEqualHouse(fixture, {
    midheavenReference: (input) => calculateMidheavenCandidate(input),
  });
  assert.equal(result.status, "unresolved");
  assert.equal(result.reason, "midheaven_reference_not_independent");
});

test("MC outside governed tolerance fails closed", () => {
  const fixture = SWISS_EQUAL_HOUSE_FIXTURES[0];
  const result = verifyEqualHouse(fixture, {
    midheavenReference: (input) => {
      const normal = calculateIndependentMidheavenReference(input);
      return {
        ...normal,
        longitudeDegrees: normal.longitudeDegrees + 0.01,
        sign: calculateMidheavenCandidate(input).sign,
        engine: normal.engine + "-mutated",
        source: normal.source + "-mutated",
      };
    },
  });
  assert.equal(result.status, "unresolved");
  assert.equal(result.reason, "midheaven_outside_tolerance");
});


test("Midheaven calculation rejects timezone-less instants", () => {
  assert.throws(
    () =>
      calculateMidheavenCandidate({
        inputTimestamp: "1990-09-17T15:11:00",
        latitude: 40.8448,
        longitude: -73.8648,
      }),
    /house_input_invalid/,
  );
});

test("Equal House verification rejects a Midheaven sign that contradicts longitude", () => {
  const fixture = SWISS_EQUAL_HOUSE_FIXTURES[0];
  const result = verifyEqualHouse(fixture, {
    midheavenReference: (input) => {
      const normal = calculateIndependentMidheavenReference(input);
      return {
        ...normal,
        longitudeDegrees: (normal.longitudeDegrees + 30) % 360,
      };
    },
  });

  assert.equal(result.status, "unresolved");
  if (result.status === "unresolved") {
    assert.equal(result.reason, "midheaven_sign_longitude_mismatch");
  }
});
