import { apiFetch } from "./queryClient";
import { ATLAS_SIGNS, type AtlasSign } from "./astrologyAtlas";
import type { SharedChartPlacement } from "./friendChartCompatibility";

/**
 * Client for Soul Circle (server: server/routes/soul-circle.ts, docs/SOUL_CIRCLE.md).
 *
 * Privacy contract this file preserves:
 * - Nothing about a friend is ever typed in; a friend's signs arrive only because
 *   that friend consented to share them with this person.
 * - Joining a circle shares nothing. Sharing is a separate, per-friend choice.
 * - Comparison runs on this device against this person's own saved chart, so the
 *   viewer's chart never has to leave the device to be compared.
 */

export type SoulCircleField =
  | "displayName"
  | "sunSign"
  | "moonSign"
  | "risingSign"
  | "lifePath"
  | "archetypeTitle"
  | "comparisonChart";

export type SoulCircleChart = {
  displayName?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  lifePath?: number;
  archetypeTitle?: string;
  comparisonChart?: Array<{ key: string; sign: string; house: number }>;
};

export type SoulCircleFriend = {
  id: string;
  displayName: string;
  since: string;
  iShare: { fields: SoulCircleField[]; expiresAt: string } | null;
  theirChart: SoulCircleChart | null;
  theirChartStatus: "not_shared" | "shared" | "unavailable";
  /** Only on the single-friend endpoint: exactly what this friend can see of me right now. */
  myPreview?: SoulCircleChart | null;
};

export type SoulCircleInviteRow = {
  id: string;
  createdAt: string;
  expiresAt: string;
  status: "open" | "accepted" | "expired" | "cancelled";
};

export type SoulCircleNotification = {
  id: string;
  kind: "friend_joined" | "friend_shared" | string;
  linkId: string;
  createdAt: string;
  read: boolean;
  /** Display-ready and consent-based: a chosen name or the anonymous label, never an account name. */
  friendName: string;
};

export type SoulCircleNotifications = { unread: number; items: SoulCircleNotification[] };

export class SoulCircleError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "SoulCircleError";
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await apiFetch(`/api/soul-circle${path}`, {
    method,
    cache: "no-store",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 204) return undefined as T;
  let payload: any = null;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok) {
    throw new SoulCircleError(response.status, String(payload?.code ?? "request_failed"), explainSoulCircleError(response.status, payload?.code, payload?.message));
  }
  return payload as T;
}

export const soulCircleApi = {
  listFriends: () => request<SoulCircleFriend[]>("GET", "/friends"),
  getFriend: (id: string) => request<SoulCircleFriend>("GET", `/friends/${encodeURIComponent(id)}`),
  listInvites: () => request<SoulCircleInviteRow[]>("GET", "/invites"),
  createInvite: (displayName?: string) =>
    request<{ id: string; token: string; path: string; expiresAt: string }>("POST", "/invites", displayName?.trim() ? { displayName: displayName.trim() } : {}),
  cancelInvite: (id: string) => request<void>("DELETE", `/invites/${encodeURIComponent(id)}`),
  previewInvite: (token: string) => request<{ inviterName: string; expiresAt: string }>("GET", `/invites/${encodeURIComponent(token)}/preview`),
  acceptInvite: (token: string) => request<{ id: string }>("POST", "/invites/accept", { token }),
  setShare: (id: string, selection: ShareSelection) =>
    request<{ fields: SoulCircleField[]; expiresAt: string; preview: SoulCircleChart }>("PUT", `/friends/${encodeURIComponent(id)}/share`, selection),
  stopSharing: (id: string) => request<void>("DELETE", `/friends/${encodeURIComponent(id)}/share`),
  removeFriend: (id: string) => request<void>("DELETE", `/friends/${encodeURIComponent(id)}`),
  blockFriend: (id: string) => request<void>("POST", `/friends/${encodeURIComponent(id)}/block`),
  listNotifications: () => request<SoulCircleNotifications>("GET", "/notifications"),
  markNotificationsRead: (ids: string[] | "all") =>
    request<{ marked: number }>("POST", "/notifications/read", ids === "all" ? { all: true } : { ids }),
};

