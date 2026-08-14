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

test("verification route is isolated from profile persistence and AI generation", () => {
  const source = readFileSync("server/routes/profile-verification.ts", "utf8");
  const server = readFileSync("server/index.ts", "utf8");

  assert.match(source, /persistedProfile: false/);
  assert.match(source, /aiGeneration: false/);
  assert.doesNotMatch(source, /from "\.\.\/storage/);
  assert.doesNotMatch(source, /generateBiography|generateDailyGuidance|openai/i);
  assert.match(server, /registerProfileVerificationRoutes\(app\)/);
});
