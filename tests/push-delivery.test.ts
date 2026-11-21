import assert from "node:assert/strict";
import { createVerify, generateKeyPairSync } from "node:crypto";
import test from "node:test";
import {
  GENERIC_UPDATE_MESSAGE,
  createFcmTransport,
  createPushService,
  hashPushToken,
  pushTokenSchema,
  resolvePushConfig,
  type PushConfig,
  type PushTransport,
} from "../server/lib/push-delivery";

// A throwaway key pair generated for these tests only. Nothing here is a real credential.
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const PRIVATE_PEM = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const PUBLIC_PEM = publicKey.export({ type: "spki", format: "pem" }).toString();

const serviceAccount = (overrides: Record<string, unknown> = {}) => JSON.stringify({
  type: "service_account",
  project_id: "demo-project",
  client_email: "sender@demo-project.iam.gserviceaccount.com",
  private_key: PRIVATE_PEM,
  token_uri: "https://oauth2.googleapis.com/token",
  ...overrides,
});
const readyEnv = (overrides: Record<string, string | undefined> = {}) => ({
  FIREBASE_ENABLED: "true",
  FIREBASE_PROJECT_ID: "demo-project",
  FIREBASE_SERVICE_ACCOUNT_JSON: serviceAccount(),
  ...overrides,
});
const ready = () => {
  const config = resolvePushConfig(readyEnv());
  assert.equal(config.status, "ready");
  return config as Extract<PushConfig, { status: "ready" }>;
};

type Call = { url: string; init: { method: string; headers: Record<string, string>; body: string } };
function fakeFetch(handler: (call: Call, index: number) => { status: number; body?: unknown } | Error) {
  const calls: Call[] = [];
  const fetch = async (url: string, init: Call["init"]) => {
    const call = { url, init };
    calls.push(call);
    const result = handler(call, calls.length - 1);
    if (result instanceof Error) throw result;
    return { ok: result.status >= 200 && result.status < 300, status: result.status, json: async () => result.body ?? {} };
  };
  return { fetch, calls };
}
const tokenOk = { status: 200, body: { access_token: "access-1", expires_in: 3600 } };
const isTokenCall = (call: Call) => call.url.includes("oauth2.googleapis.com");

test("push is off unless explicitly enabled and fully configured, and reasons never contain secrets", () => {
  assert.deepEqual(resolvePushConfig({}), { status: "disabled" });
  assert.deepEqual(resolvePushConfig({ FIREBASE_ENABLED: "false" }), { status: "disabled" });
  assert.deepEqual(resolvePushConfig(readyEnv({ FIREBASE_ENABLED: "yes" })), { status: "disabled" });

  const cases: Array<[string, Record<string, string | undefined>]> = [
    ["FIREBASE_PROJECT_ID is not set", readyEnv({ FIREBASE_PROJECT_ID: undefined })],
    ["FIREBASE_SERVICE_ACCOUNT_JSON is not set", readyEnv({ FIREBASE_SERVICE_ACCOUNT_JSON: undefined })],
    ["not valid JSON", readyEnv({ FIREBASE_SERVICE_ACCOUNT_JSON: "{oops" })],
    ["no client_email", readyEnv({ FIREBASE_SERVICE_ACCOUNT_JSON: serviceAccount({ client_email: "nope" }) })],
    ["no private_key", readyEnv({ FIREBASE_SERVICE_ACCOUNT_JSON: serviceAccount({ private_key: "x" }) })],
    ["different Firebase project", readyEnv({ FIREBASE_SERVICE_ACCOUNT_JSON: serviceAccount({ project_id: "other" }) })],
    ["unexpected token_uri", readyEnv({ FIREBASE_SERVICE_ACCOUNT_JSON: serviceAccount({ token_uri: "https://evil.example/token" }) })],
    ["cannot be read", readyEnv({ FIREBASE_SERVICE_ACCOUNT_JSON: serviceAccount({ private_key: "-----BEGIN PRIVATE KEY-----\nbm9wZQ==\n-----END PRIVATE KEY-----\n" }) })],
  ];
  for (const [expected, env] of cases) {
    const config = resolvePushConfig(env);
    assert.equal(config.status, "misconfigured", expected);
    assert.match((config as any).reason, new RegExp(expected));
    assert.ok(!(config as any).reason.includes("PRIVATE KEY") && !(config as any).reason.includes("MII"), "a reason must never include key material");
  }
  assert.equal(resolvePushConfig(readyEnv()).status, "ready");
});

