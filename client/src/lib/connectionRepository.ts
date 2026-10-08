import { ATLAS_SIGNS, PLANET_FUNCTIONS, type AtlasSign } from "./astrologyAtlas";

export const CONNECTION_PLACEMENT_KEYS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "northNode",
  "southNode",
  "chiron",
] as const;
export type ConnectionPlacementKey = typeof CONNECTION_PLACEMENT_KEYS[number];
export type ConnectionPlacement = { key: ConnectionPlacementKey; sign: AtlasSign; house: number };
export const CONNECTION_RELATIONSHIPS = ["friend", "family", "partner", "other"] as const;
export type ConnectionRelationship = typeof CONNECTION_RELATIONSHIPS[number];
export type SavedConnection = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  relationship?: ConnectionRelationship;
  birthDate?: string;
  sunSign?: AtlasSign;
  placements?: ConnectionPlacement[];
  createdAt: string;
  updatedAt: string;
};
const KEY = "soulcodex.connections.v1";
const LIMIT = 100;
const PLACEMENT_LIMIT = CONNECTION_PLACEMENT_KEYS.length;

function isPlacementKey(value: unknown): value is ConnectionPlacementKey {
  return typeof value === "string" && CONNECTION_PLACEMENT_KEYS.includes(value as ConnectionPlacementKey) && Boolean(PLANET_FUNCTIONS[value]);
}

function isHouse(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 12;
}

function cleanPhone(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const safe = trimmed.replace(/[^\d()+\-\s.]/g, "").replace(/\s+/g, " ").slice(0, 32).trim();
  return safe || undefined;
}

function phoneDigits(value: string | undefined): string {
  return value?.replace(/\D/g, "") ?? "";
}

function cleanEmail(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return undefined;
  return normalized;
}

function cleanRelationship(value: unknown): ConnectionRelationship | undefined {
  return typeof value === "string" && CONNECTION_RELATIONSHIPS.includes(value as ConnectionRelationship)
    ? value as ConnectionRelationship
    : undefined;
}

function cleanBirthDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return undefined;
  return value.trim();
}

export function deriveConnectionSunSignFromBirthDate(birthDate: string): AtlasSign | undefined {
  const safeBirthDate = cleanBirthDate(birthDate);
  if (!safeBirthDate) throw new RangeError("Birth date must use YYYY-MM-DD.");
  const [, monthText, dayText] = safeBirthDate.split("-");
  const month = Number(monthText), day = Number(dayText);
  const boundaries: Array<[number, number, AtlasSign]> = [
    [1, 20, "Aquarius"], [2, 19, "Pisces"], [3, 21, "Aries"], [4, 20, "Taurus"],
    [5, 21, "Gemini"], [6, 21, "Cancer"], [7, 23, "Leo"], [8, 23, "Virgo"],
    [9, 23, "Libra"], [10, 23, "Scorpio"], [11, 22, "Sagittarius"], [12, 22, "Capricorn"],
  ];
  const current = boundaries.find(([candidate]) => candidate === month);
  const boundaryDay = current?.[1] ?? 22;

  // A calendar cutoff is not an ephemeris. Around sign-ingress dates the Sun
  // can change sign during the civil day and the exact instant varies by year
  // and timezone. Leave these dates unresolved until the range engine or exact
  // birth data proves the sign instead of inventing a date-only certainty.
  if (Math.abs(day - boundaryDay) <= 1) return undefined;

  const next = current?.[2] ?? "Capricorn";
  const previous = ATLAS_SIGNS[(ATLAS_SIGNS.indexOf(next) + 11) % 12];
  return day > boundaryDay ? next : previous;
}

export function placementLabel(key: ConnectionPlacementKey): string {
  if (key === "northNode") return "North Node";
  if (key === "southNode") return "South Node";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function sanitizeConnectionPlacements(raw: unknown): ConnectionPlacement[] {
  if (!Array.isArray(raw)) return [];
  const byBody = new Map<ConnectionPlacementKey, ConnectionPlacement>();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const candidate = row as { key?: unknown; sign?: unknown; house?: unknown };
    if (
      !isPlacementKey(candidate.key) ||
      !ATLAS_SIGNS.includes(candidate.sign as AtlasSign) ||
      !isHouse(candidate.house)
    ) continue;
    byBody.set(candidate.key, { key: candidate.key, sign: candidate.sign as AtlasSign, house: candidate.house });
    if (byBody.size >= PLACEMENT_LIMIT) break;
  }
  return CONNECTION_PLACEMENT_KEYS.flatMap(key => byBody.get(key) ? [byBody.get(key)!] : []);
}

