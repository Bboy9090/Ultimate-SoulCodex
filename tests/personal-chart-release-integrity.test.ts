import assert from "node:assert/strict";
import test from "node:test";
import { buildClarityReadingModel } from "../client/src/lib/clarityReadingModel";
import { preserveVerifiedPlanetaryEvidence } from "../client/src/lib/profileVerificationReconciliation";
import { chartPlacementReading } from "../client/src/lib/chartPlacementReading";
import { calculateAscendantCandidate } from "../server/services/ascendant-verification";

const timestamp = "1990-09-17T14:10:00.000Z";
const evidence = { source: "Independent reference", engine: "qualified-engine", calculatedAt: timestamp, inputTimestamp: timestamp };
const sun = { sign: "Virgo", verificationStatus: "verified", evidence, internalCandidate: { longitude: 174.4299, inputTimestamp: timestamp } };
const inputs = { birthDate: "1990-09-17", birthTime: "10:10", timezone: "America/New_York" };

test("Free reading explains the admitted chart instead of generic cached prose", () => {
  const model = buildClarityReadingModel({ birthDate: inputs.birthDate, verifiedAstrologyData: { sun, planets: { sun } } }, { fullNameNumerology: false, humanDesignCore: true, interpretationDepth: false });
  assert.match(model.visiblePattern, /Sun in Virgo/);
  assert.match(model.gift, /Sun in Virgo/);
  assert.equal(model.planetaryReadings?.length, 1);
  assert.match(model.planetaryReadings![0].meaning, /house is unresolved/);
  assert.doesNotMatch(model.groundedAction, /Choose one situation where you usually/);
});

test("planet, sign and house each change the personal explanation", () => {
  const sunReading = chartPlacementReading("sun", "Virgo", 11, "verified")!;
  const moonReading = chartPlacementReading("moon", "Virgo", 11, "verified")!;
  const changed = chartPlacementReading("sun", "Aries", 6, "verified")!;
  assert.match(sunReading.meaning, /House 11.*friendships/);
  assert.match(moonReading.meaning, /emotional needs/);
  assert.notEqual(sunReading.meaning, moonReading.meaning);
  assert.notEqual(changed.action, sunReading.action);
  assert.equal(chartPlacementReading("fake", "Virgo", 1, "verified"), null);
});

test("temporary reference failure preserves a successful planet for the same instant", () => {
  const incoming = { planets: { sun: { sign: null, verificationStatus: "pending_independent_verification", evidence, verificationFailure: { reason: "horizons_http_503" } } } };
  assert.equal(preserveVerifiedPlanetaryEvidence({ planets: { sun } }, incoming, inputs).planets.sun.sign, "Virgo");
  assert.equal(preserveVerifiedPlanetaryEvidence({ planets: { sun } }, incoming, { ...inputs, birthTime: "11:11" }).planets.sun.sign, null);
  const conflict = { planets: { sun: { ...incoming.planets.sun, verificationFailure: { reason: "longitude_disagreement" } } } };
  assert.equal(preserveVerifiedPlanetaryEvidence({ planets: { sun } }, conflict, inputs).planets.sun.sign, null);
});

test("a status-only untrusted planet is never preserved", () => {
  const incoming = { planets: { sun: { evidence, verificationFailure: { reason: "horizons_http_503" } } } };
  assert.equal(preserveVerifiedPlanetaryEvidence({ planets: { sun: { ...sun, evidence: { inputTimestamp: timestamp } } } }, incoming, inputs), incoming);
});

test("owner regression instant agrees with independent Swiss Ascendant reference", () => {
  const result = calculateAscendantCandidate({ inputTimestamp: timestamp, latitude: 40.8448, longitude: -73.8648 });
  assert.equal(result.sign, "Scorpio");
  assert.ok(Math.abs(result.longitudeDegrees - 215.37476978813385) < 0.001);
});
