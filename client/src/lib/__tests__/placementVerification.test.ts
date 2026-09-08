import { describe, expect, it } from "vitest";
import { getVerifiedPlacement, placementDisplayStatus } from "../placementVerification";

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
