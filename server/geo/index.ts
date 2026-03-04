import { geocodeLocation } from "../../geocoding";
import { geocodeNominatim } from "./nominatim";
import { getGeoCached, setGeoCached, type GeoResult } from "./cache";

export type { GeoResult };

export async function resolveGeo(place: string): Promise<GeoResult | null> {
  if (!place) return null;

  const cached = getGeoCached(place);
  if (cached) {
    console.log(`[GeoCache] HIT: ${place}`);
    return cached;
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
    console.log(`[GeoCache] MISS → static DB: ${place}`);
    return result;
  }

  try {
    const nominatimResult = await geocodeNominatim(place);
    const result: GeoResult = {
      ...nominatimResult,
      provider: "nominatim",
    };
    setGeoCached(place, result);
    console.log(`[GeoCache] MISS → Nominatim: ${place} → (${result.lat}, ${result.lon})`);
    return result;
  } catch (err) {
    console.warn(`[GeoCache] Nominatim fallback failed for "${place}":`, err);
    return null;
  }
}
