import assert from "node:assert/strict";
import test from "node:test";
import { compareVerifiedSoulCircleAspects as compare } from "../client/src/lib/soulCircleAspects";

test("cross-chart conjunction and opposition use circular longitude", () => {
  const result = compare(
    [{ key: "sun", sign: "Pisces", degree: 29, verified: true }],
    [{ key: "moon", sign: "Aries", degree: 1, verified: true },
     { key: "venus", sign: "Libra", degree: 1, verified: true }],
  );
  assert.equal(result.comparedPairs, 2);
  assert.equal(result.aspects[0].aspect, "conjunction");
  assert.equal(result.aspects[0].separation, 2);
  assert.equal(result.aspects[1].aspect, "opposition");
  assert.equal(result.aspects[1].orb, 2);
});

test("never infer degree, aspects, or coverage from incomplete or unverified records", () => {
  const result = compare(
    [{ key: "sun", sign: "Aries", degree: 10, verified: false },
     { key: "moon", sign: "Cancer", house: 4 }],
    [{ key: "sun", sign: "Libra", degree: 10, verified: true }],
  );
  assert.equal(result.verifiedA, 0);
  assert.equal(result.comparedPairs, 0);
  assert.deepEqual(result.aspects, []);
  assert.equal(result.excludedA, 2);
});

test("rejects invalid longitudes and deduplicates body rows", () => {
  const result = compare(
    [{ key: "sun", sign: "Aries", degree: 30, verified: true },
     { key: "sun", sign: "Aries", degree: 0, verified: true },
     { key: "sun", sign: "Taurus", degree: 0, verified: true },
     { key: "vertex", sign: "Aries", degree: 0, verified: true }],
    [{ key: "venus", sign: "Leo", degree: 0, verified: true }],
  );
  assert.equal(result.verifiedA, 1);
  assert.equal(result.excludedA, 3);
  assert.equal(result.aspects.length, 1);
  assert.equal(result.aspects[0].aspect, "trine");
});

test("uses a bounded orb and does not emit unrelated aspects", () => {
  const result = compare(
    [{ key: "mercury", sign: "Aries", degree: 0, verified: true }],
    [{ key: "mercury", sign: "Gemini", degree: 6, verified: true }],
  );
  assert.deepEqual(result.aspects, []);
  assert.equal(result.comparedPairs, 1);
});
