import { describe, expect, it } from "vitest";
import { astrologySignals } from "../packages/core/codex30/systems/astrology";
import { aspectSignals } from "../packages/core/codex30/systems/aspects";
import { humanDesignSignals } from "../packages/core/codex30/systems/humanDesign";
import { numerologySignals } from "../packages/core/codex30/systems/numerology";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "engine-a+engine-b",
  calculatedAt: "2026-09-28T20:00:00.000Z",
};

describe("Codex30 evidence admission", () => {
  it("rejects raw or generic-badge astrology placements", () => {
    expect(astrologySignals({
      planets: {
        sun: { sign: "Virgo" },
        moon: { sign: "Scorpio" },
        rising: { sign: "Capricorn" },
      },
    }, true)).toEqual([]);
  });

  it("admits only evidence-complete verified astrology placements", () => {
    const signals = astrologySignals({
      planets: {
        sun: { sign: "Virgo", verificationStatus: "verified", evidence },
        moon: { sign: "Scorpio", verificationStatus: "verified", evidence },
      },
      rising: { sign: "Capricorn", verificationStatus: "verified", evidence },
    });

    expect(signals.map((signal) => signal.id)).toEqual([
      "astro.sun.virgo",
      "astro.moon.scorpio",
      "astro.rising.capricorn",
    ]);
    expect(signals.every((signal) => signal.confidence === "high")).toBe(true);
  });

  it("rejects aspects without the governed major-aspect contract", () => {
    expect(aspectSignals({
      aspects: [
        { planet1: "Sun", planet2: "Moon", aspect: "square", orb: 1 },
      ],
    })).toEqual([]);
  });

  it("admits governed major aspects and rejects malformed orb values", () => {
    const signals = aspectSignals({
      aspects: [
        {
          planet1: "Sun",
          planet2: "Moon",
          aspect: "square",
          orb: 1.2,
          policyId: "ASTRO-ASPECT-MAJOR-v1",
          evidenceArtifactId: "aspect-proof-1",
        },
        {
          planet1: "Venus",
          planet2: "Mars",
          aspect: "trine",
          orb: 99,
          policyId: "ASTRO-ASPECT-MAJOR-v1",
          evidenceArtifactId: "aspect-proof-2",
        },
      ],
    });

    expect(signals).toHaveLength(1);
    expect(signals[0].id).toBe("aspect.Sun.square.Moon");
  });

  it("rejects Human Design without a complete verified trust record", () => {
    expect(humanDesignSignals({
      type: "Reflector",
      strategy: "Wait a Lunar Cycle",
      authority: "Lunar",
      profile: "2/5",
    })).toEqual([]);
  });

  it("admits Human Design only with the complete trust receipt shape", () => {
    const signals = humanDesignSignals({
      status: "verified",
      type: "Reflector",
      strategy: "Wait a Lunar Cycle",
      authority: "Lunar",
      profile: "2/5",
      source: "Soul Codex deterministic Human Design core engine",
      calculatedAt: "2026-09-28T20:00:00.000Z",
      inputTimestampUtc: "1990-09-17T15:11:00.000Z",
      verificationReceiptId: "receipt-1",
      independentSource: "independent-verifier",
      verifiedAt: "2026-09-28T20:01:00.000Z",
    });

    expect(signals).toHaveLength(1);
    expect(signals[0].id).toBe("hd.type.reflector");
    expect(signals[0].confidence).toBe("high");
  });

  it("rejects unsupported numerology values rather than inventing fallback traits", () => {
    expect(numerologySignals({ lifePath: 44 })).toEqual([]);
    expect(numerologySignals({ lifePath: 9 })).toHaveLength(1);
  });
});
