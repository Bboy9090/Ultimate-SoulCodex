// Load environment variables from .env file
import "dotenv/config";

import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "../routes";
import { setupVite } from "../vite-server";

// ── Startup validation ─────────────────────────────────────────────────────
function validateStartup() {
  const missing: string[] = [];
  if (!process.env.SESSION_SECRET) missing.push("SESSION_SECRET");

  if (process.env.NODE_ENV === "production") {
    const hasAI = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!hasAI) console.warn("[Startup] No AI provider keys set — deterministic fallback only");
  }

  if (missing.length) {
    console.error(`[Startup] Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
}
validateStartup();

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
const isProduction = process.env.NODE_ENV === "production";

// ── Security headers (helmet) ───────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : null;

app.use(cors({
  origin: isProduction && allowedOrigins ? allowedOrigins : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// ── Global rate limiting ────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
  skip: (req) => req.path === "/health" || req.path === "/api/health",
});
app.use("/api", globalLimiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "AI request limit reached. Please wait a moment." },
});
app.use("/api/chat", aiLimiter);
app.use("/api/ai", aiLimiter);
app.use("/api/codex30", aiLimiter);
app.use("/api/codex-tools", aiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});
app.use("/api/auth", authLimiter);
app.use("/api/access-codes", authLimiter);

// Health endpoint (before rate limiting, above)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Parse JSON bodies with size limit
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
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
    if (!isProduction) console.error("Full error details:", err);
    res.status(status).json({
      message: isProduction && status === 500 ? "Internal Server Error" : message,
    });
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
