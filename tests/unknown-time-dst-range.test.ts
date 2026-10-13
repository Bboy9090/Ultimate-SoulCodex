import assert from "node:assert/strict";
import test from "node:test";
import { enumerateCivilInstants } from "../server/services/unknown-time-range";

test("spring-forward range enumerates only real civil instants", () => {
  const plan = enumerateCivilInstants("2023-03-12", "America/New_York");

  assert.equal(plan.validLocalMinutes, 1380);
  assert.equal(plan.nonexistentLocalMinutes, 60);
  assert.equal(plan.ambiguousLocalMinutes, 0);
  assert.equal(plan.invalidLocalMinutes, 0);
  assert.equal(plan.samples.length, 1380);
});

test("fall-back range enumerates both occurrences of the repeated hour", () => {
  const plan = enumerateCivilInstants("2023-11-05", "America/New_York");

  assert.equal(plan.validLocalMinutes, 1440);
  assert.equal(plan.nonexistentLocalMinutes, 0);
  assert.equal(plan.ambiguousLocalMinutes, 60);
  assert.equal(plan.invalidLocalMinutes, 0);
  assert.equal(plan.samples.length, 1500);

  const repeated0130 = plan.samples.filter((sample) => sample.minute === 90);
  assert.equal(repeated0130.length, 2);
  assert.deepEqual(
    repeated0130.map((sample) => sample.utcOffsetMinutes).sort((a, b) => (a ?? 0) - (b ?? 0)),
    [-300, -240],
  );
  assert.notEqual(repeated0130[0].utcIso, repeated0130[1].utcIso);
});

test("ordinary civil day remains exactly 1440 unique minute instants", () => {
  const plan = enumerateCivilInstants("2023-02-15", "America/New_York");

  assert.equal(plan.validLocalMinutes, 1440);
  assert.equal(plan.nonexistentLocalMinutes, 0);
  assert.equal(plan.ambiguousLocalMinutes, 0);
  assert.equal(plan.invalidLocalMinutes, 0);
  assert.equal(plan.samples.length, 1440);
});
