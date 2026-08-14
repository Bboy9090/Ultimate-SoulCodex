import { describe, expect, it } from "vitest";
import {
  buildCompatibilityProfileInput,
  buildMatchResponse,
  symbolicSunSign,
} from "../routes/compatibility";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "engine-a+engine-b",
  calculatedAt: "2026-08-02T17:00:00Z",
};

describe("compatibility saved-profile contract", () => {
  it("rejects naked legacy astrology strings from the verified input path", () => {
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

  it("rejects a populated Sun placement that is still pending from the verified path", () => {
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

  it("allows a supported symbolic Sun without promoting it into verified astrology", () => {
    const result = buildMatchResponse({
      astrologyData: { sunSign: "Virgo" },
      numerologyData: { lifePath: 9 },
      humanDesignType: "Reflector",
    });

    expect(result.available).toBe(true);
    expect(result.evidenceMode).toBe("symbolic");
    expect(result.formula.inputs.sunSign).toBe("Virgo");
    expect(result.formula.inputs.lifePathNumber).toBe(9);
    expect(result.formula.inputs.humanDesignType).toBeNull();
    expect(result.formula.layers.join(" ")).toContain("not verified astronomy");
    expect(result.excludedLayers).toContain("Human Design type");
  });

  it("prefers the verified Sun over a conflicting symbolic alias", () => {
    const result = buildMatchResponse({
      sunSign: "Leo",
      astrologyData: {
        sunSign: "Leo",
        sun: { sign: "Virgo", verificationStatus: "verified", evidence },
      },
    });

    expect(result.available).toBe(true);
    expect(result.evidenceMode).toBe("verified");
    expect(result.formula.inputs.sunSign).toBe("Virgo");
  });

  it("keeps compatibility unavailable when neither verified nor valid symbolic Sun exists", () => {
    const result = buildMatchResponse({ astrologyData: { sunSign: "NotASign" } });

    expect(symbolicSunSign({ astrologyData: { sunSign: "NotASign" } })).toBeUndefined();
    expect(result.available).toBe(false);
    expect(result.evidenceMode).toBe("unavailable");
    expect(result.formula.inputs.sunSign).toBeNull();
  });
});
