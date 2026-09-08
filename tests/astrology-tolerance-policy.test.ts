import assert from "node:assert/strict";
import test from "node:test";
import { proposeLongitudeTolerancePolicy } from "../server/services/astrology-tolerance-policy";
import { verifyAgainstIndependentReference } from "../server/services/astrology-verification";

const liveSummary = {
  totalRows: 40,
  signDisagreements: 0,
  maximumLongitudeDeltaDegrees: 0.0007351139863658318,
  sunMaximumDeltaDegrees: 0.0002682866178815857,
  moonMaximumDeltaDegrees: 0.0007351139863658318,
};

test("expanded live evidence produces a conservative draft tolerance without enabling promotion", () => {
  const proposal = proposeLongitudeTolerancePolicy(liveSummary, "expanded-live-receipt");

  assert.equal(proposal.policy.status, "draft");
  assert.equal(proposal.policy.maximumLongitudeDeltaDegrees, 0.001);
  assert.equal(proposal.promotionAllowed, false);
  assert.equal(proposal.evidence.totalRows, 40);
  assert.equal(proposal.evidence.signDisagreements, 0);
});

test("the draft proposal cannot verify a placement", () => {
  const proposal = proposeLongitudeTolerancePolicy(liveSummary, "expanded-live-receipt");
  const result = verifyAgainstIndependentReference({
    body: "Sun",
    sign: "Virgo",
    longitude: 174.25,
    source: "Astronomy Engine geocentric true-ecliptic-of-date calculation",
    engine: "astronomy-engine@2.1.19",
    calculatedAt: "2026-08-03T07:25:00.000Z",
    inputTimestamp: "1990-09-17T15:11:00.000Z",
  }, {
    body: "Sun",
    sign: "Virgo",
    longitude: 174.2502,
    source: "NASA/JPL Horizons API",
    engine: "NASA/JPL Horizons",
    calculatedAt: "2026-08-03T07:25:01.000Z",
    inputTimestamp: "1990-09-17T15:11:00.000Z",
  }, proposal.policy);

  assert.equal(result.status, "rejected");
  if (result.status === "rejected") assert.equal(result.reason, "policy_not_approved");
});

test("sign disagreements block even a draft proposal", () => {
  assert.throws(
    () => proposeLongitudeTolerancePolicy({ ...liveSummary, signDisagreements: 1 }, "run"),
    /sign_disagreement_present/,
  );
});

test("the old 10-row matrix no longer satisfies the evidence floor", () => {
  assert.throws(
    () => proposeLongitudeTolerancePolicy({ ...liveSummary, totalRows: 10 }, "run"),
    /insufficient_evidence_rows/,
  );
});

test("39 rows still cannot produce a proposal", () => {
  assert.throws(
    () => proposeLongitudeTolerancePolicy({ ...liveSummary, totalRows: 39 }, "run"),
    /insufficient_evidence_rows/,
  );
});

test("an evidence receipt identifier is mandatory", () => {
  assert.throws(
    () => proposeLongitudeTolerancePolicy(liveSummary, "  "),
    /evidence_receipt_id_required/,
  );
});