export type ShareSelection = { fields: SoulCircleField[]; displayName?: string };

/** What a person may choose to show one friend, in the order the sheet lists them. */
export const SHARE_FIELD_OPTIONS: ReadonlyArray<{ field: SoulCircleField; label: string; hint: string }> = [
  { field: "displayName", label: "A name for this friend to see", hint: "Otherwise you appear as \"Soul Circle friend\". Your account name is never shown." },
  { field: "sunSign", label: "Sun sign", hint: "Only shown if independently verified." },
  { field: "moonSign", label: "Moon sign", hint: "Only shown if independently verified." },
  { field: "risingSign", label: "Rising sign", hint: "Only shown if independently verified." },
  { field: "lifePath", label: "Life Path number", hint: "Calculated from your birth date." },
  { field: "archetypeTitle", label: "Archetype title", hint: "The headline of your reading, not the reading itself." },
  { field: "comparisonChart", label: "Verified planets and houses", hint: "Lets this friend compare charts with you." },
];

export const BIG_THREE: SoulCircleField[] = ["sunSign", "moonSign", "risingSign"];
export const EVERYTHING_VERIFIED: SoulCircleField[] = ["sunSign", "moonSign", "risingSign", "lifePath", "archetypeTitle", "comparisonChart"];

export function toggleField(fields: SoulCircleField[], field: SoulCircleField): SoulCircleField[] {
  return fields.includes(field) ? fields.filter((value) => value !== field) : [...fields, field];
}

export type ShareSelectionResult =
  | { ok: true; selection: ShareSelection }
  | { ok: false; message: string };

/** Builds the request body, refusing combinations the server would reject. */
export function buildShareSelection(fields: SoulCircleField[], displayName: string): ShareSelectionResult {
  const unique = [...new Set(fields)];
  if (unique.length === 0) return { ok: false, message: "Choose at least one thing to share, or stop sharing." };
  const name = displayName.trim();
  if (unique.includes("displayName")) {
    if (!name) return { ok: false, message: "Type the name you want this friend to see, or untick it." };
    if (name.length > 80) return { ok: false, message: "Keep the name under 80 characters." };
    return { ok: true, selection: { fields: unique, displayName: name } };
  }
  return { ok: true, selection: { fields: unique } };
}

export type ChartChip = { key: string; label: string; value: string };

/** Display chips for a friend's shared chart, in a stable order. Never invents a missing value. */
export function chartChips(chart: SoulCircleChart | null | undefined): ChartChip[] {
  if (!chart) return [];
  const chips: ChartChip[] = [];
  if (chart.sunSign) chips.push({ key: "sun", label: "Sun", value: chart.sunSign });
  if (chart.moonSign) chips.push({ key: "moon", label: "Moon", value: chart.moonSign });
  if (chart.risingSign) chips.push({ key: "rising", label: "Rising", value: chart.risingSign });
  if (typeof chart.lifePath === "number") chips.push({ key: "lifePath", label: "Life Path", value: String(chart.lifePath) });
  if (chart.archetypeTitle) chips.push({ key: "archetype", label: "Archetype", value: chart.archetypeTitle });
  return chips;
}

/**
 * Everything a friend can currently see of the caller, including the fields that are not
 * signs (a chosen name, shared planets and houses). The consent preview must describe the
 * full disclosure, so emptiness is decided from this, never from signs alone.
 */
export function disclosedChips(chart: SoulCircleChart | null | undefined): ChartChip[] {
  if (!chart) return [];
  const chips = chartChips(chart);
  if (chart.displayName) chips.unshift({ key: "name", label: "Name", value: chart.displayName });
  const placements = chart.comparisonChart?.length ?? 0;
  if (placements > 0) chips.push({ key: "placements", label: "Planets & houses", value: `${placements} shared` });
  return chips;
}

