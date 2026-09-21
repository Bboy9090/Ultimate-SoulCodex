import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { profileVerificationRequestSchema } from "../server/routes/profile-verification.ts";
import { calculateVerifiedHumanDesignCore } from "../server/services/human-design-core-verification.ts";

const minimal = {
  birthDate: "1990-09-17",
  birthTime: "11:11",
  timezone: "America/New_York",
  latitude: "40.8448",
  longitude: "-73.8648",
};

test("profile verification accepts only calculation inputs and rejects unrelated profile data", () => {
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

test("profile verification supports unknown birth time without inventing one", () => {
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


test("verified Human Design response is limited to the independently qualified core", () => {
  const result = calculateVerifiedHumanDesignCore({
    birthDate: "1990-09-17",
    birthTime: "11:11",
    timezone: "America/New_York",
    latitude: 40.8448,
    longitude: -73.8648,
    inputTimestampUtc: "1990-09-17T15:11:00.000Z",
  });

  assert.ok(result);
  assert.equal(result.status, "verified");
  assert.equal(result.policyId, "HUMAN-DESIGN-CORE-v1");
  assert.equal(result.type, "Reflector");
  assert.equal(result.profile, "2/5");
  assert.equal(result.trust.status, "verified");
  assert.equal(
    result.trust.verificationReceiptId,
    "35474994858:human-design-repair-audit",
  );
  assert.equal("variables" in result, false);
  assert.equal("incarnationCross" in result, false);
});

test("verified Human Design core fails closed without exact timed coordinates", () => {
  assert.equal(
    calculateVerifiedHumanDesignCore({
      birthDate: "1990-09-17",
      timezone: "America/New_York",
      latitude: 40.8448,
      longitude: -73.8648,
      inputTimestampUtc: "1990-09-17T15:11:00.000Z",
    }),
    null,
  );
  assert.equal(
    calculateVerifiedHumanDesignCore({
      birthDate: "1990-09-17",
      birthTime: "11:11",
      timezone: "America/New_York",
      inputTimestampUtc: "1990-09-17T15:11:00.000Z",
    }),
    null,
  );
});

test("verification route reports the combined evidence-only purpose", () => {
  const source = readFileSync("server/routes/profile-verification.ts", "utf8");
  assert.match(
    source,
    /astronomy_and_human_design_core_verification_only/,
  );
  assert.match(source, /humanDesignData/);
});
