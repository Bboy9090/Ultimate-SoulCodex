// Soul Codex Express Server Entry Point
// This is the production entry point for the Express server
import "dotenv/config";
import express, { type Express } from "express";
import session from "express-session";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";

const app: Express = express();

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Health check endpoint (for Railway/Docker health checks)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Register all API routes
(async () => {
  try {
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use(
      (
        err: any,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
      ) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error(`[ERROR] ${status}: ${message}`, err);
        res.status(status).json({ message });
      }
    );

    // Start the server
    const PORT = parseInt(process.env.PORT || "3000", 10);
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Soul Codex server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`🔮 API endpoints: http://localhost:${PORT}/api/*`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