const SIGN_SET = new Set<string>(ATLAS_SIGNS);

/** Placements a friend shared, shaped for compareFriendCharts. Unknown signs are dropped, not guessed. */
export function comparablePlacements(chart: SoulCircleChart | null | undefined): SharedChartPlacement[] {
  return (chart?.comparisonChart ?? []).flatMap((row) =>
    SIGN_SET.has(row.sign) ? [{ key: row.key, sign: row.sign as AtlasSign, house: row.house }] : [],
  );
}

export function inviteUrl(origin: string, path: string): string {
  const base = new URL(origin);
  if (!/^https?:$/.test(base.protocol)) throw new RangeError("Invite origin must use HTTP or HTTPS.");
  if (!/^\/circle\/join\/[A-Za-z0-9_-]{32,96}$/.test(path)) throw new RangeError("Unexpected invite path.");
  return new URL(path, base).toString();
}

export function inviteMessage(url: string): string {
  return `Join my Soul Codex circle. We each choose what to share, and nothing is shared until you decide: ${url}`;
}

export function explainSoulCircleError(status: number, code?: unknown, message?: unknown): string {
  switch (code) {
    case "sign_in_required": return "Sign in to use Soul Circle.";
    case "invite_unavailable": return "This invite is no longer available. Ask your friend for a new one.";
    case "own_invite": return "This is your own invite. Send it to a friend instead.";
    case "verified_profile_required": return "Save and verify your chart online before sharing it. Nothing leaves your device until you do.";
    case "no_verified_fields": return "None of the things you picked are independently verified yet, so there is nothing to share.";
    case "soul_circle_invite_limit": return "You have too many open invites. Cancel one first.";
    case "soul_circle_full": return "A Soul Circle is full.";
    case "soul_circle_rate_limited": return "Too many requests. Wait a few minutes and try again.";
    case "soul_circle_not_found": return "That friend is no longer in your circle.";
  }
  if (status === 401) return "Sign in to use Soul Circle.";
  if (status === 503) return "Soul Circle needs durable storage and is unavailable right now.";
  if (typeof message === "string" && message.trim() && message.length < 200) return message.trim();
  return "Something went wrong. Please try again.";
}

/** Whether a failure means the person should go verify their chart rather than retry. */
export function needsVerification(error: unknown): boolean {
  return error instanceof SoulCircleError && (error.code === "verified_profile_required" || error.code === "no_verified_fields");
}

const ANONYMOUS_FRIEND = "Soul Circle friend";

/** Plain-language text for an update. Unknown kinds degrade to a neutral line, never to raw data. */
export function notificationText(item: Pick<SoulCircleNotification, "kind" | "friendName">): string {
  const named = item.friendName && item.friendName !== ANONYMOUS_FRIEND;
  switch (item.kind) {
    case "friend_joined": return named ? `${item.friendName} joined your circle.` : "A friend accepted your invite and joined your circle.";
    case "friend_shared": return named ? `${item.friendName} started sharing with you.` : "A friend started sharing with you.";
    default: return "You have a new Soul Circle update.";
  }
}

export const UPDATES_COLLAPSED_COUNT = 10;

/**
 * Splits updates into what is shown and what is folded away. Anything unread that is folded
 * away is counted, so the unread badge can never point at updates the person cannot reach.
 */
export function splitUpdates<T extends { read: boolean }>(items: T[], showAll: boolean, collapsed = UPDATES_COLLAPSED_COUNT) {
  const visible = showAll ? items : items.slice(0, collapsed);
  const hidden = showAll ? [] : items.slice(collapsed);
  return { visible, hiddenCount: hidden.length, hiddenUnread: hidden.filter((item) => !item.read).length };
}
