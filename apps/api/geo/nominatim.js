export async function geocodeNominatim(place) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", place);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "0");
    const res = await fetch(url.toString(), {
        headers: {
            "User-Agent": "SoulCodex/1.0 (mystical identity app)",
            "Accept": "application/json",
        },
        signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
        throw new Error(`Nominatim geocoding error: ${res.status}`);
    }
    const data = await res.json();
    if (!data?.length) {
        throw new Error(`No geocoding results for: ${place}`);
    }
    const first = data[0];
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);
    if (!isFinite(lat) || !isFinite(lon)) {
        throw new Error(`Invalid coordinates from geocoder for: ${place}`);
    }
    return {
        normalizedPlace: first.display_name,
        lat,
        lon,
    };
}
