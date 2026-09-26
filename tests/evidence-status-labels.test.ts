import assert from "node:assert/strict";
import test from "node:test";
import {
  calculationStatusLabel,
  inputStatusLabel,
  interpretationStatusLabel,
} from "../client/src/lib/evidenceStatusLabels";

test("evidence input statuses have stable user-facing labels", () => {
  const cases = {
    user_entered: "User entered",
    document_verified: "Document verified",
    self_reported: "Self reported",
    system_imported: "Imported from connected system",
    inferred: "Derived from supplied evidence",
  } as const;

  for (const [status, expected] of Object.entries(cases)) {
    assert.equal(inputStatusLabel(status as keyof typeof cases), expected);
    assert.doesNotMatch(expected, /_/);
  }
});

test("calculation statuses have stable user-facing labels", () => {
  const cases = {
    deterministic: "Deterministic calculation",
    ephemeris_verified: "Ephemeris verified",
    estimated: "Estimated from incomplete inputs",
    legacy: "Legacy / non-verified calculation",
    not_calculated: "Not calculated",
  } as const;

  for (const [status, expected] of Object.entries(cases)) {
    assert.equal(calculationStatusLabel(status as keyof typeof cases), expected);
    assert.doesNotMatch(expected, /_/);
  }
});

test("interpretation statuses stay explicitly interpretive", () => {
  const cases = {
    direct: "Direct symbolic interpretation",
    synthesized: "Symbolic synthesis",
    provisional: "Provisional interpretation",
    reflective: "Reflection framework",
    contextual: "Context-dependent interpretation",
  } as const;

  for (const [status, expected] of Object.entries(cases)) {
    assert.equal(
      interpretationStatusLabel(status as keyof typeof cases),
      expected,
    );
    assert.doesNotMatch(expected, /_/);
  }

  const rendered = Object.values(cases).join(" ");
  assert.match(rendered, /symbolic|interpretation|reflection/i);
  assert.doesNotMatch(rendered, /fact|proves|guarantees|destined/i);
});
