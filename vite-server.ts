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
    });
    app.use(vite.middlewares);
  }
}

function serveStatic(app: express.Express) {
  // Prefer the Next.js static export if available, fall back to Vite build.
  // Check once at startup — not on every request — for performance.
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
    // Serve the upgraded Next.js static export.
    // Pre-compute the list of per-route HTML files at startup.
    const routeFiles = new Set<string>();
    try {
      for (const entry of fs.readdirSync(nextDistPath)) {
        if (entry.endsWith(".html")) {
          routeFiles.add("/" + entry.replace(/\.html$/, ""));
        }
        // Also check one level of subdirectories (e.g. /home/index.html)
        const sub = path.join(nextDistPath, entry);
        if (fs.statSync(sub).isDirectory()) {
          const indexHtml = path.join(sub, "index.html");
          if (fs.existsSync(indexHtml)) {
            routeFiles.add("/" + entry);
          }
        }
      }
    } catch {
      // Non-critical — fall through to default handling
    }

    app.use(express.static(nextDistPath));

    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ message: "API route not found" });
      }
      // Try per-route HTML from the precomputed set
      const routeBase = req.path.replace(/\/$/, "") || "/";
      if (routeFiles.has(routeBase)) {
        const htmlFile =
          path.join(nextDistPath, `${routeBase.slice(1)}.html`).replace(/^\//, "");
        const candidate = path.join(nextDistPath, `${routeBase.slice(1)}.html`);
        if (fs.existsSync(candidate)) {
          return res.sendFile(candidate);
        }
        const indexCandidate = path.join(nextDistPath, routeBase.slice(1), "index.html");
        if (fs.existsSync(indexCandidate)) {
          return res.sendFile(indexCandidate);
        }
      }
      // Fall back to root index.html
      const rootHtml = path.join(nextDistPath, "index.html");
      if (fs.existsSync(rootHtml)) {
        return res.sendFile(rootHtml);
      }
      res.status(404).json({ message: "Not found" });
    });
  } else {
    // Fall back to Vite build (legacy client app)
    app.use(express.static(viteDistPath));

    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ message: "API route not found" });
      }
      res.sendFile(path.join(viteDistPath, "index.html"));
    });
  }
}
