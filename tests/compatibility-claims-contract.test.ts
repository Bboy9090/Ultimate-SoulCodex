import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { buildMatchResponse } from "../routes/compatibility";

const engineSource = fs.readFileSync("services/archetype-matches.ts", "utf8");

const verifiedEvidence = {
  source: "independent ephemeris comparison",
  engine: "engine-a+engine-b",
  calculatedAt: "2026-08-14T00:00:00Z",
};

describe("compatibility evidence framing", () => {
  it("does not describe symbolic scoring as empirical relationship research", () => {
    for (const banned of [
      "research-backed",
      "Gottman research",
      "large-sample couple studies",
      "2000+ years of synastry research",
      "researched energy dynamics",
    ]) {
      expect(engineSource).not.toContain(banned);
    }

    expect(engineSource).toContain("symbolic ranking across all 12 signs");
    expect(engineSource).toContain("not empirical relationship-effect estimates");
  });

  it("labels even verified-input results as a symbolic relationship model", () => {
    const result = buildMatchResponse({
      astrologyData: {
        sun: {
          sign: "Virgo",
          verificationStatus: "verified",
          evidence: verifiedEvidence,
        },
      },
      numerologyData: { lifePath: 9 },
    });

    expect(result.available).toBe(true);
    expect(result.evidenceMode).toBe("verified");
    expect(result.evidenceLabel).toContain("symbolic relationship model");
    expect(result.formula.layers.join(" ")).toContain("symbolic sign-pair model");
  });
});
