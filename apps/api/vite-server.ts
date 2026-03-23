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
  const distPath = path.resolve("dist/public");

  if (!fs.existsSync(distPath)) {
    throw new Error("Build folder not found. Run `npm run build` first.");
  }

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}
