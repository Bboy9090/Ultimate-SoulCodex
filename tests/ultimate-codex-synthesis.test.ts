import assert from "node:assert/strict";
import test from "node:test";
import { buildUltimateCodexSynthesis } from "../client/src/lib/ultimateCodexSynthesis.ts";

const placementEvidence = {
  source: "independent ephemeris comparison",
  engine: "ultimate-codex-test-reference@1",
  calculatedAt: "2026-09-26T18:00:00.000Z",
};

const hdTrust = {
  engine: "soulcodex-hd-geocentric-v1",
  source: "Soul Codex deterministic Human Design core engine",
  calculatedAt: "2026-09-26T18:00:00.000Z",
  inputTimestampUtc: "1990-09-17T15:11:00.000Z",
  verificationReceiptId: "35474994858:human-design-repair-audit",
  independentSource: "free-human-design@1.0.1 differential verifier",
  verifiedAt: "2026-09-19T23:03:08.000Z",
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
    planets[key] = { verificationStatus: "verified", sign, evidence: placementEvidence, internalCandidate: { longitude: signStart[sign] + 3 + index } };
    planetaryHouses[key] = key === "sun" || key === "moon" || key === "mercury" ? 10 : ((index + 2) % 12) + 1;
  });

  const zodiac = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  return {
    verifiedAstrologyData: {
      planets,
      planetaryHouses,
      rising: { verificationStatus: "verified", sign: "Scorpio", evidence: placementEvidence, internalCandidate: { longitude: 222 } },
      midheaven: { verificationStatus: "verified", sign: "Leo", longitude: 130, degree: 10, policyId: "ASTRO-EQUAL-HOUSE-v1", evidenceArtifactId: "equal-house-test-artifact" },
      northNode: { verificationStatus: "verified", sign: "Taurus", longitude: 48, degree: 18, house: 7, mode: "mean", policyId: "ASTRO-MEAN-NODE-v1", evidenceArtifactId: "mean-node-test-artifact" },
      southNode: { verificationStatus: "verified", sign: "Scorpio", longitude: 228, degree: 18, house: 1, mode: "mean", policyId: "ASTRO-MEAN-NODE-v1", evidenceArtifactId: "mean-node-test-artifact" },
      chiron: { verificationStatus: "verified", sign: "Cancer", longitude: 105, degree: 15, house: 4, policyId: "ASTRO-CHIRON-v1", evidenceArtifactId: "chiron-test-artifact", qualificationMethod: "live-jpl-qualified-against-swiss" },
      houses: Array.from({ length: 12 }, (_, index) => ({
        verificationStatus: "verified",
        policyId: "ASTRO-EQUAL-HOUSE-v1",
        evidenceArtifactId: "equal-house-test-artifact",
        house: index + 1,
        sign: zodiac[index],
        degree: 12,
        longitude: index * 30 + 12,
      })),
      aspects: [
        { planet1: "sun", planet2: "mars", aspect: "square", orb: 2.1, policyId: "ASTRO-ASPECT-MAJOR-v1" },
        { planet1: "moon", planet2: "venus", aspect: "trine", orb: 1.2, policyId: "ASTRO-ASPECT-MAJOR-v1" },
      ],
    },
    numerologyData: { lifePath: 9, birthday: 8, expression: 5, soulUrge: 2, personality: 7, maturity: 5, personalYear: 9 },
    humanDesignData: {
      status: "verified",
      ...hdTrust,
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

test("Ultimate Codex excludes label-only verified evidence from the stable fingerprint", () => {
  const unsafe = profile();
  unsafe.verifiedAstrologyData.planets.sun = {
    verificationStatus: "verified",
    sign: "Virgo",
    internalCandidate: { longitude: 174 },
  };
  unsafe.humanDesignData = {
    status: "verified",
    type: "Reflector",
    strategy: "To Wait a Lunar Cycle",
    authority: "Lunar Authority",
    profile: "2/5",
  } as any;

  const result = buildUltimateCodexSynthesis(unsafe);
  assert.equal(result.evidenceSignature.some((value) => value.startsWith("astro:sun:")), false);
  assert.equal(result.evidenceSignature.some((value) => value.startsWith("hd:type:")), false);
  assert.ok(result.unresolved.some((value) => /Human Design/i.test(value)));
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
