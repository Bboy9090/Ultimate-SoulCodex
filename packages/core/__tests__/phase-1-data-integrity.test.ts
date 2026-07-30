/**
 * Phase 1 Data Integrity Tests
 *
 * Golden test: Robert Gonzalez verified chart
 * Ensures legacy approximations never override verified ephemeris
 */

import { test } from "node:test";
import assert from "node:assert";
import {
  generateSoulCodexReadingV1,
  type RawAnalysisInput,
} from "../soul-codex-reading-generator-v1.js";

test("Phase 1: Data Integrity - Verified Ephemeris vs Legacy", async (t) => {
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

  await t.test("verified_ephemeris: shows all three (Sun, Moon, Ascendant)", () => {
    const reading = generateSoulCodexReadingV1(verifiedRobertInput);

    assert.strictEqual(reading.meta.calculationStatus, "verified_ephemeris");
    assert.strictEqual(reading.verifiedSystems.astrology.sunSign, "Virgo");
    assert.strictEqual(reading.verifiedSystems.astrology.moonSign, "Virgo");
    assert.strictEqual(reading.verifiedSystems.astrology.ascendant, "Scorpio");
    assert.strictEqual(reading.meta.confidence, "high");
  });

  await t.test("verified_ephemeris: remark says 'Verified', not 'approximation'", () => {
    const reading = generateSoulCodexReadingV1(verifiedRobertInput);
    assert(reading.verifiedSystems.astrology.remark.includes("Verified"));
  });

  await t.test("never shows legacy approximations when verified_ephemeris is available", () => {
    const reading = generateSoulCodexReadingV1(verifiedRobertInput);
    assert.strictEqual(reading.verifiedSystems.astrology.status, "verified_ephemeris");
    // The component should NOT render legacy-approximation styling
    assert(!reading.verifiedSystems.astrology.remark.includes("approximation"));
  });

  await t.test("date_only: Sun only, no Moon or Ascendant", async (t) => {
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

    await t.test("shows Sun when date_only", () => {
      const reading = generateSoulCodexReadingV1(dateOnlyInput);
      assert.strictEqual(reading.verifiedSystems.astrology.sunSign, "Virgo");
      assert.strictEqual(reading.meta.calculationStatus, "date_only");
    });

    await t.test("does not guess Moon or Ascendant when date_only", () => {
      const reading = generateSoulCodexReadingV1(dateOnlyInput);
      assert.strictEqual(reading.verifiedSystems.astrology.moonSign, "");
      assert.strictEqual(reading.verifiedSystems.astrology.ascendant, undefined);
    });

    await t.test("provides helpful remark about birth time requirement", () => {
      const reading = generateSoulCodexReadingV1(dateOnlyInput);
      assert(reading.verifiedSystems.astrology.remark.includes("Birth time required"));
    });
  });

  await t.test("estimated_birth_window: shows range", async (t) => {
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

    await t.test("shows all three with caveat about time dependency", () => {
      const reading = generateSoulCodexReadingV1(estimatedInput);
      assert.strictEqual(reading.verifiedSystems.astrology.status, "estimated_birth_window");
      assert.strictEqual(reading.verifiedSystems.astrology.moonSign, "Virgo");
      assert(reading.verifiedSystems.astrology.remark.includes("time"));
      assert.strictEqual(reading.meta.confidence, "moderate");
    });
  });

  await t.test("legacy_approximation: lowest priority fallback", async (t) => {
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

    await t.test("shows all three but marks as legacy", () => {
      const reading = generateSoulCodexReadingV1(legacyInput);
      assert.strictEqual(reading.verifiedSystems.astrology.status, "legacy_approximation");
      assert(reading.verifiedSystems.astrology.remark.includes("simplified formula"));
    });

    await t.test("has low confidence when legacy_approximation", () => {
      const reading = generateSoulCodexReadingV1(legacyInput);
      assert.strictEqual(reading.meta.confidence, "low");
    });
  });

  await t.test("unavailable: no data shown", async (t) => {
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

    await t.test("returns unavailable status", () => {
      const reading = generateSoulCodexReadingV1(unavailableInput);
      assert.strictEqual(reading.verifiedSystems.astrology.status, "unavailable");
    });
  });

  await t.test("Validation: prevents invalid inputs", async (t) => {
    await t.test("rejects verified_ephemeris without all three fields", () => {
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

      assert.throws(() => generateSoulCodexReadingV1(invalidInput));
    });

    await t.test("rejects date_only with invented Moon sign", () => {
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

      assert.throws(() => generateSoulCodexReadingV1(invalidInput));
    });

    await t.test("rejects date_only with invented Ascendant", () => {
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

      assert.throws(() => generateSoulCodexReadingV1(invalidInput));
    });
  });
});
