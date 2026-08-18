// Soul Codex Express Server Entry Point
// This is the production entry point for the Express server and web client.
import "dotenv/config";
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { existsSync } from "node:fs";
import { registerRoutes } from "./routes.js";
import { registerProfileVerificationRoutes } from "./routes/profile-verification.js";
import { registerCodexToolRoutes } from "./routes/codex-tools.js";
import { registerSoulGuideRoutes } from "./routes/soul-guide.js";
import compatibilityRouter from "./routes/compatibility.js";
import { resolveReleaseIdentity } from "./lib/release-identity.js";
import {
  registerBillingRawRoutes,
  registerBillingRoutes,
} from "./billing.js";

const app: Express = express();

// Railway terminates TLS before forwarding traffic to the container.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    // Vite and the current PWA shell still emit a small amount of inline
    // runtime styling. Keep CSP out of this pass rather than shipping a policy
    // that makes the app look secure while quietly breaking the interface.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "no-referrer" },
  }),
);

const allowedOrigins = [
  "soulcodex://localhost",
  "capacitor://localhost",
  // capacitor.config.ts sets androidScheme=https, making Android's shell origin
  // https://localhost for bundled store builds.
  "https://localhost",
  "http://localhost:3000",
  "http://localhost:5000",
  "https://soulcodex.up.railway.app",
  "https://ultimate-soulcodex.up.railway.app",
  process.env.PUBLIC_APP_URL,
].filter((origin): origin is string => Boolean(origin));

// Enable CORS only for the known browser deployment and native shells.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("cors_origin_rejected"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature"],
    credentials: true,
    maxAge: 600,
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
    code: "api_rate_limited",
  },
});

app.use("/api", apiLimiter, (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// These routes must be registered before JSON parsing. Stripe verifies the
// exact raw webhook bytes, and the retired direct-card endpoint is rejected
// without accepting payment details into application memory.
registerBillingRawRoutes(app);

app.use(express.json({ limit: "256kb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "64kb" }));

// Local-first users can request astronomy verification without creating a
// server profile, invoking AI generation, or sending unrelated identity data.
registerProfileVerificationRoutes(app);

// The restored clarity tools accept only the specific text required by each
// tool. They do not accept or infer a profile, birth data, Moon/Rising, Human
// Design, or any other identity payload.
registerCodexToolRoutes(app);

// Soul Guide accepts the user's question and, only when the caller names an
// owned server profile, a narrow evidence adapter built on the server. Caller-
// supplied profile blobs are rejected by the strict route schema.
registerSoulGuideRoutes(app);

// Soul Codex never handles card details. Checkout sessions are created here,
// while Stripe's hosted page collects payment information.
registerBillingRoutes(app);

// Mount the evidence-aware Compatibility contract before the canonical route
// registry. Consumer Compatibility sends only the minimum supported Sun
// evidence and Life Path needed for the selected symbolic model.
app.use("/api", compatibilityRouter);

// Railway and release smoke use this endpoint for both liveness and immutable
// client↔backend contract identity. An unknown SHA stays visible as unknown so
// a deployment can never be promoted from liveness alone.
app.get("/health", (_req, res) => {
  res.status(200).json(resolveReleaseIdentity());
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
          setHeaders(res, filePath) {
            if (filePath.endsWith("index.html") || filePath.endsWith("sw.js")) {
              res.setHeader("Cache-Control", "no-cache");
            }
          },
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

    app.use((_req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    app.use(
      (
        err: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        const typedError = err as {
          status?: number;
          statusCode?: number;
          message?: string;
          stack?: string;
        };
        const status = typedError.status || typedError.statusCode || 500;
        const internalMessage = typedError.message || "Internal Server Error";
        const publicMessage =
          status >= 500 ? "Internal Server Error" : internalMessage;

        console.error("[server-error]", {
          status,
          message: internalMessage,
          stack:
            process.env.NODE_ENV === "production" ? undefined : typedError.stack,
        });
        res.status(status).json({ message: publicMessage });
      },
    );

    const port = Number.parseInt(process.env.PORT || "3000", 10);
    server.listen(port, "0.0.0.0", () => {
      const identity = resolveReleaseIdentity();
      console.log(`Soul Codex server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
      console.log(`Release: ${identity.appVersion} ${identity.releaseSha} ${identity.apiContract}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", {
      message: error instanceof Error ? error.message : "unknown_error",
      stack:
        process.env.NODE_ENV === "production" && error instanceof Error
          ? undefined
          : error instanceof Error
            ? error.stack
            : undefined,
    });
    process.exit(1);
  }
})();