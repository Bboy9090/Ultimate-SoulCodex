import express, { type Express } from "express";
import { setupVite, log, serveStatic } from "../vite";
import { registerRoutes } from "../routes";
import { startEMAScheduler } from "../ema-scheduler";

// Create Express app
const app: Express = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global error handlers for uncaught errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Main server startup
(async () => {
  try {
    // Log startup information
    const NODE_ENV = process.env.NODE_ENV || "development";
    const PORT = process.env.PORT || 3000;
    const hasDatabaseUrl = !!process.env.DATABASE_URL;

    console.log("=".repeat(50));
    console.log("Starting Ultimate SoulCodex Engine");
    console.log("=".repeat(50));
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Port: ${PORT}`);
    console.log(`Database configured: ${hasDatabaseUrl ? "Yes" : "No"}`);
    console.log("=".repeat(50));

    // Register application routes
    const server = await registerRoutes(app);

    // Error handling middleware (must be after routes)
    app.use((err: any, _req: any, res: any, _next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    // Setup Vite dev server or serve static files
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start the server
    const port = parseInt(PORT.toString(), 10);
    server.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`serving on port ${port}`);
        
        // Start EMA notification scheduler
        startEMAScheduler();
        log(`EMA notification scheduler started`);
      }
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
