import test from "node:test";
import assert from "node:assert/strict";
import { storedBirthDateToDateOnly, serializeProfileForJson } from "../server/lib/profile-json";

test("stored UTC-midnight birth dates serialize as the original calendar date", () => {
  const value = new Date("1990-09-17T00:00:00.000Z");
  assert.equal(storedBirthDateToDateOnly(value), "1990-09-17");
});

test("stored ISO strings are normalized to date-only values", () => {
  assert.equal(
    storedBirthDateToDateOnly("1990-09-17T00:00:00.000Z"),
    "1990-09-17",
  );
});

test("profile JSON serializer never exposes birthDate as a timestamp", () => {
  const serialized = serializeProfileForJson({
    id: "profile-1",
    birthDate: new Date("1990-09-17T00:00:00.000Z"),
    name: "Example",
  });

  assert.equal(serialized.birthDate, "1990-09-17");
  assert.doesNotMatch(serialized.birthDate, /T|Z/);
});

test("invalid stored birth dates fail closed", () => {
  assert.throws(
    () => storedBirthDateToDateOnly("not-a-date"),
    /Date must use YYYY-MM-DD|Stored birth date/,
  );
});
