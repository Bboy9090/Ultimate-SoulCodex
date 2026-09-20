import assert from "node:assert/strict";
import test from "node:test";
import {
  buildVerifiedDifferentiationCorpus,
  differentiationMetrics,
} from "./fixtures/verified-differentiation-corpus";

test("48 distinct verified chart signatures never collapse to token-identical readings", () => {
  const readings = buildVerifiedDifferentiationCorpus(48);
  const metrics = differentiationMetrics(readings);

  assert.equal(metrics.profileCount, 48);
  assert.equal(metrics.uniqueNarratives, 48);
  assert.equal(metrics.exactDuplicateCount, 0);
  assert.ok(
    metrics.maximumPairwiseTokenJaccard < 0.995,
    `maximum pairwise token overlap was ${metrics.maximumPairwiseTokenJaccard} for ${metrics.mostSimilarPair?.join(" vs ")}`,
  );
  assert.ok(metrics.minimumVerifiedEvidenceCount >= 10);
  assert.ok(metrics.minimumTotalEvidenceCount >= 13);
});

test("verified synthesis changes substance, not only the profile name", () => {
  const [first, second] = buildVerifiedDifferentiationCorpus(2);
  assert.notEqual(first.signature, second.signature);
  assert.notEqual(first.biography, second.biography);
  assert.notEqual(first.narrative, second.narrative);
  assert.equal(first.biography.includes("Differentiation Control"), true);
  assert.equal(second.biography.includes("Differentiation Control"), true);
});
