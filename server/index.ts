// Soul Codex Express Server Entry Point
// This is the production entry point for the Express server and web client.
import "dotenv/config";
import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import path from "node:path";
import { existsSync } from "node:fs";
import { registerRoutes } from "./routes.js";

const app: Express = express();

// Railway terminates TLS before forwarding traffic to the container.
app.set("trust proxy", 1);

const allowedOrigins = [
  "soulcodex://localhost",
  "capacitor://localhost",
  "http://localhost:3000",
  "http://localhost:5000",
  "https://soulcodex.up.railway.app",
  "https://ultimate-soulcodex.up.railway.app",
  process.env.PUBLIC_APP_URL,
].filter((origin): origin is string => Boolean(origin));

// Enable CORS for the browser deployment and native mobile shells.
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

// Health check endpoint used by Railway.
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Serve the Vite/PWA output from the same Railway service as the API.
    // API and health routes are registered first so the SPA fallback cannot
    // disguise missing server endpoints as HTML responses.
    if (process.env.NODE_ENV === "production") {
      const publicDirectory = path.resolve(process.cwd(), "dist/public");
      const indexFile = path.join(publicDirectory, "index.html");

      if (!existsSync(indexFile)) {
        throw new Error(
          `Production web bundle is missing at ${indexFile}. Run the complete npm build before starting the server.`,
        );
      }

      app.use(
        express.static(publicDirectory, {
          index: false,
          maxAge: "1h",
          immutable: false,
        }),
      );

      app.get("*", (req, res, next) => {
        if (req.path === "/health" || req.path.startsWith("/api/")) {
          next();
          return;
        }
        res.sendFile(indexFile);
      });
    }

    app.use((req, res) => {
      res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
    });

    app.use(
      (
        err: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        const typedError = err as { status?: number; statusCode?: number; message?: string };
        const status = typedError.status || typedError.statusCode || 500;
        const message = typedError.message || "Internal Server Error";
        console.error(`[ERROR] ${status}: ${message}`, err);
        res.status(status).json({ message });
      },
    );

    const port = Number.parseInt(process.env.PORT || "3000", 10);
    server.listen(port, "0.0.0.0", () => {
      console.log(`Soul Codex server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
