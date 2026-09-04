import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { buildHorizonsReferenceUrl } from "../server/services/jpl-horizons-reference";
import {
  PLANETARY_BODIES,
  calculatePlanetaryCandidate,
  exactBirthTimestampUtc,
} from "../server/services/planetary-verification";
import { PLANETARY_EVIDENCE_FIXTURES } from "../server/services/planetary-evidence-matrix";

const EXPECTED_COMMANDS = {
  Mercury: "199",
  Venus: "299",
  Mars: "499",
  Jupiter: "599",
  Saturn: "699",
  Uranus: "799",
  Neptune: "899",
  Pluto: "999",
} as const;

test("JPL Horizons URLs use the canonical target IDs for all major planets", () => {
  for (const body of PLANETARY_BODIES) {
    const url = new URL(buildHorizonsReferenceUrl(body, "1990-09-17T15:11:00.000Z"));
    assert.equal(url.hostname, "ssd.jpl.nasa.gov");
    assert.equal(url.pathname, "/api/horizons.api");
    assert.equal(url.searchParams.get("COMMAND"), `'${EXPECTED_COMMANDS[body]}'`);
    assert.equal(url.searchParams.get("CENTER"), "'500@399'");
    assert.equal(url.searchParams.get("QUANTITIES"), "'31'");
  }
});

test("planetary candidates use the exact birth-place timezone conversion", () => {
  const timestamp = exactBirthTimestampUtc({
    birthDate: "1990-09-17",
    birthTime: "11:11",
    timezone: "America/New_York",
  });
  assert.equal(timestamp?.toISOString(), "1990-09-17T15:11:00.000Z");

  for (const body of PLANETARY_BODIES) {
    const candidate = calculatePlanetaryCandidate(body, {
      birthDate: "1990-09-17",
      birthTime: "11:11",
      timezone: "America/New_York",
    });
    assert.equal(candidate.body, body);
    assert.equal(candidate.inputTimestamp, "1990-09-17T15:11:00.000Z");
    assert.ok(Number.isFinite(candidate.longitude));
    assert.ok(candidate.longitude >= 0 && candidate.longitude < 360);
    assert.ok(candidate.sign.length > 0);
    assert.match(candidate.engine, /astronomy-engine/i);
  }
});

test("planetary calculation fails closed without exact timed inputs", () => {
  assert.equal(
    exactBirthTimestampUtc({ birthDate: "1990-09-17", timezone: "America/New_York" }),
    null,
  );
  assert.throws(
    () => calculatePlanetaryCandidate("Mercury", {
      birthDate: "1990-09-17",
      timezone: "America/New_York",
    }),
    /planetary_exact_birth_timestamp_required/,
  );
});

test("planetary evidence matrix contains ten independent timestamps per body", () => {
  assert.equal(PLANETARY_BODIES.length, 8);
  assert.equal(PLANETARY_EVIDENCE_FIXTURES.length, 10);
  assert.equal(PLANETARY_BODIES.length * PLANETARY_EVIDENCE_FIXTURES.length, 80);
  assert.ok(new Set(PLANETARY_EVIDENCE_FIXTURES.map((fixture) => fixture.category)).size >= 5);
});

test("seasonal timestamps are not mislabeled as body-specific zodiac-cusp evidence", () => {
  const seasonal = PLANETARY_EVIDENCE_FIXTURES.filter(
    (fixture) => fixture.category === "seasonal_boundary",
  );
  assert.equal(seasonal.length, 2);
  assert.equal(
    PLANETARY_EVIDENCE_FIXTURES.some(
      (fixture) => (fixture.category as string) === "zodiac_boundary",
    ),
    false,
  );
  for (const fixture of seasonal) {
    assert.match(fixture.note, /not (counted|represented)/i);
  }
});

test("planetary evidence is wired to a dedicated external CodeBuild lane", () => {
  const buildspec = fs.readFileSync(
    new URL("../buildspec-planetary-evidence.yml", import.meta.url),
    "utf8",
  );
  const runner = fs.readFileSync(
    new URL("../scripts/ci/codebuild-planetary-evidence.sh", import.meta.url),
    "utf8",
  );
  assert.match(buildspec, /codebuild-planetary-evidence\.sh/);
  assert.match(runner, /run-live-planetary-evidence\.ts/);
  assert.match(runner, /planetary-verification-contract\.test\.ts/);
  assert.match(runner, /astronomy-engine-compat\.ts/);
});
