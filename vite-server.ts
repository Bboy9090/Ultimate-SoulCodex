import express from "express";
import path from "path";
import fs from "fs";
import type { Server } from "http";

export async function setupVite(app: express.Express, server: Server) {
  // Treat undefined NODE_ENV as production — the compiled dist/index.js bundle
  // is only created for production use and does not bundle Vite. Running the
  // built server without setting NODE_ENV should serve static assets, not
  // attempt to start a Vite dev server.
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev) {
    serveStatic(app);
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server }, allowedHosts: true },
      appType: "spa",
      configFile: path.resolve("vite.config.ts"),
    });
    app.use(vite.middlewares);
  }
}

function serveStatic(app: express.Express) {
  // Prefer the Next.js static export if available, fall back to Vite build.
  // All filesystem checks are performed at startup — never on each request.
  const nextDistPath = path.resolve("dist/next-public");
  const viteDistPath = path.resolve("dist/public");

  const nextAvailable = fs.existsSync(nextDistPath);
  const viteAvailable = fs.existsSync(viteDistPath);

  if (!nextAvailable && !viteAvailable) {
    throw new Error(
      "No build folder found. Run `npm run build` (Vite) or `npm run build:next` (Next.js) first."
    );
  }

  if (nextAvailable) {
    // Build a lookup map of route → absolute file path at startup time.
    // This avoids any per-request filesystem access.
    const routeMap = new Map<string, string>();
    try {
      for (const entry of fs.readdirSync(nextDistPath)) {
        if (entry.endsWith(".html")) {
          const routeName = "/" + entry.replace(/\.html$/, "");
          routeMap.set(routeName, path.join(nextDistPath, entry));
        }
        // One level of subdirectories (e.g. /home/index.html)
        const subPath = path.join(nextDistPath, entry);
        if (fs.statSync(subPath).isDirectory()) {
          const indexHtml = path.join(subPath, "index.html");
          if (fs.existsSync(indexHtml)) {
            routeMap.set("/" + entry, indexHtml);
          }
        }
      }
    } catch {
      // Non-critical — fall through to default handling
    }

    // Root fallback (e.g. / → index.html which redirects to /home)
    const rootHtml = path.join(nextDistPath, "index.html");
    const rootHtmlAbsolute = fs.existsSync(rootHtml) ? rootHtml : null;

    app.use(express.static(nextDistPath));

    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ message: "API route not found" });
      }
      const routeBase = (req.path.replace(/\/$/, "") || "/");
      const htmlFile = routeMap.get(routeBase);
      if (htmlFile) {
        return res.sendFile(htmlFile);
      }
      if (rootHtmlAbsolute) {
        return res.sendFile(rootHtmlAbsolute);
      }
      res.status(404).json({ message: "Not found" });
    });
  } else {
    // Fall back to Vite build (legacy client app)
    app.use(express.static(viteDistPath));

    const viteFallback = path.join(viteDistPath, "index.html");
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ message: "API route not found" });
      }
      res.sendFile(viteFallback);
    });
  }
}
