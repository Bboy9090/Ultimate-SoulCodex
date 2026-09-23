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
export type SavedConnection = {
  id: string;
  name: string;
  sunSign: AtlasSign;
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
        !ATLAS_SIGNS.includes(row?.sunSign) ||
        typeof row?.createdAt !== "string" || typeof row?.updatedAt !== "string"
      ) return [];
      const placements = sanitizeConnectionPlacements(row.placements);
      return [{
        id: row.id,
        name: row.name.trim(),
        sunSign: row.sunSign,
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

export function saveConnection(input: { name: string; sunSign: AtlasSign; placements?: ConnectionPlacement[] }): SavedConnection[] {
  const target = storage();
  if (!target) throw new Error("Connections are available on this device only.");
  const name = input.name.trim();
  if (!name || name.length > 80) throw new Error("Enter a name between 1 and 80 characters.");
  if (!ATLAS_SIGNS.includes(input.sunSign)) throw new Error("Choose a valid Sun sign.");
  const current = loadConnections();
  if (current.length >= LIMIT) throw new Error(`This device can store up to ${LIMIT} connections.`);
  const timestamp = new Date().toISOString();
  const placements = sanitizeConnectionPlacements(input.placements);
  const connection: SavedConnection = {
    id: crypto.randomUUID(),
    name,
    sunSign: input.sunSign,
    ...(placements.length > 0 ? { placements } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const next = [connection, ...current];
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

export function compatibilityLink(connection: Pick<SavedConnection,"id">): string {
  const params = new URLSearchParams({ connection: connection.id });
  return `/compatibility/compare?${params.toString()}`;
}
