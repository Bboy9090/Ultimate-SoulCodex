import assert from "node:assert/strict";
import test from "node:test";
import { numerologySignals } from "../packages/core/codex30/systems/numerology";

test("Codex30 numerology rejects unsupported values instead of inventing fallback themes", () => {
  for (const value of [0, 10, 12, 44, -1, 3.5, Number.NaN]) {
    assert.deepEqual(
      numerologySignals({ lifePath: value }),
      [],
      `unsupported Life Path ${String(value)} must not produce a fallback signal`,
    );
  }
});

test("Codex30 numerology keeps governed values symbolic rather than deterministic identity claims", () => {
  for (const value of [1,2,3,4,5,6,7,8,9,11,22,33]) {
    const signals = numerologySignals({ lifePath: value });
    assert.equal(signals.length, 1);
    assert.equal(signals[0]?.id, `num.lifepath.${value}`);
    assert.match(signals[0]?.label ?? "", /deterministic numerology value/i);
    assert.match(signals[0]?.label ?? "", /optional symbolic reflection/i);
    assert.doesNotMatch(
      signals[0]?.label ?? "",
      /assignment|destined|master it|guaranteed|you are|fixed identity/i,
    );
    assert.ok((signals[0]?.tags.length ?? 0) > 0);
  }
});

test("Codex30 numerology requires an explicit Life Path", () => {
  assert.deepEqual(numerologySignals({}), []);
  assert.deepEqual(numerologySignals({ numerology: {} }), []);
});
