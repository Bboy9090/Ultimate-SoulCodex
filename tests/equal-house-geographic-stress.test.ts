import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateEqualHouseEvidence,
  calculateHousePosition,
  circularDegreesDelta,
} from "../server/services/house-verification";

const LATITUDES = [-85, -75, -66, 0, 66, 75, 85] as const;
const LONGITUDES = [-179.9, -90, 0, 90, 179.9] as const;
const INSTANTS = [
  "2026-03-20T12:00:00.000Z",
  "2026-06-21T12:00:00.000Z",
  "2026-09-23T12:00:00.000Z",
  "2026-12-21T12:00:00.000Z",
] as const;

test("Equal House geometry remains finite across latitude, longitude, and seasonal extremes", () => {
  let cases = 0;

  for (const inputTimestamp of INSTANTS) {
    for (const latitude of LATITUDES) {
      for (const longitude of LONGITUDES) {
        const evidence = calculateEqualHouseEvidence({
          inputTimestamp,
          latitude,
          longitude,
        });

        assert.equal(evidence.system, "equal");
        assert.ok(
          Number.isFinite(evidence.ascendantLongitudeDegrees),
          `${inputTimestamp} ${latitude},${longitude}`,
        );
        assert.ok(
          evidence.ascendantLongitudeDegrees >= 0 &&
            evidence.ascendantLongitudeDegrees < 360,
        );
        assert.equal(evidence.cusps.length, 12);

        for (const angle of [
          evidence.midheavenCandidate,
          evidence.midheavenReference,
        ]) {
          assert.ok(Number.isFinite(angle.longitudeDegrees));
          assert.ok(angle.longitudeDegrees >= 0 && angle.longitudeDegrees < 360);
          assert.ok(angle.degreeInSign >= 0 && angle.degreeInSign < 30);
        }

        // Candidate and independent MC implementations should remain tightly
        // aligned even where Ascendant geometry becomes numerically steep.
        assert.ok(
          circularDegreesDelta(
            evidence.midheavenCandidate.longitudeDegrees,
            evidence.midheavenReference.longitudeDegrees,
          ) <= 0.001,
          `MC delta exceeded policy at ${inputTimestamp} ${latitude},${longitude}`,
        );

        for (let index = 0; index < evidence.cusps.length; index += 1) {
          const cusp = evidence.cusps[index];
          const next = evidence.cusps[(index + 1) % evidence.cusps.length];

          assert.equal(cusp.house, index + 1);
          assert.ok(cusp.longitudeDegrees >= 0 && cusp.longitudeDegrees < 360);
          assert.ok(cusp.degreeInSign >= 0 && cusp.degreeInSign < 30);
          assert.ok(
            Math.abs(
              circularDegreesDelta(cusp.longitudeDegrees, next.longitudeDegrees) - 30,
            ) < 1e-10,
          );
          assert.equal(
            calculateHousePosition(cusp.longitudeDegrees, evidence.cusps),
            cusp.house,
          );
        }

        cases += 1;
      }
    }
  }

  assert.equal(
    cases,
    INSTANTS.length * LATITUDES.length * LONGITUDES.length,
  );
});
