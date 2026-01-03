import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "../routes";
import { setupVite, serveStatic, log } from "../vite-server";
import { randomUUID } from "crypto";

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING - Simple in-memory rate limiter
// ═══════════════════════════════════════════════════════════════════════════

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  // Skip rate limiting for health checks
  if (req.path === "/health" || req.path === "/ready") {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    res.setHeader("Retry-After", Math.ceil((entry.resetTime - now) / 1000).toString());
    return res.status(429).json({ 
      message: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    });
  }

  entry.count++;
  return next();
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

const app: Express = express();

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY HEADERS & MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

// Security headers
app.use((_req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions policy
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

// CORS configuration for production
app.use((_req, res, next) => {
  const origin = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Parse JSON bodies with size limit
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// Apply rate limiting
app.use(rateLimiter);

// Request ID tracking for debugging
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).requestId = randomUUID().slice(0, 8);
  next();
});

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH & READINESS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// Basic health check (for load balancers)
app.get("/health", (_req, res) => {
  res.status(200).json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed readiness check (for deployments)
app.get("/ready", (_req, res) => {
  res.status(200).json({
    status: "ready",
    version: process.env.npm_package_version || "1.0.0",
    node: process.version,
    env: process.env.NODE_ENV || "development",
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB"
    }
  });
});

// API version endpoint
app.get("/api/version", (_req, res) => {
  res.json({
    name: "Soul Codex - Engine of Eternal Now",
    version: "1.0.0",
    api: "v1",
    features: [
      "astrology", "numerology", "human-design", "gene-keys", "i-ching",
      "chinese-astrology", "kabbalah", "mayan-astrology", "chakra-system",
      "sacred-geometry", "runes", "sabian-symbols", "ayurveda", "biorhythms",
      "elemental-medicine", "soul-archetype", "compatibility", "daily-insights"
    ]
  });
});

// Metrics endpoint (for monitoring dashboards)
app.get("/metrics", (_req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  res.json({
    status: "operational",
    uptime: {
      seconds: Math.floor(uptime),
      formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
    },
    memory: {
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
      external: `${Math.round(memory.external / 1024 / 1024)}MB`
    },
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST LOGGING & MONITORING
// ═══════════════════════════════════════════════════════════════════════════

// Request timeout (30 seconds for API, 60 for special routes)
app.use((req: Request, res: Response, next: NextFunction) => {
  const timeout = req.path.includes("/chat") ? 60000 : 30000;
  req.setTimeout(timeout, () => {
    if (!res.headersSent) {
      res.status(408).json({ message: "Request timeout" });
    }
  });
  next();
});

// Enhanced request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  const requestId = (req as any).requestId || "unknown";
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  } as any;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Color-coded status for logs
      const statusColor = res.statusCode >= 500 ? "🔴" : 
                          res.statusCode >= 400 ? "🟡" : 
                          res.statusCode >= 300 ? "🔵" : "🟢";
      
      let logLine = `${statusColor} [${requestId}] ${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Only log response body for errors
      if (res.statusCode >= 400 && capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse).slice(0, 100)}`;
      }

      log(logLine);
      
      // Log slow requests
      if (duration > 5000) {
        log(`⚠️ Slow request: ${path} took ${duration}ms`, "performance");
      }
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

  // Setup Vite dev server in development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Ensure the fallback serves the built Vite output (dist/public)
    serveStatic(app);
  }

  // Use PORT from environment (Render and other platforms set this)
  const PORT = parseInt(process.env.PORT || "3000", 10);
  // On Windows, use 127.0.0.1 explicitly to avoid IPv6 issues. On Linux, use 0.0.0.0 for all interfaces
  const HOST = process.platform === "win32" ? "127.0.0.1" : "0.0.0.0";

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
