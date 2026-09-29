import assert from "node:assert/strict";
import test from "node:test";
import { structureCheck as rootStructureCheck } from "../src/ai/validators/structure.ts";
import { structureCheck as packageStructureCheck } from "../packages/ai/validators/structure.ts";

const checks = [
  ["root", rootStructureCheck],
  ["package", packageStructureCheck],
] as const;

for (const [label, structureCheck] of checks) {
  test(`${label} AI structure gate rejects repetitive sentence architecture`, () => {
    const repetitive = [
      "I notice I overcommit when I want to keep momentum.",
      "I value reliability because it matters to me.",
      "This pattern can create friction in practice.",
      "This pattern can create friction in practice.",
      "This pattern can create friction when decisions stack up.",
      "This pattern can create friction when attention gets split.",
    ].join(" ");

    const result = structureCheck(repetitive);
    assert.equal(result.hasRepetition, true);
    assert.equal(result.pass, false);
    assert.ok(result.repetitionGroups.length > 0);
  });

  test(`${label} AI structure gate allows varied concrete prose`, () => {
    const varied = [
      "When I overcommit, I notice my attention gets fragmented.",
      "I value reliability, so I need a clear limit before saying yes.",
      "In practice, that means I finish one obligation before adding another.",
      "The result is less rework and a cleaner decision trail.",
    ].join(" ");

    const result = structureCheck(varied);
    assert.equal(result.hasRepetition, false);
    assert.equal(result.pass, true);
  });
}
