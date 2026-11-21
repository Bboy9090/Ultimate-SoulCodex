import { Capacitor, registerPlugin } from "@capacitor/core";
import { apiFetch } from "./queryClient";

/**
 * Phone alerts for Soul Circle (server: docs/PUSH_NOTIFICATIONS.md).
 *
 * This lane is a switch with three independent conditions, all of which must hold before anything
 * is shown or requested:
 *   1. the app is running natively on iOS or Android,
 *   2. this build contains the native Firebase Messaging plugin (a build without it simply has no
 *      phone alerts; nothing here crashes or prompts), and
 *   3. the server reports that delivery is configured (`available`).
 * Until all three hold, the person sees nothing and nothing is sent anywhere.
 *
 * Privacy: the only thing sent to the server is this device's push token, tied to the signed-in
 * account. Alert text is a constant chosen on the server; no names or signs are ever pushed.
 */

export type PhoneAlertPlatform = "ios" | "android";

/** The subset of @capacitor-firebase/messaging this lane uses. */
export interface MessagingPlugin {
  checkPermissions(): Promise<{ receive: string }>;
  requestPermissions(): Promise<{ receive: string }>;
  getToken(): Promise<{ token: string }>;
  deleteToken(): Promise<void>;
  addListener(
    event: "notificationActionPerformed",
    listener: (event: { notification?: { data?: unknown } }) => void,
  ): Promise<{ remove(): Promise<void> }>;
}

export interface PhoneAlertsApi {
  status(): Promise<{ available: boolean; registered: boolean; deviceCount: number }>;
  register(platform: PhoneAlertPlatform, token: string): Promise<void>;
  unregister(token: string): Promise<void>;
}

export interface PreferenceStore {
  get(): string | null;
  set(userId: string): void;
  clear(): void;
}

const PREFERENCE_KEY = "soulcodex.phoneAlerts.v1";

export const localPreferenceStore: PreferenceStore = {
  get() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(PREFERENCE_KEY) ?? "null");
      return typeof parsed?.userId === "string" && parsed.userId ? parsed.userId : null;
    } catch { return null; }
  },
  set(userId) { try { window.localStorage.setItem(PREFERENCE_KEY, JSON.stringify({ userId })); } catch { /* optional */ } },
  clear() { try { window.localStorage.removeItem(PREFERENCE_KEY); } catch { /* optional */ } },
};

