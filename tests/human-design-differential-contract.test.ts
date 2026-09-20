import assert from "node:assert/strict";
import test from "node:test";
import { calculateHumanDesign } from "../packages/astrology/human-design";

const input = {
  name: "Determinism",
  birthDate: "1990-09-17",
  birthTime: "11:11",
  birthLocation: "Bronx, New York",
  timezone: "America/New_York",
  latitude: "40.8448",
  longitude: "-73.8648",
};

test("Human Design calculation is deterministic for identical exact inputs", () => {
  const first = calculateHumanDesign(input);
  const second = calculateHumanDesign(input);
  assert.deepEqual(first, second);
});

test("Human Design fails closed when exact birth time is missing", () => {
  const result = calculateHumanDesign({...input,birthTime:""});
  assert.equal(result.status,"unresolved");
  if (result.status === "unresolved") {
    assert.equal(result.reason,"missing_birth_time");
  }
});

test("current resolved chart exposes 26 activation slots for differential audit", () => {
  const result = calculateHumanDesign(input);
  assert.equal(result.status,"resolved");
  if (result.status !== "resolved") return;
  assert.equal(Object.keys(result.activations.conscious).length,13);
  assert.equal(Object.keys(result.activations.unconscious).length,13);
});
