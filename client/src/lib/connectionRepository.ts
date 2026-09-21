import { ATLAS_SIGNS, type AtlasSign } from "./astrologyAtlas";

export type SavedConnection = { id: string; name: string; sunSign: AtlasSign; createdAt: string; updatedAt: string };
const KEY = "soulcodex.connections.v1";
const LIMIT = 100;

export function parseConnections(raw: string | null): SavedConnection[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !Array.isArray(value.connections)) return [];
    return value.connections.filter((row: any): row is SavedConnection =>
      typeof row?.id === "string" && row.id.length > 0 &&
      typeof row?.name === "string" && row.name.trim().length > 0 && row.name.trim().length <= 80 &&
      ATLAS_SIGNS.includes(row?.sunSign) &&
      typeof row?.createdAt === "string" && typeof row?.updatedAt === "string"
    ).slice(0, LIMIT);
  } catch { return []; }
}

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function loadConnections(): SavedConnection[] {
  return parseConnections(storage()?.getItem(KEY) ?? null);
}

export function saveConnection(input: { name: string; sunSign: AtlasSign }): SavedConnection[] {
  const target = storage();
  if (!target) throw new Error("Connections are available on this device only.");
  const name = input.name.trim();
  if (!name || name.length > 80) throw new Error("Enter a name between 1 and 80 characters.");
  if (!ATLAS_SIGNS.includes(input.sunSign)) throw new Error("Choose a valid Sun sign.");
  const current = loadConnections();
  if (current.length >= LIMIT) throw new Error(`This device can store up to ${LIMIT} connections.`);
  const timestamp = new Date().toISOString();
  const connection: SavedConnection = { id: crypto.randomUUID(), name, sunSign: input.sunSign, createdAt: timestamp, updatedAt: timestamp };
  const next = [connection, ...current];
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

export function compatibilityLink(connection: Pick<SavedConnection,"name"|"sunSign">): string {
  const params = new URLSearchParams({ name: connection.name, sunSign: connection.sunSign });
  return `/compatibility/compare?${params.toString()}`;
}
