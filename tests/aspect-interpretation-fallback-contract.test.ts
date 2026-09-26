import assert from "node:assert/strict";
import test from "node:test";
import { getAspectInterpretation as getServiceAspect } from "../services/interpretations";
import { getAspectInterpretation as getPackageAspect } from "../packages/astrology/interpretations";

const implementations = [
  ["service", getServiceAspect],
  ["package", getPackageAspect],
] as const;

test("governed aspect fallback contract", async (suite) => {
  for (const [label, getAspect] of implementations) {
    await suite.test(`${label}: recognized unlisted pairs stay aspect-specific and grounded`, () => {
      const square = getAspect("jupiter", "pluto", "square");
      const trine = getAspect("jupiter", "pluto", "trine");

      assert.match(square.description, /90° relationship/);
      assert.match(square.description, /friction/i);
      assert.match(trine.description, /120° relationship/);
      assert.match(trine.description, /flowing/i);
      assert.notEqual(square.description, trine.description);

      const combined = `${square.description} ${square.spiritualMeaning} ${trine.description} ${trine.spiritualMeaning}`;
      assert.doesNotMatch(combined, /align divinely|your purpose|different parts of your soul|life path|unstoppable force|trust the universe/i);
    });

    await suite.test(`${label}: unsupported aspect types do not masquerade as conjunctions`, () => {
      const result = getAspect("jupiter", "pluto", "quintile");

      assert.match(result.description, /No governed interpretation is available/i);
      assert.match(result.spiritualMeaning, /withheld from symbolic interpretation/i);
      assert.doesNotMatch(result.description, /same angular zone|deeply unified|powerful blend/i);
      assert.equal(result.keywords.includes("quintile"), true);
    });
  }
});
