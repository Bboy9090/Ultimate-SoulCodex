import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { generateFoundationOfflineCodexProfile } from "../client/src/lib/foundationOfflineCodex.ts";

const birth = {
  name: "Test Person",
  fullBirthName: "Test Full Name",
  birthDate: "1990-09-17",
  birthTime: "",
  birthLocation: "Bronx, New York",
  timezone: "America/New_York",
  latitude: "40.8448",
  longitude: "-73.8648",
};

test("Free local generation keeps date numerology but excludes paid name numerology from synthesis", () => {
  const profile = generateFoundationOfflineCodexProfile(birth as any, {
    generatedAt: "2026-10-11T20:00:00.000Z",
    currentYear: 2026,
    includeNameNumerology: false,
  });

  assert.equal(profile.fullBirthName, "Test Full Name");
  assert.equal(typeof profile.numerologyData.lifePath, "number");
  assert.equal(typeof profile.numerologyData.birthday, "number");
  assert.equal(typeof profile.numerologyData.personalYear, "number");
  assert.equal(profile.numerologyData.expression, null);
  assert.equal(profile.numerologyData.soulUrge, null);
  assert.equal(profile.numerologyData.personality, null);
  assert.equal(profile.numerologyData.maturity, null);
  assert.match(profile.numerologyData.interpretations.expression, /reserved for Soul Codex\+ depth/);
  assert.match(profile.biography, /Name-based numerology remains outside this Free local synthesis/);
  assert.equal(profile.depthInterpretation.evidence.some((entry: any) => entry.field === "expression"), false);
  assert.equal(profile.depthInterpretation.evidence.some((entry: any) => entry.field === "soulUrge"), false);
});

test("Plus local generation preserves deterministic full-name numerology depth", () => {
  const profile = generateFoundationOfflineCodexProfile(birth as any, {
    generatedAt: "2026-10-11T20:00:00.000Z",
    currentYear: 2026,
    includeNameNumerology: true,
  });

  assert.equal(typeof profile.numerologyData.expression, "number");
  assert.equal(typeof profile.numerologyData.soulUrge, "number");
  assert.equal(typeof profile.numerologyData.personality, "number");
  assert.equal(typeof profile.numerologyData.maturity, "number");
  assert.equal(profile.depthInterpretation.evidence.some((entry: any) => entry.field === "expression"), true);
});

test("local create uses live product tier and local repair uses only bounded cached Plus", () => {
  const createPage = readFileSync(new URL("../client/src/pages/local-first-input-form.tsx", import.meta.url), "utf8");
  const repoSource = readFileSync(new URL("../client/src/lib/ActiveProfileRepository.ts", import.meta.url), "utf8");

  assert.match(createPage, /useProductAccess\(\)/);
  assert.match(createPage, /includeNameNumerology: tier === "plus"/);

  assert.match(repoSource, /readBoundedOfflinePlus/);
  assert.match(repoSource, /includeNameNumerology: Boolean\(readBoundedOfflinePlus\(\)\)/);
});
