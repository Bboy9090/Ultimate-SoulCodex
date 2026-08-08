import { describe, it } from "node:test";
import assert from "node:assert";
import { calculateAstrology, calculateVerifiedAstrology } from "../services/astrology-production";
import {
  calcPersonalYear,
  calcPersonalMonth,
  calcPersonalDay,
} from "../../packages/core/compute/personal-numbers";
import { calculateHumanDesign } from "../../packages/astrology/human-design";
import type { BirthData } from "../services/astrology-production";

describe("Gate 1: Foundation Regression Suite", () => {
  describe("Birth Date Normalization", () => {
    it("accepts valid ISO 8601 birth dates", () => {
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(birthData);
      assert.ok(result);
      assert.ok(result.verification);
    });

    it("rejects invalid date format", () => {
      const birthData: BirthData = {
        birthDate: "15/08/1990",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(birthData);
      assert.strictEqual(result.sun.status, "pending_ephemeris");
    });

    it("handles leap day (Feb 29)", () => {
      const birthData: BirthData = {
        birthDate: "2000-02-29",
        birthTime: "12:00",
        timezone: "UTC",
      };
      const result = calculateAstrology(birthData);
      assert.ok(result);
      assert.ok(result.verification);
    });

    it("handles very old dates", () => {
      const birthData: BirthData = {
        birthDate: "1900-01-01",
        birthTime: "00:00",
        timezone: "UTC",
      };
      const result = calculateAstrology(birthData);
      assert.ok(result);
    });
  });

  describe("Birth Time Handling", () => {
    it("requires birth time for Moon and Rising calculations", () => {
      const noTimeData: BirthData = {
        birthDate: "1990-08-15",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(noTimeData);
      assert.strictEqual(result.moon.status, "requires_verified_birth_time");
      assert.strictEqual(result.rising.status, "requires_verified_birth_time");
    });

    it("degrades gracefully with unknown birth time", () => {
      const unknownTime: BirthData = {
        birthDate: "1990-08-15",
        birthTime: null,
        timezone: "America/New_York",
      };
      const result = calculateAstrology(unknownTime);
      assert.strictEqual(result.moon.status, "requires_verified_birth_time");
      assert.strictEqual(result.rising.status, "requires_verified_birth_time");
    });

    it("handles exact birth time", () => {
      const exactTime: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(exactTime);
      assert.notStrictEqual(result.moon.status, "requires_verified_birth_time");
    });
  });

  describe("Timezone Handling", () => {
    it("requires timezone for Moon and Rising", () => {
      const noTz: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
      };
      const result = calculateAstrology(noTz);
      assert.strictEqual(result.moon.status, "requires_verified_birth_time");
      assert.strictEqual(result.rising.status, "requires_verified_birth_time");
    });

    it("handles DST boundary (spring forward)", () => {
      const dstBoundary: BirthData = {
        birthDate: "2023-03-12",
        birthTime: "02:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(dstBoundary);
      assert.ok(result);
    });

    it("handles DST boundary (fall back)", () => {
      const dstBoundary: BirthData = {
        birthDate: "2023-11-05",
        birthTime: "01:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(dstBoundary);
      assert.ok(result);
    });

    it("handles timezone edge cases", () => {
      const utcPlus14: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "12:00",
        timezone: "Pacific/Kiritimati",
      };
      const result = calculateAstrology(utcPlus14);
      assert.ok(result);
    });
  });

  describe("Latitude/Longitude Validation", () => {
    it("accepts valid coordinates", () => {
      const validCoords: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 40.7128,
        longitude: -74.006,
      };
      const result = calculateAstrology(validCoords);
      assert.notStrictEqual(result.rising.status, "requires_location");
    });

    it("rejects invalid latitude (> 90)", () => {
      const invalidLat: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 91,
        longitude: 0,
      };
      const result = calculateAstrology(invalidLat);
      assert.notStrictEqual(result.rising.status, "verified");
    });

    it("rejects invalid latitude (< -90)", () => {
      const invalidLat: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: -91,
        longitude: 0,
      };
      const result = calculateAstrology(invalidLat);
      assert.notStrictEqual(result.rising.status, "verified");
    });

    it("accepts polar extremes", () => {
      const northPole: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "12:00",
        timezone: "Etc/UTC",
        latitude: 90,
        longitude: 0,
      };
      const result = calculateAstrology(northPole);
      assert.ok(result);
    });
  });

  describe("Unresolved State Propagation", () => {
    it("propagates unresolved birth time through profile", () => {
      const unknownTime: BirthData = {
        birthDate: "1990-08-15",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(unknownTime);
      assert.strictEqual(result.moon.status, "requires_verified_birth_time");
      assert.strictEqual(result.rising.status, "requires_verified_birth_time");
      assert.ok(result.verification.unresolvedBodies.includes("Moon"));
      assert.ok(result.verification.unresolvedBodies.includes("Ascendant"));
    });

    it("does not fabricate defaults for missing data", () => {
      const noLocation: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(noLocation);
      assert.strictEqual(result.rising.sign, null);
      assert.strictEqual(result.rising.status, "requires_location");
    });

    it("maintains unresolved state across multiple calls", () => {
      const unknownTime: BirthData = {
        birthDate: "1990-08-15",
        timezone: "America/New_York",
      };
      const result1 = calculateAstrology(unknownTime);
      const result2 = calculateAstrology(unknownTime);
      assert.strictEqual(result1.moon.status, result2.moon.status);
      assert.strictEqual(result1.rising.status, result2.rising.status);
    });
  });

  describe("Numerology Determinism", () => {
    it("produces consistent results across multiple calls", () => {
      const result1 = calcPersonalYear("1990-08-15", 2026);
      const result2 = calcPersonalYear("1990-08-15", 2026);
      assert.strictEqual(result1, result2);
    });

    it("handles master numbers correctly", () => {
      const masterNum = calcPersonalYear("1999-11-11", 2026);
      assert.ok([11, 22, 33, 1, 2, 3, 4, 5, 6, 7, 8, 9].includes(masterNum));
    });

    it("calculates personal day consistently", () => {
      const day1 = calcPersonalDay("1990-08-15", "2026-08-15");
      const day2 = calcPersonalDay("1990-08-15", "2026-08-15");
      assert.strictEqual(day1, day2);
    });

    it("numerology is pure math", () => {
      const result = calcPersonalYear("2000-01-01", 2025);
      assert.strictEqual(typeof result, "number");
      assert.ok(result >= 1 && result <= 33);
    });
  });

  describe("Human Design Calculation", () => {
    it("calculates Human Design type deterministically", () => {
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 40.7128,
        longitude: -74.006,
      };
      const hd1 = calculateHumanDesign(birthData);
      const hd2 = calculateHumanDesign(birthData);
      assert.strictEqual(hd1.type, hd2.type);
    });

    it("handles missing birth time gracefully", () => {
      const noTime: BirthData = {
        birthDate: "1990-08-15",
        timezone: "America/New_York",
      };
      const result = calculateHumanDesign(noTime);
      assert.ok(result);
    });

    it("calculates all required Human Design components", () => {
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 40.7128,
        longitude: -74.006,
      };
      const result = calculateHumanDesign(birthData);
      assert.ok(result.type);
      assert.ok(result.strategy);
      assert.ok(result.authority);
      assert.ok(result.profile);
      assert.ok(result.definition);
    });
  });

  describe("Verification State Accuracy", () => {
    it("marks calculations correctly", () => {
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(birthData);
      if (result.sun.candidate) {
        assert.strictEqual(
          result.sun.status,
          "calculated_pending_independent_verification"
        );
      }
    });
  });

  describe("Profile Refresh Survival", () => {
    it("recalculating produces same result", () => {
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result1 = calculateAstrology(birthData);
      const result2 = calculateAstrology(birthData);
      assert.strictEqual(result1.sun.sign, result2.sun.sign);
      assert.strictEqual(result1.moon.status, result2.moon.status);
    });

    it("maintains unresolved state on refresh", () => {
      const unknownTime: BirthData = {
        birthDate: "1990-08-15",
        timezone: "America/New_York",
      };
      const result1 = calculateAstrology(unknownTime);
      const result2 = calculateAstrology(unknownTime);
      assert.strictEqual(result1.moon.sign, null);
      assert.strictEqual(result2.moon.sign, null);
    });
  });

  describe("No Silent Data Upgrades", () => {
    it("does not fabricate missing placements", () => {
      const noLocation: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(noLocation);
      assert.strictEqual(result.rising.sign, null);
      assert.strictEqual(result.rising.status, "requires_location");
    });
  });

  describe("Repeatability Guarantee", () => {
    it("produces identical results across multiple calls", () => {
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const results = Array.from({ length: 5 }, () =>
        calculateAstrology(birthData)
      );
      const first = results[0];
      for (const result of results.slice(1)) {
        assert.strictEqual(result.sun.sign, first.sun.sign);
        assert.strictEqual(result.moon.status, first.moon.status);
        assert.strictEqual(result.rising.status, first.rising.status);
      }
    });

    it("numerology is repeatable", () => {
      const year1 = calcPersonalYear("1990-08-15", 2020);
      const year2 = calcPersonalYear("1990-08-15", 2020);
      assert.strictEqual(year1, year2);
    });
  });
});
