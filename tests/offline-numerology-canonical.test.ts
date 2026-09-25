import assert from "node:assert/strict";
import test from "node:test";
import {
  generateOfflineCodexProfile,
} from "../packages/core/offline-codex/index.ts";
import {
  calcCoreNumerology,
} from "../packages/core/compute/numerology.ts";
import {
  calcPersonalYear,
} from "../packages/core/compute/personal-numbers.ts";

function profileFor(name: string, birthDate: string, currentYear = 2026) {
  return generateOfflineCodexProfile(
    {
      name,
      birthDate,
      birthLocation: "New York, NY",
      timezone: "America/New_York",
    },
    {
      id: "local-numerology-consistency",
      generatedAt: "2026-09-24T12:00:00.000Z",
      currentYear,
    },
  );
}

test("offline profile creation uses canonical numerology v3 immediately", () => {
  const name = "José Núñez";
  const birthDate = "1900-01-18";
  const currentYear = 2026;

  const expectedCore = calcCoreNumerology(birthDate, name);
  const expectedPersonalYear = calcPersonalYear(birthDate, currentYear);
  const profile = profileFor(name, birthDate, currentYear);

  assert.equal(expectedCore.lifePath, 11);
  assert.equal(profile.numerologyData.lifePath, expectedCore.lifePath);
  assert.equal(profile.numerologyData.birthday, expectedCore.birthday);
  assert.equal(profile.numerologyData.expression, expectedCore.expression);
  assert.equal(profile.numerologyData.soulUrge, expectedCore.soulUrge);
  assert.equal(profile.numerologyData.personality, expectedCore.personality);
  assert.equal(profile.numerologyData.maturity, expectedCore.maturity);
  assert.equal(profile.numerologyData.personalYear, expectedPersonalYear);
});

test("offline profile no longer uses raw date-sum Life Path convention", () => {
  const profile = profileFor("Master Case", "1900-08-31");

  // Canonical component-reduction convention yields 4.
  // The superseded raw date sum yielded 22.
  assert.equal(profile.numerologyData.lifePath, 4);
  assert.notEqual(profile.numerologyData.lifePath, 22);
});
