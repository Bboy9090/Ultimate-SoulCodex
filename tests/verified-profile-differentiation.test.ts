import assert from "node:assert/strict";
import test from "node:test";
import {
  buildVerifiedDifferentiationCorpus,
  differentiationMetrics,
} from "./fixtures/verified-differentiation-corpus";

test("192 distinct verified chart signatures remain structurally differentiated", () => {
  const readings = buildVerifiedDifferentiationCorpus(192);
  const metrics = differentiationMetrics(readings);

  assert.equal(metrics.profileCount, 192);
  assert.equal(metrics.uniqueNarratives, 192);
  assert.equal(metrics.exactDuplicateCount, 0);
  assert.ok(
    metrics.maximumMaterialBigramJaccard < 0.9,
    `maximum material-pair bigram overlap was ${metrics.maximumMaterialBigramJaccard} for ${metrics.mostSimilarMaterialBigramPair?.join(" vs ")}`,
  );
  assert.ok(
    metrics.maximumMaterialTrigramJaccard < 0.85,
    `maximum material-pair trigram overlap was ${metrics.maximumMaterialTrigramJaccard} for ${metrics.mostSimilarMaterialTrigramPair?.join(" vs ")}`,
  );
  assert.ok(
    metrics.maximumMaterialIdenticalLayerSummaries <= 5,
    `${metrics.maximumMaterialIdenticalLayerSummaries}/${metrics.layerCount} material-pair layer summaries were identical for ${metrics.mostMaterialLayerDuplicatePair?.join(" vs ")}`,
  );
  assert.ok(metrics.materialPairCount > 4000);
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
