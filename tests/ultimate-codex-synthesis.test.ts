import assert from "node:assert/strict";
import test from "node:test";
import { buildUltimateCodexSynthesis } from "../client/src/lib/ultimateCodexSynthesis.ts";

const placementEvidence = {
  source: "Independent verified synthesis fixture",
  engine: "test-independent-engine",
  calculatedAt: "2026-09-26T12:00:00.000Z",
};

function profile(moonSign = "Virgo") {
  const signs: Record<string, string> = {
    sun: "Virgo", moon: moonSign, mercury: "Virgo", venus: "Libra", mars: "Scorpio",
    jupiter: "Capricorn", saturn: "Aquarius", uranus: "Capricorn", neptune: "Capricorn", pluto: "Scorpio",
  };
  const signStart: Record<string, number> = {
    Aries:0,Taurus:30,Gemini:60,Cancer:90,Leo:120,Virgo:150,Libra:180,Scorpio:210,Sagittarius:240,Capricorn:270,Aquarius:300,Pisces:330,
  };
  const planets: Record<string, any> = {};
  const planetaryHouses: Record<string, number> = {};
  Object.keys(signs).forEach((key, index) => {
    const sign = signs[key];
    planets[key] = {
      verificationStatus: "verified",
      sign,
      evidence: placementEvidence,
      internalCandidate: { longitude: signStart[sign] + 3 + index },
    };
    planetaryHouses[key] = key === "sun" || key === "moon" || key === "mercury" ? 10 : ((index + 2) % 12) + 1;
  });

  const zodiac = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  return {
    verifiedAstrologyData: {
      planets,
      planetaryHouses,
      rising: {
        verificationStatus: "verified",
        sign: "Scorpio",
        evidence: placementEvidence,
        internalCandidate: { longitude: 222 },
      },
      midheaven: {
        verificationStatus: "verified",
        sign: "Leo",
        longitude: 130,
        degree: 10,
        policyId: "ASTRO-EQUAL-HOUSE-v1",
        evidenceArtifactId: "equal-house-fixture",
      },
      northNode: {
        verificationStatus: "verified",
        sign: "Taurus",
        longitude: 48,
        degree: 18,
        house: 7,
        policyId: "ASTRO-MEAN-NODE-v1",
        evidenceArtifactId: "mean-node-fixture",
      },
      southNode: {
        verificationStatus: "verified",
        sign: "Scorpio",
        longitude: 228,
        degree: 18,
        house: 1,
        policyId: "ASTRO-MEAN-NODE-v1",
        evidenceArtifactId: "mean-node-fixture",
      },
      chiron: {
        verificationStatus: "verified",
        sign: "Cancer",
        longitude: 105,
        degree: 15,
        house: 4,
        policyId: "ASTRO-CHIRON-v1",
        evidenceArtifactId: "chiron-live-jpl-fixture",
      },
      houses: Array.from({ length: 12 }, (_, index) => ({
        verificationStatus: "verified",
        house: index + 1,
        sign: zodiac[index],
        degree: 12,
        longitude: index * 30 + 12,
        policyId: "ASTRO-EQUAL-HOUSE-v1",
        evidenceArtifactId: "equal-house-fixture",
      })),
      aspects: [
        { planet1: "sun", planet2: "mars", aspect: "square", orb: 2.1, policyId: "ASTRO-ASPECT-MAJOR-v1" },
        { planet1: "moon", planet2: "venus", aspect: "trine", orb: 1.2, policyId: "ASTRO-ASPECT-MAJOR-v1" },
      ],
    },
    numerologyData: { lifePath: 9, birthday: 8, expression: 5, soulUrge: 2, personality: 7, maturity: 5, personalYear: 9 },
    humanDesignData: {
      status: "verified",
      verificationReceiptId: "HUMAN-DESIGN-CORE-v1-fixture-receipt",
      independentSource: "independent-hd-fixture",
      verifiedAt: "2026-09-26T12:00:00.000Z",
      type: "Reflector",
      strategy: "To Wait a Lunar Cycle",
      authority: "Lunar Authority",
      profile: "2/5",
      definition: "No Definition",
      centers: { defined: [], undefined: ["Head","Ajna","Throat","G","Heart","Spleen","Solar Plexus","Sacral","Root"] },
      channels: [],
      activatedGates: [18, 28, 41],
      activations: {
        conscious: {
          sun: { gate: 18, line: 2 },
          moon: { gate: 28, line: 4 },
        },
        unconscious: {
          sun: { gate: 41, line: 5 },
        },
      },
    },
  };
}

