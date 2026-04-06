export function astroCacheKey(req) {
    const hs = req.houseSystem ?? "equal";
    const t = req.timeUnknown ? "time_unknown" : (req.time24 ?? "00:00");
    const lat = req.lat !== undefined ? req.lat.toFixed(4) : "na";
    const lon = req.lon !== undefined ? req.lon.toFixed(4) : "na";
    const tz = req.timezone ?? "na";
    const place = req.place.trim().toLowerCase().replace(/\s+/g, "_");
    return `astro:v1:${req.dateISO}:${t}:${tz}:${place}:${lat}:${lon}:${hs}`;
}
