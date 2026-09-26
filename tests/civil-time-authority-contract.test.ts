import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const profileVerification = readFileSync(
  "server/routes/profile-verification.ts",
  "utf8",
);
const humanDesign = readFileSync(
  "packages/astrology/human-design.ts",
  "utf8",
);
const strictCivilTime = readFileSync(
  "packages/core/compute/civil-time.ts",
  "utf8",
);

test("strict civil-time resolver remains the timezone authority", () => {
  assert.match(strictCivilTime, /export function resolveCivilTimeStrict/);
  assert.match(strictCivilTime, /status: 'nonexistent'/);
  assert.match(strictCivilTime, /status: 'ambiguous'/);
  assert.match(strictCivilTime, /candidateUtcOffsetsMinutes/);
});

test("profile verification cannot bypass strict civil-time resolution", () => {
  assert.match(profileVerification, /resolveCivilTimeStrict/);
  assert.doesNotMatch(profileVerification, /fromZonedTime/);
  assert.match(
    profileVerification,
    /civilTime\.status !== "valid" \|\| !civilTime\.utc/,
  );
  assert.match(profileVerification, /candidateUtcOffsetsMinutes\[0\]/);
});

test("Human Design uses the same strict birth-instant authority", () => {
  assert.match(humanDesign, /resolveCivilTimeStrict/);
  assert.doesNotMatch(humanDesign, /fromZonedTime/);
  assert.match(humanDesign, /nonexistent_local_time/);
  assert.match(humanDesign, /ambiguous_local_time/);
  assert.match(humanDesign, /const birthTimeUTC = civilTime\.utc/);
});

test("governed birth-time paths do not normalize DST gaps or repeated hours", () => {
  for (const source of [profileVerification, humanDesign]) {
    assert.doesNotMatch(
      source,
      /new Date\([^\n]*(birthDate|birthTime)[^\n]*\)/,
    );
  }
});
