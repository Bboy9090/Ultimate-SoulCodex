// Load environment variables from .env file
import "dotenv/config";
import express, { type Express } from "express";
import { registerRoutes } from "./routes.canonical";

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

// Split deploy (e.g. Vercel web + Railway API): set WEB_ORIGIN to your frontend origin, no trailing slash.
const webOrigin = process.env.WEB_ORIGIN?.replace(/\/$/, "");
if (webOrigin) {
  app.use((req, res, next) => {
    if (req.headers.origin === webOrigin) {
      res.setHeader("Access-Control-Allow-Origin", webOrigin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      const requested = req.header("Access-Control-Request-Headers");
      if (requested) res.setHeader("Access-Control-Allow-Headers", requested);
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
}

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add /health endpoint for health checks
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  const PORT = parseInt(process.env.PORT || "5000", 10);
  server.listen(PORT, "0.0.0.0", () => {
    log(`SoulCodex API serving on port ${PORT}`);
  });
})();
