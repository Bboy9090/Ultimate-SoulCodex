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


test("every governed major-aspect orb is inclusive at the boundary and exclusive immediately outside", () => {
  for (const entry of LEGACY_COMPAT_MAJOR_ASPECT_POLICY_V1.entries) {
    const insideLow = Math.max(0, entry.angleDegrees - entry.maximumOrbDegrees);
    const insideHigh = Math.min(180, entry.angleDegrees + entry.maximumOrbDegrees);

    const lowResult = calculateMajorAspects([p("Sun", 0), p("Moon", insideLow)]);
    assert.equal(lowResult.length, 1, `${entry.kind} low boundary`);
    assert.equal(lowResult[0].aspect, entry.kind);

    const highResult = calculateMajorAspects([p("Sun", 0), p("Moon", insideHigh)]);
    assert.equal(highResult.length, 1, `${entry.kind} high boundary`);
    assert.equal(highResult[0].aspect, entry.kind);

    const epsilon = 1e-6;
    if (insideLow > 0) {
      const outsideLow = calculateMajorAspects([
        p("Sun", 0),
        p("Moon", insideLow - epsilon),
      ]);
      assert.equal(outsideLow.length, 0, `${entry.kind} below orb`);
    }
    if (insideHigh < 180) {
      const outsideHigh = calculateMajorAspects([
        p("Sun", 0),
        p("Moon", insideHigh + epsilon),
      ]);
      assert.equal(outsideHigh.length, 0, `${entry.kind} above orb`);
    }
  }
});

test("circular separation is symmetric and invariant under whole-circle shifts", () => {
  const values = [-721.25, -360, -0.001, 0, 1, 59.5, 179.999, 180, 359.999, 360, 721.25];

  for (const left of values) {
    for (const right of values) {
      const forward = circularSeparationDegrees(left, right);
      const reverse = circularSeparationDegrees(right, left);
      assert.ok(forward >= 0 && forward <= 180);
      assert.ok(Math.abs(forward - reverse) < 1e-12);
      assert.ok(
        Math.abs(
          forward -
            circularSeparationDegrees(left + 360 * 5, right - 360 * 7),
        ) < 1e-12,
      );
    }
  }
});

test("aspect output never duplicates an unordered body pair", () => {
  const placements = [
    p("Sun", 0),
    p("Moon", 60),
    p("Mercury", 90),
    p("Venus", 120),
    p("Mars", 180),
    p("Jupiter", 240),
  ];
  const aspects = calculateMajorAspects(placements);
  const pairKeys = aspects.map((aspect) => [aspect.bodyA, aspect.bodyB].sort().join(":"));
  assert.equal(new Set(pairKeys).size, pairKeys.length);
});
