#!/usr/bin/env node

import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT ?? 4173);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../dist/public");
const INDEX_PATH = path.join(ROOT, "index.html");
let simulateOutage = false;

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function safeFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const normalized = path.posix.normalize(decoded).replace(/^\/+/, "");
  const candidate = path.resolve(ROOT, normalized);
  return candidate === ROOT || candidate.startsWith(`${ROOT}${path.sep}`) ? candidate : null;
}

async function existingFile(filePath) {
  if (!filePath) return null;
  try {
    await access(filePath);
    return (await stat(filePath)).isFile() ? filePath : null;
  } catch {
    return null;
  }
}

function sendFile(request, response, filePath) {
  const type = MIME_TYPES.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream";
  response.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": type,
    "Service-Worker-Allowed": "/",
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
}

function sendUnavailable(response, message = "Test server outage enabled") {
  response.writeHead(503, {
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(message);
}

const server = http.createServer(async (request, response) => {
  const method = request.method ?? "GET";
  const requestUrl = new URL(request.url ?? "/", `http://${HOST}:${PORT}`);

  if (method === "POST" && requestUrl.pathname === "/__test/offline") {
    request.resume();
    simulateOutage = true;
    response.writeHead(204, { "Cache-Control": "no-store" });
    response.end();
    return;
  }

  if (method === "POST" && requestUrl.pathname === "/__test/online") {
    request.resume();
    simulateOutage = false;
    response.writeHead(204, { "Cache-Control": "no-store" });
    response.end();
    return;
  }

  if (simulateOutage) {
    request.resume();
    sendUnavailable(response);
    return;
  }

  if (requestUrl.pathname.startsWith("/api/")) {
    request.resume();
    response.writeHead(503, {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    });
    response.end(JSON.stringify({ message: "Cloud services intentionally unavailable during offline browser validation" }));
    return;
  }

  if (method !== "GET" && method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  const requestedPath = requestUrl.pathname === "/" ? INDEX_PATH : safeFilePath(requestUrl.pathname);
  const staticFile = await existingFile(requestedPath);
  if (staticFile) {
    sendFile(request, response, staticFile);
    return;
  }

  sendFile(request, response, INDEX_PATH);
});

server.listen(PORT, HOST, () => {
  console.log(`SoulCodex PWA test server listening at http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  server.close((error) => {
    if (error) {
      console.error(`Failed to stop PWA test server after ${signal}`, error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
