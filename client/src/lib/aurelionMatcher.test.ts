import test from "node:test";
import assert from "node:assert/strict";
import {
  aurelionMatchSummary,
  buildAurelionPlacements,
} from "./aurelionMatcher";

test("Aurelion includes only saved planetary placements and does not invent missing planets", () => {
  const placements = buildAurelionPlacements({
    astrologyData: {
      planets: {
        sun: { sign: "Virgo", degree: 12.5 },
        mercury: { sign: "Libra" },
      },
      planetaryHouses: { sun: 10 },
    },
  });

  assert.deepEqual(
    placements.map((placement) => [placement.key, placement.sign, placement.house]),
    [
      ["sun", "Virgo", 10],
      ["mercury", "Libra", undefined],
    ],
  );
});

test("Aurelion ignores invalid house and degree values instead of normalizing guesses", () => {
  const [sun] = buildAurelionPlacements({
    astrologyData: {
      planets: { sun: { sign: "Virgo", degree: 44 } },
      planetaryHouses: { sun: 13 },
    },
  });

  assert.equal(sun.sign, "Virgo");
  assert.equal(sun.house, undefined);
  assert.equal(sun.degree, undefined);
});

test("Aurelion match summary stays bounded to shared saved signals", () => {
  const summary = aurelionMatchSummary("Jordan", [
    { key: "moon", label: "Moon", score: 62 },
    { key: "mercury", label: "Mercury", score: 91 },
  ]);

  assert.match(summary, /Mercury/);
  assert.match(summary, /Moon/);
  assert.match(summary, /not a prediction/i);
});

test("Aurelion reports unavailable matching when no shared signals exist", () => {
  assert.match(aurelionMatchSummary("Jordan", []), /cannot match Jordan yet/i);
});
