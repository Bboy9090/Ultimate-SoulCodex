import assert from "node:assert/strict";
import test from "node:test";
import { localAstroProvider } from "../server/astro/providers/localProvider.ts";

test("local astrology fallback withholds Moon when birth time is unknown", async () => {
  const result = await localAstroProvider.getChart({
    dateISO: "1990-09-17",
    timeUnknown: true,
    place: "Bronx, New York",
    timezone: "America/New_York",
  });

  assert.equal(result.sun, "Virgo");
  assert.equal(result.moon, "Unknown");
  assert.equal(result.rising, undefined);
  assert.equal(result.houses, undefined);
  assert.ok(result.notes?.some((note) => note.includes("Moon")));
});

test("local astrology fallback withholds Moon when timezone is missing", async () => {
  const result = await localAstroProvider.getChart({
    dateISO: "1990-09-17",
    time24: "11:11",
    timeUnknown: false,
    place: "Bronx, New York",
  });

  assert.equal(result.moon, "Unknown");
  assert.ok(result.notes?.some((note) => note.includes("Timezone unavailable")));
});

test("date-only Sun fails closed on a conventional sign-change date", async () => {
  const result = await localAstroProvider.getChart({
    dateISO: "1990-09-23",
    timeUnknown: true,
    place: "Bronx, New York",
    timezone: "America/New_York",
  });

  assert.equal(result.sun, "Unknown");
  assert.equal(result.moon, "Unknown");
});
