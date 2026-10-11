import assert from "node:assert/strict";
import test from "node:test";
import { explainProfileLabel } from "../client/src/lib/profileLabelExplanation";
import { canonicalNumberPattern, canonicalSignPattern } from "../shared/symbolic-vocabulary";
import { calcLifePath } from "@soulcodex/core";

test("different supported themes receive their own symbolic tradeoff and action", () => {
  const firstProfile = { birthDate: "1986-01-14" };
  const secondProfile = { birthDate: "1990-09-17" };
  const firstPattern = canonicalNumberPattern(calcLifePath(firstProfile.birthDate))!;
  const secondPattern = canonicalNumberPattern(calcLifePath(secondProfile.birthDate))!;
  const first = explainProfileLabel(firstPattern.gift, "strength", firstProfile);
  const second = explainProfileLabel(secondPattern.gift, "strength", secondProfile);
  assert.equal(first.practicalTakeaway, firstPattern.action);
  assert.equal(second.practicalTakeaway, secondPattern.action);
  assert.notEqual(first.practicalTakeaway, second.practicalTakeaway);
  assert.notEqual(first.tradeoff, second.tradeoff);
  assert.match(first.observation, /symbolism/);
  assert.doesNotMatch(JSON.stringify([first, second]), /protection can outlive|abandon your own limits|fear, need, or unfinished/);
});

test("unsupported saved labels do not invent history, motives, relationships, or instructions", () => {
  const item = explainProfileLabel("Private unverified label", "growth", {});
  assert.equal(item.relationshipView, undefined);
  assert.equal(item.tradeoff, undefined);
  assert.equal(item.practicalTakeaway, undefined);
  assert.match(item.evidence!, /unavailable/);
});

test("candidate sign and stale stored numbers cannot supply a source-specific explanation", () => {
  const pattern = canonicalSignPattern("Virgo")!;
  const item = explainProfileLabel(pattern.gift, "strength", { astrologyData: { sun: { sign: "Virgo", verificationStatus: "pending_independent_verification" } }, numerologyData: { lifePath: 9 } });
  assert.equal(item.practicalTakeaway, undefined);
});

test("verified sign supports its matching theme while mismatched labels stay unexplained", () => {
  const pattern = canonicalSignPattern("Aries")!;
  const profile = { astrologyData: { sun: {
    sign: "Aries", verificationStatus: "verified",
    evidence: { source: "independent ephemeris", engine: "fixture", calculatedAt: "2026-10-07T00:00:00Z" },
  } } };
  const supported = explainProfileLabel(pattern.shadow, "growth", profile);
  assert.match(supported.observation, /Aries Sun symbolism/);
  assert.equal(supported.practicalTakeaway, pattern.action);
  assert.equal(explainProfileLabel(canonicalSignPattern("Virgo")!.shadow, "growth", profile).tradeoff, undefined);
});

test("assessment-linked depth wording is retained without adding a protective history", () => {
  const item = explainProfileLabel("asking clearly", "strength", { depthInterpretation: {
    gift: { summary: "You reported asking clearly in the last disagreement.", claimKind: "observed", evidenceIds: ["answer"] },
    evidence: [{ id: "answer", system: "user-stated", field: "communication", value: "asking clearly" }],
  } });
  assert.match(item.observation, /recorded assessment/);
  assert.equal(item.tradeoff, undefined);
  assert.equal(item.relationshipView, undefined);
});
