import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { calculateKnownTimeHumanDesign, HumanDesignVerificationError, profileVerificationRequestSchema } from "../server/routes/profile-verification.ts";

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

test("complete known-time inputs calculate a real Human Design on the first request", () => {
  const input = profileVerificationRequestSchema.parse(minimal);
  const result = calculateKnownTimeHumanDesign({ ...input, birthTime: input.birthTime!, latitude: input.latitude!, longitude: input.longitude! });
  assert.equal(result.status, "resolved");
  assert.equal(result.type, "Reflector");
  assert.equal(result.profile, "2/5");
  assert.ok(result.activatedGates.length > 0);
});

test("invalid calendar, clock, timezone, and ambiguous civil inputs are rejected before calculation", () => {
  for (const patch of [
    { birthDate: "1990-02-30" },
    { birthTime: "25:00" },
    { timezone: "Mars/Olympus" },
    { birthDate: "2024-11-03", birthTime: "01:30" },
    { birthDate: "2024-03-10", birthTime: "02:30" },
  ]) assert.equal(profileVerificationRequestSchema.safeParse({ ...minimal, ...patch }).success, false);
});

test("unresolved Human Design cannot silently produce a successful null result", () => {
  assert.throws(() => calculateKnownTimeHumanDesign({
    birthDate: "1990-09-17", birthTime: "25:00", timezone: "America/New_York", latitude: 40.8448, longitude: -73.8648,
  }), HumanDesignVerificationError);
});

test("zero latitude and longitude remain valid known-time calculation inputs", () => {
  const result = calculateKnownTimeHumanDesign({
    birthDate: "1990-09-17", birthTime: "15:11", timezone: "Etc/UTC", latitude: 0, longitude: 0,
  });
  assert.equal(result.status, "resolved");
  assert.equal(result.type, "Reflector");
  assert.equal(result.profile, "2/5");
  const utcAlias = calculateKnownTimeHumanDesign({
    birthDate: "1990-09-17", birthTime: "15:11", timezone: "UTC", latitude: 0, longitude: 0,
  });
  assert.equal(utcAlias.type, result.type);
  assert.equal(utcAlias.profile, result.profile);
  assert.equal(utcAlias.authority, result.authority);
  assert.deepEqual(utcAlias.activations, result.activations);
  assert.deepEqual(utcAlias.centers, result.centers);
  assert.deepEqual(utcAlias.channels, result.channels);
});
