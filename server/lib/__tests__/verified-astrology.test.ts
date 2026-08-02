import { describe, expect, it } from "vitest";
import { buildVerifiedAstrologyLines, extractVerifiedAstrology } from "../verified-astrology";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "engine-a+engine-b",
  calculatedAt: "2026-08-02T00:00:00Z",
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
    expect(extractVerifiedAstrology({
      astrologyData: {
        sun: { sign: "Virgo", status: "pending_ephemeris" },
        moon: { sign: "Virgo", verificationStatus: "pending_independent_verification" },
        rising: { sign: "Scorpio", verificationStatus: "calculated", provenance: evidence },
      },
    })).toEqual(expect.objectContaining({ unresolved: ["Sun", "Moon", "Ascendant"] }));
  });

  it("rejects a verified label without source, engine, and timestamp", () => {
    expect(extractVerifiedAstrology({
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "verified" },
      },
    }).sun).toBeUndefined();
  });

  it("accepts only evidence-complete verified placements", () => {
    expect(extractVerifiedAstrology({
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "verified", provenance: evidence },
        moon: { sign: "Scorpio", verificationStatus: "verified", evidence },
      },
    })).toEqual({
      sun: "Virgo",
      moon: "Scorpio",
      rising: undefined,
      unresolved: ["Ascendant"],
    });
  });

  it("builds explicit refusal language for unresolved placements", () => {
    const lines = buildVerifiedAstrologyLines({ moonSign: "Virgo", risingSign: "Scorpio" });
    expect(lines.join("\n")).toContain("Do not infer or interpret these placements");
    expect(lines.join("\n")).not.toContain("Virgo");
    expect(lines.join("\n")).not.toContain("Scorpio");
  });
});
