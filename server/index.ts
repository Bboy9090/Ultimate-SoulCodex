import express, { type Express } from "express";
import { registerRoutes } from "../routes";
import { setupVite, serveStatic, log } from "../vite";

const app: Express = express();

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add /health endpoint for health checks (useful for Render and other platforms)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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

// Store server instance for graceful shutdown
let serverInstance: any = null;

// Setup routes and start server
(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('Error handler caught:', err);
    res.status(status).json({ message });
  });

  // Setup Vite dev server in development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment (Render and other platforms set this)
  const PORT = parseInt(process.env.PORT || "3000", 10);
  
  serverInstance = server.listen(
    {
      port: PORT,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      // Log startup information (without exposing secrets)
      console.info(`
========================================
🚀 Server Starting Up
========================================
NODE_ENV: ${process.env.NODE_ENV || 'development'}
PORT: ${PORT}
DATABASE_URL: ${process.env.DATABASE_URL ? '✓ Set' : '✗ Not set'}
========================================
Server listening on http://0.0.0.0:${PORT}
Health check: http://0.0.0.0:${PORT}/health
========================================
`);
      log(`Server ready on port ${PORT}`);
    }
  );
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Exit with failure code
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Exit with failure code
  process.exit(1);
});

// Handle SIGTERM gracefully (e.g., from Render shutdown)
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received: closing HTTP server gracefully');
  if (serverInstance) {
    serverInstance.close(() => {
      console.info('HTTP server closed');
      process.exit(0);
    });
    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forcing server close after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
});

// Handle SIGINT gracefully (e.g., Ctrl+C)
process.on('SIGINT', () => {
  console.info('SIGINT signal received: closing HTTP server gracefully');
  if (serverInstance) {
    serverInstance.close(() => {
      console.info('HTTP server closed');
      process.exit(0);
    });
    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forcing server close after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
});