export function parseConnections(raw: string | null): SavedConnection[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !Array.isArray(value.connections)) return [];
    return value.connections.flatMap((row: any): SavedConnection[] => {
      if (
        typeof row?.id !== "string" || row.id.length === 0 ||
        typeof row?.name !== "string" || row.name.trim().length === 0 || row.name.trim().length > 80 ||
        typeof row?.createdAt !== "string" || typeof row?.updatedAt !== "string"
      ) return [];
      const hasSunSign = row.sunSign !== undefined && row.sunSign !== null && row.sunSign !== "";
      if (hasSunSign && !ATLAS_SIGNS.includes(row.sunSign)) return [];
      const placements = sanitizeConnectionPlacements(row.placements);
      const phone = cleanPhone(row.phone);
      const email = cleanEmail(row.email);
      const relationship = cleanRelationship(row.relationship);
      const birthDate = cleanBirthDate(row.birthDate);
      const derivedSunSign = birthDate ? deriveConnectionSunSignFromBirthDate(birthDate) : undefined;
      return [{
        id: row.id,
        name: row.name.trim(),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        ...(relationship ? { relationship } : {}),
        ...(birthDate ? { birthDate } : {}),
        ...(derivedSunSign || hasSunSign ? { sunSign: derivedSunSign ?? row.sunSign as AtlasSign } : {}),
        ...(placements.length > 0 ? { placements } : {}),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }];
    }).slice(0, LIMIT);
  } catch { return []; }
}

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function loadConnections(): SavedConnection[] {
  return parseConnections(storage()?.getItem(KEY) ?? null);
}

