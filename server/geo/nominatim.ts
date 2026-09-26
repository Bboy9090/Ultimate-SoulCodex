export interface NominatimResult {
  normalizedPlace: string;
  lat: number;
  lon: number;
}

type NominatimAddress = {
  country_code?: string;
  state?: string;
  region?: string;
  county?: string;
};

type NominatimCandidate = {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
};

function regionIdentity(candidate: NominatimCandidate): string {
  const address = candidate.address ?? {};
  return [
    address.country_code?.toLowerCase() ?? "",
    (address.state ?? address.region ?? address.county ?? "").toLowerCase(),
  ].join("|");
}

function distanceKm(
  left: { lat: number; lon: number },
  right: { lat: number; lon: number },
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371.0088;
  const lat1 = radians(left.lat);
  const lat2 = radians(right.lat);
  const deltaLat = radians(right.lat - left.lat);
  const deltaLon = radians(right.lon - left.lon);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(a)));
}

export async function geocodeNominatim(place: string): Promise<NominatimResult> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", place);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "3");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "SoulCodex/1.0 (birth-location resolver)",
      "Accept": "application/json",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Nominatim geocoding error: ${res.status}`);
  }

  const data = await res.json() as NominatimCandidate[];

  if (!data?.length) {
    throw new Error(`No geocoding results for: ${place}`);
  }

  const parsed = data
    .map((candidate) => ({
      candidate,
      lat: Number.parseFloat(candidate.lat),
      lon: Number.parseFloat(candidate.lon),
    }))
    .filter((value) => Number.isFinite(value.lat) && Number.isFinite(value.lon));

  if (parsed.length === 0) {
    throw new Error(`Invalid coordinates from geocoder for: ${place}`);
  }

  const first = parsed[0];
  const firstRegion = regionIdentity(first.candidate);

  // Multiple search hits inside the same metro/administrative area are normal.
  // A second high-ranked hit in a different region/country and far away means
  // the birthplace name itself is ambiguous; choosing rank 1 would manufacture
  // precision in every downstream timezone/Ascendant/HD calculation.
  const conflicting = parsed.slice(1).find((other) => {
    const otherRegion = regionIdentity(other.candidate);
    if (!firstRegion || !otherRegion || firstRegion === otherRegion) return false;
    return distanceKm(first, other) >= 80;
  });

  if (conflicting) {
    throw new Error(
      `Ambiguous geocoding results for: ${place}. Add state/region/country.`,
    );
  }

  return {
    normalizedPlace: first.candidate.display_name,
    lat: first.lat,
    lon: first.lon,
  };
}
