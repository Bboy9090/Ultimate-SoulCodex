import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVED_HUMAN_DESIGN_TRUST,
  hasVerifiedHumanDesignTrust,
} from "../packages/core/human-design-trust";
import {
  APPROVED_HUMAN_DESIGN_CORE_VERIFICATION,
  createVerifiedHumanDesignTrustRecord,
} from "../server/services/human-design-trust";

function flattenedVerifiedRecord() {
  const trust = createVerifiedHumanDesignTrustRecord({
    birthTimeKnown: true,
    inputTimestampUtc: "1990-09-17T15:11:00.000Z",
    calculatedAt: "2026-09-26T18:00:00.000Z",
    candidate: {
      type: "Reflector",
      strategy: "Wait a lunar cycle",
      authority: "Lunar Authority",
      profile: "2/5",
    },
  });

  assert.equal(trust.status, "verified");
  if (trust.status !== "verified") throw new Error("fixture did not verify");

  return {
    status: trust.status,
    type: trust.candidate.type,
    strategy: trust.candidate.strategy,
    authority: trust.candidate.authority,
    profile: trust.candidate.profile,
    engine: trust.engine,
    source: trust.source,
    calculatedAt: trust.calculatedAt,
    inputTimestampUtc: trust.inputTimestampUtc,
    verificationReceiptId: trust.verificationReceiptId,
    independentSource: trust.independentSource,
    verifiedAt: trust.verifiedAt,
  };
}

test("server Human Design approval constants match the core consumer authority", () => {
  assert.equal(
    APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.engine,
    APPROVED_HUMAN_DESIGN_TRUST.engine,
  );
  assert.equal(
    APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.verificationReceiptId,
    APPROVED_HUMAN_DESIGN_TRUST.verificationReceiptId,
  );
  assert.equal(
    APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.independentSource,
    APPROVED_HUMAN_DESIGN_TRUST.independentSource,
  );
  assert.equal(
    APPROVED_HUMAN_DESIGN_CORE_VERIFICATION.approvedAt,
    APPROVED_HUMAN_DESIGN_TRUST.verifiedAt,
  );
});

test("profile-route flattened verified Human Design passes the core consumer gate", () => {
  const record = flattenedVerifiedRecord();
  assert.equal(hasVerifiedHumanDesignTrust(record), true);

  const readingAlias = {
    ...record,
    profile: undefined,
    profileType: record.profile,
  };
  assert.equal(hasVerifiedHumanDesignTrust(readingAlias), true);
});

test("core consumer Human Design gate fails closed on every trust mutation", () => {
  const record = flattenedVerifiedRecord();

  const mutations: Array<Record<string, unknown>> = [
    { status: "calculated_unverified" },
    { engine: "wrong-engine" },
    { source: "" },
    { calculatedAt: "not-a-date" },
    { inputTimestampUtc: "1990-09-17T11:11:00-04:00" },
    { verificationReceiptId: "wrong-receipt" },
    { independentSource: "wrong-verifier" },
    { verifiedAt: "2026-09-20T00:00:00.000Z" },
    { strategy: "To Respond" },
    { authority: "Sacral Authority" },
    { profile: "9/9" },
  ];

  for (const mutation of mutations) {
    assert.equal(
      hasVerifiedHumanDesignTrust({ ...record, ...mutation }),
      false,
      JSON.stringify(mutation),
    );
  }
});
