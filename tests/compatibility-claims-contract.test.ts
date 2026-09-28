import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { buildMatchResponse } from "../routes/compatibility";
import { calculateArchetypeMatches } from "../services/archetype-matches";

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

  it("keeps every sign-pair narrative explicitly symbolic and non-predictive", () => {
    const signs = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    ];
    const modes = ["love", "attraction", "friendship", "growth"] as const;
    const prohibited = [
      /\bsoulmate\b/i,
      /\bfated\b/i,
      /\bdestiny\b/i,
      /\bkarmic\b/i,
      /\bpsychic\b/i,
      /\btelepath/i,
      /\bmeant to be\b/i,
      /\bwill last\b/i,
      /\bguarantee/i,
      /\bproven\b/i,
      /\bundeniable pull\b/i,
      /\bunderstand each other without speaking\b/i,
      /\bchanges both of us\b/i,
    ];

    for (const sign of signs) {
      for (const mode of modes) {
        const rows = calculateArchetypeMatches(sign, undefined, undefined, mode);
        expect(rows).toHaveLength(12);
        for (const row of rows) {
          const narrative = [row.headline, row.why, row.tension].join(" ");
          expect(row.headline).toContain("Symbolic theme");
          expect(row.why).toContain("Tradition-based model only");
          expect(row.why).toContain("not evidence");
          expect(row.tension).toContain("not a prediction");
          for (const pattern of prohibited) expect(narrative).not.toMatch(pattern);
        }
      }
    }
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
