import { describe, expect, it } from "vitest";
import { buildCompatibilityProfileInput } from "../routes/compatibility";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "engine-a+engine-b",
  calculatedAt: "2026-08-02T17:00:00Z",
};

describe("compatibility saved-profile contract", () => {
  it("rejects naked legacy astrology strings", () => {
    const input = buildCompatibilityProfileInput({
      sunSign: "Virgo",
      moonSign: "Scorpio",
      risingSign: "Capricorn",
      lifePathNumber: 9,
    });

    expect(input.sunSign).toBeUndefined();
    expect(input.lifePathNumber).toBe(9);
    expect(input.unresolved.astrology).toContain("Sun");
  });

  it("rejects a populated Sun placement that is still pending", () => {
    const input = buildCompatibilityProfileInput({
      astrologyData: {
        sun: {
          sign: "Virgo",
          verificationStatus: "pending_independent_verification",
          evidence,
        },
      },
    });

    expect(input.sunSign).toBeUndefined();
  });

  it("accepts an evidence-complete verified Sun placement", () => {
    const input = buildCompatibilityProfileInput({
      astrologyData: {
        sun: {
          sign: "Virgo",
          verificationStatus: "verified",
          evidence,
        },
      },
      numerologyData: { lifePath: 9 },
    });

    expect(input.sunSign).toBe("Virgo");
    expect(input.lifePathNumber).toBe(9);
    expect(input.unresolved.astrology).not.toContain("Sun");
  });

  it("does not consume a naked Human Design type", () => {
    const input = buildCompatibilityProfileInput({
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "verified", evidence },
      },
      humanDesignType: "Reflector",
    });

    expect(input.humanDesignType).toBeUndefined();
    expect(input.unresolved.humanDesign).toEqual(["Human Design type"]);
  });

  it("accepts an evidence-complete Human Design type object", () => {
    const input = buildCompatibilityProfileInput({
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "verified", evidence },
      },
      humanDesignData: {
        type: {
          value: "Reflector",
          verificationStatus: "verified",
          evidence: {
            source: "verified birth inputs",
            engine: "human-design-engine-v1",
            calculatedAt: "2026-08-02T17:00:00Z",
          },
        },
      },
    });

    expect(input.humanDesignType).toBe("Reflector");
    expect(input.unresolved.humanDesign).toEqual([]);
  });
});
