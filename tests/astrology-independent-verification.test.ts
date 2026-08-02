import assert from "node:assert/strict";
import test from "node:test";
import {
  verifyAgainstIndependentReference,
  type EphemerisCandidate,
  type IndependentEphemerisReference,
  type VerificationPolicy,
} from "../server/services/astrology-verification";

const candidate: EphemerisCandidate = {
  sign: "Virgo",
  longitude: 174.25,
  source: "Astronomy Engine geocentric true-ecliptic-of-date calculation",
  engine: "astronomy-engine@2.1.19",
  calculatedAt: "2026-08-02T23:00:00.000Z",
  inputTimestamp: "1990-09-17T15:11:00.000Z",
};

const reference: IndependentEphemerisReference = {
  body: "Sun",
  sign: "Virgo",
  longitude: 174.27,
  source: "Independent checked reference fixture",
  engine: "independent-engine@1.0.0",
  calculatedAt: "2026-08-02T23:01:00.000Z",
  inputTimestamp: "1990-09-17T15:11:00.000Z",
};

const approvedPolicy: VerificationPolicy = {
  status: "approved",
  policyId: "ASTRO-LONGITUDE-v1",
  maximumLongitudeDeltaDegrees: 0.1,
  approvedAt: "2026-08-02T23:02:00.000Z",
};

test("approved independent agreement can produce a verified result", () => {
  const result = verifyAgainstIndependentReference(candidate, reference, approvedPolicy);

  assert.equal(result.status, "verified");
  if (result.status !== "verified") return;
  assert.equal(result.sign, "Virgo");
  assert.equal(result.policyId, "ASTRO-LONGITUDE-v1");
  assert.ok(result.longitudeDeltaDegrees <= 0.1);
  assert.equal(result.candidate.engine, "astronomy-engine@2.1.19");
  assert.equal(result.reference.engine, "independent-engine@1.0.0");
});

test("draft policy cannot promote a candidate", () => {
  const result = verifyAgainstIndependentReference(candidate, reference, {
    ...approvedPolicy,
    status: "draft",
    approvedAt: undefined,
  });

  assert.deepEqual(result, {
    status: "rejected",
    sign: null,
    reason: "policy_not_approved",
    longitudeDeltaDegrees: null,
  });
});

test("the same engine cannot verify itself", () => {
  const result = verifyAgainstIndependentReference(candidate, {
    ...reference,
    engine: candidate.engine,
  }, approvedPolicy);

  assert.equal(result.status, "rejected");
  if (result.status === "rejected") assert.equal(result.reason, "same_engine_not_independent");
});

test("timestamp mismatch blocks promotion", () => {
  const result = verifyAgainstIndependentReference(candidate, {
    ...reference,
    inputTimestamp: "1990-09-17T15:12:00.000Z",
  }, approvedPolicy);

  assert.equal(result.status, "rejected");
  if (result.status === "rejected") assert.equal(result.reason, "timestamp_mismatch");
});

test("sign disagreement blocks promotion even when longitude values are near a boundary", () => {
  const result = verifyAgainstIndependentReference({
    ...candidate,
    sign: "Virgo",
    longitude: 179.99,
  }, {
    ...reference,
    sign: "Libra",
    longitude: 180.01,
  }, approvedPolicy);

  assert.equal(result.status, "rejected");
  if (result.status === "rejected") assert.equal(result.reason, "sign_disagreement");
});

test("longitude outside the approved tolerance blocks promotion", () => {
  const result = verifyAgainstIndependentReference(candidate, {
    ...reference,
    longitude: 174.5,
  }, approvedPolicy);

  assert.equal(result.status, "rejected");
  if (result.status === "rejected") assert.equal(result.reason, "longitude_outside_tolerance");
});
