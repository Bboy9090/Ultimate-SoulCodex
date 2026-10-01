import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COMPATIBILITY_FORMULA_VERSION,
  buildCompatibilityProfileInput,
  buildMatchResponse,
  buildPersonComparisonResponse,
  deterministicLifePath,
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

    assert.equal(input.sunSign, undefined);
    assert.equal(input.lifePathNumber, undefined);
    assert.ok(input.unresolved.astrology.includes("Sun"));
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

    assert.equal(input.sunSign, undefined);
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
      birthDate: "1990-09-17",
      numerologyData: { lifePath: 4 },
    });

    assert.equal(input.sunSign, "Virgo");
    assert.equal(input.lifePathNumber, 9);
    assert.equal(input.unresolved.astrology.includes("Sun"), false);
  });

  it("preserves canonical master Life Paths only when recomputed from birth date", () => {
    const fixtures = [
      ["1966-12-31", 11],
      ["1950-01-06", 22],
    ] as const;

    for (const [birthDate, master] of fixtures) {
      assert.equal(deterministicLifePath({ birthDate, numerologyData: { lifePath: 9 } }), master);

      const explorer = buildMatchResponse({
        birthDate,
        astrologyData: { sunSign: "Virgo" },
        numerologyData: { lifePath: 9 },
      });
      assert.equal(explorer.available, true);
      assert.equal(explorer.formula.inputs.lifePathNumber, master);
      assert.equal(explorer.formula.version, COMPATIBILITY_FORMULA_VERSION);

      const person = buildPersonComparisonResponse(
        {
          birthDate,
          astrologyData: { sunSign: "Virgo" },
          numerologyData: { lifePath: 9 },
        },
        { name: "Alex", sunSign: "Pisces" },
      );
      assert.equal(person.available, true);
      assert.equal(person.formula.inputs.lifePathNumber, master);
      assert.equal(person.formula.version, COMPATIBILITY_FORMULA_VERSION);
    }
  });

  it("does not trust a supported-looking Life Path when birth date is absent", () => {
    for (const claimed of [1, 9, 11, 22, 33]) {
      assert.equal(deterministicLifePath({ numerologyData: { lifePath: claimed } }), undefined);
    }
  });

  it("rejects unsupported Life Path values instead of smuggling malformed numerology into scoring", () => {
    for (const invalid of [0, 10, 12, 44, -1, 4.5, "not-a-number"]) {
      assert.equal(deterministicLifePath({ lifePathNumber: invalid }), undefined);
    }
  });

  it("excludes a naked Human Design type from Foundation compatibility", () => {
    const input = buildCompatibilityProfileInput({
      astrologyData: {
        sun: { sign: "Virgo", verificationStatus: "verified", evidence },
      },
      humanDesignType: "Reflector",
    });

    assert.equal(input.humanDesignType, undefined);
    assert.deepEqual(input.unresolved.humanDesign, ["Human Design excluded from Foundation compatibility"]);
  });

  it("still excludes an evidence-complete Human Design object until its compatibility contract is independently promoted", () => {
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

    assert.equal(input.humanDesignType, undefined);
    assert.deepEqual(input.unresolved.humanDesign, ["Human Design excluded from Foundation compatibility"]);
  });

  it("allows a supported symbolic Sun without promoting it into verified astrology", () => {
    const result = buildMatchResponse({
      astrologyData: { sunSign: "virgo" },
      birthDate: "1990-09-17",
      numerologyData: { lifePath: 4 },
      humanDesignType: "Reflector",
    });

    assert.equal(result.available, true);
    assert.equal(result.evidenceMode, "symbolic");
    assert.equal(result.formula.inputs.sunSign, "Virgo");
    assert.equal(result.formula.inputs.lifePathNumber, 9);
    assert.equal(result.formula.inputs.humanDesignType, null);
    assert.match(result.formula.layers.join(" "), /not verified astronomy/);
    assert.ok(result.excludedLayers.includes("Human Design excluded from Foundation compatibility"));
  });

  it("uses a locally computed Sun candidate only in the symbolic tier", () => {
    const profile = {
      astrologyData: {
        sun: {
          verificationStatus: "pending_independent_verification",
          internalCandidate: { sign: "virgo" },
        },
      },
      birthDate: "1966-12-31",
      numerologyData: { lifePath: 4 },
    };

    const verified = buildCompatibilityProfileInput(profile);
    assert.equal(verified.sunSign, undefined);
    assert.equal(symbolicSunSign(profile), "Virgo");

    const result = buildMatchResponse(profile);
    assert.equal(result.available, true);
    assert.equal(result.evidenceMode, "symbolic");
    assert.equal(result.formula.inputs.sunSign, "Virgo");
    assert.equal(result.formula.inputs.lifePathNumber, 11);
  });

  it("prefers the verified Sun over a conflicting symbolic alias", () => {
    const result = buildMatchResponse({
      sunSign: "Leo",
      astrologyData: {
        sunSign: "Leo",
        sun: { sign: "Virgo", verificationStatus: "verified", evidence },
      },
    });

    assert.equal(result.available, true);
    assert.equal(result.evidenceMode, "verified");
    assert.equal(result.formula.inputs.sunSign, "Virgo");
  });

  it("keeps compatibility unavailable when neither verified nor valid symbolic Sun exists", () => {
    const result = buildMatchResponse({ astrologyData: { sunSign: "NotASign" } });

    assert.equal(symbolicSunSign({ astrologyData: { sunSign: "NotASign" } }), undefined);
    assert.equal(result.available, false);
    assert.equal(result.evidenceMode, "unavailable");
    assert.equal(result.formula.inputs.sunSign, null);
  });

  it("compares one person by dimensions without inventing a universal relationship score", () => {
    const result = buildPersonComparisonResponse(
      {
        astrologyData: {
          sun: { sign: "Virgo", verificationStatus: "verified", evidence },
        },
        birthDate: "1990-09-17",
        numerologyData: { lifePath: 4 },
        humanDesignType: "Reflector",
      },
      { name: "Alex", sunSign: "pisces" },
    );

    assert.equal(result.available, true);
    assert.equal(result.evidenceMode, "symbolic");
    assert.equal(result.savedSunEvidenceMode, "verified");
    assert.deepEqual(result.person, { name: "Alex", sunSign: "Pisces" });
    assert.ok(result.dimensions);
    assert.equal(typeof result.dimensions.romantic, "number");
    assert.equal(typeof result.dimensions.chemistry, "number");
    assert.equal(typeof result.dimensions.mentalFriendship, "number");
    assert.equal(typeof result.dimensions.growth, "number");
    assert.equal(Object.prototype.hasOwnProperty.call(result, "overallScore"), false);
    assert.equal(result.formula.inputs.humanDesignType, null);
    assert.ok(result.excludedLayers.includes("Human Design excluded from Foundation compatibility"));
    assert.match(result.formula.layers.join(" "), /user-supplied symbolic data/);
  });
});
