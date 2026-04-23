import type { AstroRequest } from "./types";

const TIME_24H_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function astroCacheKey(req: AstroRequest): string {
  const hs = req.houseSystem ?? "equal";
  const normalizedTime24 = normalizeTime24(req.time24);
  const t = req.timeUnknown || !normalizedTime24 ? "time_unknown" : normalizedTime24;
  const lat = Number.isFinite(req.lat) ? req.lat.toFixed(4) : "na";
  const lon = Number.isFinite(req.lon) ? req.lon.toFixed(4) : "na";
  const tz = normalizeTimezone(req.timezone) ?? "na";
  const place = req.place.trim().toLowerCase().replace(/\s+/g, "_");
  return `astro:v1:${req.dateISO}:${t}:${tz}:${place}:${lat}:${lon}:${hs}`;
}

function normalizeTime24(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const match = TIME_24H_RE.exec(trimmed);
  if (!match) return undefined;
  return `${match[1]}:${match[2]}`;
}

function normalizeTimezone(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
