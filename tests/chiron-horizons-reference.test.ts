import assert from "node:assert/strict";
import test from "node:test";
import {
  buildChironHorizonsUrl,
  fetchChironHorizonsReference,
} from "../server/services/chiron-horizons-reference";

function mockPayload(longitude: number): Response {
  const result = [
    " Date__(UT)__HR:MN:SC.fff, ObsEcLon, ObsEcLat,",
    "$$SOE",
    `1990-Sep-17 15:11:00.000, ${longitude.toFixed(8)}, 0.00000000,`,
    "$$EOE",
  ].join("\n");
  return new Response(JSON.stringify({
    signature: { source: "NASA/JPL Horizons API", version: "1.3" },
    result,
  }), { status: 200, headers: { "Content-Type": "application/json" } });
}

test("Chiron Horizons URL explicitly selects 2060 Chiron by designation", () => {
  const url = new URL(buildChironHorizonsUrl("1990-09-17T15:11:00.000Z"));
  assert.match(url.searchParams.get("COMMAND") ?? "", /1977 UB/);
  assert.match(url.searchParams.get("COMMAND") ?? "", /DES=/);
  assert.equal(url.searchParams.get("CENTER"), "'500@399'");
  assert.equal(url.searchParams.get("QUANTITIES"), "'31'");
});

test("Chiron Horizons response promotes only a valid JPL-signed longitude", async () => {
  const reference = await fetchChironHorizonsReference(
    "1990-09-17T15:11:00.000Z",
    { fetchImpl: async () => mockPayload(110.25) },
  );
  assert.equal(reference.body, "Chiron");
  assert.equal(reference.sign, "Cancer");
  assert.equal(reference.longitude, 110.25);
  assert.match(reference.engine, /jpl-horizons/i);
});

test("invalid Horizons signatures fail closed", async () => {
  await assert.rejects(
    () => fetchChironHorizonsReference(
      "1990-09-17T15:11:00.000Z",
      {
        fetchImpl: async () => new Response(JSON.stringify({
          signature: { source: "untrusted", version: "1" },
          result: "$$SOE\nrow\n$$EOE",
        }), { status: 200, headers: { "Content-Type": "application/json" } }),
      },
    ),
    /horizons_signature_invalid/,
  );
});
