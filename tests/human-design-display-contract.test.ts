import assert from "node:assert/strict";
import test from "node:test";
import {
  humanDesignChannelLabel,
  humanDesignGateLabel,
  humanDesignGateNumber,
  humanDesignListLabel,
} from "../client/src/lib/humanDesignDisplay";

test("structured Human Design channels never stringify as object artifacts", () => {
  const label = humanDesignChannelLabel({ gates: [41, 30], name: "Recognition" });
  assert.equal(label, "30-41 · Recognition");
  assert.doesNotMatch(label, /\[object Object\]/);
  assert.doesNotMatch(humanDesignListLabel([{ gates: [1, 8] }, { gates: [2, 14] }], "channel"), /\[object Object\]/);
});

test("structured Human Design gates remain readable", () => {
  assert.equal(humanDesignGateLabel({ gate: 41, line: 2 }), "41.2");
  assert.equal(humanDesignGateLabel({ number: 12, name: "Caution" }), "12 · Caution");
  assert.doesNotMatch(humanDesignListLabel([{ gate: 41 }, { gate: 30 }], "gate"), /\[object Object\]/);
});


test("structured gate-lines retain canonical gate numbers for metadata lookup", () => {
  assert.equal(humanDesignGateNumber({ gate: 41, line: 2 }), 41);
  assert.equal(humanDesignGateLabel({ gate: 41, line: 2 }), "41.2");
  assert.equal(humanDesignGateNumber("41.2"), 41);
  assert.equal(humanDesignGateNumber({ number: 12, name: "Caution" }), 12);
});