test("the pushed message is a constant that cannot carry a name or any chart data", async () => {
  assert.deepEqual({ ...GENERIC_UPDATE_MESSAGE, data: { ...GENERIC_UPDATE_MESSAGE.data } }, {
    title: "Soul Circle", body: "You have a new Soul Circle update.", data: { url: "/circle" },
  });
  assert.ok(Object.isFrozen(GENERIC_UPDATE_MESSAGE) && Object.isFrozen(GENERIC_UPDATE_MESSAGE.data));

  const { fetch, calls } = fakeFetch((call) => (isTokenCall(call) ? tokenOk : { status: 200 }));
  await createFcmTransport(ready(), { fetch }).send({ token: "tok_".padEnd(30, "x"), platform: "ios" }, GENERIC_UPDATE_MESSAGE);
  const sent = JSON.parse(calls.find((call) => !isTokenCall(call))!.init.body);
  assert.deepEqual(Object.keys(sent), ["message"]);
  assert.deepEqual(Object.keys(sent.message).sort(), ["apns", "data", "notification", "token"]);
  assert.deepEqual(sent.message.notification, { title: "Soul Circle", body: "You have a new Soul Circle update." });
  assert.deepEqual(sent.message.data, { url: "/circle" });
});

test("sign-in to Google uses a correctly signed RS256 token and the access token is cached", async () => {
  let clock = 1_800_000_000_000;
  const { fetch, calls } = fakeFetch((call) => (isTokenCall(call) ? tokenOk : { status: 200 }));
  const transport = createFcmTransport(ready(), { fetch, now: () => clock });
  const device = { token: "a".repeat(40), platform: "android" as const };
  assert.deepEqual(await transport.send(device, GENERIC_UPDATE_MESSAGE), { ok: true });

  const tokenCall = calls.find(isTokenCall)!;
  const form = new URLSearchParams(tokenCall.init.body);
  assert.equal(form.get("grant_type"), "urn:ietf:params:oauth:grant-type:jwt-bearer");
  const [header, claims, signature] = form.get("assertion")!.split(".");
  assert.deepEqual(JSON.parse(Buffer.from(header, "base64url").toString()), { alg: "RS256", typ: "JWT" });
  const parsedClaims = JSON.parse(Buffer.from(claims, "base64url").toString());
  assert.equal(parsedClaims.iss, "sender@demo-project.iam.gserviceaccount.com");
  assert.equal(parsedClaims.scope, "https://www.googleapis.com/auth/firebase.messaging");
  assert.equal(parsedClaims.aud, "https://oauth2.googleapis.com/token");
  assert.equal(parsedClaims.iat, 1_800_000_000);
  assert.equal(parsedClaims.exp, 1_800_003_600);
  assert.ok(createVerify("RSA-SHA256").update(`${header}.${claims}`).verify(PUBLIC_PEM, Buffer.from(signature, "base64url")), "the signature must verify against the public key");

  const sendCall = calls.find((call) => !isTokenCall(call))!;
  assert.equal(sendCall.url, "https://fcm.googleapis.com/v1/projects/demo-project/messages:send");
  assert.equal(sendCall.init.headers.Authorization, "Bearer access-1");

  await transport.send(device, GENERIC_UPDATE_MESSAGE);
  assert.equal(calls.filter(isTokenCall).length, 1, "the access token is reused while valid");
  clock += 3_600_000;
  await transport.send(device, GENERIC_UPDATE_MESSAGE);
  assert.equal(calls.filter(isTokenCall).length, 2, "and refreshed once it is about to expire");
});

test("provider errors are classified: dead tokens are removable, outages are retryable, bad payloads are not blamed on the token", async () => {
  const device = { token: "b".repeat(40), platform: "ios" as const };
  const sendWith = async (response: { status: number; body?: unknown } | Error) => {
    const { fetch } = fakeFetch((call) => (isTokenCall(call) ? tokenOk : response));
    return createFcmTransport(ready(), { fetch }).send(device, GENERIC_UPDATE_MESSAGE);
  };
  assert.deepEqual(await sendWith({ status: 404, body: { error: { status: "NOT_FOUND", details: [{ errorCode: "UNREGISTERED" }] } } }), { ok: false, invalidToken: true, retryable: false, reason: "unregistered" });
  assert.deepEqual(await sendWith({ status: 400, body: { error: { status: "INVALID_ARGUMENT", message: "The registration token is not a valid FCM registration token" } } }), { ok: false, invalidToken: true, retryable: false, reason: "invalid_token" });
  assert.deepEqual(await sendWith({ status: 400, body: { error: { status: "INVALID_ARGUMENT", message: "Invalid JSON payload" } } }), { ok: false, invalidToken: false, retryable: false, reason: "http_400" });
  assert.deepEqual(await sendWith({ status: 429 }), { ok: false, invalidToken: false, retryable: true, reason: "http_429" });
  assert.deepEqual(await sendWith({ status: 503 }), { ok: false, invalidToken: false, retryable: true, reason: "http_503" });
  assert.deepEqual(await sendWith(new Error("socket hang up")), { ok: false, invalidToken: false, retryable: true, reason: "network" });

  const authDown = fakeFetch(() => ({ status: 500 }));
  assert.deepEqual(await createFcmTransport(ready(), { fetch: authDown.fetch }).send(device, GENERIC_UPDATE_MESSAGE), { ok: false, invalidToken: false, retryable: true, reason: "auth_unavailable" });
});

