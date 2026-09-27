import assert from "node:assert/strict";
import test from "node:test";
import {
  humanDesignDefinedChannels,
  humanDesignListLabel,
  normalizeHumanDesignCenters,
} from "../client/src/lib/humanDesignDisplay";

test("canonical producer center maps normalize into defined and open lists", () => {
  const centers = normalizeHumanDesignCenters({
    Head: { defined: false },
    Ajna: { defined: false },
    Throat: { defined: false },
    G: { defined: false },
    Heart: { defined: false },
    Spleen: { defined: false },
    "Solar Plexus": { defined: false },
    Sacral: { defined: false },
    Root: { defined: false },
  });

  assert.deepEqual(centers.defined, []);
  assert.deepEqual(centers.undefined.sort(), [
    "Ajna", "G", "Head", "Heart", "Root", "Sacral", "Solar Plexus", "Spleen", "Throat",
  ].sort());
});

test("only defined channels survive canonical producer normalization", () => {
  const channels = [
    { gates: [1, 8], name: "Inspiration", defined: false },
    { gates: [2, 14], name: "Beat", defined: true },
    { gates: [3, 60], name: "Mutation", defined: false },
  ];

  const defined = humanDesignDefinedChannels(channels);
  assert.equal(defined.length, 1);
  assert.equal(humanDesignListLabel(channels, "channel"), "2-14 · Beat");
});

test("legacy string channel arrays remain readable as already-defined values", () => {
  assert.deepEqual(humanDesignDefinedChannels(["1-8", "2-14"]), ["1-8", "2-14"]);
});
