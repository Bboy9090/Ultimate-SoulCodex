import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCompatibilityProfileInput,
  buildMatchResponse,
  buildPersonComparisonResponse,
  symbolicSunSign,
} from "../routes/compatibility";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "engine-a+engine-b",
  calculatedAt: "2026-08-02T17:00:00Z",
};

describe("compatibility saved-profile contract", () => {
  it("rejects naked legacy astrology strings from the verified input path", () => {
    const input = buildCompatibilityProfileInput({ sunSign: "Virgo", moonSign: "Scorpio", risingSign: "Capricorn", lifePathNumber: 9 });
    assert.equal(input.sunSign, undefined);
    assert.equal(input.lifePathNumber, 9);
    assert.ok(input.unresolved.astrology.includes("Sun"));
  });

  it("rejects a populated Sun placement that is still pending from the verified path", () => {
    const input = buildCompatibilityProfileInput({ astrologyData: { sun: { sign: "Virgo", verificationStatus: "pending_independent_verification", evidence } } });
    assert.equal(input.sunSign, undefined);
  });

  it("accepts an evidence-complete verified Sun placement", () => {
    const input = buildCompatibilityProfileInput({ astrologyData: { sun: { sign: "Virgo", verificationStatus: "verified", evidence } }, numerologyData: { lifePath: 9 } });
    assert.equal(input.sunSign, "Virgo");
    assert.equal(input.lifePathNumber, 9);
    assert.equal(input.unresolved.astrology.includes("Sun"), false);
  });

  for (const lifePath of [11, 22, 33]) {
    it(`preserves master Life Path ${lifePath} through the Compatibility input contract`, () => {
      const input = buildCompatibilityProfileInput({ astrologyData: { sun: { sign: "Virgo", verificationStatus: "verified", evidence } }, lifePathNumber: lifePath });
      assert.equal(input.lifePathNumber, lifePath);
      const explorer = buildMatchResponse({ astrologyData: { sun: { sign: "Virgo", verificationStatus: "verified", evidence } }, lifePathNumber: lifePath });
      assert.equal(explorer.available, true);
      assert.equal(explorer.formula.inputs.lifePathNumber, lifePath);
      const person = buildPersonComparisonResponse({ astrologyData: { sun: { sign: "Virgo", verificationStatus: "verified", evidence } }, lifePathNumber: lifePath }, { name: "Alex", sunSign: "Pisces" });
      assert.equal(person.available, true);
      assert.equal(person.formula.inputs.lifePathNumber, lifePath);
    });
  }

  it("excludes Human Design from Foundation compatibility", () => {
    const input = buildCompatibilityProfileInput({ astrologyData: { sun: { sign: "Virgo", verificationStatus: "verified", evidence } }, humanDesignType: "Reflector" });
    assert.equal(input.humanDesignType, undefined);
    assert.deepEqual(input.unresolved.humanDesign, ["Human Design excluded from Foundation compatibility"]);
  });

  it("still excludes evidence-complete Human Design until a separate compatibility contract promotes it", () => {
    const input = buildCompatibilityProfileInput({ astrologyData: { sun: { sign: "Virgo", verificationStatus: "verified", evidence } }, humanDesignData: { type: { value: "Reflector", verificationStatus: "verified", evidence: { source: "verified birth inputs", engine: "human-design-engine-v1", calculatedAt: "2026-08-02T17:00:00Z" } } } });
    assert.equal(input.humanDesignType, undefined);
  });

  it("allows a supported symbolic Sun without promoting it into verified astrology", () => {
    const result = buildMatchResponse({ astrologyData: { sunSign: "virgo" }, numerologyData: { lifePath: 9 }, humanDesignType: "Reflector" });
    assert.equal(result.available, true);
    assert.equal(result.evidenceMode, "symbolic");
    assert.equal(result.formula.inputs.sunSign, "Virgo");
    assert.equal(result.formula.inputs.lifePathNumber, 9);
    assert.equal(result.formula.inputs.humanDesignType, null);
    assert.match(result.formula.layers.join(" "), /not verified astronomy/);
  });

  it("uses a local internal Sun candidate only at the symbolic evidence tier", () => {
    const profile = { astrologyData: { sun: { verificationStatus: "pending_independent_verification", internalCandidate: { sign: "Virgo" } } }, lifePathNumber: 9 };
    assert.equal(symbolicSunSign(profile), "Virgo");
    const result = buildMatchResponse(profile);
    assert.equal(result.available, true);
    assert.equal(result.evidenceMode, "symbolic");
    assert.equal(result.formula.inputs.sunSign, "Virgo");
  });

  it("prefers the verified Sun over a conflicting symbolic alias", () => {
    const result = buildMatchResponse({ sunSign: "Leo", astrologyData: { sunSign: "Leo", sun: { sign: "Virgo", verificationStatus: "verified", evidence } } });
    assert.equal(result.available, true);
    assert.equal(result.evidenceMode, "verified");
    assert.equal(result.formula.inputs.sunSign, "Virgo");
  });

  it("keeps compatibility unavailable when neither verified nor valid symbolic Sun exists", () => {
    const result = buildMatchResponse({ astrologyData: { sunSign: "NotASign" } });
    assert.equal(symbolicSunSign({ astrologyData: { sunSign: "NotASign" } }), undefined);
    assert.equal(result.available, false);
    assert.equal(result.evidenceMode, "unavailable");
  });

  it("compares one person by dimensions without inventing a universal relationship score", () => {
    const result = buildPersonComparisonResponse(
      { astrologyData: { sun: { sign: "Virgo", verificationStatus: "verified", evidence } }, numerologyData: { lifePath: 9 }, humanDesignType: "Reflector" },
      { name: "Alex", sunSign: "pisces" },
    );
    assert.equal(result.available, true);
    assert.equal(result.evidenceMode, "symbolic");
    assert.deepEqual(result.person, { name: "Alex", sunSign: "Pisces" });
    assert.ok(result.dimensions);
    assert.equal(typeof result.dimensions.romantic, "number");
    assert.equal(typeof result.dimensions.chemistry, "number");
    assert.equal(typeof result.dimensions.mentalFriendship, "number");
    assert.equal(typeof result.dimensions.growth, "number");
    assert.equal(Object.prototype.hasOwnProperty.call(result, "overallScore"), false);
    assert.equal(result.formula.inputs.humanDesignType, null);
  });

  it("versions the Foundation Compatibility formula", () => {
    const result = buildMatchResponse({ astrologyData: { sunSign: "Virgo" }, lifePathNumber: 9 });
    assert.equal(result.formula.id, "foundation-compatibility-v1");
  });
});
