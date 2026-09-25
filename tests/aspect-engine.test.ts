import assert from "node:assert/strict";
import test from "node:test";
import {
  LEGACY_COMPAT_MAJOR_ASPECT_POLICY_V1,
  calculateMajorAspects,
  circularSeparationDegrees,
  type VerifiedLongitudePlacement,
} from "../server/services/aspect-engine";

function p(body: VerifiedLongitudePlacement["body"], longitudeDegrees: number): VerifiedLongitudePlacement {
  return { body, longitudeDegrees, verificationStatus: "verified" };
}

test("major aspect policy explicitly preserves the historical orb convention", () => {
  const policy = LEGACY_COMPAT_MAJOR_ASPECT_POLICY_V1;
  assert.equal(policy.policyId, "ASTRO-ASPECT-MAJOR-v1");
  assert.equal(policy.status, "approved");
  assert.deepEqual(
    policy.entries.map(({ kind, angleDegrees, maximumOrbDegrees }) => [
      kind, angleDegrees, maximumOrbDegrees,
    ]),
    [
      ["conjunction", 0, 10],
      ["sextile", 60, 6],
      ["square", 90, 8],
      ["trine", 120, 8],
      ["opposition", 180, 10],
    ],
  );
});

test("circular separation handles zodiac wrap correctly", () => {
  assert.equal(circularSeparationDegrees(359, 1), 2);
  assert.equal(circularSeparationDegrees(10, 190), 180);
  assert.equal(circularSeparationDegrees(-1, 361), 2);
});

test("exact major aspects are deterministic and evidence-derived", () => {
  const placements = [
    p("Sun", 0),
    p("Moon", 60),
    p("Mercury", 90),
    p("Venus", 120),
    p("Mars", 180),
  ];
  const first = calculateMajorAspects(placements);
  const second = calculateMajorAspects([...placements].reverse());
  assert.deepEqual(first, second);

  const sunAspects = first.filter((aspect) => aspect.bodyA === "Sun");
  assert.deepEqual(
    sunAspects.map((aspect) => [aspect.bodyB, aspect.aspect, aspect.orbDegrees]),
    [
      ["Moon", "sextile", 0],
      ["Mercury", "square", 0],
      ["Venus", "trine", 0],
      ["Mars", "opposition", 0],
    ],
  );
});

test("orb boundaries include the exact limit and reject the next value outside", () => {
  assert.equal(calculateMajorAspects([p("Sun", 0), p("Moon", 10)]).length, 1);
  assert.equal(calculateMajorAspects([p("Sun", 0), p("Moon", 10.0001)]).length, 0);

  assert.equal(calculateMajorAspects([p("Sun", 0), p("Moon", 66)]).length, 1);
  assert.equal(calculateMajorAspects([p("Sun", 0), p("Moon", 66.0001)]).length, 0);

  assert.equal(calculateMajorAspects([p("Sun", 0), p("Moon", 98)]).length, 1);
  assert.equal(calculateMajorAspects([p("Sun", 0), p("Moon", 98.0001)]).length, 0);
});

test("trine and opposition exact orb edges are inclusive and zodiac-wrap safe", () => {
  const trineAtLimit = calculateMajorAspects([p("Sun", 355), p("Moon", 123)]);
  assert.equal(trineAtLimit.length, 1);
  assert.equal(trineAtLimit[0].aspect, "trine");
  assert.equal(trineAtLimit[0].orbDegrees, 8);

  const trineOutside = calculateMajorAspects([p("Sun", 355), p("Moon", 123.0001)]);
  assert.equal(trineOutside.length, 0);

  const oppositionAtLimit = calculateMajorAspects([p("Sun", 350), p("Moon", 180)]);
  assert.equal(oppositionAtLimit.length, 1);
  assert.equal(oppositionAtLimit[0].aspect, "opposition");
  assert.equal(oppositionAtLimit[0].orbDegrees, 10);

  const oppositionOutside = calculateMajorAspects([p("Sun", 350), p("Moon", 180.0001)]);
  assert.equal(oppositionOutside.length, 0);
});

test("no major aspect is invented when verified separation falls outside every governed orb", () => {
  const aspects = calculateMajorAspects([
    p("Sun", 0),
    p("Moon", 30),
    p("Mercury", 45),
  ]);
  assert.deepEqual(aspects, []);
});

test("unverified, duplicate, and invalid inputs fail closed", () => {
  assert.throws(
    () => calculateMajorAspects([
      p("Sun", 0),
      { body: "Moon", longitudeDegrees: 60, verificationStatus: "pending" as never },
    ]),
    /unverified_aspect_input/,
  );
  assert.throws(
    () => calculateMajorAspects([p("Sun", 0), p("Sun", 120)]),
    /duplicate_aspect_body/,
  );
  assert.throws(
    () => calculateMajorAspects([p("Sun", Number.NaN), p("Moon", 60)]),
    /aspect_longitude_invalid/,
  );
});

test("draft aspect policy cannot produce authoritative aspect output", () => {
  assert.throws(
    () => calculateMajorAspects([p("Sun", 0), p("Moon", 60)], {
      ...LEGACY_COMPAT_MAJOR_ASPECT_POLICY_V1,
      status: "draft",
    }),
    /aspect_policy_not_approved/,
  );
});