test("a rejected access token is replaced once, then delivery succeeds", async () => {
  let sendAttempts = 0;
  let tokenIssued = 0;
  const { fetch } = fakeFetch((call) => {
    if (isTokenCall(call)) { tokenIssued += 1; return { status: 200, body: { access_token: `access-${tokenIssued}`, expires_in: 3600 } }; }
    sendAttempts += 1;
    return sendAttempts === 1 ? { status: 401 } : { status: 200 };
  });
  const result = await createFcmTransport(ready(), { fetch }).send({ token: "c".repeat(40), platform: "android" }, GENERIC_UPDATE_MESSAGE);
  assert.deepEqual(result, { ok: true });
  assert.equal(tokenIssued, 2);
});

test("the service skips quietly when unconfigured, removes dead tokens, and never throws", async () => {
  const devices = [
    { id: "1", userId: "u", platform: "ios", token: "good".padEnd(30, "1"), tokenHash: hashPushToken("good".padEnd(30, "1")), createdAt: new Date(), updatedAt: new Date() },
    { id: "2", userId: "u", platform: "android", token: "dead".padEnd(30, "2"), tokenHash: hashPushToken("dead".padEnd(30, "2")), createdAt: new Date(), updatedAt: new Date() },
    { id: "3", userId: "u", platform: "android", token: "flaky".padEnd(30, "3"), tokenHash: hashPushToken("flaky".padEnd(30, "3")), createdAt: new Date(), updatedAt: new Date() },
  ];
  const removed: string[] = [];
  const logs: string[] = [];
  const storage = {
    listPushDevices: async () => devices,
    deletePushDeviceByTokenHash: async (hash: string) => { removed.push(hash); },
  };
  const delivered: Array<{ token: string; message: unknown }> = [];
  const transport: PushTransport = {
    async send(device, message) {
      delivered.push({ token: device.token, message });
      if (device.token.startsWith("dead")) return { ok: false, invalidToken: true, retryable: false, reason: "unregistered" };
      if (device.token.startsWith("flaky")) return { ok: false, invalidToken: false, retryable: true, reason: "http_503" };
      return { ok: true };
    },
  };

  const off = createPushService({ storage, env: {}, log: (m) => logs.push(m) });
  assert.equal(off.isAvailable(), false);
  assert.deepEqual(await off.notifyUpdate("u"), { sent: 0, removed: 0, skipped: "not_configured" });

  const bad = createPushService({ storage, env: readyEnv({ FIREBASE_SERVICE_ACCOUNT_JSON: "{oops" }), log: (m) => logs.push(m) });
  assert.equal(bad.isAvailable(), false);
  assert.ok(logs.some((line) => /push disabled: .*valid JSON/.test(line)));

  const live = createPushService({ storage, transport, log: (m) => logs.push(m) });
  assert.equal(live.isAvailable(), true);
  assert.deepEqual(await live.notifyUpdate("u"), { sent: 1, removed: 1 });
  assert.deepEqual(removed, [devices[1].tokenHash], "only the dead token is removed; a temporary failure keeps it");
  assert.ok(delivered.every((entry) => entry.message === GENERIC_UPDATE_MESSAGE), "every push uses the constant message");
  assert.ok(logs.some((line) => /delivery failed \(http_503, retryable\)/.test(line)));
  assert.ok(logs.every((line) => !line.includes("flaky") && !line.includes("good")), "tokens are never logged");

  const empty = createPushService({ storage: { listPushDevices: async () => [], deletePushDeviceByTokenHash: async () => undefined }, transport });
  assert.deepEqual(await empty.notifyUpdate("u"), { sent: 0, removed: 0, skipped: "no_devices" });
  const exploding = createPushService({ storage: { listPushDevices: async () => { throw new Error("db down"); }, deletePushDeviceByTokenHash: async () => undefined }, transport, log: (m) => logs.push(m) });
  assert.deepEqual(await exploding.notifyUpdate("u"), { sent: 0, removed: 0 });
});

test("device tokens are validated before they are stored", () => {
  assert.ok(pushTokenSchema.safeParse("dGVzdA:APA91bH-_.token".padEnd(40, "x")).success);
  for (const bad of ["short", "has space ".padEnd(40, "x"), "x".repeat(4097), "<script>".padEnd(40, "x"), "tok\nen".padEnd(40, "x"), 12345 as any]) {
    assert.equal(pushTokenSchema.safeParse(bad).success, false);
  }
  assert.match(hashPushToken("abc"), /^[0-9a-f]{64}$/);
});
