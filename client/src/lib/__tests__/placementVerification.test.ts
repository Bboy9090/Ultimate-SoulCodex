import { describe, expect, it } from "vitest";
import { getSynthesisPlacement, getVerifiedPlacement, placementDisplayStatus } from "../placementVerification";

describe("placement verification boundary", () => {
  it("rejects a populated sign without verification metadata", () => {
    expect(getVerifiedPlacement({ sign: "Scorpio", degree: 17.19 })).toBeNull();
  });

  it("rejects calculated state even when evidence fields exist", () => {
    expect(getVerifiedPlacement({
      sign: "Scorpio",
      verificationStatus: "calculated",
      provenance: {
        source: "birth inputs",
        engine: "single-engine",
        calculatedAt: "2026-08-01T00:00:00Z",
      },
    })).toBeNull();
  });

  it("rejects verified label without traceable evidence", () => {
    expect(getVerifiedPlacement({
      sign: "Virgo",
      verificationStatus: "verified",
    })).toBeNull();
  });

  it("accepts explicit verified state with source, engine, and timestamp", () => {
    expect(getVerifiedPlacement({
      sign: "Virgo",
      degree: 24.1,
      verificationStatus: "verified",
      provenance: {
        source: "independent ephemeris comparison",
        engine: "engine-a+engine-b",
        calculatedAt: "2026-08-01T00:00:00Z",
        comparisonSource: "reference chart",
        confidence: 99,
      },
    })).toEqual(expect.objectContaining({
      sign: "Virgo",
      verificationStatus: "verified",
    }));
  });

  it("admits complete stable-across-range evidence to synthesis without calling it verified", () => {
    const placement = {
      sign: "Virgo",
      verificationStatus: "calculated",
      evidenceState: "stable_across_range" as const,
      rangeEvidence: {
        resolutionMinutes: 1,
        rangeStartLocal: "1990-09-17T00:00",
        rangeEndLocal: "1990-09-17T23:59",
        timezone: "America/New_York",
        testedValues: 1440,
      },
    };
    expect(getVerifiedPlacement(placement)).toBeNull();
    expect(getSynthesisPlacement(placement)).toEqual(expect.objectContaining({
      sign: "Virgo",
      evidenceState: "stable_across_range",
    }));
    expect(placementDisplayStatus(placement)).toBe("Stable across full-day range");
  });

  it("rejects conditional range branches from main synthesis", () => {
    const placement = {
      sign: null,
      verificationStatus: "unresolved",
      evidenceState: "conditional" as const,
      rangeEvidence: {
        resolutionMinutes: 1,
        rangeStartLocal: "1990-09-17T00:00",
        rangeEndLocal: "1990-09-17T23:59",
        timezone: "America/New_York",
        testedValues: 1440,
      },
      conditionalValues: [
        { value: "Aries", startLocalTime: "00:00", endLocalTime: "20:13" },
        { value: "Taurus", startLocalTime: "20:14", endLocalTime: "23:59" },
      ],
    };
    expect(getSynthesisPlacement(placement)).toBeNull();
    expect(placementDisplayStatus(placement)).toBe("Conditional — branches by birth-time window");
  });

  it("rejects incomplete range evidence even when labeled stable", () => {
    expect(getSynthesisPlacement({
      sign: "Virgo",
      verificationStatus: "calculated",
      evidenceState: "stable_across_range",
      rangeEvidence: {
        resolutionMinutes: 60,
        rangeStartLocal: "1990-09-17T00:00",
        rangeEndLocal: "1990-09-17T23:00",
        testedValues: 24,
      },
    })).toBeNull();
  });

  it("does not let a verified string conceal missing evidence", () => {
    expect(placementDisplayStatus({
      sign: "Virgo",
      verificationStatus: "verified",
    })).toBe("Verification evidence incomplete");
  });

  it("renders pending states honestly", () => {
    expect(placementDisplayStatus({ verificationStatus: "pending_independent_verification" }))
      .toBe("Pending independent verification");
    expect(placementDisplayStatus({ verificationStatus: "approximate", sign: "Virgo" }))
      .toBe("Approximate — interpretation paused");
  });
});
