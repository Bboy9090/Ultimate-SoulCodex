import assert from "node:assert/strict";
import test from "node:test";
import { generateOfflineCodexProfile } from "../packages/core/offline-codex/index.ts";

const BASE = {
  name: "Evidence Boundary",
  birthDate: "1990-09-17",
  birthLocation: "Bronx, New York",
  timezone: "America/New_York",
};

test("offline interpretation never cites approximate Moon or Rising evidence", () => {
  const profile = generateOfflineCodexProfile(
    {
      ...BASE,
      birthTime: "11:11",
      latitude: "40.8448",
      longitude: "-73.8648",
    },
    {
      id: "boundary-a",
      generatedAt: "2026-09-20T00:10:00.000Z",
      currentYear: 2026,
    },
  );

  const ids = profile.depthInterpretation.evidence.map((entry) => entry.id);
  assert.ok(!ids.includes("offline.astrology.moon"));
  assert.ok(!ids.includes("offline.astrology.rising"));
  assert.match(profile.depthInterpretation.missingData.join(" "), /Moon/i);
  assert.match(profile.depthInterpretation.missingData.join(" "), /Rising/i);
});

test("unverified time and coordinates cannot alter offline synthesis", () => {
  const options = {
    generatedAt: "2026-09-20T00:10:00.000Z",
    currentYear: 2026,
  };
  const morning = generateOfflineCodexProfile(
    {
      ...BASE,
      birthTime: "06:05",
      latitude: "40.8448",
      longitude: "-73.8648",
    },
    { ...options, id: "boundary-morning" },
  );
  const night = generateOfflineCodexProfile(
    {
      ...BASE,
      birthTime: "23:55",
      latitude: "-33.8688",
      longitude: "151.2093",
    },
    { ...options, id: "boundary-night" },
  );

  assert.equal(morning.archetypeData.title, night.archetypeData.title);
  assert.equal(morning.biography, night.biography);
  assert.equal(morning.dailyGuidance, night.dailyGuidance);

  const stripGeneratedAt = (value: typeof morning.depthInterpretation) => ({
    ...value,
    generatedAt: "same",
  });
  assert.deepEqual(
    stripGeneratedAt(morning.depthInterpretation),
    stripGeneratedAt(night.depthInterpretation),
  );
});
