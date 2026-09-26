import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  "client/src/components/soul-codex/TechnicalAppendix.tsx",
  "utf8",
);

test("technical appendix mirrors governed production astronomy", () => {
  assert.match(source, /Equal House \(verified production path\)/);
  assert.match(source, /Tropical/);
  assert.match(source, /governed verified-ephemeris contract/);

  assert.doesNotMatch(source, /House System:\s*Placidus/i);
  assert.doesNotMatch(source, /SOFA-compliant/i);
});

test("technical appendix does not imply Human Design is always present", () => {
  assert.match(
    source,
    /Human Design contributes only when its separate verified core contract is present/i,
  );
  assert.doesNotMatch(
    source,
    /This reading synthesizes astrology, numerology, and Human Design/i,
  );
});

test("technical appendix separates calculation support from identity certainty", () => {
  assert.match(
    source,
    /calculation support, not certainty about personality or outcomes/i,
  );
  assert.match(
    source,
    /rather than being silently replaced with invented precision/i,
  );
});