export function saveConnection(input: { name: string; phone?: string; email?: string; relationship?: ConnectionRelationship; birthDate?: string; sunSign?: AtlasSign | ""; placements?: ConnectionPlacement[] }): SavedConnection[] {
  const target = storage();
  if (!target) throw new Error("Connections are available on this device only.");
  const name = input.name.trim();
  const phone = cleanPhone(input.phone);
  const email = cleanEmail(input.email);
  if (input.email && !email) throw new Error("Enter a valid email address or leave it blank.");
  const relationship = cleanRelationship(input.relationship);
  const birthDate = cleanBirthDate(input.birthDate);
  if (input.birthDate && !birthDate) throw new Error("Birth date must be a real date in YYYY-MM-DD format.");
  const derivedSunSign = birthDate ? deriveConnectionSunSignFromBirthDate(birthDate) : undefined;
  if (!name || name.length > 80) throw new Error("Enter a name between 1 and 80 characters.");
  if (input.sunSign && !ATLAS_SIGNS.includes(input.sunSign)) throw new Error("Choose a valid Sun sign.");
  const current = loadConnections();
  if (current.length >= LIMIT) throw new Error(`This device can store up to ${LIMIT} connections.`);
  const timestamp = new Date().toISOString();
  const placements = sanitizeConnectionPlacements(input.placements);
  const connection: SavedConnection = {
    id: crypto.randomUUID(),
    name,
    ...(phone ? { phone } : {}),
    ...(email ? { email } : {}),
    ...(relationship ? { relationship } : {}),
    ...(birthDate ? { birthDate } : {}),
    ...(derivedSunSign || input.sunSign ? { sunSign: derivedSunSign ?? input.sunSign as AtlasSign } : {}),
    ...(placements.length > 0 ? { placements } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const next = [connection, ...current];
  target.setItem(KEY, JSON.stringify({ version: 1, connections: next }));
  window.dispatchEvent(new Event("soulcodex:connections-updated"));
  return next;
}

export function saveImportedContacts(
  contacts: Array<{ name?: string; phone?: string; email?: string }>,
  relationship: ConnectionRelationship = "friend",
): SavedConnection[] {
  const target = storage();
  if (!target) throw new Error("Connections are available on this device only.");
  const current = loadConnections();
  const next = [...current];
  const knownPhones = new Set(current.map(row => phoneDigits(row.phone)).filter(Boolean));
  const knownEmails = new Set(current.map(row => cleanEmail(row.email)).filter(Boolean));
  const timestamp = new Date().toISOString();

  for (const contact of contacts) {
    if (next.length >= LIMIT) break;
    const name = typeof contact.name === "string" ? contact.name.trim().slice(0, 80) : "";
    const phone = cleanPhone(contact.phone);
    const email = cleanEmail(contact.email);
    const digits = phoneDigits(phone);
    if (!name || (!phone && !email)) continue;
    if ((digits && knownPhones.has(digits)) || (email && knownEmails.has(email))) continue;
    next.unshift({
      id: crypto.randomUUID(),
      name,
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      relationship,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    if (digits) knownPhones.add(digits);
    if (email) knownEmails.add(email);
  }

  target.setItem(KEY, JSON.stringify({ version: 1, connections: next }));
  window.dispatchEvent(new Event("soulcodex:connections-updated"));
  return next;
}

export function updateConnectionPlacements(id: string, placements: ConnectionPlacement[]): SavedConnection[] {
  const target = storage();
  if (!target) return [];
  const next = loadConnections().map(connection =>
    connection.id === id
      ? { ...connection, placements: sanitizeConnectionPlacements(placements), updatedAt: new Date().toISOString() }
      : connection
  );
  target.setItem(KEY, JSON.stringify({ version: 1, connections: next }));
  window.dispatchEvent(new Event("soulcodex:connections-updated"));
  return next;
}

export function removeConnection(id: string): SavedConnection[] {
  const target = storage();
  if (!target) return [];
  const next = loadConnections().filter(row => row.id !== id);
  target.setItem(KEY, JSON.stringify({ version: 1, connections: next }));
  window.dispatchEvent(new Event("soulcodex:connections-updated"));
  return next;
}

export function findConnectionById(connections: SavedConnection[], id: string | null): SavedConnection | null {
  if (!id) return null;
  return connections.find(connection => connection.id === id) ?? null;
}

export function searchConnections(connections: SavedConnection[], query: string): SavedConnection[] {
  const normalized = query.trim().toLowerCase();
  const digits = query.replace(/\D/g, "");
  if (!normalized && !digits) return connections;
  return connections.filter(connection =>
    connection.name.toLowerCase().includes(normalized) ||
    (connection.birthDate ?? "").includes(normalized) ||
    (connection.sunSign ?? "").toLowerCase().includes(normalized) ||
    (connection.email ?? "").toLowerCase().includes(normalized) ||
    (connection.relationship ?? "").toLowerCase().includes(normalized) ||
    (normalized.length > 0 && (connection.phone ?? "").toLowerCase().includes(normalized)) ||
    (digits.length > 0 && phoneDigits(connection.phone).includes(digits))
  );
}

export function relationshipLabel(value: ConnectionRelationship | undefined): string {
  if (value === "family") return "Family";
  if (value === "partner") return "Partner";
  if (value === "other") return "Other";
  return "Friend";
}

export function buildSoulCodexInvite(
  connection: Pick<SavedConnection, "name" | "phone" | "email">,
  origin: string,
): { url: string; text: string; smsHref?: string; emailHref?: string } {
  const parsedOrigin = new URL(origin);
  if (!/^https?:$/.test(parsedOrigin.protocol)) throw new RangeError("Invite origin must use HTTP or HTTPS.");
  const url = new URL("/create", parsedOrigin);
  url.searchParams.set("source", "connection-invite");
  const text = `Hey ${connection.name}, join me on Soul Codex. We can compare only the chart details we each choose to share: ${url.toString()}`;
  const digits = phoneDigits(connection.phone);
  const email = cleanEmail(connection.email);
  return {
    url: url.toString(),
    text,
    ...(digits ? { smsHref: `sms:${digits}?body=${encodeURIComponent(text)}` } : {}),
    ...(email ? { emailHref: `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Join me on Soul Codex")}&body=${encodeURIComponent(text)}` } : {}),
  };
}

export function connectionComparableSunSign(connection: Pick<SavedConnection, "sunSign" | "placements">): AtlasSign | undefined {
  return connection.sunSign ?? connection.placements?.find(placement => placement.key === "sun")?.sign;
}

export function hasComparableConnectionData(connection: Pick<SavedConnection, "sunSign" | "placements">): boolean {
  return Boolean(connectionComparableSunSign(connection));
}

export function connectionProfileSummary(connection: Pick<SavedConnection, "name" | "birthDate" | "sunSign" | "placements">): string {
  const name = connection.name.trim() || "This person";
  const comparableSun = connectionComparableSunSign(connection);
  const placements = sanitizeConnectionPlacements(connection.placements);
  const evidence: string[] = [];
  if (connection.birthDate && comparableSun) evidence.push(`${comparableSun} Sun from birthday ${connection.birthDate}`);
  else if (comparableSun) evidence.push(`${comparableSun} Sun from a saved chart field`);
  if (placements.length > 0) {
    evidence.push(...placements.slice(0, 4).map(row => `${placementLabel(row.key)} in ${row.sign}, House ${row.house}`));
    if (placements.length > 4) evidence.push(`${placements.length - 4} more saved placements`);
  }
  if (evidence.length === 0) {
    if (connection.birthDate) {
      return `${name}: birthday ${connection.birthDate} is saved, but the Sun sign is unresolved because the date is near a sign-ingress boundary. Add birth time plus timezone/location, or a verified Sun placement, to resolve the branch before chart comparison.`;
    }
    return `${name} is saved as a contact only. Add a birthday or a known Sun placement before Soul Codex compares charts for this person.`;
  }
  const missing = placements.length > 0
    ? "Only the saved placements listed here are used; unsaved bodies and time-sensitive systems stay unavailable."
    : "Moon, Rising, houses, Human Design, and other time-sensitive systems stay unavailable until exact supporting data is added.";
  return `${name}: ${evidence.join("; ")}. ${missing}`;
}

export function compatibilityLink(connection: Pick<SavedConnection,"id">): string {
  const params = new URLSearchParams({ connection: connection.id });
  return `/compatibility/compare?${params.toString()}`;
}
