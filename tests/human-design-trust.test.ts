import assert from "node:assert/strict";
import test from "node:test";

import {
  createHumanDesignTrustRecord,
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
      strategy: "Wait a lunar cycle",
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
