import assert from "node:assert/strict";
import test from "node:test";
import * as Astronomy from "astronomy-engine";
import {
  calculateUniversalDayNumber,
  getCurrentHDGate,
  getDailyContext as getPackageDailyContext,
  getMoonPhase,
} from "../packages/astrology/daily-context.ts";
import { degreeToGateAndLine } from "../packages/astrology/human-design.ts";
import { calcUniversalDay } from "@soulcodex/core";
import { getDailyContext as getServiceDailyContext } from "../services/daily-context.ts";

const Astro: typeof Astronomy = (Astronomy as any).default ?? Astronomy;

test("daily Moon phase classification uses the astronomical lunar phase angle", () => {
  for (const iso of [
    "2026-01-01T12:00:00.000Z",
    "2026-03-20T12:00:00.000Z",
    "2026-06-21T12:00:00.000Z",
    "2026-09-28T12:00:00.000Z",
    "2026-12-21T12:00:00.000Z",
  ]) {
    const instant = new Date(iso);
    const angle = Astro.MoonPhase(instant);
    const result = getMoonPhase(instant);

    const expected =
      angle < 22.5 || angle >= 337.5 ? "New Moon" :
      angle < 67.5 ? "Waxing Crescent" :
      angle < 112.5 ? "First Quarter" :
      angle < 157.5 ? "Waxing Gibbous" :
      angle < 202.5 ? "Full Moon" :
      angle < 247.5 ? "Waning Gibbous" :
      angle < 292.5 ? "Last Quarter" :
      "Waning Crescent";

    assert.equal(result.phase, expected, iso);
  }
});

test("daily HD transit gate and line delegate to the governed converter", () => {
  for (const iso of [
    "2026-01-01T00:00:00.000Z",
    "2026-03-20T12:00:00.000Z",
    "2026-06-21T12:00:00.000Z",
    "2026-09-28T12:00:00.000Z",
    "2026-12-21T12:00:00.000Z",
  ]) {
    const instant = new Date(iso);
    const sunPos = Astro.Ecliptic(Astro.GeoVector(Astro.Body.Sun, instant, false));
    assert.deepEqual(getCurrentHDGate(instant), degreeToGateAndLine(sunPos.elon), iso);
  }
});

test("Universal Day uses the canonical date-only numerology engine", () => {
  for (const date of ["2026-01-01", "2026-09-28", "2028-02-29", "2030-12-31"]) {
    assert.equal(calculateUniversalDayNumber(date), calcUniversalDay(date), date);
  }
});

test("server and package daily context are one authority surface", () => {
  const instant = new Date("2026-09-28T18:45:00.000Z");
  const packageResult = getPackageDailyContext("1990-09-17", instant, "2026-09-28");
  const serviceResult = getServiceDailyContext("1990-09-17", instant, "2026-09-28");

  assert.deepEqual(serviceResult, packageResult);
  assert.equal(packageResult.planetaryHour, null);
  assert.equal(packageResult.date, "2026-09-28");
});

test("invalid astronomical instants fail closed", () => {
  assert.throws(
    () => getPackageDailyContext("1990-09-17", new Date("not-a-date")),
    /valid astronomical instant/i,
  );
});
