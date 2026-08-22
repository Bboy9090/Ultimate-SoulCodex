import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveWholeSignHouses,
  wholeSignCusps,
  wholeSignHouseForSigns,
} from "../server/services/whole-sign-houses";

test("Whole Sign maps the Ascendant sign to house 1 and advances zodiacally", () => {
  assert.equal(wholeSignHouseForSigns("Scorpio", "Scorpio"), 1);
  assert.equal(wholeSignHouseForSigns("Scorpio", "Sagittarius"), 2);
  assert.equal(wholeSignHouseForSigns("Scorpio", "Leo"), 10);
  assert.equal(wholeSignHouseForSigns("Scorpio", "Libra"), 12);
});

test("Whole Sign cusps are explicitly 0 degrees of each successive sign", () => {
  const cusps = wholeSignCusps("Scorpio");
  assert.equal(cusps.length, 12);
  assert.deepEqual(cusps[0], { house: 1, sign: "Scorpio", degree: 0 });
  assert.deepEqual(cusps[9], { house: 10, sign: "Leo", degree: 0 });
  assert.deepEqual(cusps[11], { house: 12, sign: "Libra", degree: 0 });
});

test("house assignments require verified Ascendant and verified placement signs", () => {
  const houses = deriveWholeSignHouses(
    { sign: "Scorpio", verificationStatus: "verified" },
    {
      sun: { sign: "Virgo", verificationStatus: "verified" },
      moon: { sign: "Virgo", verificationStatus: "verified" },
      mercury: { sign: "Virgo", verificationStatus: "verified" },
      venus: { sign: "Leo", verificationStatus: "pending_independent_verification" },
    },
  );

  assert.ok(houses);
  assert.equal(houses?.system, "Whole Sign");
  assert.equal(houses?.assignments.sun.house, 11);
  assert.equal(houses?.assignments.mercury.house, 11);
  assert.equal(houses?.assignments.venus, undefined);
  assert.match(houses?.limitations.join(" ") ?? "", /Midheaven.*separately gated/i);
});

test("unverified Ascendant prevents all Whole Sign house claims", () => {
  assert.equal(
    deriveWholeSignHouses(
      { sign: "Scorpio", verificationStatus: "pending_independent_verification" },
      { sun: { sign: "Virgo", verificationStatus: "verified" } },
    ),
    null,
  );
});
