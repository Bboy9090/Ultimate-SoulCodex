import assert from "node:assert/strict";
import test from "node:test";
import { birthEvidenceInput, sameBirthEvidenceInput } from "../client/src/lib/profileBirthEvidence";

const valid = {
  birthDate: "1990-09-17",
  birthTime: "11:11",
  timezone: "America/New_York",
  latitude: "40.8448",
  longitude: "-73.8648",
};

test("canonical decimal coordinates preserve identical verified birth evidence", () => {
  const text = birthEvidenceInput(valid);
  const numeric = birthEvidenceInput({ ...valid, latitude: 40.8448, longitude: -73.8648 });
  assert.ok(text);
  assert.ok(numeric);
  assert.equal(text.latitude, 40.8448);
  assert.equal(text.longitude, -73.8648);
  assert.equal(sameBirthEvidenceInput(text, numeric), true);
});

test("malformed coordinates are never accepted as natal verification bindings", () => {
  for (const invalid of ["0x28", "0b1010", "4e1", "Infinity", "NaN", "40,84", "++40", "41 degrees"]) {
    assert.equal(birthEvidenceInput({ ...valid, latitude: invalid }), null, invalid);
    assert.equal(birthEvidenceInput({ ...valid, longitude: invalid }), null, invalid);
  }
});

test("latitude/longitude bounds reject invalid values without a fallback location", () => {
  for (const [latitude, longitude] of [["90.01", "0"], ["0", "180.001"], ["-90.001", "0"], ["0", "-180.001"]]) {
    assert.equal(birthEvidenceInput({ ...valid, latitude, longitude }), null);
  }
  assert.equal(birthEvidenceInput({ ...valid, latitude: "-90", longitude: "+180" })?.latitude, -90);
});

test("missing location stays explicitly unresolved, never a fabricated origin", () => {
  const result = birthEvidenceInput({ ...valid, latitude: null, longitude: "" });
  assert.ok(result);
  assert.equal(result.latitude, null);
  assert.equal(result.longitude, null);
});
