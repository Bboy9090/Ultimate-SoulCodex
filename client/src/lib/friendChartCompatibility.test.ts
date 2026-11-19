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
  assert.match(result.friendshipPerspectives[0].repair, /direct|translate|goal|ask|difference|style/i);
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


test("friend conversation questions follow actual overlap rather than fabricated compatibility or private thoughts", () => {
  const result = compareFriendCharts(
    [{ key: "moon", sign: "Virgo", house: 4 }, { key: "mercury", sign: "Gemini" }, { key: "venus", sign: "Capricorn" }],
    [{ key: "moon", sign: "Capricorn", house: 9 }, { key: "mercury", sign: "Libra" }, { key: "jupiter", sign: "Leo" }],
  );
  assert.deepEqual(result.conversationMoments.map((moment) => moment.key), ["moon", "mercury"]);
  assert.match(result.conversationMoments[0].basis, /Virgo.*House 4.*Capricorn.*House 9/);
  assert.match(result.conversationMoments[0].question, /overwhelmed/);
  assert.match(result.conversationMoments[1].question, /crossed wire/);
  assert.ok(result.conversationMoments.every((moment) => moment.question.includes("?")));
  assert.ok(result.conversationMoments.every((moment) => moment.followUp.length > 35));
  assert.equal(JSON.stringify(result.conversationMoments).includes("jupiter"), false);
  assert.equal(JSON.stringify(result.conversationMoments).includes("venus"), false);
});

test("matching chart symbols invite challenge rather than asserting mind-reading", () => {
  const result = compareFriendCharts([{ key: "venus", sign: "Cancer" }], [{ key: "venus", sign: "Cancer" }]);
  assert.equal(result.conversationMoments.length, 1);
  assert.match(result.conversationMoments[0].opening, /different lived experiences/);
  assert.match(result.conversationMoments[0].basis, /Cancer/);
  assert.equal(result.conversationMoments[0].basis.includes("House"), false);
});

test("missing overlapping Moon Mercury Venus and Jupiter produces no invented conversation", () => {
  const result = compareFriendCharts([{ key: "sun", sign: "Virgo" }], [{ key: "sun", sign: "Aries" }]);
  assert.deepEqual(result.conversationMoments, []);
  assert.equal(result.friendshipScore, null);
});
