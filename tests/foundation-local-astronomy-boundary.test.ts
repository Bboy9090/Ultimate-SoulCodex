import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { generateFoundationOfflineCodexProfile } from "../client/src/lib/foundationOfflineCodex.ts";

const baseInput = {
  name: "Boundary Test",
  birthDate: "1990-09-17",
  birthLocation: "Bronx, New York",
  timezone: "America/New_York",
  latitude: "40.8448",
  longitude: "-73.8648",
};

function evidenceIds(profile: ReturnType<typeof generateFoundationOfflineCodexProfile>) {
  return JSON.stringify(profile.depthInterpretation);
}

test("known birth time does not authorize fabricated local Moon, Rising, planets, houses, or aspects", () => {
  const profile = generateFoundationOfflineCodexProfile(
    { ...baseInput, birthTime: "11:11" },
    { id: "local-known-time", generatedAt: "2026-08-14T00:00:00.000Z", currentYear: 2026 },
  );

  assert.equal(profile.astrologyData.sunSign, "Virgo");
  assert.equal(profile.astrologyData.moonSign, "");
  assert.equal(profile.astrologyData.risingSign, "");
  assert.deepEqual(profile.astrologyData.planets, {});
  assert.deepEqual(profile.astrologyData.houses, []);
  assert.deepEqual(profile.astrologyData.aspects, []);
  assert.equal(profile.astrologyData.northNode, null);
  assert.equal(profile.astrologyData.southNode, null);
  assert.equal(profile.astrologyData.chiron, null);

  const serialized = evidenceIds(profile);
  assert.match(serialized, /offline\.astrology\.sun/);
  assert.doesNotMatch(serialized, /offline\.astrology\.moon/);
  assert.doesNotMatch(serialized, /offline\.astrology\.rising/);
  assert.match(serialized, /Moon sign is unavailable in local mode/);
  assert.match(serialized, /Planetary positions, houses, aspects, nodes, Chiron, and Midheaven are unavailable/);
});

test("blank birth time remains an explicit unknown state without changing the no-fabrication boundary", () => {
  const profile = generateFoundationOfflineCodexProfile(
    { ...baseInput, birthTime: "" },
    { id: "local-unknown-time", generatedAt: "2026-08-14T00:00:00.000Z", currentYear: 2026 },
  );

  assert.equal(profile.birthTime, null);
  assert.equal(profile.astrologyData.moonSign, "");
  assert.equal(profile.astrologyData.risingSign, "");
  assert.deepEqual(profile.astrologyData.planets, {});
  assert.deepEqual(profile.astrologyData.houses, []);
  assert.deepEqual(profile.astrologyData.aspects, []);
});

test("production create and Identity surfaces use the Foundation-safe path and never render the random chart", () => {
  const createSource = readFileSync("client/src/pages/local-first-input-form.tsx", "utf8");
  const identitySource = readFileSync("client/src/pages/offline-profile.tsx", "utf8");
  const chartSource = readFileSync("client/src/components/cosmic-chart.tsx", "utf8");

  assert.match(createSource, /generateFoundationOfflineCodexProfile/);
  assert.doesNotMatch(createSource, /generateOfflineCodexProfile\(/);
  assert.doesNotMatch(identitySource, /CosmicChart/);
  assert.match(identitySource, /local-astronomy-unresolved-panel/);
  assert.match(identitySource, /does not draw sample planets, random aspects, approximate houses, or an invented wheel/);

  // The legacy component still exists for archival/refactor purposes, so guard
  // the production router from ever importing it while it contains sample math.
  assert.match(chartSource, /Math\.random\(\)/);
});
