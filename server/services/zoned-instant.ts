export function parseExplicitZonedInstant(value: string): Date | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;

  const zoneMatch = raw.match(/(?:Z|([+-])([0-9]{2}):([0-9]{2}))$/i);
  if (!zoneMatch) return null;

  if (zoneMatch[2] !== undefined && zoneMatch[3] !== undefined) {
    const hours = Number(zoneMatch[2]);
    const minutes = Number(zoneMatch[3]);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
    if (hours > 23 || minutes > 59) return null;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function canonicalExplicitZonedInstant(value: string): string | null {
  return parseExplicitZonedInstant(value)?.toISOString() ?? null;
}
