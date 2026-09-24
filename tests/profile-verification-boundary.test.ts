import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { profileVerificationRequestSchema } from "../server/routes/profile-verification.ts";

const minimal = {
  birthDate: "1990-09-17",
  birthTime: "11:11",
  timezone: "America/New_York",
  latitude: "40.8448",
  longitude: "-73.8648",
};

test("astronomy verification accepts only calculation inputs and rejects unrelated profile data", () => {
  assert.deepEqual(profileVerificationRequestSchema.parse(minimal), {
    birthDate: "1990-09-17",
    birthTime: "11:11",
    timezone: "America/New_York",
    latitude: 40.8448,
    longitude: -73.8648,
  });

  assert.equal(
    profileVerificationRequestSchema.safeParse({ ...minimal, name: "Should not be sent" }).success,
    false,
  );
  assert.equal(
    profileVerificationRequestSchema.safeParse({ ...minimal, birthLocation: "Bronx, New York" }).success,
    false,
  );
});

test("astronomy verification supports unknown birth time without inventing one", () => {
  assert.equal(profileVerificationRequestSchema.parse({ ...minimal, birthTime: "" }).birthTime, "");
  assert.equal(profileVerificationRequestSchema.parse({
    birthDate: minimal.birthDate,
    timezone: minimal.timezone,
    latitude: minimal.latitude,
    longitude: minimal.longitude,
  }).birthTime, undefined);
});


test("astronomy verification rejects impossible calendar and clock values", () => {
  for (const birthDate of ["1990-02-30", "1990-13-01", "not-a-date"]) {
    assert.equal(
      profileVerificationRequestSchema.safeParse({ ...minimal, birthDate }).success,
      false,
      birthDate,
    );
  }

  for (const birthTime of ["24:00", "11:60", "9:30", "99:99"]) {
    assert.equal(
      profileVerificationRequestSchema.safeParse({ ...minimal, birthTime }).success,
      false,
      birthTime,
    );
  }
});

test("astronomy verification rejects bogus timezones and incomplete coordinate pairs", () => {
  assert.equal(
    profileVerificationRequestSchema.safeParse({
      ...minimal,
      timezone: "Mars/Olympus",
    }).success,
    false,
  );

  const { longitude: _longitude, ...latitudeOnly } = minimal;
  assert.equal(profileVerificationRequestSchema.safeParse(latitudeOnly).success, false);

  const { latitude: _latitude, ...longitudeOnly } = minimal;
  assert.equal(profileVerificationRequestSchema.safeParse(longitudeOnly).success, false);
});

test("verification route is isolated from profile persistence and AI generation", () => {
  const source = readFileSync("server/routes/profile-verification.ts", "utf8");
  const server = readFileSync("server/index.ts", "utf8");

  assert.match(source, /persistedProfile: false/);
  assert.match(source, /aiGeneration: false/);
  assert.doesNotMatch(source, /from "\.\.\/storage/);
  assert.doesNotMatch(source, /generateBiography|generateDailyGuidance|openai/i);
  assert.doesNotMatch(source, /fromZonedTime/);
  assert.match(source, /moon\.internalCandidate\?\.inputTimestamp/);
  assert.match(server, /registerProfileVerificationRoutes\(app\)/);
});
