import { describe, it } from "node:test";
import assert from "node:assert";
import {
  calculateAstrology,
  calculateVerifiedAstrology,
  type BirthData,
} from "../services/astrology";

describe("Gate 3: No Silent Data Upgrades", () => {
  describe("Backend Astrology Service", () => {
    describe("calculateAstrology() returns unresolved placements when data is incomplete", () => {
      it("returns sun placement with pending status when no data provided", () => {
        const birthData: BirthData = { birthDate: "" };
        const result = calculateAstrology(birthData);

        assert.strictEqual(result.sun.sign, null);
        assert.strictEqual(result.sun.status, "pending_ephemeris");
        assert.strictEqual(result.sun.confidence, null);
        assert.strictEqual(result.sun.source, null);
        assert.ok(result.sun.reason);
      });

      it("returns moon placement with requires_verified_birth_time status when no birth time", () => {
        const birthData: BirthData = {
          birthDate: "1990-05-15",
          timezone: "America/New_York",
        };
        const result = calculateAstrology(birthData);

        assert.strictEqual(result.moon.sign, null);
        assert.strictEqual(result.moon.status, "requires_verified_birth_time");
        assert.strictEqual(result.moon.confidence, null);
        assert.match(result.moon.reason || "", /Birth time required/);
      });

      it("returns rising placement with requires_verified_birth_time when no time", () => {
        const birthData: BirthData = {
          birthDate: "1990-05-15",
          timezone: "America/New_York",
        };
        const result = calculateAstrology(birthData);

        assert.strictEqual(result.rising.sign, null);
        assert.strictEqual(result.rising.status, "requires_verified_birth_time");
      });

      it("returns rising placement with requires_location when no location", () => {
        const birthData: BirthData = {
          birthDate: "1990-05-15",
          birthTime: "14:30",
          timezone: "America/New_York",
        };
        const result = calculateAstrology(birthData);

        assert.strictEqual(result.rising.sign, null);
        assert.strictEqual(result.rising.status, "requires_location");
      });

      it("never invents approximate sun signs from date boundaries", () => {
        const testDates = [
          "1990-01-15", // Capricorn boundary
          "1990-04-20", // Taurus boundary
          "1990-07-23", // Leo boundary
          "1990-12-22", // Capricorn boundary
        ];

        testDates.forEach((date) => {
          const birthData: BirthData = { birthDate: date };
          const result = calculateAstrology(birthData);

          assert.strictEqual(result.sun.sign, null);
          assert.strictEqual(result.sun.status, "pending_ephemeris");
          assert.match(result.sun.reason || "", /does not/);
        });
      });

      it("verification object documents missing data", () => {
        const birthData: BirthData = { birthDate: "1990-05-15" };
        const result = calculateAstrology(birthData);

        assert.strictEqual(result.verification.complete, false);
        assert.ok(result.verification.missingData.length > 0);
        assert.ok(result.verification.suggestions);
      });

      it("verification object shows no verified bodies when incomplete", () => {
        const birthData: BirthData = { birthDate: "1990-05-15" };
        const result = calculateAstrology(birthData);

        assert.deepStrictEqual(result.verification.verifiedBodies, []);
        assert.strictEqual(result.verification.policyId, null);
      });
    });

    describe("Never returns hardcoded fallback signs", () => {
      it("Does not return suspicious fallback signs under any input", () => {
        const testCases: BirthData[] = [
          { birthDate: "" },
          { birthDate: "invalid" },
          { birthDate: "1990-05-15" },
          { birthDate: "1990-05-15", birthTime: "" },
          { birthDate: "1990-05-15", birthTime: "14:30" },
          { birthDate: "1990-05-15", birthTime: "14:30", timezone: "UTC" },
          {
            birthDate: "1990-05-15",
            birthTime: "14:30",
            timezone: "UTC",
            latitude: 0,
            longitude: 0,
          },
        ];

        testCases.forEach((birthData) => {
          const result = calculateAstrology(birthData);

          assert.notStrictEqual(result.sun.sign, "Gemini");
          assert.notStrictEqual(result.sun.sign, "Pisces");
          assert.notStrictEqual(result.sun.sign, "Sagittarius");
          assert.notStrictEqual(result.moon.sign, "Gemini");
          assert.notStrictEqual(result.moon.sign, "Pisces");
          assert.notStrictEqual(result.moon.sign, "Sagittarius");
          assert.notStrictEqual(result.rising.sign, "Gemini");
          assert.notStrictEqual(result.rising.sign, "Pisces");
          assert.notStrictEqual(result.rising.sign, "Sagittarius");
        });
      });
    });
  });

  describe("Regression: Silent upgrade protection", () => {
    it("FAILS if code silently upgrades approximate sun sign to verified", () => {
      const birthData: BirthData = { birthDate: "1990-05-15" };
      const result = calculateAstrology(birthData);

      assert.strictEqual(result.sun.sign, null);
      assert.notStrictEqual(result.sun.status, "verified");
      assert.ok(!result.verification.verifiedBodies.includes("Sun"));
    });

    it("FAILS if code creates approximate moon sign without birth time", () => {
      const birthData: BirthData = {
        birthDate: "1990-05-15",
        timezone: "America/New_York",
      };
      const result = calculateAstrology(birthData);

      assert.strictEqual(result.moon.sign, null);
      assert.notStrictEqual(result.moon.status, "verified");
      assert.ok(!result.verification.verifiedBodies.includes("Moon"));
    });

    it("FAILS if code invents rising sign from coordinates alone", () => {
      const birthData: BirthData = {
        birthDate: "1990-05-15",
        latitude: 40.7128,
        longitude: -74.006,
      };
      const result = calculateAstrology(birthData);

      assert.strictEqual(result.rising.sign, null);
      assert.notStrictEqual(result.rising.status, "verified");
      assert.strictEqual(result.rising.status, "requires_verified_birth_time");
    });

    it("FAILS if verification.complete is true with missing data", () => {
      const birthData: BirthData = { birthDate: "1990-05-15" };
      const result = calculateAstrology(birthData);

      if (!result.verification.complete) {
        assert.ok(result.verification.missingData.length > 0);
      }
      assert.strictEqual(
        result.verification.verifiedBodies.length,
        result.verification.complete ? 3 : 0
      );
    });

    it("FAILS if unresolved placement appears in unresolvedBodies list but is marked verified", () => {
      const birthData: BirthData = { birthDate: "1990-05-15" };
      const result = calculateAstrology(birthData);

      result.verification.unresolvedBodies.forEach((body) => {
        const placement =
          body === "Sun"
            ? result.sun
            : body === "Moon"
              ? result.moon
              : result.rising;
        assert.notStrictEqual(placement.status, "verified");
      });
    });
  });

  describe("Verified astrology maintains verification discipline", () => {
    it("calculateVerifiedAstrology requires explicit birth time and timezone", async () => {
      const birthDataWithoutTime: BirthData = {
        birthDate: "1990-05-15",
        timezone: "America/New_York",
      };

      const result = await calculateVerifiedAstrology(birthDataWithoutTime);

      assert.strictEqual(result.sun.sign, null);
      assert.match(result.sun.reason || "", /explicit birth time/);
      assert.strictEqual(result.verification.complete, false);
    });

    it("Never silently upgrades calculated data to verified without independent reference", async () => {
      const birthData: BirthData = {
        birthDate: "1990-05-15",
        birthTime: "14:30",
        timezone: "America/New_York",
        latitude: 40.7128,
        longitude: -74.006,
      };

      const result = await calculateVerifiedAstrology(birthData, {
        referenceFetcher: async () => {
          throw new Error("Reference unavailable");
        },
      });

      assert.notStrictEqual(result.sun.status, "verified");
      assert.ok(result.sun.verificationFailure);
    });
  });
});