test("Ultimate Codex detects verified stellium-style clusters and contradictions", () => {
  const result = buildUltimateCodexSynthesis(profile());
  assert.equal(result.placements.length, 10);
  assert.equal(result.houseCusps.length, 12);
  assert.equal(result.supportingPoints.length, 5);
  assert.equal(result.coverage, "complete");
  assert.ok(result.evidenceSignature.some((value) => value.startsWith("point:northNode:Taurus")));
  assert.ok(result.evidenceSignature.includes("num:birthday:8"));
  assert.ok(result.evidenceSignature.includes("num:maturity:5"));
  assert.ok(!result.evidenceSignature.some((value) => value.startsWith("num:personalYear:")));
  assert.ok(result.stelliums.some((cluster) => cluster.kind === "sign" && cluster.key === "Virgo"));
  assert.ok(result.stelliums.some((cluster) => cluster.kind === "house" && cluster.key === "10"));
  assert.ok(result.tensions.some((value) => /square/i.test(value)));
  assert.ok(result.tensions.some((value) => /Expression 5/i.test(value)));
  assert.match(result.codexNumber, /^\d{12}$/);
  assert.match(result.codexId, /^GCX-/);
  assert.ok(result.derivedArchetype);
  assert.ok(result.systemSummary.some((row) => row.system === "Numerology" && /deterministic stable core/.test(row.status)));
  assert.ok(result.systemSummary.some((row) => row.system === "Astrocartography" && /unavailable \/ excluded/.test(row.status)));
  assert.ok(result.systemSummary.some((row) => row.system === "Palmistry" && /unavailable \/ excluded/.test(row.status)));
  assert.ok(result.systemSummary.some((row) => row.system === "Personality assessments" && /not assessed \/ excluded/.test(row.status)));
});

test("Ultimate Codex fingerprint changes when governed chart evidence changes", () => {
  const a = buildUltimateCodexSynthesis(profile("Virgo"));
  const b = buildUltimateCodexSynthesis(profile("Libra"));
  assert.notEqual(a.fingerprint, b.fingerprint);
  assert.notEqual(a.codexNumber, b.codexNumber);
});

test("Ultimate Codex fails closed instead of manufacturing unsupported systems", () => {
  const result = buildUltimateCodexSynthesis({
    astrologyData: {},
    numerologyData: { lifePath: 9 },
    humanDesignData: { status: "calculated_unverified", type: "Reflector" },
  });
  assert.equal(result.coverage, "insufficient");
  assert.equal(result.derivedArchetype, null);
  assert.equal(result.fingerprint, null);
  assert.equal(result.codexNumber, null);
  assert.equal(result.codexId, null);
  assert.ok(result.unresolved.some((value) => /Human Design/i.test(value)));
});


test("verified Human Design gate-line activations alter the stable Codex fingerprint", () => {
  const first = profile();
  const second = profile();
  second.humanDesignData.activations.conscious.sun.line = 3;
  const a = buildUltimateCodexSynthesis(first);
  const b = buildUltimateCodexSynthesis(second);
  assert.ok(a.evidenceSignature.includes("hd:activation:conscious:sun:18.2"));
  assert.ok(b.evidenceSignature.includes("hd:activation:conscious:sun:18.3"));
  assert.notEqual(a.fingerprint, b.fingerprint);
  assert.notEqual(a.codexNumber, b.codexNumber);
});

