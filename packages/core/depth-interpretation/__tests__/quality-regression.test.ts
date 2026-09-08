import { test } from "node:test";
import assert from "node:assert";
import {
  DEPTH_QUALITY_FIXTURES,
  evaluateDepthInterpretationQuality,
} from "../index.js";

const EXPECTED_SCORES: Readonly<Record<string, number>> = {
  "strong-known-time": 100,
  "honest-unknown-time": 97,
  "shallow-overclaiming": 0,
  "invented-biography": 52,
  "unsupported-high-confidence": 0,
};

test("Depth quality public regression corpus", async (suite) => {
  await suite.test("is exported through the depth interpretation barrel", () => {
    assert.equal(typeof evaluateDepthInterpretationQuality, "function");
    assert.equal(DEPTH_QUALITY_FIXTURES.length, 5);
  });

  await suite.test("locks exact deterministic fixture scores", () => {
    for (const fixture of DEPTH_QUALITY_FIXTURES) {
      const result = evaluateDepthInterpretationQuality(
        fixture.interpretation,
        { birthTimeStatus: fixture.birthTimeStatus },
      );

      assert.equal(
        result.score,
        EXPECTED_SCORES[fixture.id],
        `${fixture.id} score changed`,
      );
      assert.equal(
        result.pass,
        fixture.expectedPass,
        `${fixture.id} outcome changed`,
      );
    }
  });

  await suite.test("does not mutate locked fixture sources", () => {
    for (const fixture of DEPTH_QUALITY_FIXTURES) {
      const before = JSON.stringify(fixture.interpretation);

      evaluateDepthInterpretationQuality(fixture.interpretation, {
        birthTimeStatus: fixture.birthTimeStatus,
      });

      assert.equal(
        JSON.stringify(fixture.interpretation),
        before,
        `${fixture.id} was mutated`,
      );
    }
  });
});
