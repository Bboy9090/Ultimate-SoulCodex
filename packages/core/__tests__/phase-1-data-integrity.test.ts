/**
 * Phase 1 Data Integrity Tests
 *
 * Golden test: Robert Gonzalez verified chart
 * Ensures legacy approximations never override verified ephemeris
 */

import { describe, it, expect } from "vitest";
import {
  generateSoulCodexReadingV1,
  type RawAnalysisInput,
} from "../soul-codex-reading-generator-v1.js";

describe("Phase 1: Data Integrity - Verified Ephemeris vs Legacy", () => {
  // Golden fixture: Robert Gonzalez with verified chart
  const verifiedRobertInput: RawAnalysisInput = {
    subjectName: "Robert Gonzalez",
    birthData: {
      date: "1990-09-17",
      time: "11:11 AM",
      location: "Bronx, New York",
      timezone: "America/New_York",
    },
    ephemeris: {
      status: "verified_ephemeris",
      sunSign: "Virgo",
      sunDegree: 24.32,
      moonSign: "Virgo",
      moonDegree: 17.45,
      ascendant: "Scorpio",
      ascendantDegree: 17.19,
      houses: [
        { number: 1, sign: "Scorpio", degree: 17.19 },
        { number: 2, sign: "Sagittarius", degree: 9.45 },
      ],
    },
    numerology: {
      lifePathNumber: 9,
      birthdayNumber: 8,
    },
  };

  it("verified_ephemeris: shows all three (Sun, Moon, Ascendant)", () => {
    const reading = generateSoulCodexReadingV1(verifiedRobertInput);

    expect(reading.meta.calculationStatus).toBe("verified_ephemeris");
    expect(reading.verifiedSystems.astrology.sunSign).toBe("Virgo");
    expect(reading.verifiedSystems.astrology.moonSign).toBe("Virgo");
    expect(reading.verifiedSystems.astrology.ascendant).toBe("Scorpio");
    expect(reading.meta.confidence).toBe("high");
  });

  it("verified_ephemeris: remark says 'Verified', not 'approximation'", () => {
    const reading = generateSoulCodexReadingV1(verifiedRobertInput);
    expect(reading.verifiedSystems.astrology.remark).toContain("Verified");
  });

  it("never shows legacy approximations when verified_ephemeris is available", () => {
    const reading = generateSoulCodexReadingV1(verifiedRobertInput);
    expect(reading.verifiedSystems.astrology.status).toBe("verified_ephemeris");
    // The component should NOT render legacy-approximation styling
    expect(reading.verifiedSystems.astrology.remark).not.toContain("approximation");
  });

  describe("date_only: Sun only, no Moon or Ascendant", () => {
    const dateOnlyInput: RawAnalysisInput = {
      subjectName: "Unknown Person",
      birthData: {
        date: "1990-09-17",
        location: "Unknown",
        timezone: "UTC",
      },
      ephemeris: {
        status: "date_only",
        sunSign: "Virgo",
        sunDegree: 24.32,
      },
    };

    it("shows Sun when date_only", () => {
      const reading = generateSoulCodexReadingV1(dateOnlyInput);
      expect(reading.verifiedSystems.astrology.sunSign).toBe("Virgo");
      expect(reading.meta.calculationStatus).toBe("date_only");
    });

    it("does not guess Moon or Ascendant when date_only", () => {
      const reading = generateSoulCodexReadingV1(dateOnlyInput);
      expect(reading.verifiedSystems.astrology.moonSign).toBe("");
      expect(reading.verifiedSystems.astrology.ascendant).toBeUndefined();
    });

    it("provides helpful remark about birth time requirement", () => {
      const reading = generateSoulCodexReadingV1(dateOnlyInput);
      expect(reading.verifiedSystems.astrology.remark).toContain("Birth time required");
    });
  });

  describe("estimated_birth_window: shows range", () => {
    const estimatedInput: RawAnalysisInput = {
      subjectName: "Someone",
      birthData: {
        date: "1990-09-17",
        location: "New York",
        timezone: "America/New_York",
      },
      ephemeris: {
        status: "estimated_birth_window",
        sunSign: "Virgo",
        sunDegree: 24.32,
        moonSign: "Virgo",
        moonDegree: 17.45,
        ascendant: "Scorpio",
        ascendantDegree: 17.19,
        remark: "Moon/Ascendant could vary with exact birth time",
      },
    };

    it("shows all three with caveat about time dependency", () => {
      const reading = generateSoulCodexReadingV1(estimatedInput);
      expect(reading.verifiedSystems.astrology.status).toBe("estimated_birth_window");
      expect(reading.verifiedSystems.astrology.moonSign).toBe("Virgo");
      expect(reading.verifiedSystems.astrology.remark).toContain("time");
      expect(reading.meta.confidence).toBe("moderate");
    });
  });

  describe("legacy_approximation: lowest priority fallback", () => {
    const legacyInput: RawAnalysisInput = {
      subjectName: "Legacy Test",
      birthData: {
        date: "1990-09-17",
        location: "Unknown",
        timezone: "UTC",
      },
      ephemeris: {
        status: "legacy_approximation",
        sunSign: "Virgo",
        sunDegree: 24.32,
        moonSign: "Scorpio",
        moonDegree: 15.0,
        ascendant: "Capricorn",
        ascendantDegree: 5.0,
        remark: "Calculated from birth date using simplified formula",
      },
    };

    it("shows all three but marks as legacy", () => {
      const reading = generateSoulCodexReadingV1(legacyInput);
      expect(reading.verifiedSystems.astrology.status).toBe("legacy_approximation");
      expect(reading.verifiedSystems.astrology.remark).toContain("simplified formula");
    });

    it("has low confidence when legacy_approximation", () => {
      const reading = generateSoulCodexReadingV1(legacyInput);
      expect(reading.meta.confidence).toBe("low");
    });
  });

  describe("unavailable: no data shown", () => {
    const unavailableInput: RawAnalysisInput = {
      subjectName: "No Data",
      birthData: {
        date: "1990-09-17",
        location: "Unknown",
        timezone: "UTC",
      },
      ephemeris: {
        status: "unavailable",
        sunSign: "",
        sunDegree: 0,
      },
    };

    it("returns unavailable status", () => {
      const reading = generateSoulCodexReadingV1(unavailableInput);
      expect(reading.verifiedSystems.astrology.status).toBe("unavailable");
    });
  });

  describe("Validation: prevents invalid inputs", () => {
    it("rejects verified_ephemeris without all three fields", () => {
      const invalidInput: RawAnalysisInput = {
        subjectName: "Incomplete",
        birthData: {
          date: "1990-09-17",
          location: "NYC",
          timezone: "UTC",
        },
        ephemeris: {
          status: "verified_ephemeris",
          sunSign: "Virgo",
          sunDegree: 24.32,
          // Missing moonSign, moonDegree, ascendant, ascendantDegree
        },
      };

      expect(() => generateSoulCodexReadingV1(invalidInput)).toThrow();
    });

    it("rejects date_only with invented Moon sign", () => {
      const invalidInput: RawAnalysisInput = {
        subjectName: "Invalid",
        birthData: {
          date: "1990-09-17",
          location: "NYC",
          timezone: "UTC",
        },
        ephemeris: {
          status: "date_only",
          sunSign: "Virgo",
          sunDegree: 24.32,
          moonSign: "Scorpio",
          moonDegree: 15.0,
          // Missing remark explaining the invention
        },
      };

      expect(() => generateSoulCodexReadingV1(invalidInput)).toThrow();
    });

    it("rejects date_only with invented Ascendant", () => {
      const invalidInput: RawAnalysisInput = {
        subjectName: "Invalid",
        birthData: {
          date: "1990-09-17",
          location: "NYC",
          timezone: "UTC",
        },
        ephemeris: {
          status: "date_only",
          sunSign: "Virgo",
          sunDegree: 24.32,
          ascendant: "Capricorn",
          ascendantDegree: 5.0,
          // Ascendant cannot come from date-only
        },
      };

      expect(() => generateSoulCodexReadingV1(invalidInput)).toThrow();
    });
  });
});