test("documented numerology aliases produce the same stable Codex identity", () => {
  const canonical = profile();
  const aliased = profile();
  aliased.numerologyData = {
    lifePathNumber: aliased.numerologyData.lifePath,
    birthDay: aliased.numerologyData.birthday,
    expressionNumber: aliased.numerologyData.expression,
    soulUrgeNumber: aliased.numerologyData.soulUrge,
    personalityNumber: aliased.numerologyData.personality,
    maturityNumber: aliased.numerologyData.maturity,
    personalYearNumber: aliased.numerologyData.personalYear,
  };
  const a = buildUltimateCodexSynthesis(canonical);
  const b = buildUltimateCodexSynthesis(aliased);
  assert.equal(a.coverage, "complete");
  assert.equal(b.coverage, "complete");
  assert.equal(a.fingerprint, b.fingerprint);
  assert.equal(a.codexNumber, b.codexNumber);
});

test("verified supporting points alter the Codex fingerprint", () => {
  const first = profile();
  const second = profile();
  second.verifiedAstrologyData.northNode.sign = "Gemini";
  second.verifiedAstrologyData.northNode.longitude = 72;
  second.verifiedAstrologyData.northNode.degree = 12;
  const a = buildUltimateCodexSynthesis(first);
  const b = buildUltimateCodexSynthesis(second);
  assert.notEqual(a.fingerprint, b.fingerprint);
  assert.notEqual(a.codexNumber, b.codexNumber);
});


test("status-only Human Design cannot enter the stable Codex fingerprint", () => {
  const trusted = profile();
  const statusOnly: any = profile();
  delete statusOnly.humanDesignData.verificationReceiptId;
  delete statusOnly.humanDesignData.independentSource;
  delete statusOnly.humanDesignData.verifiedAt;

  const trustedResult = buildUltimateCodexSynthesis(trusted);
  const statusOnlyResult = buildUltimateCodexSynthesis(statusOnly);

  assert.ok(trustedResult.evidenceSignature.some((value) => value.startsWith("hd:type:")));
  assert.equal(
    statusOnlyResult.evidenceSignature.some((value) => value.startsWith("hd:")),
    false,
  );
  assert.ok(statusOnlyResult.unresolved.some((value) => /Human Design/i.test(value)));
  assert.notEqual(trustedResult.fingerprint, statusOnlyResult.fingerprint);
});

test("status-only derived astrology cannot enter Ultimate Codex evidence", () => {
  const candidate: any = profile();

  for (const row of candidate.verifiedAstrologyData.houses) {
    delete row.policyId;
    delete row.evidenceArtifactId;
  }
  delete candidate.verifiedAstrologyData.midheaven.policyId;
  delete candidate.verifiedAstrologyData.midheaven.evidenceArtifactId;
  delete candidate.verifiedAstrologyData.northNode.policyId;
  delete candidate.verifiedAstrologyData.northNode.evidenceArtifactId;
  delete candidate.verifiedAstrologyData.southNode.policyId;
  delete candidate.verifiedAstrologyData.southNode.evidenceArtifactId;
  delete candidate.verifiedAstrologyData.chiron.policyId;
  delete candidate.verifiedAstrologyData.chiron.evidenceArtifactId;
  for (const aspect of candidate.verifiedAstrologyData.aspects) {
    delete aspect.policyId;
  }

  const result = buildUltimateCodexSynthesis(candidate);
  assert.equal(result.houseCusps.length, 0);
  assert.equal(result.aspects.length, 0);
  assert.equal(
    result.supportingPoints.some((point) =>
      ["midheaven", "northNode", "southNode", "chiron"].includes(point.key),
    ),
    false,
  );
  assert.equal(result.coverage, "partial");
});

