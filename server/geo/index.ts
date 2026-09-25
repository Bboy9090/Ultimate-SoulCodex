import { geocodeLocation } from "../../geocoding";
import { geocodeNominatim } from "./nominatim";
import { getGeoCached, setGeoCached, type GeoResult } from "./cache";

export type { GeoResult };

function isAmbiguityError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith("Ambiguous geocoding results for:");
}

const SAFE_STATIC_FALLBACK_ALIASES = new Set([
  "nyc",
  "new york city",
  "manhattan",
  "brooklyn",
  "bronx",
  "bronx new york",
  "the bronx",
  "queens",
  "staten island",
  "harlem",
  "washington dc",
]);

function normalizedPlaceKey(place: string): string {
  return place.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export async function resolveGeo(place: string): Promise<GeoResult | null> {
  if (!place) return null;

  const cached = getGeoCached(place);
  if (cached) {
    console.log(`[GeoCache] HIT: ${place}`);
    return cached;
  }

  // Prefer the live ranked geocoder because birthplace accuracy matters more
  // than avoiding a network call. The static table is a resilience fallback,
  // not an authority for potentially ambiguous place names.
  try {
    const nominatimResult = await geocodeNominatim(place);
    const result: GeoResult = {
      ...nominatimResult,
      provider: "nominatim",
    };
    setGeoCached(place, result);
    console.log(
      `[GeoCache] MISS → Nominatim: ${place} → (${result.lat}, ${result.lon})`,
    );
    return result;
  } catch (err) {
    if (isAmbiguityError(err)) {
      console.warn(`[GeoCache] Ambiguous birthplace "${place}" requires more detail`);
      return null;
    }
    console.warn(`[GeoCache] Nominatim unavailable for "${place}"; checking static fallback`, err);
  }

  if (!SAFE_STATIC_FALLBACK_ALIASES.has(normalizedPlaceKey(place))) {
    return null;
  }

  const staticResult = geocodeLocation(place);
  if (!staticResult) return null;

  const result: GeoResult = {
    normalizedPlace: staticResult.location,
    lat: parseFloat(staticResult.lat),
    lon: parseFloat(staticResult.lon),
    provider: "static",
  };
  setGeoCached(place, result);
  console.log(`[GeoCache] MISS → curated static fallback: ${place}`);
  return result;
}
