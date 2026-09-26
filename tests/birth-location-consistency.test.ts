import test from "node:test";
import assert from "node:assert/strict";
import { verifyBirthTimezoneCoordinates } from "../server/lib/birth-location-consistency";

test("birth timezone matches Bronx coordinates", () => {
  const result = verifyBirthTimezoneCoordinates({
    latitude: 40.8448,
    longitude: -73.8648,
    timezone: "America/New_York",
  });

  assert.equal(result.status, "matched");
  assert.ok(result.candidates.includes("America/New_York"));
});

test("birth timezone mismatch is rejected even when both inputs are individually valid", () => {
  const result = verifyBirthTimezoneCoordinates({
    latitude: 40.8448,
    longitude: -73.8648,
    timezone: "Europe/London",
  });

  assert.equal(result.status, "unresolved");
  if (result.status === "unresolved") {
    assert.equal(result.reason, "timezone_coordinate_mismatch");
    assert.ok(result.candidates.includes("America/New_York"));
  }
});

test("invalid geographic coordinates fail before timezone comparison", () => {
  const result = verifyBirthTimezoneCoordinates({
    latitude: 95,
    longitude: -73.8648,
    timezone: "America/New_York",
  });

  assert.deepEqual(result, {
    status: "unresolved",
    timezone: "America/New_York",
    candidates: [],
    reason: "coordinates_invalid",
  });
});
