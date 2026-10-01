import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calcPersonalYear } from "../packages/core/compute/personal-numbers.ts";
import { generateFoundationOfflineCodexProfile } from "../client/src/lib/foundationOfflineCodex.ts";

const sourceUrl = new URL("../client/src/lib/foundationOfflineCodex.ts", import.meta.url);

test("Foundation local profile uses canonical Personal Year engine", () => {
  const profile = generateFoundationOfflineCodexProfile(
    {
      name: "Test Person",
      fullBirthName: "Test Person",
      birthDate: "1990-09-17",
      birthTime: "",
      birthLocation: "Bronx, NY",
      timezone: "America/New_York",
      latitude: "40.8448",
      longitude: "-73.8648",
    } as any,
    { generatedAt: "2026-10-01T16:00:00.000Z", currentYear: 2026 },
  );

  assert.equal(profile.numerologyData.personalYear, calcPersonalYear("1990-09-17", 2026));
});

test("Foundation client does not maintain a second Personal Year reducer", async () => {
  const source = await readFile(sourceUrl, "utf8");
  assert.match(source, /calcPersonalYear\(input\.birthDate, currentYear\)/);
  assert.doesNotMatch(source, /function personalYear\(/);
  assert.doesNotMatch(source, /function reduceNumber\(/);
});
