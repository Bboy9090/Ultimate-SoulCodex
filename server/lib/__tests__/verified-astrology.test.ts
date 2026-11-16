import { describe, expect, it } from "vitest";
import { buildVerifiedAstrologyLines, extractVerifiedAstrology, extractVerifiedAstrologyFromBoundData } from "../verified-astrology";
import { bindStoredEvidence } from "../profile-birth-evidence-integrity";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "engine-a+engine-b",
  calculatedAt: "2026-08-02T00:00:00Z",
};
const birthInputs = {
  birthDate: "1990-09-17",
  birthTime: "11:11",
  timezone: "America/New_York",
  latitude: 40.8448,
  longitude: -73.8648,
};

describe("server verified astrology filter", () => {
  it("rejects legacy naked sign strings", () => {
    expect(extractVerifiedAstrology({
      sunSign: "Virgo",
      moonSign: "Virgo",
      risingSign: "Scorpio",
    })).toEqual({
      sun: undefined,
      moon: undefined,
      rising: undefined,
      unresolved: ["Sun", "Moon", "Ascendant"],
    });
  });

  it("rejects populated placements marked pending", () => {
    expect(extractVerifiedAstrologyFromBoundData(bindStoredEvidence({
      sun: { sign: "Virgo", status: "pending_ephemeris" },
      moon: { sign: "Virgo", verificationStatus: "pending_independent_verification" },
      rising: { sign: "Scorpio", verificationStatus: "calculated", provenance: evidence },
    }, birthInputs))).toEqual(expect.objectContaining({ unresolved: ["Sun", "Moon", "Ascendant"] }));
  });

  it("rejects a verified label without source, engine, and timestamp", () => {
    expect(extractVerifiedAstrologyFromBoundData(bindStoredEvidence({
      sun: { sign: "Virgo", verificationStatus: "verified" },
    }, birthInputs)).sun).toBeUndefined();
  });

  it("accepts only evidence-complete verified placements", () => {
    expect(extractVerifiedAstrologyFromBoundData(bindStoredEvidence({
      sun: { sign: "Virgo", verificationStatus: "verified", provenance: evidence },
      moon: { sign: "Scorpio", verificationStatus: "verified", evidence },
    }, birthInputs))).toEqual({
      sun: "Virgo",
      moon: "Scorpio",
      rising: undefined,
      unresolved: ["Ascendant"],
    });
  });

  it("full-profile extraction requires the stored binding to match current birth inputs", () => {
    const astrologyData = bindStoredEvidence({
      sun: { sign: "Virgo", verificationStatus: "verified", provenance: evidence },
    }, birthInputs);
    expect(extractVerifiedAstrology({ ...birthInputs, astrologyData }).sun).toBe("Virgo");
    expect(extractVerifiedAstrology({ ...birthInputs, birthTime: "11:12", astrologyData }).sun).toBeUndefined();
    expect(extractVerifiedAstrology({ ...birthInputs, latitude: 41, astrologyData }).sun).toBeUndefined();
  });

  it("builds explicit refusal language for unresolved placements", () => {
    const lines = buildVerifiedAstrologyLines({ moonSign: "Virgo", risingSign: "Scorpio" });
    expect(lines.join("\n")).toContain("Do not infer or interpret these placements");
    expect(lines.join("\n")).not.toContain("Virgo");
    expect(lines.join("\n")).not.toContain("Scorpio");
  });
});
