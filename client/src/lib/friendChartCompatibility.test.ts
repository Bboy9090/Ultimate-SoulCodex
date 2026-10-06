import assert from "node:assert/strict";
import test from "node:test";
import { compareFriendCharts } from "./friendChartCompatibility";

test("compareFriendCharts scores shared chart placements and exposes coverage without filling missing placements", () => {
    const result = compareFriendCharts(
      [
        { key: "moon", sign: "Cancer", house: 4 },
        { key: "mercury", sign: "Gemini", house: 3 },
        { key: "sun", sign: "Virgo", house: 1 },
      ],
      [
        { key: "moon", sign: "Cancer", house: 4 },
        { key: "mercury", sign: "Libra", house: 7 },
        { key: "venus", sign: "Leo", house: 5 },
      ],
    );

    assert.deepEqual(result.matches.map((match) => match.key), ["moon", "mercury"]);
    assert.deepEqual({ score: result.matches[0].score, signal: result.matches[0].signal, sameHouse: result.matches[0].sameHouse }, { score: 100, signal: "same sign", sameHouse: true });
    assert.deepEqual({ score: result.matches[1].score, signal: result.matches[1].signal, sameHouse: result.matches[1].sameHouse }, { score: 78, signal: "same element", sameHouse: false });
    assert.equal(result.overallScore, 89);
    assert.equal(result.friendshipScore, 89);
    assert.deepEqual(result.overallCoverage, { matched: 2, available: 4 });
    assert.deepEqual(result.friendshipCoverage, { matched: 2, available: 4 });
});

test("compareFriendCharts returns unresolved scores when the charts have no comparable shared placements", () => {
    const result = compareFriendCharts([{ key: "sun", sign: "Aries" }], [{ key: "moon", sign: "Pisces" }]);
    assert.equal(result.overallScore, null);
    assert.equal(result.friendshipScore, null);
    assert.deepEqual(result.matches, []);
});
