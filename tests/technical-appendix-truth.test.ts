import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  "client/src/components/soul-codex/TechnicalAppendix.tsx",
  "utf8",
);

test("technical appendix mirrors governed production astronomy without overstating reading status", () => {
  assert.match(source, /Equal House production policy/);
  assert.match(source, /Tropical/);
  assert.match(source, /Astronomy Status:/);

  assert.doesNotMatch(source, /House System:\s*Placidus/i);
  assert.doesNotMatch(source, /SOFA-compliant/i);
  assert.doesNotMatch(source, /Equal House \(verified production path\)/);
  assert.doesNotMatch(source, /Ephemeris: governed verified-ephemeris contract/);
});

test("technical appendix has explicit language for every astronomy evidence state", () => {
  for (const expected of [
    "Verified ephemeris for this reading",
    "Estimated birth-window astronomy",
    "Date-only astronomy; time-sensitive geometry withheld",
    "Legacy approximation; excluded from verified synthesis",
    "Astronomy verification unavailable",
  ]) {
    assert.match(source, new RegExp(expected.replace(/[.*+?^$\\{}()|[\]\\]/g, "\\test("technical appendix mirrors governed production astronomy", () => {
  assert.match(source, /Equal House \(verified production path\)/);
  assert.match(source, /Tropical/);
  assert.match(source, /governed verified-ephemeris contract/);

  assert.doesNotMatch(source, /House System:\s*Placidus/i);
  assert.doesNotMatch(source, /SOFA-compliant/i);
});")));
  }
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
