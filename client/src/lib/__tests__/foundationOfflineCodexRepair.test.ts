import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  generateFoundationOfflineCodexProfile,
  repairFoundationOfflineCodexProfile,
  FOUNDATION_NARRATIVE_REVISION,
} from "../foundationOfflineCodex";

describe("repairFoundationOfflineCodexProfile", () => {
  it("defers regeneration of a reading carrying user assessment evidence", () => {
    const generated = generateFoundationOfflineCodexProfile({
      name: "Avery Cole", birthDate: "1986-01-14", birthLocation: "Bronx, New York",
      timezone: "America/New_York",
    });
    const assessed = {
      ...generated,
      foundationNarrativeRevision: undefined,
      depthInterpretation: {
        ...generated.depthInterpretation,
        evidence: [{ ...generated.depthInterpretation.evidence[0], system: "user-stated" as const }],
      },
    };
    assert.equal(repairFoundationOfflineCodexProfile(assessed), assessed);
  });
  it("refreshes old prose with correct numerology and preserves personal metadata idempotently", () => {
    const current = generateFoundationOfflineCodexProfile({
      name: "Avery Cole", birthDate: "1986-01-14", birthLocation: "Bronx, New York",
      timezone: "America/New_York",
    }, { id: "local-revision", generatedAt: "2026-10-07T12:00:00.000Z" });
    const stale = {
      ...current,
      foundationNarrativeRevision: undefined,
      biography: "Everyone has discernment and Life Path 9.",
      assessmentMetadata: { answers: ["user supplied answer"], completedAt: "2026-10-01" },
    };
    const repaired = repairFoundationOfflineCodexProfile(stale);
    assert.equal(repaired.numerologyData.lifePath, current.numerologyData.lifePath);
    assert.equal(repaired.biography, current.biography);
    assert.equal(repaired.foundationNarrativeRevision, FOUNDATION_NARRATIVE_REVISION);
    assert.deepEqual(repaired.assessmentMetadata, stale.assessmentMetadata);
    assert.equal(repaired.id, stale.id);
    assert.equal(repaired.createdAt, stale.createdAt);
    assert.equal(repairFoundationOfflineCodexProfile(repaired), repaired);
  });

  it("does not revive timed synthesis from a stored default when birth time is unknown", () => {
    const current = generateFoundationOfflineCodexProfile({
      name: "Avery Cole", birthDate: "1986-01-14", birthLocation: "Bronx, New York",
      timezone: "America/New_York",
    });
    const stale = {
      ...current,
      birthTime: "12:00",
      birthTimeStatus: "unknown" as const,
      foundationNarrativeRevision: undefined,
      verifiedAstrologyData: {
        sun: { verificationStatus: "verified", sign: "Capricorn" },
        moon: { verificationStatus: "verified", sign: "Aries" },
        rising: { verificationStatus: "verified", sign: "Leo" },
        planets: {},
      },
    };
    const repaired = repairFoundationOfflineCodexProfile(stale);
    assert.equal(repaired.depthInterpretation.evidence.some((entry) => entry.system === "astrology"), false);
    assert.doesNotMatch(repaired.biography, /Leo Rising|verified Codex/);
    assert.deepEqual(repaired.verifiedAstrologyData, stale.verifiedAstrologyData);
    assert.equal(repaired.birthTimeStatus, "unknown");
    assert.equal(repairFoundationOfflineCodexProfile(repaired), repaired);
  });
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
