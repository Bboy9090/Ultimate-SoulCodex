import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse: any = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
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
    const server = createServer(app);
    
    // Try to load existing routes module if available
    try {
      const { registerRoutes } = await import("../routes.js");
      if (registerRoutes) {
        console.info("Loading existing routes...");
        await registerRoutes(app);
        console.info("Routes loaded successfully");
      }
    } catch (err) {
      console.warn("Could not load routes module, serving static files only:", (err as Error).message);
    }
    
    // Serve static files - in production this will be dist/public, in development could be root
    const NODE_ENV = process.env.NODE_ENV || "development";
    let staticPath;
    
    if (NODE_ENV === "production") {
      // In production after build, files should be in dist/public
      staticPath = path.resolve(__dirname, "public");
      console.info(`Production mode: serving static files from ${staticPath}`);
    } else {
      // In development, serve from parent directory (repository root)
      staticPath = path.resolve(__dirname, "..");
      console.info(`Development mode: serving static files from ${staticPath}`);
    }
    
    app.use(express.static(staticPath));
    
    // SPA fallback to index.html for client-side routing
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(staticPath, "index.html"));
    });

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("Server error:", err);
    });

    // Use PORT from environment (Render requirement) with fallback to 3000
    const PORT = parseInt(process.env.PORT || "3000", 10);
    const DATABASE_URL_SET = process.env.DATABASE_URL ? "set" : "not set";

    server.listen(
      PORT,
      "0.0.0.0",
      async () => {
        // Enhanced startup logging as required
        console.info("=".repeat(50));
        console.info("🚀 Server started successfully");
        console.info("=".repeat(50));
        console.info(`NODE_ENV: ${NODE_ENV}`);
        console.info(`PORT: ${PORT}`);
        console.info(`DATABASE_URL: ${DATABASE_URL_SET}`);
        console.info(`Health check: http://localhost:${PORT}/health`);
        console.info("=".repeat(50));

        console.log(`Server is listening on port ${PORT}`);
        
        // Try to start EMA notification scheduler if available
        try {
          const { startEMAScheduler } = await import("../ema-scheduler.js");
          if (startEMAScheduler) {
            startEMAScheduler();
            console.log("EMA notification scheduler started");
          }
        } catch (err) {
          console.warn("EMA scheduler not available:", (err as Error).message);
        }
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
