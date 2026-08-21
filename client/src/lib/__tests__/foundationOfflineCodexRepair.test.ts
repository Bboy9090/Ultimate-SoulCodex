import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  generateFoundationOfflineCodexProfile,
  repairFoundationOfflineCodexProfile,
} from "../foundationOfflineCodex";

describe("repairFoundationOfflineCodexProfile", () => {
  it("rebuilds stale Life Path 8 synthesis as 9 without removing verified astrology", () => {
    const generatedAt = "2026-08-21T12:00:00.000Z";
    const correct = generateFoundationOfflineCodexProfile(
      {
        name: "robert gonzalez",
        birthDate: "1990-09-17",
        birthTime: "11:11",
        birthLocation: "Bronx, New York",
        timezone: "America/New_York",
        latitude: "40.8448",
        longitude: "-73.8648",
      },
      { id: "local-test", generatedAt, currentYear: 2026 },
    );
    const stale = {
      ...correct,
      numerologyData: { ...correct.numerologyData, lifePath: 8 },
      biography: correct.biography.replace("Life Path 9", "Life Path 8"),
      verifiedAstrologyData: {
        sun: { verificationStatus: "verified", sign: "Virgo" },
        moon: { verificationStatus: "verified", sign: "Virgo" },
        rising: { verificationStatus: "verified", sign: "Scorpio" },
      },
    };

    const repaired = repairFoundationOfflineCodexProfile(stale, {
      repairedAt: "2026-08-21T13:00:00.000Z",
      currentYear: 2026,
    });

    assert.equal(repaired.numerologyData.lifePath, 9);
    assert.match(repaired.biography, /Life Path 9/);
    assert.match(repaired.archetypeData.description, /Life Path 9/);
    assert.deepEqual(repaired.verifiedAstrologyData, stale.verifiedAstrologyData);
  });

  it("returns an already-correct profile unchanged", () => {
    const correct = generateFoundationOfflineCodexProfile(
      {
        name: "robert gonzalez",
        birthDate: "1990-09-17",
        birthLocation: "Bronx, New York",
        timezone: "America/New_York",
      },
      { id: "local-test", generatedAt: "2026-08-21T12:00:00.000Z", currentYear: 2026 },
    );

    assert.equal(repairFoundationOfflineCodexProfile(correct), correct);
  });
});
