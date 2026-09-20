import assert from "node:assert/strict";
import test from "node:test";
import {
  buildVerifiedDifferentiationCorpus,
  differentiationMetrics,
} from "./fixtures/verified-differentiation-corpus";

test("96 distinct verified chart signatures remain structurally differentiated", () => {
  const readings = buildVerifiedDifferentiationCorpus(96);
  const metrics = differentiationMetrics(readings);

  assert.equal(metrics.profileCount, 96);
  assert.equal(metrics.uniqueNarratives, 96);
  assert.equal(metrics.exactDuplicateCount, 0);
  assert.ok(
    metrics.maximumPairwiseBigramJaccard < 0.9,
    `maximum pairwise bigram overlap was ${metrics.maximumPairwiseBigramJaccard} for ${metrics.mostSimilarBigramPair?.join(" vs ")}`,
  );
  assert.ok(
    metrics.maximumPairwiseTrigramJaccard < 0.85,
    `maximum pairwise trigram overlap was ${metrics.maximumPairwiseTrigramJaccard} for ${metrics.mostSimilarTrigramPair?.join(" vs ")}`,
  );
  assert.ok(
    metrics.maximumIdenticalLayerSummaries <= 5,
    `${metrics.maximumIdenticalLayerSummaries}/${metrics.layerCount} layer summaries were identical for ${metrics.mostLayerDuplicatePair?.join(" vs ")}`,
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
