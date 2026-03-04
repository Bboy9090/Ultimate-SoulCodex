export interface GeoResult {
  normalizedPlace: string;
  lat: number;
  lon: number;
  provider: "static" | "nominatim";
}

const geoCache = new Map<string, GeoResult>();

function cacheKey(query: string): string {
  return `geo:v1:${query.trim().toLowerCase()}`;
}

export function getGeoCached(query: string): GeoResult | undefined {
  return geoCache.get(cacheKey(query));
}

export function setGeoCached(query: string, result: GeoResult): void {
  geoCache.set(cacheKey(query), result);
}
