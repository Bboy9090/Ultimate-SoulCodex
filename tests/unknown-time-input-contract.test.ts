import assert from "node:assert/strict";
import test from "node:test";
import { birthDataSchema } from "../shared/schema.ts";

const base = {
  name: "Unknown Time Test",
  birthDate: "1990-09-17",
  birthLocation: "Bronx, New York",
  timezone: "America/New_York",
  latitude: "40.8448",
  longitude: "-73.8648",
};

test("blank birth time is accepted as an explicit unknown state", () => {
  const parsed = birthDataSchema.parse({ ...base, birthTime: "" });
  assert.equal(parsed.birthTime, "");
});

test("untimed local profiles do not require a timezone", () => {
  const parsed = birthDataSchema.parse({
    ...base,
    birthTime: "",
    timezone: "",
    latitude: "",
    longitude: "",
  });
  assert.equal(parsed.timezone, "");
});

test("timed profiles require a valid timezone and bounded coordinates", () => {
  assert.throws(
    () => birthDataSchema.parse({ ...base, birthTime: "11:11", timezone: "" }),
    /Timezone is required when birth time is provided/,
  );
  assert.throws(
    () => birthDataSchema.parse({ ...base, birthTime: "11:11", timezone: "local" }),
    /valid IANA timezone/,
  );
  assert.throws(
    () => birthDataSchema.parse({ ...base, birthTime: "11:11", latitude: "abc" }),
    /Latitude must be a finite number/,
  );
  assert.throws(
    () => birthDataSchema.parse({ ...base, birthTime: "11:11", longitude: "200" }),
    /Longitude must be a finite number/,
  );
});

test("a provided birth time must use HH:MM instead of accepting arbitrary text", () => {
  assert.throws(() => birthDataSchema.parse({ ...base, birthTime: "not-a-time" }), /Birth time must use HH:MM/);
  assert.equal(birthDataSchema.parse({ ...base, birthTime: "11:11" }).birthTime, "11:11");
});


test("remembered birth time is accepted without forcing certificate-grade provenance", () => {
  const parsed = birthDataSchema.parse({
    ...base,
    birthTime: "11:11",
    birthTimeAccuracy: "recalled",
  });
  assert.equal(parsed.birthTimeAccuracy, "recalled");
});

test("approximate birth time requires an explicit uncertainty window", () => {
  assert.throws(
    () =>
      birthDataSchema.parse({
        ...base,
        birthTime: "11:00",
        birthTimeAccuracy: "estimated",
      }),
    /Approximate birth time requires an uncertainty window/,
  );

  const parsed = birthDataSchema.parse({
    ...base,
    birthTime: "11:00",
    birthTimeAccuracy: "estimated",
    birthTimeUncertaintyMinutes: 30,
  });
  assert.equal(parsed.birthTimeUncertaintyMinutes, 30);
});

test("unknown birth time cannot claim recorded or recalled provenance", () => {
  assert.throws(
    () =>
      birthDataSchema.parse({
        ...base,
        birthTime: "",
        birthTimeAccuracy: "recorded",
      }),
    /Birth-time accuracy cannot be set when birth time is unknown/,
  );
});
