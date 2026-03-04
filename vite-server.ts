import express from "express";
import path from "path";
import fs from "fs";
import type { Server } from "http";

export async function setupVite(app: express.Express, server: Server) {
  if (process.env.NODE_ENV === "production") {
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
