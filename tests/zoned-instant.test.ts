import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalExplicitZonedInstant,
  parseExplicitZonedInstant,
} from "../server/services/zoned-instant";

test("explicit zoned instants accept UTC and numeric offsets", () => {
  const utc = parseExplicitZonedInstant("1990-09-17T15:11:00Z");
  const offset = parseExplicitZonedInstant("1990-09-17T11:11:00-04:00");

  assert.ok(utc);
  assert.ok(offset);
  assert.equal(utc?.getTime(), offset?.getTime());
  assert.equal(
    canonicalExplicitZonedInstant("1990-09-17T11:11:00-04:00"),
    "1990-09-17T15:11:00.000Z",
  );
});

test("explicit zoned instants reject timezone-less timestamps", () => {
  for (const value of [
    "1990-09-17T15:11:00",
    "1990-09-17 15:11:00",
    "1990-09-17",
  ]) {
    assert.equal(parseExplicitZonedInstant(value), null, value);
    assert.equal(canonicalExplicitZonedInstant(value), null, value);
  }
});

test("explicit zoned instants reject malformed or impossible offsets", () => {
  for (const value of [
    "1990-09-17T15:11:00+24:00",
    "1990-09-17T15:11:00+04:60",
    "1990-09-17T15:11:00+4:00",
    "not-a-dateZ",
    "",
  ]) {
    assert.equal(parseExplicitZonedInstant(value), null, value);
  }
});
