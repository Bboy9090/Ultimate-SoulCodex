import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateMeanNodePair,
  calculateMeanNorthNodeCandidate,
  circularNodeDeltaDegrees,
} from "../server/services/lunar-node-evidence";
import {
  SWISS_MEAN_NODE_FIXTURES,
  SWISS_MEAN_NODE_REFERENCE,
} from "./fixtures/swiss-mean-node-fixtures";

test("mean-node evidence matrix is explicitly identified and broad", () => {
  assert.equal(SWISS_MEAN_NODE_REFERENCE.body, "MEAN_NODE");
  assert.equal(SWISS_MEAN_NODE_REFERENCE.fixtureCount, 24);
  assert.ok(SWISS_MEAN_NODE_REFERENCE.engine.includes("Swiss Ephemeris"));
});

test("Meeus mean North Node candidate stays within 0.01 degrees of Swiss across 24 fixtures", () => {
  let maximumDelta = 0;

  for (const fixture of SWISS_MEAN_NODE_FIXTURES) {
    const candidate = calculateMeanNorthNodeCandidate({
      inputTimestamp: fixture.inputTimestamp,
    });
    const delta = circularNodeDeltaDegrees(
      candidate.longitudeDegrees,
      fixture.expectedNorthNodeLongitude,
    );
    maximumDelta = Math.max(maximumDelta, delta);

    assert.equal(candidate.mode, "mean");
    assert.ok(delta <= 0.01, `${fixture.id} node delta ${delta}`);
  }

  assert.ok(maximumDelta > 0);
  assert.ok(maximumDelta < 0.0051);
});

test("South Node is the exact 180-degree opposition of the mean North Node candidate", () => {
  for (const fixture of SWISS_MEAN_NODE_FIXTURES) {
    const pair = calculateMeanNodePair({ inputTimestamp: fixture.inputTimestamp });
    assert.equal(
      circularNodeDeltaDegrees(
        pair.southNode.longitudeDegrees,
        (pair.northNode.longitudeDegrees + 180) % 360,
      ),
      0,
    );
    assert.equal(pair.northNode.mode, "mean");
    assert.equal(pair.southNode.mode, "mean");
  }
});

test("invalid timestamp fails closed", () => {
  assert.throws(
    () => calculateMeanNorthNodeCandidate({ inputTimestamp: "not-a-date" }),
    /node_input_timestamp_invalid/,
  );
});
