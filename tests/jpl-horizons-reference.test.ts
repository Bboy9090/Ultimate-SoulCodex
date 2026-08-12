import assert from "node:assert/strict";
import test from "node:test";
import {
  buildHorizonsReferenceUrl,
  fetchHorizonsReference,
  parseHorizonsLongitude,
} from "../server/services/jpl-horizons-reference";

const sampleResult = `
*******************************************************************************
 Date__(UT)__HR:MN:SC.fff, ObsEcLon, ObsEcLat,
*******************************************************************************
$$SOE
1990-Sep-17 15:11:00.000, 174.2700000, 0.0001000,
$$EOE
*******************************************************************************
`;

const validPayload = JSON.stringify({
  signature: { source: "NASA/JPL Horizons API", version: "1.3" },
  result: sampleResult,
});

test("builds an official geocentric quantity-31 request for the same UTC instant", () => {
  const url = new URL(buildHorizonsReferenceUrl("Sun", "1990-09-17T15:11:00.000Z"));

  assert.equal(url.origin, "https://ssd.jpl.nasa.gov");
  assert.equal(url.pathname, "/api/horizons.api");
  assert.equal(url.searchParams.get("COMMAND"), "'10'");
  assert.equal(url.searchParams.get("CENTER"), "'500@399'");
  assert.equal(url.searchParams.get("EPHEM_TYPE"), "'OBSERVER'");
  assert.equal(url.searchParams.get("QUANTITIES"), "'31'");
  assert.equal(url.searchParams.get("START_TIME"), "'1990-09-17 15:11:00'");
  assert.equal(url.searchParams.get("STOP_TIME"), "'1990-09-17 15:12:00'");
});

test("parses the named Horizons ecliptic-longitude column instead of guessing a numeric position", () => {
  assert.equal(parseHorizonsLongitude(sampleResult), 174.27);
});

test("creates an independent Sun reference with provenance but does not promote it", async () => {
  const fetchImpl = async () => new Response(validPayload, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  const reference = await fetchHorizonsReference("Sun", "1990-09-17T15:11:00.000Z", { fetchImpl });

  assert.equal(reference.body, "Sun");
  assert.equal(reference.sign, "Virgo");
  assert.equal(reference.longitude, 174.27);
  assert.equal(reference.engine, "nasa-jpl-horizons-api@1.3");
  assert.match(reference.source, /NASA\/JPL Horizons/i);
  assert.equal(reference.inputTimestamp, "1990-09-17T15:11:00.000Z");
  assert.equal("status" in reference, false);
});

test("uses the Moon major-body command for Moon references", () => {
  const url = new URL(buildHorizonsReferenceUrl("Moon", "1990-09-17T15:11:00.000Z"));
  assert.equal(url.searchParams.get("COMMAND"), "'301'");
});

test("retries transient Horizons availability failures with bounded exponential backoff", async () => {
  let calls = 0;
  const delays: number[] = [];
  const fetchImpl = async () => {
    calls += 1;
    if (calls < 3) return new Response("database unavailable", { status: 500 });
    return new Response(validPayload, { status: 200, headers: { "Content-Type": "application/json" } });
  };

  const reference = await fetchHorizonsReference("Sun", "1990-09-17T15:11:00.000Z", {
    fetchImpl,
    maxAttempts: 3,
    retryBaseDelayMs: 10,
    sleepImpl: async (milliseconds) => { delays.push(milliseconds); },
  });

  assert.equal(reference.longitude, 174.27);
  assert.equal(calls, 3);
  assert.deepEqual(delays, [10, 20]);
});

test("fails closed after transient Horizons retry budget is exhausted", async () => {
  let calls = 0;
  const delays: number[] = [];
  const fetchImpl = async () => {
    calls += 1;
    return new Response("database unavailable", { status: 500 });
  };

  await assert.rejects(
    fetchHorizonsReference("Sun", "1990-09-17T15:11:00.000Z", {
      fetchImpl,
      maxAttempts: 3,
      retryBaseDelayMs: 5,
      sleepImpl: async (milliseconds) => { delays.push(milliseconds); },
    }),
    /horizons_http_500/,
  );

  assert.equal(calls, 3);
  assert.deepEqual(delays, [5, 10]);
});

test("does not retry permanent HTTP client errors", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return new Response("bad request", { status: 400 });
  };

  await assert.rejects(
    fetchHorizonsReference("Sun", "1990-09-17T15:11:00.000Z", {
      fetchImpl,
      maxAttempts: 4,
      sleepImpl: async () => undefined,
    }),
    /horizons_http_400/,
  );
  assert.equal(calls, 1);
});

test("rejects unsigned, malformed, or incomplete Horizons responses", async () => {
  const unsignedFetch = async () => new Response(JSON.stringify({ result: sampleResult }), { status: 200 });
  await assert.rejects(
    fetchHorizonsReference("Sun", "1990-09-17T15:11:00.000Z", { fetchImpl: unsignedFetch }),
    /horizons_signature_invalid/,
  );

  const malformedFetch = async () => new Response(JSON.stringify({
    signature: { source: "NASA/JPL Horizons API", version: "1.3" },
    result: "no ephemeris block",
  }), { status: 200 });
  await assert.rejects(
    fetchHorizonsReference("Sun", "1990-09-17T15:11:00.000Z", { fetchImpl: malformedFetch }),
    /horizons_ephemeris_block_missing/,
  );
});
