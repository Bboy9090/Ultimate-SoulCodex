import assert from "node:assert/strict";
import test from "node:test";
import { generateFallbackBiography, generateFallbackGuidance, type BiographyRequest } from "../server/services/openai-service";
import { canonicalNumberPattern, canonicalSignPattern } from "../shared/symbolic-vocabulary";
import { extractVerifiedAstrology } from "../server/lib/verified-astrology";
import { calculateProfileHumanDesign } from "../server/services/profile-human-design";

const evidence = { source: "independent ephemeris", engine: "qualified-engine", calculatedAt: "2026-10-07T12:00:00Z" };
function profile(sign: string, path: number): BiographyRequest {
  return { name: "Shared Name", archetypeTitle: "Shared Title", astrologyData: {
    sun: { sign, verificationStatus: "verified", evidence },
  }, numerologyData: { lifePath: path }, personalityData: {}, archetype: {} };
}

test("server fallback changes actual action and interpretive substance across supported profiles", () => {
  const first = profile("Aries", 1);
  const second = profile("Virgo", 9);
  const a = generateFallbackGuidance(first);
  const b = generateFallbackGuidance(second);
  assert.match(a, new RegExp(canonicalSignPattern("Aries")!.action.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.ok(b.includes(canonicalNumberPattern(9)!.action));
  assert.notEqual(a, b);
  assert.notEqual(generateFallbackBiography(first), generateFallbackBiography(second));
  assert.doesNotMatch(a + b, /one grounded action|protection can outlive|hidden fear/);
  assert.match(a, /symbolic/);
});

test("candidate signs and unsupported numerology cannot generate substitute Virgo or Life Path 9", () => {
  const input = profile("Virgo", 0);
  input.astrologyData.sun.verificationStatus = "pending_independent_verification";
  input.numerologyData.expression = 99;
  const text = generateFallbackGuidance(input) + generateFallbackBiography(input);
  assert.doesNotMatch(text, /Virgo|Life Path 9|Expression 99/);
  assert.match(text, /No source-specific guidance/);
});

test("unsupported signs, whitespace provenance, and malformed timestamps are rejected", () => {
  for (const placement of [
    { sign: "InventedSign", verificationStatus: "verified", evidence },
    { sign: "Virgo", verificationStatus: "verified", evidence: { ...evidence, calculatedAt: "not-a-date" } },
    { sign: "Virgo", verificationStatus: "verified", evidence: { ...evidence, source: " " } },
  ]) assert.equal(extractVerifiedAstrology({ astrologyData: { sun: placement } }).sun, undefined);
  assert.equal(extractVerifiedAstrology({ astrologyData: { sun: { sign: " vIRgO ", verificationStatus: "verified", evidence } } }).sun, "Virgo");
});

test("forged Human Design status cannot enter deterministic fallback words", () => {
  const input = profile("Aries", 1);
  input.humanDesignData = { status: "verified", type: "Reflector", strategy: "Wait lunar cycle", authority: "Lunar", profile: "2/5" };
  assert.doesNotMatch(generateFallbackGuidance(input) + generateFallbackBiography(input), /Reflector|Lunar|Human Design/);
});

test("qualified Human Design contributes Strategy and Authority only as a symbolic decision experiment", () => {
  const input = profile("Virgo", 9);
  input.humanDesignData = calculateProfileHumanDesign({ birthDate: "1990-09-17", birthTime: "11:11", timezone: "America/New_York", latitude: 40.8448, longitude: -73.8648 });
  const guidance = generateFallbackGuidance(input);
  const hd = input.humanDesignData as Record<string, unknown>;
  assert.ok(guidance.includes(String(hd.strategy)));
  assert.ok(guidance.includes(String(hd.authority)));
  assert.match(guidance, /optional symbolic practice/);
  assert.match(generateFallbackBiography(input), /not a demonstrated psychological trait/);
});

test("identical symbolic actions are rendered once with both source labels", () => {
  const input = profile("Aries", 1);
  input.numerologyData.expression = 1;
  const result = generateFallbackGuidance(input);
  assert.ok(result.includes("Life Path 1 / Expression 1 reflection"));
  const action = canonicalNumberPattern(1)!.action;
  assert.equal(result.split(action).length - 1, 1);
});
