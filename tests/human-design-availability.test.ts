import assert from "node:assert/strict";
import test from "node:test";
import { humanDesignAvailability } from "../client/src/lib/humanDesignAvailability";

const complete = {
  birthDate: "1990-09-17", birthTime: "11:11", timezone: "America/New_York",
  latitude: "40.8448", longitude: "-73.8648",
};

test("complete birth data identifies failed or pending HD verification instead of missing information", () => {
  for (const data of [undefined, { status: "unavailable" }, { status: "calculated_unverified" }]) {
    const result = humanDesignAvailability({ ...complete, humanDesignData: data });
    assert.equal(result.state, "pending_verification");
    assert.deepEqual(result.missing, []);
    assert.match(result.message, /complete/);
    assert.doesNotMatch(result.message, /needs .*birth/);
  }
});

test("explicit unknown time overrides a stored default without inventing HD", () => {
  const result = humanDesignAvailability({ ...complete, birthTimeStatus: "unknown" });
  assert.equal(result.state, "missing_inputs");
  assert.deepEqual(result.missing, ["an exact birth time"]);
});

test("availability identifies missing resolved location and rejects invalid civil dates", () => {
  assert.deepEqual(humanDesignAvailability({ ...complete, longitude: "" }).missing, ["resolved birthplace coordinates"]);
  assert.deepEqual(humanDesignAvailability({ ...complete, birthDate: "2026-02-30" }).missing, ["a valid birth date"]);
  assert.deepEqual(humanDesignAvailability({ ...complete, timezone: "invalid" }).missing, ["the birthplace timezone"]);
});

test("completed full-day analysis has a separate state from missing inputs and exact verification", () => {
  assert.equal(humanDesignAvailability({ ...complete, birthTimeStatus: "unknown", humanDesignData: { status: "range_analyzed" } }).state, "range_analyzed");
});

test("complete-input calculation failure exposes the service diagnostic without calling inputs missing", () => {
  const result = humanDesignAvailability({ ...complete, humanDesignVerificationDiagnostic: { status: "unavailable", reason: "calculation_failed" } });
  assert.equal(result.state, "pending_verification");
  assert.match(result.message, /service could not finish/);
  assert.deepEqual(result.missing, []);
});
