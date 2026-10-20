import type { HttpOptions, HttpResponse } from "@capacitor/core";

type SessionTransport = {
  isIOS: () => boolean;
  apiBase: string;
  nativeRequest: (options: HttpOptions) => Promise<HttpResponse>;
  webFetch: typeof fetch;
};

// Account and billing requests share the native HTTP cookie jar on iOS.
// Never copy session cookies into JavaScript storage or request headers.
const SESSION_PATH = /^\/api\/(?:auth(?:\/|$)|user$|access$|billing(?:\/|$))/;

export function createSessionFetch(transport: SessionTransport) {
  return async (url: string, init: RequestInit = {}): Promise<Response> => {
    const base = transport.apiBase.trim().replace(/\/+$/, "");
    const target = new URL(url, base || "https://invalid.local");
    const nativeSessionRequest = transport.isIOS() && Boolean(base) &&
      target.origin === new URL(base).origin && SESSION_PATH.test(target.pathname);
    if (!nativeSessionRequest) return transport.webFetch(url, init);
    if (target.protocol !== "https:") throw new Error("Native account requests require HTTPS.");
    if (init.credentials === "omit") throw new Error("Native account requests require a session.");
    init.signal?.throwIfAborted();

    const headers = new Headers(init.headers);
    headers.set("Origin", "capacitor://localhost");
    headers.delete("Cookie");
    if (init.cache === "no-store") headers.set("Cache-Control", "no-store");
    let data: unknown;
    if (init.body != null) {
      if (typeof init.body !== "string" || !headers.get("Content-Type")?.includes("application/json")) {
        throw new Error("Native account requests require a JSON body.");
      }
      data = JSON.parse(init.body);
    }
    const result = await transport.nativeRequest({
      url: target.href,
      method: init.method ?? "GET",
      headers: Object.fromEntries(headers.entries()),
      ...(data === undefined ? {} : { data }),
      responseType: "json",
      connectTimeout: 15_000,
      readTimeout: 30_000,
      disableRedirects: true,
    });
    init.signal?.throwIfAborted();
    const responseHeaders = new Headers(result.headers);
    responseHeaders.delete("Set-Cookie");
    responseHeaders.delete("Set-Cookie2");
    const empty = result.status === 204 || result.status === 205 || init.method?.toUpperCase() === "HEAD";
    return new Response(empty ? null : typeof result.data === "string" ? result.data : JSON.stringify(result.data), {
      status: result.status,
      headers: responseHeaders,
    });
  };
}
