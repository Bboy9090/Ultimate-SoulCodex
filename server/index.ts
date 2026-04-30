// Load environment variables from .env file
import "dotenv/config";

import express, { type Express } from "express";
import cors from "cors";
import { registerRoutes } from "../routes";
import { setupVite } from "../vite-server";

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

// Standard permissive CORS for Railway/Capacitor reliability
app.use(cors({
  origin: true,
  credentials: true
}));

// Manual headers for extra safety on non-browser environments
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});


// Add /health endpoint early for health checks
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Store server instance for graceful shutdown
let serverInstance: any = null;

// Setup routes and start server
(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error handler caught: ${message}`, "error");
    console.error("Full error details:", err);
    res.status(status).json({ message });
  });

  // Use PORT from environment (Render and other platforms set this)
  const PORT = parseInt(process.env.PORT || "5000", 10);
  // Use HOST from environment if set, otherwise default based on platform
  const HOST = process.env.HOST || (process.platform === "win32" ? "127.0.0.1" : "0.0.0.0");

  // Setup Vite (dev middleware or static serving)
  await setupVite(app, server);

  serverInstance = server.listen(PORT, HOST, () => {
    // Log startup information (without exposing secrets)
    console.info(`
========================================
🚀 Server Starting Up
========================================
NODE_ENV: ${process.env.NODE_ENV || "development"}
PORT: ${PORT}
HOST: ${HOST}
DATABASE_URL: ${process.env.DATABASE_URL ? "✓ Set" : "✗ Not set (MemStorage bootstrap mode)"}
SCHEMA: ${process.env.DATABASE_URL ? "✓ Verified/Synchronized (db:init)" : "✗ Skipped (No DB)"}
========================================
Server listening on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}
Health check: http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/health
========================================
`);
    log(`Server ready on port ${PORT}`);
  });
})();

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
  // Exit with failure code
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  // Exit with failure code
  process.exit(1);
});

// Handle SIGTERM gracefully (e.g., from Render shutdown)
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received: closing HTTP server gracefully");
  if (serverInstance) {
    serverInstance.close(() => {
      console.info("HTTP server closed");
      process.exit(0);
    });
    // Force close after 10 seconds
    setTimeout(() => {
      console.error("Forcing server close after timeout");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
});

// Handle SIGINT gracefully (e.g., Ctrl+C)
process.on("SIGINT", () => {
  console.info("SIGINT signal received: closing HTTP server gracefully");
  if (serverInstance) {
    serverInstance.close(() => {
      console.info("HTTP server closed");
      process.exit(0);
    });
    // Force close after 10 seconds
    setTimeout(() => {
      console.error("Forcing server close after timeout");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
});
