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
  assert.deepEqual(
    { score: result.matches[0].score, signal: result.matches[0].signal, sameHouse: result.matches[0].sameHouse },
    { score: 100, signal: "same sign", sameHouse: true },
  );
  assert.deepEqual(
    { score: result.matches[1].score, signal: result.matches[1].signal, sameHouse: result.matches[1].sameHouse },
    { score: 78, signal: "same element", sameHouse: false },
  );
  assert.equal(result.overallScore, 89);
  assert.equal(result.friendshipScore, 89);
  assert.deepEqual(result.overallCoverage, { matched: 2, available: 4 });
  assert.deepEqual(result.friendshipCoverage, { matched: 2, available: 4 });
});

test("compareFriendCharts builds two-way friendship perspectives from only shared verified placements", () => {
  const result = compareFriendCharts(
    [
      { key: "moon", sign: "Virgo", house: 11 },
      { key: "mercury", sign: "Virgo", house: 11 },
      { key: "venus", sign: "Virgo", house: 11 },
      { key: "jupiter", sign: "Leo", house: 10 },
    ],
    [
      { key: "moon", sign: "Capricorn", house: 9 },
      { key: "mercury", sign: "Aquarius", house: 1 },
      { key: "venus", sign: "Sagittarius", house: 11 },
      { key: "jupiter", sign: "Pisces", house: 3 },
    ],
  );

  assert.equal(result.friendshipPerspectives.length, 4);
  assert.equal(result.friendshipPerspectives[0].label, "Emotional rhythm");
  assert.match(result.friendshipPerspectives[0].youExperienceThem, /Your Virgo style/);
  assert.match(result.friendshipPerspectives[0].theyExperienceYou, /their Virgo style|your own instinct/i);
  assert.match(result.friendshipPerspectives[0].repair, /direct|translate|goal|ask/i);
  assert.ok(result.guideSummary.headline.length > 0);
  assert.ok(result.guideSummary.streetTranslation.includes("Aureon"));
});

test("compareFriendCharts returns unresolved scores and an evidence-safe guide when charts have no comparable shared placements", () => {
  const result = compareFriendCharts([{ key: "sun", sign: "Aries" }], [{ key: "moon", sign: "Pisces" }]);
  assert.equal(result.overallScore, null);
  assert.equal(result.friendshipScore, null);
  assert.deepEqual(result.matches, []);
  assert.deepEqual(result.friendshipPerspectives, []);
  assert.match(result.guideSummary.headline, /Not enough shared chart evidence/);
});
