import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "../routes";
import { setupVite, serveStatic, log } from "../vite";
import { startEMAScheduler } from "../ema-scheduler";

const app = express();

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

// Health check endpoint for Render
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("Server error:", err);
    });

    // Setup Vite in development or serve static files in production
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Use PORT from environment (Render requirement) with fallback to 3000
    const PORT = parseInt(process.env.PORT || "3000", 10);
    const NODE_ENV = process.env.NODE_ENV || "development";
    const DATABASE_URL_SET = process.env.DATABASE_URL ? "set" : "not set";

    server.listen(
      {
        port: PORT,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        // Enhanced startup logging as required
        console.info("=".repeat(50));
        console.info("🚀 Server started successfully");
        console.info("=".repeat(50));
        console.info(`NODE_ENV: ${NODE_ENV}`);
        console.info(`PORT: ${PORT}`);
        console.info(`DATABASE_URL: ${DATABASE_URL_SET}`);
        console.info(`Health check: http://localhost:${PORT}/health`);
        console.info("=".repeat(50));

        log(`serving on port ${PORT}`);
        
        // Start EMA notification scheduler
        startEMAScheduler();
        log("EMA notification scheduler started");
      }
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();

// Graceful error handling for unhandled rejections and exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // In production, you might want to log to external service and exit gracefully
  // process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Log the error and exit the process
  process.exit(1);
});