test("status-only natal placements and Rising cannot enter Ultimate Codex evidence", () => {
  const candidate: any = profile();

  for (const placement of Object.values(candidate.verifiedAstrologyData.planets) as any[]) {
    delete placement.evidence;
  }
  delete candidate.verifiedAstrologyData.rising.evidence;

  const result = buildUltimateCodexSynthesis(candidate);
  assert.equal(result.placements.length, 0);
  assert.equal(
    result.supportingPoints.some((point) => point.key === "rising"),
    false,
  );
  assert.equal(result.coverage, "partial");
});


test("unsupported numerology values cannot enter Ultimate Codex coverage or fingerprint", () => {
  const candidate: any = profile();
  candidate.numerologyData = {
    lifePath: 99,
    birthday: 0,
    expression: 44,
    soulUrge: -1,
    personality: 10,
    maturity: 100,
    personalYear: 77,
  };

  const result = buildUltimateCodexSynthesis(candidate);

  assert.equal(result.coverage, "partial");
  assert.equal(
    result.evidenceSignature.some((value) => value.startsWith("num:")),
    false,
  );
  assert.ok(result.unresolved.some((value) => /Life Path/i.test(value)));
  assert.ok(result.unresolved.some((value) => /Birthday number/i.test(value)));
  assert.ok(result.unresolved.some((value) => /Expression number/i.test(value)));
  assert.ok(result.unresolved.some((value) => /Soul Urge/i.test(value)));
  assert.ok(result.unresolved.some((value) => /Personality number/i.test(value)));
  assert.ok(result.unresolved.some((value) => /Maturity number/i.test(value)));
});

test("invalid current-cycle numerology never changes the stable Codex identity", () => {
  const valid = profile();
  const invalidCycle: any = profile();
  invalidCycle.numerologyData.personalYear = 99;

  const a = buildUltimateCodexSynthesis(valid);
  const b = buildUltimateCodexSynthesis(invalidCycle);

  assert.equal(a.fingerprint, b.fingerprint);
  assert.equal(a.codexNumber, b.codexNumber);
  assert.equal(
    b.evidenceSignature.some((value) => value.startsWith("num:personalYear:")),
    false,
  );
});


test("Ultimate Codex rejects malformed aspect policy rows", () => {
  const invalid: any = profile();
  invalid.verifiedAstrologyData.aspects.push(
    { planet1: "sun", planet2: "moon", aspect: "banana", orb: 1, policyId: "ASTRO-ASPECT-MAJOR-v1" },
    { planet1: "sun", planet2: "venus", aspect: "square", orb: -1, policyId: "ASTRO-ASPECT-MAJOR-v1" },
    { planet1: "mars", planet2: "jupiter", aspect: "sextile", orb: 6.01, policyId: "ASTRO-ASPECT-MAJOR-v1" },
  );

  const result = buildUltimateCodexSynthesis(invalid);
  assert.equal(result.aspects.length, 2);
  assert.equal(result.aspects.some((aspect) => aspect.aspect === "banana"), false);
  assert.equal(result.aspects.some((aspect) => aspect.orb < 0), false);
  assert.equal(
    result.aspects.some((aspect) => aspect.aspect === "sextile" && aspect.orb > 6),
    false,
  );
});

test("Ultimate Codex rejects inconsistent governed cusp and point geometry", () => {
  const invalid: any = profile();

  invalid.verifiedAstrologyData.houses[0].sign = "Taurus";
  invalid.verifiedAstrologyData.midheaven.degree = 35;
  invalid.verifiedAstrologyData.northNode.sign = "Gemini";

  const result = buildUltimateCodexSynthesis(invalid);

  assert.equal(result.houseCusps.length, 11);
  assert.equal(
    result.supportingPoints.some((point) => point.key === "midheaven"),
    false,
  );
  assert.equal(
    result.supportingPoints.some((point) => point.key === "northNode"),
    false,
  );
  assert.equal(result.coverage, "partial");
});
