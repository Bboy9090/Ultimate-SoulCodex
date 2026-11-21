import { createHash, createPrivateKey, createSign } from "crypto";
import { z } from "zod";
import type { IStorage } from "../storage";

/**
 * Phone push delivery through Firebase Cloud Messaging (which reaches Android directly and iOS
 * through the Apple key uploaded to Firebase). Everything here is OFF until the deployment sets
 * FIREBASE_ENABLED=true plus the project id and a service-account secret; no credential is ever
 * read from, or written to, the repository. See docs/PUSH_NOTIFICATIONS.md.
 *
 * Privacy contract:
 *  - The notification text is a constant. No function in this file accepts a name, sign, or any
 *    chart data, so none can reach Apple's or Google's push servers.
 *  - A token belongs to one account and is deleted with it; tokens are never returned by an API.
 */

export type PushPlatform = "ios" | "android";

export const pushPlatformSchema = z.enum(["ios", "android"]);
// Registration tokens use letters, digits and : _ - . only.
export const pushTokenSchema = z.string().min(20).max(4096).regex(/^[A-Za-z0-9:_.\-]+$/);

export function hashPushToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** The only message this app ever pushes for Soul Circle. */
export const GENERIC_UPDATE_MESSAGE = Object.freeze({
  title: "Soul Circle",
  body: "You have a new Soul Circle update.",
  data: Object.freeze({ url: "/circle" }),
});

export type PushConfig =
  | { status: "disabled" }
  | { status: "misconfigured"; reason: string }
  | { status: "ready"; projectId: string; clientEmail: string; privateKey: string; tokenUri: string };

const GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token";

/** Never includes a secret in a reason: reasons are logged and shown to operators. */
export function resolvePushConfig(env: Record<string, string | undefined> = process.env): PushConfig {
  if (env.FIREBASE_ENABLED?.trim().toLowerCase() !== "true") return { status: "disabled" };
  const projectId = env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) return { status: "misconfigured", reason: "FIREBASE_PROJECT_ID is not set" };
  const raw = env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return { status: "misconfigured", reason: "FIREBASE_SERVICE_ACCOUNT_JSON is not set" };

  let parsed: any;
  try { parsed = JSON.parse(raw); } catch { return { status: "misconfigured", reason: "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON" }; }
  const clientEmail = typeof parsed?.client_email === "string" ? parsed.client_email.trim() : "";
  const privateKey = typeof parsed?.private_key === "string" ? parsed.private_key : "";
  if (!clientEmail.includes("@")) return { status: "misconfigured", reason: "service account has no client_email" };
  if (!privateKey.includes("PRIVATE KEY")) return { status: "misconfigured", reason: "service account has no private_key" };
  if (parsed.project_id && parsed.project_id !== projectId) {
    return { status: "misconfigured", reason: "service account belongs to a different Firebase project" };
  }
  const tokenUri = typeof parsed.token_uri === "string" && parsed.token_uri.trim() ? parsed.token_uri.trim() : GOOGLE_TOKEN_URI;
  if (tokenUri !== GOOGLE_TOKEN_URI) return { status: "misconfigured", reason: "unexpected token_uri" };
  try { createPrivateKey(privateKey); } catch { return { status: "misconfigured", reason: "private_key cannot be read" }; }
  return { status: "ready", projectId, clientEmail, privateKey, tokenUri };
}

export interface PushMessage {
  title: string;
  body: string;
  data: Readonly<Record<string, string>>;
}

export type PushSendResult =
  | { ok: true }
  | { ok: false; invalidToken: boolean; retryable: boolean; reason: string };

export interface PushTransport {
  send(device: { token: string; platform: PushPlatform }, message: PushMessage): Promise<PushSendResult>;
}

const b64url = (value: Buffer | string) => Buffer.from(value).toString("base64url");

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<any>;
}>;

