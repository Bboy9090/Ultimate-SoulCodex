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


test("offline depth prose avoids legacy repetitive synthesis stems", () => {
  const profiles = [
    generateOfflineCodexProfile(
      { ...BASE, name: "Ada Lovelace", birthDate: "1815-12-10" },
      { id: "offline-repetition-a", generatedAt: "2026-09-30T00:00:00.000Z", currentYear: 2026 },
    ),
    generateOfflineCodexProfile(
      { ...BASE, name: "Grace Hopper", birthDate: "1906-12-09" },
      { id: "offline-repetition-b", generatedAt: "2026-09-30T00:00:00.000Z", currentYear: 2026 },
    ),
    generateOfflineCodexProfile(
      { ...BASE, name: "Katherine Johnson", birthDate: "1918-08-26" },
      { id: "offline-repetition-c", generatedAt: "2026-09-30T00:00:00.000Z", currentYear: 2026 },
    ),
  ];

  const rendered = profiles.flatMap((profile) =>
    Object.values(profile.depthInterpretation)
      .filter((value): value is { summary: string; explanation: string } =>
        Boolean(value) &&
        typeof value === "object" &&
        "summary" in value &&
        "explanation" in value,
      )
      .flatMap((layer) => [layer.summary, layer.explanation]),
  ).join("\n");

  assert.doesNotMatch(rendered, /A central pattern emphasizes/i);
  assert.doesNotMatch(rendered, /The pattern may be trying to preserve/i);
  assert.doesNotMatch(rendered, /The numerology layer adds a theme/i);
  assert.doesNotMatch(rendered, /Protection may become organized around/i);
});
