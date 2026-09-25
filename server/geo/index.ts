import { geocodeLocation } from "../../geocoding";
import { geocodeNominatim } from "./nominatim";
import { getGeoCached, setGeoCached, type GeoResult } from "./cache";

export type { GeoResult };

function isAmbiguityError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith("Ambiguous geocoding results for:");
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

  const staticResult = geocodeLocation(place);
  if (staticResult) {
    const result: GeoResult = {
      normalizedPlace: staticResult.location,
      lat: parseFloat(staticResult.lat),
      lon: parseFloat(staticResult.lon),
      provider: "static",
    };
    setGeoCached(place, result);
    console.log(`[GeoCache] MISS → static fallback: ${place}`);
    return result;
  }

  return null;
}