export function createFcmTransport(
  config: Extract<PushConfig, { status: "ready" }>,
  options: { fetch?: FetchLike; now?: () => number } = {},
): PushTransport {
  const doFetch: FetchLike = options.fetch ?? ((url, init) => fetch(url, init) as any);
  const now = options.now ?? (() => Date.now());
  let cached: { token: string; expiresAt: number } | null = null;

  async function accessToken(): Promise<string> {
    if (cached && cached.expiresAt - 60_000 > now()) return cached.token;
    const issuedAt = Math.floor(now() / 1000);
    const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = b64url(JSON.stringify({
      iss: config.clientEmail,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: config.tokenUri,
      iat: issuedAt,
      exp: issuedAt + 3600,
    }));
    const signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(config.privateKey).toString("base64url");
    const response = await doFetch(config.tokenUri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${encodeURIComponent(`${header}.${claims}.${signature}`)}`,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || typeof payload?.access_token !== "string") throw new Error("push_auth_failed");
    cached = { token: payload.access_token, expiresAt: now() + Math.max(60, Number(payload.expires_in) || 3600) * 1000 };
    return cached.token;
  }

  async function attempt(device: { token: string; platform: PushPlatform }, message: PushMessage): Promise<PushSendResult & { reauth?: boolean }> {
    let bearer: string;
    try { bearer = await accessToken(); } catch { return { ok: false, invalidToken: false, retryable: true, reason: "auth_unavailable" }; }
    let response;
    try {
      response = await doFetch(`https://fcm.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/messages:send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearer}` },
        body: JSON.stringify({
          message: {
            token: device.token,
            notification: { title: message.title, body: message.body },
            data: { ...message.data },
            apns: { payload: { aps: { sound: "default" } } },
          },
        }),
      });
    } catch {
      return { ok: false, invalidToken: false, retryable: true, reason: "network" };
    }
    if (response.ok) return { ok: true };

    const payload = await response.json().catch(() => null);
    const errorStatus: string = String(payload?.error?.status ?? "");
    const detailCodes: string[] = Array.isArray(payload?.error?.details) ? payload.error.details.map((detail: any) => String(detail?.errorCode ?? "")) : [];
    const text = String(payload?.error?.message ?? "");
    if (response.status === 404 || errorStatus === "NOT_FOUND" || detailCodes.includes("UNREGISTERED")) {
      return { ok: false, invalidToken: true, retryable: false, reason: "unregistered" };
    }
    if (response.status === 400 && (errorStatus === "INVALID_ARGUMENT" || detailCodes.includes("INVALID_ARGUMENT")) && /registration token/i.test(text)) {
      return { ok: false, invalidToken: true, retryable: false, reason: "invalid_token" };
    }
    if (response.status === 401 || response.status === 403) {
      return { ok: false, invalidToken: false, retryable: false, reason: "auth_rejected", reauth: true };
    }
    return { ok: false, invalidToken: false, retryable: response.status === 429 || response.status >= 500, reason: `http_${response.status}` };
  }

  return {
    async send(device, message) {
      const first = await attempt(device, message);
      if (!first.ok && first.reauth) {
        cached = null; // the cached token may have been revoked: sign in again, once
        const { reauth: _ignored, ...second } = await attempt(device, message);
        return second;
      }
      const { reauth: _ignored, ...result } = first as PushSendResult & { reauth?: boolean };
      return result;
    },
  };
}

export interface PushService {
  /** True only when a real transport is configured. Controls whether devices may be registered. */
  isAvailable(): boolean;
  /** Tells every device of one person that something new is waiting. Never throws. */
  notifyUpdate(userId: string): Promise<{ sent: number; removed: number; skipped?: "not_configured" | "no_devices" }>;
}

export function createPushService(dependencies: {
  storage: Pick<IStorage, "listPushDevices" | "deletePushDeviceByTokenHash">;
  /** Tests inject a transport. Production leaves this unset and uses the environment. */
  transport?: PushTransport;
  env?: Record<string, string | undefined>;
  log?: (message: string) => void;
}): PushService {
  const log = dependencies.log ?? ((message: string) => console.warn(`[Push] ${message}`));
  let transport = dependencies.transport ?? null;
  if (!transport) {
    const config = resolvePushConfig(dependencies.env ?? process.env);
    if (config.status === "ready") transport = createFcmTransport(config);
    else if (config.status === "misconfigured") log(`push disabled: ${config.reason}`);
  }

  return {
    isAvailable: () => transport !== null,
    async notifyUpdate(userId) {
      if (!transport) return { sent: 0, removed: 0, skipped: "not_configured" };
      try {
        const devices = await dependencies.storage.listPushDevices(userId);
        if (devices.length === 0) return { sent: 0, removed: 0, skipped: "no_devices" };
        let sent = 0;
        let removed = 0;
        for (const device of devices) {
          const result = await transport.send({ token: device.token, platform: device.platform as PushPlatform }, GENERIC_UPDATE_MESSAGE);
          if (result.ok) { sent += 1; continue; }
          if (result.invalidToken) {
            await dependencies.storage.deletePushDeviceByTokenHash(device.tokenHash);
            removed += 1;
          } else {
            log(`delivery failed (${result.reason}${result.retryable ? ", retryable" : ""})`);
          }
        }
        return { sent, removed };
      } catch (error) {
        log(`notify failed: ${error instanceof Error ? error.message : "unknown error"}`);
        return { sent: 0, removed: 0 };
      }
    },
  };
}
