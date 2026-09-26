import * as geoTz from "geo-tz";

export type BirthLocationConsistency =
  | {
      status: "matched";
      timezone: string;
      candidates: string[];
    }
  | {
      status: "unresolved";
      timezone: string;
      candidates: string[];
      reason:
        | "coordinates_invalid"
        | "timezone_invalid"
        | "timezone_candidates_unavailable"
        | "timezone_coordinate_mismatch";
    };

function usableTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function verifyBirthTimezoneCoordinates(input: {
  latitude: number;
  longitude: number;
  timezone: string;
}): BirthLocationConsistency {
  const { latitude, longitude } = input;
  const timezone = input.timezone.trim();

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      status: "unresolved",
      timezone,
      candidates: [],
      reason: "coordinates_invalid",
    };
  }

  if (!timezone || !usableTimezone(timezone)) {
    return {
      status: "unresolved",
      timezone,
      candidates: [],
      reason: "timezone_invalid",
    };
  }

  let candidates: string[];
  try {
    candidates = geoTz.find(latitude, longitude).filter(usableTimezone);
  } catch {
    return {
      status: "unresolved",
      timezone,
      candidates: [],
      reason: "timezone_candidates_unavailable",
    };
  }

  if (candidates.length === 0) {
    return {
      status: "unresolved",
      timezone,
      candidates,
      reason: "timezone_candidates_unavailable",
    };
  }

  if (!candidates.includes(timezone)) {
    return {
      status: "unresolved",
      timezone,
      candidates,
      reason: "timezone_coordinate_mismatch",
    };
  }

  return {
    status: "matched",
    timezone,
    candidates,
  };
}
