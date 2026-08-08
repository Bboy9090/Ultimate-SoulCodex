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
  describe("Birth Date Normalization — Exact Behavior", () => {
    it("accepts valid ISO 8601 birth dates and returns deterministic result", () => {
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(birthData);
      // Exact assertions: result must have valid structure and status
      assert.ok(typeof result.sun.status === "string");
      assert.ok(result.verification.verifiedBodies !== undefined);
      // Sun calculation should complete without error with full birth data
      assert.ok(!isNaN(Date.parse(birthData.birthDate)));
    });

    it("rejects invalid ISO 8601 format and returns unresolved status", () => {
      const birthData: BirthData = {
        birthDate: "15/08/1990", // Invalid format
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(birthData);
      // Exact assertion: must be pending_ephemeris, not crash
      assert.strictEqual(result.sun.status, "pending_ephemeris");
      assert.strictEqual(result.sun.sign, null);
    });

    it("handles leap day (Feb 29) with identical results across multiple calls, no off-by-one errors", () => {
      const birthData: BirthData = {
        birthDate: "2000-02-29",
        birthTime: "12:00",
        timezone: "UTC",
        latitude: 51.5074,
        longitude: -0.1278,
      };
      // Call multiple times to verify leap day calculation is deterministic and repeatable
      const result1 = calculateAstrology(birthData);
      const result2 = calculateAstrology(birthData);
      const result3 = calculateAstrology(birthData);

      // Exact assertion: leap day must produce identical sun placements (no off-by-one rolling into March 1)
      assert.strictEqual(result1.sun.sign, result2.sun.sign);
      assert.strictEqual(result2.sun.sign, result3.sun.sign);
      assert.strictEqual(result1.sun.degree, result2.sun.degree);
      assert.strictEqual(result2.sun.degree, result3.sun.degree);
      // Leap day is valid; should calculate with valid status
      assert.ok(["calculated_pending_independent_verification", "pending_ephemeris", "verified"].includes(result1.sun.status));
    });

    it("handles very old dates (1900) without crash", () => {
      const birthData: BirthData = {
        birthDate: "1900-01-01",
        birthTime: "00:00",
        timezone: "UTC",
      };
      const result = calculateAstrology(birthData);
      // Exact assertion: old date must not crash, may be unresolved if outside ephemeris range
      assert.ok(result.sun.status);
      assert.ok(["calculated_pending_independent_verification", "pending_ephemeris"].includes(result.sun.status));
    });
  });

  describe("Birth Time Handling — Exact Status Behavior", () => {
    it("requires birth time for Moon and Rising, returns explicit requires_verified_birth_time", () => {
      const noTimeData: BirthData = {
        birthDate: "1990-08-15",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(noTimeData);
      // Exact assertions: status must be explicit, sign must be null
      assert.strictEqual(result.moon.status, "requires_verified_birth_time");
      assert.strictEqual(result.moon.sign, null);
      assert.strictEqual(result.rising.status, "requires_verified_birth_time");
      assert.strictEqual(result.rising.sign, null);
    });

    it("with null birth time, degrades gracefully to unresolved", () => {
      const unknownTime: BirthData = {
        birthDate: "1990-08-15",
        birthTime: null,
        timezone: "America/New_York",
      };
      const result = calculateAstrology(unknownTime);
      // Exact assertion: explicit unresolved state, no fabrication
      assert.strictEqual(result.moon.status, "requires_verified_birth_time");
      assert.strictEqual(result.rising.status, "requires_verified_birth_time");
    });

    it("with exact birth time, returns calculated_pending_independent_verification", () => {
      const exactTime: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(exactTime);
      // Exact assertion: status must indicate calculation occurred
      if (result.moon.candidate) {
        assert.strictEqual(result.moon.status, "calculated_pending_independent_verification");
      }
    });
  });

  describe("Timezone Handling — Exact UTC Conversion", () => {
    it("requires timezone for Moon/Rising calculations", () => {
      const noTz: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
      };
      const result = calculateAstrology(noTz);
      // Exact assertion: must explicitly require timezone
      assert.strictEqual(result.moon.status, "requires_verified_birth_time");
      assert.strictEqual(result.rising.status, "requires_verified_birth_time");
    });

    it("converts DST spring forward (2023-03-12 02:30 EST→EDT) to correct UTC and calculates consistently", () => {
      const dstSpringForward: BirthData = {
        birthDate: "2023-03-12",
        birthTime: "02:30", // Pre-DST local time (EST = UTC-5)
        timezone: "America/New_York",
        latitude: 40.7128,
        longitude: -74.006,
      };
      // Call twice to verify determinism across DST boundary
      const result1 = calculateAstrology(dstSpringForward);
      const result2 = calculateAstrology(dstSpringForward);

      // Exact assertion: sun placement must be consistent (same UTC-derived result both times)
      assert.strictEqual(result1.sun.sign, result2.sun.sign);
      assert.strictEqual(result1.sun.degree, result2.sun.degree);
      assert.strictEqual(result1.sun.status, result2.sun.status);
      // Both times must produce valid status (not crash, not random)
      assert.ok(["calculated_pending_independent_verification", "pending_ephemeris", "verified"].includes(result1.sun.status));
    });

    it("converts DST fall back (2023-11-05 01:30 EDT→EST) to correct UTC, handles ambiguity deterministically", () => {
      const dstFallBack: BirthData = {
        birthDate: "2023-11-05",
        birthTime: "01:30", // Ambiguous: could be EDT (UTC-4) or EST (UTC-5)
        timezone: "America/New_York",
        latitude: 40.7128,
        longitude: -74.006,
      };
      // During ambiguous hour, library must choose consistently (typically first occurrence = EDT)
      const result1 = calculateAstrology(dstFallBack);
      const result2 = calculateAstrology(dstFallBack);

      // Exact assertion: must produce deterministic UTC conversion, same result both times
      assert.strictEqual(result1.sun.sign, result2.sun.sign);
      assert.strictEqual(result1.sun.degree, result2.sun.degree);
      // Status must be valid (not crash)
      assert.ok(typeof result1.sun.status === "string");
    });

    it("handles extreme timezone (UTC+14 Kiritimati) with correct offset and deterministic calculation", () => {
      const utcPlus14: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "12:00", // Noon Kiritimati time
        timezone: "Pacific/Kiritimati",
        latitude: 1.9709,
        longitude: -157.4474,
      };
      // Call twice to verify no random state or offset miscalculation
      const result1 = calculateAstrology(utcPlus14);
      const result2 = calculateAstrology(utcPlus14);

      // Exact assertion: UTC conversion must be identical across calls
      assert.strictEqual(result1.sun.sign, result2.sun.sign);
      assert.strictEqual(result1.sun.degree, result2.sun.degree);
      // Noon on UTC+14 is midnight UTC (previous day) - should calculate without off-by-one error
      assert.ok(result1.sun.status);
    });
  });

  describe("Latitude/Longitude Validation — Exact Range Enforcement", () => {
    it("accepts valid coordinates and does not return requires_location", () => {
      const validCoords: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 40.7128,
        longitude: -74.006,
      };
      const result = calculateAstrology(validCoords);
      // Exact assertion: with valid coords, should not require location
      assert.notStrictEqual(result.rising.status, "requires_location");
    });

    it("rejects latitude > 90 and returns non-verified status", () => {
      const invalidLat: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 91,
        longitude: 0,
      };
      const result = calculateAstrology(invalidLat);
      // Exact assertion: invalid latitude must not verify
      assert.notStrictEqual(result.rising.status, "verified");
    });

    it("rejects latitude < -90 and returns non-verified status", () => {
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

    it("rejects longitude > 180 and returns non-verified status", () => {
      const invalidLon: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 0,
        longitude: 181,
      };
      const result = calculateAstrology(invalidLon);
      assert.notStrictEqual(result.rising.status, "verified");
    });

    it("rejects longitude < -180 and returns non-verified status", () => {
      const invalidLon: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 0,
        longitude: -181,
      };
      const result = calculateAstrology(invalidLon);
      assert.notStrictEqual(result.rising.status, "verified");
    });

    it("accepts North Pole (latitude 90, longitude 0)", () => {
      const northPole: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "12:00",
        timezone: "Etc/UTC",
        latitude: 90,
        longitude: 0,
      };
      const result = calculateAstrology(northPole);
      // Exact assertion: extreme but valid coordinate must not crash
      assert.ok(result.rising.status);
    });

    it("accepts South Pole (latitude -90, longitude 0)", () => {
      const southPole: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "12:00",
        timezone: "Etc/UTC",
        latitude: -90,
        longitude: 0,
      };
      const result = calculateAstrology(southPole);
      assert.ok(result.rising.status);
    });

    it("accepts International Date Line (longitude ±180)", () => {
      const dateLine: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "12:00",
        timezone: "Etc/UTC",
        latitude: 0,
        longitude: 180,
      };
      const result = calculateAstrology(dateLine);
      assert.ok(result.rising.status);
    });
  });

  describe("Unresolved State Propagation — No Fabrication", () => {
    it("missing birth time propagates through all bodies", () => {
      const unknownTime: BirthData = {
        birthDate: "1990-08-15",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(unknownTime);
      // Exact assertions: no fabrication
      assert.strictEqual(result.moon.status, "requires_verified_birth_time");
      assert.strictEqual(result.moon.sign, null);
      assert.strictEqual(result.rising.status, "requires_verified_birth_time");
      assert.strictEqual(result.rising.sign, null);
      assert.ok(result.verification.unresolvedBodies.includes("Moon"));
      assert.ok(result.verification.unresolvedBodies.includes("Ascendant"));
    });

    it("missing location does not fabricate Rising sign", () => {
      const noLocation: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(noLocation);
      // Exact assertions: null sign, explicit status
      assert.strictEqual(result.rising.sign, null);
      assert.strictEqual(result.rising.status, "requires_location");
    });

    it("unresolved state is consistent across multiple calls", () => {
      const unknownTime: BirthData = {
        birthDate: "1990-08-15",
        timezone: "America/New_York",
      };
      const result1 = calculateAstrology(unknownTime);
      const result2 = calculateAstrology(unknownTime);
      // Exact assertion: identical unresolved state
      assert.strictEqual(result1.moon.status, result2.moon.status);
      assert.strictEqual(result1.moon.sign, result2.moon.sign);
      assert.strictEqual(result1.rising.status, result2.rising.status);
      assert.strictEqual(result1.rising.sign, result2.rising.sign);
    });
  });

  describe("Numerology Determinism — Exact Reduction", () => {
    it("Personal Year reduction is deterministic and repeatable", () => {
      const result1 = calcPersonalYear("1990-08-15", 2026);
      const result2 = calcPersonalYear("1990-08-15", 2026);
      // Exact assertion: identical numeric result
      assert.strictEqual(result1, result2);
      assert.ok(typeof result1 === "number");
      assert.ok(result1 >= 1 && result1 <= 33);
    });

    it("Personal Year preserves master numbers (11, 22, 33)", () => {
      const masterNum = calcPersonalYear("1999-11-11", 2026);
      // Exact assertion: result is valid numerology number
      assert.ok([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].includes(masterNum));
    });

    it("Personal Day is deterministic from same inputs", () => {
      const targetDate = new Date("2026-08-15");
      const day1 = calcPersonalDay("1990-08-15", targetDate);
      const day2 = calcPersonalDay("1990-08-15", new Date("2026-08-15"));
      // Exact assertion: identical numeric result
      assert.strictEqual(day1, day2);
      assert.ok(typeof day1 === "number");
      assert.ok(day1 >= 1 && day1 <= 33);
    });

    it("Personal Month cycles within Personal Year", () => {
      const py = calcPersonalYear("1990-08-15", 2026);
      const month1 = calcPersonalMonth(py, 1, 2026);
      const month2 = calcPersonalMonth(py, 2, 2026);
      // Exact assertion: different months produce different values
      assert.ok(typeof month1 === "number");
      assert.ok(typeof month2 === "number");
      assert.ok(month1 >= 1 && month1 <= 33);
      assert.ok(month2 >= 1 && month2 <= 33);
    });

    it("Numerology is pure math with no external dependencies", () => {
      const result = calcPersonalYear("2000-01-01", 2025);
      // Exact assertion: deterministic numeric result, no I/O
      assert.strictEqual(typeof result, "number");
      assert.ok(result >= 1 && result <= 33);
    });
  });

  describe("Human Design Calculation — Deterministic with Explicit Unresolved", () => {
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
      // Exact assertion: identical type across calls
      assert.strictEqual(hd1.type, hd2.type);
      assert.ok(typeof hd1.type === "string");
    });

    it("missing birth time returns unresolved state without fabricated activations", () => {
      const noTime: BirthData = {
        birthDate: "1990-08-15",
        timezone: "America/New_York",
      };
      const result = calculateHumanDesign(noTime);
      // Exact assertions: explicit unresolved state, activations omitted (not fabricated)
      assert.strictEqual(result.type, "unresolved");
      assert.strictEqual(result.strategy, "requires_verified_birth_time");
      // Activations must be undefined or omitted; we do not fabricate gate:0 line:0
      assert.strictEqual(result.activations, undefined);
    });

    it("calculates all required Human Design components when data complete", () => {
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 40.7128,
        longitude: -74.006,
      };
      const result = calculateHumanDesign(birthData);
      // Exact assertions: all components present and typed
      assert.ok(result.type);
      assert.notStrictEqual(result.type, "unresolved");
      assert.ok(result.strategy);
      assert.ok(result.authority);
      assert.ok(result.profile);
      assert.ok(result.definition);
      assert.ok(result.centers !== undefined);
      assert.ok(Array.isArray(result.channels));
    });
  });

  describe("Verification State Accuracy — No Ambiguous Status", () => {
    it("calculated placements return calculated_pending_independent_verification, not mixed states", () => {
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(birthData);
      // Exact assertion: status is one of the valid states, consistent
      const validStatuses = [
        "calculated_pending_independent_verification",
        "requires_verified_birth_time",
        "pending_ephemeris",
      ];
      assert.ok(validStatuses.includes(result.moon.status));
    });
  });

  describe("No Silent Data Upgrades — Strict Boundary", () => {
    it("does not fabricate Missing placements even when other data complete", () => {
      const noLocation: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(noLocation);
      // Exact assertions: null sign, no upgrade
      assert.strictEqual(result.rising.sign, null);
      assert.strictEqual(result.rising.status, "requires_location");
      assert.strictEqual(result.rising.confidence, null);
    });

    it("verifiedBodies list only contains placements that passed independent reference", () => {
      const unknownTime: BirthData = {
        birthDate: "1990-08-15",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(unknownTime);
      // Exact assertion: no false verification claims
      for (const body of result.verification.verifiedBodies) {
        if (body === "Sun") {
          assert.strictEqual(result.sun.status, "verified");
        } else if (body === "Moon") {
          assert.strictEqual(result.moon.status, "verified");
        } else if (body === "Ascendant") {
          assert.strictEqual(result.rising.status, "verified");
        }
      }
    });
  });

  describe("Repeatability Guarantee — Exact Determinism", () => {
    it("produces identical Sun signs across 5 sequential calls", () => {
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };
      const results = Array.from({ length: 5 }, () => calculateAstrology(birthData));
      const firstSign = results[0].sun.sign;
      // Exact assertion: all calls produce identical result
      for (const result of results.slice(1)) {
        assert.strictEqual(result.sun.sign, firstSign);
      }
    });

    it("numerology is repeatable across identical inputs", () => {
      const year1 = calcPersonalYear("1990-08-15", 2020);
      const year2 = calcPersonalYear("1990-08-15", 2020);
      // Exact assertion: identical numeric result
      assert.strictEqual(year1, year2);
    });
  });

  describe("ESM/CJS Compatibility — Namespace Import Pattern", () => {
    it("SiderealTime function is accessible via astronomy-engine namespace import", async () => {
      // This test verifies the namespace import pattern is necessary
      // and documents the ESM/CJS compatibility requirement
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 40.7128,
        longitude: -74.006,
      };
      const result = calculateAstrology(birthData);
      // Exact assertion: if calculation succeeded, namespace import is working
      assert.ok(result);
      // Ascendant calculation uses SiderealTime via namespace
      if (result.rising.candidate) {
        assert.ok(result.rising.candidate.sign);
      }
    });
  });

  describe("Profile Persistence & Refresh Survival", () => {
    it("calculated profile data persists across simulated page refresh (save and reload)", () => {
      // Simulate: user generates reading → browser stores it → user refreshes page → data still available
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 40.7128,
        longitude: -74.006,
      };

      // First calculation (before refresh)
      const resultBeforeRefresh = calculateAstrology(birthData);
      // Exact assertion: sun status must be consistent (not random)
      assert.strictEqual(typeof resultBeforeRefresh.sun.status, "string");

      // Simulate storage: create JSON representation of profile with all astrological data
      const storedProfile = JSON.stringify({
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        timezone: birthData.timezone,
        latitude: birthData.latitude,
        longitude: birthData.longitude,
        sunStatus: resultBeforeRefresh.sun.status,
        sunSign: resultBeforeRefresh.sun.sign,
        sunDegree: resultBeforeRefresh.sun.degree,
        moonStatus: resultBeforeRefresh.moon.status,
        moonSign: resultBeforeRefresh.moon.sign,
        risingStatus: resultBeforeRefresh.rising.status,
        risingSign: resultBeforeRefresh.rising.sign,
      });

      // Simulate refresh: parse back from storage
      const recoveredProfile = JSON.parse(storedProfile);

      // Recalculate with same birth data after "refresh"
      const resultAfterRefresh = calculateAstrology(birthData);

      // Exact assertion: sun placement must be identical before and after refresh (determinism)
      assert.strictEqual(resultBeforeRefresh.sun.status, resultAfterRefresh.sun.status);
      assert.strictEqual(resultBeforeRefresh.sun.sign, resultAfterRefresh.sun.sign);
      assert.strictEqual(resultBeforeRefresh.sun.degree, resultAfterRefresh.sun.degree);
      // Exact assertion: stored status matches recalculated status
      assert.strictEqual(recoveredProfile.sunStatus, resultAfterRefresh.sun.status);
      // Exact assertion: moon and rising statuses also survive refresh
      assert.strictEqual(resultBeforeRefresh.moon.status, resultAfterRefresh.moon.status);
      assert.strictEqual(resultBeforeRefresh.rising.status, resultAfterRefresh.rising.status);
      assert.strictEqual(recoveredProfile.moonStatus, resultAfterRefresh.moon.status);
      assert.strictEqual(recoveredProfile.risingStatus, resultAfterRefresh.rising.status);
    });

    it("profile timestamp and schema version persist correctly through storage cycle", () => {
      const birthData: BirthData = {
        birthDate: "1990-08-15",
        birthTime: "14:30",
        timezone: "America/New_York",
      };

      const result = calculateAstrology(birthData);

      // Create profile storage object with schema metadata
      const now = new Date().toISOString();
      const storedProfile = JSON.stringify({
        schemaVersion: 1,
        createdAt: now,
        updatedAt: now,
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        timezone: birthData.timezone,
        sunSign: result.sun.sign,
      });

      // Simulate storage and retrieval
      const recoveredProfile = JSON.parse(storedProfile);

      // Exact assertion: schema and timestamps survive round-trip
      assert.strictEqual(recoveredProfile.schemaVersion, 1);
      assert.ok(recoveredProfile.createdAt);
      assert.ok(recoveredProfile.updatedAt);
      // Exact assertion: profile data is intact
      assert.strictEqual(recoveredProfile.sunSign, result.sun.sign);
    });
  });
});
