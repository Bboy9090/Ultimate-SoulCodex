import assert from "node:assert";
import { test } from "node:test";
import {
  generateOfflineCodexProfile,
  isOfflineCodexProfile,
  validateDepthInterpretationV1,
} from "../../index.js";

const birthInput = {
  name: "Bobby Example",
  birthDate: "1990-09-17",
  birthTime: "11:11",
  birthLocation: "Bronx, New York",
  timezone: "America/New_York",
  latitude: "40.8448",
  longitude: "-73.8648",
};

test("Offline Codex runtime", async (suite) => {
  await suite.test("generates the same profile for the same fixed inputs", () => {
    const options = {
      id: "local-fixed-profile",
      generatedAt: "2026-07-24T20:00:00.000Z",
      currentYear: 2026,
    };
    const first = generateOfflineCodexProfile(birthInput, options);
    const second = generateOfflineCodexProfile(birthInput, options);

    assert.deepStrictEqual(first, second);
    assert.equal(first.astrologyData.sunSign, "Virgo");
    assert.equal(first.numerologyData.lifePath, 9);
    assert.equal(first.localOnly, true);
    assert.equal(first.syncStatus, "local-only");
    assert.equal(isOfflineCodexProfile(first), true);
  });

  await suite.test("produces a contract-valid evidence-linked depth interpretation", () => {
    const profile = generateOfflineCodexProfile(birthInput, {
      id: "local-depth-profile",
      generatedAt: "2026-07-24T20:00:00.000Z",
      currentYear: 2026,
    });
    const validation = validateDepthInterpretationV1(profile.depthInterpretation, {
      birthTimeStatus: "known",
    });

    assert.equal(validation.valid, true);
    assert.ok(profile.depthInterpretation.evidence.length >= 3);
    assert.notEqual(profile.depthInterpretation.claritySummary.claimKind, "unavailable");
    assert.match(profile.depthInterpretation.action.summary, /define|identify|finish|state|pause|protect|choose|ground|return|teach|lead|keep|reduce/i);
  });

  await suite.test("degrades time-sensitive claims when birth time is unknown", () => {
    const profile = generateOfflineCodexProfile(
      { ...birthInput, birthTime: undefined },
      {
        id: "local-unknown-time",
        generatedAt: "2026-07-24T20:00:00.000Z",
        currentYear: 2026,
      },
    );

    assert.ok(profile.depthInterpretation.missingData.some((item) => item.includes("Exact birth time is required")));
    assert.equal(profile.depthInterpretation.evidence.some((item) => item.id === "offline.astrology.rising"), false);
    assert.equal(profile.depthInterpretation.evidence.some((item) => item.id === "offline.astrology.moon"), false);
  });
});
