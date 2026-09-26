import test from "node:test";
import assert from "node:assert/strict";
import { geocodeNominatim } from "../server/geo/nominatim";

const originalFetch = globalThis.fetch;

function mockFetch(payload: unknown, inspect?: (url: URL) => void) {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const raw =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    inspect?.(new URL(raw));
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("ranked geocoder rejects far-apart results in different regions", async () => {
  mockFetch([
    {
      display_name: "Camden, Camden County, New Jersey, United States",
      lat: "39.9259",
      lon: "-75.1196",
      address: { country_code: "us", state: "New Jersey" },
    },
    {
      display_name: "Camden, Ouachita County, Arkansas, United States",
      lat: "33.5846",
      lon: "-92.8343",
      address: { country_code: "us", state: "Arkansas" },
    },
  ], (url) => {
    assert.equal(url.searchParams.get("limit"), "3");
    assert.equal(url.searchParams.get("addressdetails"), "1");
  });

  await assert.rejects(
    () => geocodeNominatim("Camden"),
    /Ambiguous geocoding results.*Add state\/region\/country/,
  );
});

test("ranked geocoder accepts multiple nearby hits in the same region", async () => {
  mockFetch([
    {
      display_name: "Bronx, New York, United States",
      lat: "40.8448",
      lon: "-73.8648",
      address: { country_code: "us", state: "New York" },
    },
    {
      display_name: "The Bronx, New York, United States",
      lat: "40.8467",
      lon: "-73.8786",
      address: { country_code: "us", state: "New York" },
    },
  ]);

  const result = await geocodeNominatim("Bronx, New York");
  assert.equal(result.normalizedPlace, "Bronx, New York, United States");
  assert.equal(result.lat, 40.8448);
  assert.equal(result.lon, -73.8648);
});