async function request(method: string, path: string, body?: unknown): Promise<Response> {
  return apiFetch(`/api/soul-circle/push${path}`, {
    method,
    cache: "no-store",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const phoneAlertsApi: PhoneAlertsApi = {
  async status() {
    const response = await request("GET", "/status");
    if (!response.ok) throw new Error("status_failed");
    const body = await response.json();
    return { available: body?.available === true, registered: body?.registered === true, deviceCount: Number(body?.deviceCount) || 0 };
  },
  async register(platform, token) {
    const response = await request("POST", "/register", { platform, token });
    if (response.status === 409) throw new PhoneAlertsError("unavailable");
    if (!response.ok) throw new PhoneAlertsError("failed");
  },
  async unregister(token) {
    const response = await request("POST", "/unregister", { token });
    if (!response.ok) throw new PhoneAlertsError("failed");
  },
};

export class PhoneAlertsError extends Error {
  constructor(public code: "unavailable" | "failed") {
    super(code);
    this.name = "PhoneAlertsError";
  }
}

let cachedPlugin: MessagingPlugin | null | undefined;

/** The native plugin, or null on the web and in any build that does not include it. */
export function getMessagingPlugin(): MessagingPlugin | null {
  if (cachedPlugin !== undefined) return cachedPlugin;
  try {
    cachedPlugin = Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("FirebaseMessaging")
      ? registerPlugin<MessagingPlugin>("FirebaseMessaging")
      : null;
  } catch { cachedPlugin = null; }
  return cachedPlugin;
}

export function getPhoneAlertPlatform(): PhoneAlertPlatform | null {
  try {
    if (!Capacitor.isNativePlatform()) return null;
    const platform = Capacitor.getPlatform();
    return platform === "ios" || platform === "android" ? platform : null;
  } catch { return null; }
}

export type PhoneAlertsView =
  | { kind: "hidden" }
  | { kind: "off" }
  | { kind: "on" }
  | { kind: "blocked" };

/** What the settings card shows. Hidden unless native, plugin-bearing and server-available. */
export function phoneAlertsView(input: {
  platform: PhoneAlertPlatform | null;
  pluginPresent: boolean;
  serverAvailable: boolean;
  permission: string;
  enabledForThisAccount: boolean;
}): PhoneAlertsView {
  if (!input.platform || !input.pluginPresent || !input.serverAvailable) return { kind: "hidden" };
  if (input.permission === "denied") return { kind: "blocked" };
  return input.enabledForThisAccount ? { kind: "on" } : { kind: "off" };
}

export type EnableResult =
  | { status: "enabled" }
  | { status: "denied" }
  | { status: "unsupported" }
  | { status: "unavailable" }
  | { status: "failed" };

export interface PhoneAlertsDeps {
  platform: PhoneAlertPlatform | null;
  plugin: MessagingPlugin | null;
  api: PhoneAlertsApi;
  store: PreferenceStore;
}

export async function enablePhoneAlerts(deps: PhoneAlertsDeps, userId: string): Promise<EnableResult> {
  if (!deps.platform || !deps.plugin) return { status: "unsupported" };
  try {
    let permission = (await deps.plugin.checkPermissions()).receive;
    if (permission !== "granted") permission = (await deps.plugin.requestPermissions()).receive;
    if (permission !== "granted") return { status: "denied" };
    const { token } = await deps.plugin.getToken();
    if (!token) return { status: "failed" };
    await deps.api.register(deps.platform, token);
    deps.store.set(userId);
    return { status: "enabled" };
  } catch (error) {
    return { status: error instanceof PhoneAlertsError && error.code === "unavailable" ? "unavailable" : "failed" };
  }
}

/** Removes this device (never other devices) from the account and forgets the choice. Never throws. */
export async function disablePhoneAlerts(deps: PhoneAlertsDeps): Promise<{ serverCleared: boolean }> {
  let serverCleared = true;
  try {
    if (deps.plugin) {
      const { token } = await deps.plugin.getToken();
      if (token) await deps.api.unregister(token);
    }
  } catch { serverCleared = false; }
  // Stop the OS from delivering to this install even if the server could not be reached.
  try { await deps.plugin?.deleteToken(); } catch { /* best effort */ }
  deps.store.clear();
  return { serverCleared };
}

/** Sign-out hook: acts only if this device opted in, so non-users never touch the plugin. Never throws. */
export async function disablePhoneAlertsOnSignOut(deps: PhoneAlertsDeps): Promise<void> {
  if (deps.store.get() === null) return;
  try { await disablePhoneAlerts(deps); } catch { /* sign-out must never fail because of this */ }
}

/**
 * Called at launch. Tokens rotate, so a device that opted in re-registers its current token.
 * It never prompts, and it only acts for the same account that opted in on this device.
 */
export async function refreshPhoneAlertToken(deps: PhoneAlertsDeps, userId: string): Promise<"skipped" | "refreshed" | "failed"> {
  if (!deps.platform || !deps.plugin) return "skipped";
  if (deps.store.get() !== userId) return "skipped";
  try {
    if ((await deps.plugin.checkPermissions()).receive !== "granted") return "skipped";
    const { token } = await deps.plugin.getToken();
    if (!token) return "failed";
    await deps.api.register(deps.platform, token);
    return "refreshed";
  } catch (error) {
    // Includes "unavailable": the server may only be temporarily unconfigured. The choice is kept so
    // the card, sign-out and clear-data can still revoke this device; nothing is forgotten.
    return "failed";
  }
}

/** Notification taps may only open a known in-app route; any other payload is ignored. */
export function safeAlertRoute(data: unknown): string | null {
  const url = (data as { url?: unknown } | null | undefined)?.url;
  return url === "/circle" ? "/circle" : null;
}

export function currentDeps(): PhoneAlertsDeps {
  return { platform: getPhoneAlertPlatform(), plugin: getMessagingPlugin(), api: phoneAlertsApi, store: localPreferenceStore };
}
