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
  // Prefer the Next.js static export if available, fall back to Vite build
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
    // Serve the upgraded Next.js static export
    app.use(express.static(nextDistPath));

    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ message: "API route not found" });
      }
      // Try to find a route-specific HTML file (Next.js static export pattern)
      const routeHtml = path.join(nextDistPath, req.path, "index.html");
      const exactHtml = path.join(nextDistPath, `${req.path}.html`);
      if (fs.existsSync(routeHtml)) {
        return res.sendFile(routeHtml);
      }
      if (fs.existsSync(exactHtml)) {
        return res.sendFile(exactHtml);
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
