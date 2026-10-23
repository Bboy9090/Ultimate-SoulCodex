import assert from "node:assert/strict";
import test from "node:test";
import { galacticProfileRevision } from "../server/services/galactic-code-revision";

const base = {
  birthDate: new Date("1990-09-17T00:00:00Z"),
  birthTime: "11:11", timezone: "America/New_York",
  latitude: "40.85", longitude: "-73.88", fullBirthName: "Test Person",
} as any;

test("profile revision is deterministic for unchanged identity fields", () => {
  assert.equal(galacticProfileRevision(base), galacticProfileRevision({ ...base }));
  assert.match(galacticProfileRevision(base), /^[a-f0-9]{64}$/);
});

test("changes to birth date, time, zone, location or name invalidate revision", () => {
  const original = galacticProfileRevision(base);
  const changes = [
    { birthDate: new Date("1990-09-18T00:00:00Z") },
    { birthTime: "11:12" }, { timezone: "America/Chicago" },
    { latitude: "40.86" }, { longitude: "-73.87" },
    { fullBirthName: "Another Person" },
  ];
  for (const change of changes) {
    assert.notEqual(galacticProfileRevision({ ...base, ...change }), original);
  }
});

test("invalid date or coordinates cannot create a cache revision", () => {
  assert.throws(() => galacticProfileRevision({ ...base, birthDate: new Date("bad") }));
  assert.throws(() => galacticProfileRevision({ ...base, latitude: "invalid" }));
});
