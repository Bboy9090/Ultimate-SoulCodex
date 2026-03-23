// Load environment variables from .env file
import "dotenv/config";
import express, { type Express } from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite-server";

// Simple logger function
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app: Express = express();

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add /health endpoint for health checks
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

(async () => {
  const server = registerRoutes(app);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Production static serving handled via apps/web build
    app.use(express.static("dist/public"));
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`SoulCodex API serving on port ${PORT}`);
  });
})();
