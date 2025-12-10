#!/usr/bin/env bash
set -euo pipefail
BRANCH="render/deploy-prep"
COMMIT_MSG="Apply fix: Vite root/outDir -> dist/public; revert index.ts exports; ensure server serves dist/public"

echo "Running in $(pwd)"
# Backups
backup_if_exists() {
  if [ -f "$1" ]; then
    cp -a "$1" "$1.bak.$(date +%s)"
    echo "Backed up $1"
  fi
}

backup_if_exists "vite.config.ts"
backup_if_exists "index.ts"
backup_if_exists "server/index.ts"

# Write vite.config.ts
cat > vite.config.ts <<'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer())]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  // Use repository root as Vite root (index.html is at repo root)
  root: path.resolve(import.meta.dirname, "."),
  build: {
    // Output to dist/public so server can serve it
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
EOF

# Revert index.ts to original exports
cat > index.ts <<'EOF'
export * from "./types";
export * from "./numerology";
export * from "./psych";
export * from "./confidence";
export * from "./fusion";
EOF

# Ensure server dir exists
mkdir -p server

# Write server/index.ts
cat > server/index.ts <<'EOF'
import express, { type Express } from "express";
import { registerRoutes } from "../routes";
import { setupVite, serveStatic, log } from "../vite";

const app: Express = express();

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add /health endpoint for health checks (useful for Render and other platforms)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

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
let serverInstance = null;

// Setup routes and start server
(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err, _req, res, _next) => {
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

  serverInstance = server.listen(
    {
      port: PORT,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      // Log startup information (without exposing secrets)
      console.info(\`
========================================
🚀 Server Starting Up
========================================
NODE_ENV: \${process.env.NODE_ENV || "development"}
PORT: \${PORT}
DATABASE_URL: \${process.env.DATABASE_URL ? "✓ Set" : "✗ Not set"}
========================================
Server listening on http://0.0.0.0:\${PORT}
Health check: http://0.0.0.0:\${PORT}/health
========================================
\`);
      log(\`Server ready on port \${PORT}\`);
    }
  );
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
EOF

# Ensure branch
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  if git ls-remote --exit-code --heads origin main >/dev/null 2>&1; then
    git fetch origin main:refs/remotes/origin/main || true
    git checkout -b "$BRANCH" origin/main || git checkout -b "$BRANCH"
  else
    git checkout -b "$BRANCH"
  fi
fi

# Stage & commit
git add vite.config.ts index.ts server/index.ts
if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  git commit -m "$COMMIT_MSG"
  git push --set-upstream origin "$BRANCH"
  echo "Pushed branch $BRANCH"
fi

# Try to create/update PR with gh
if command -v gh >/dev/null 2>&1; then
  echo "Attempting to create or update PR via gh..."
  PR_URL="$(gh pr list --head "$(git rev-parse --abbrev-ref HEAD)" --json url -q '.[0].url' 2>/dev/null || true)"
  if [ -n "$PR_URL" ]; then
    echo "Existing PR: $PR_URL"
  else
    gh pr create --base main --head "$BRANCH" --title "Fix Vite root/outDir; revert index.ts; serve dist/public" --body "Patch fixes Vite root/outDir mismatch and restores canonical server entry."
    PR_URL="$(gh pr view --json url -q .url 2>/dev/null || true)"
    echo "Created PR: $PR_URL"
  fi
else
  echo "gh CLI not found. Please create or update the PR from branch $BRANCH -> main in GitHub UI."
fi

echo "Done. If you pushed, paste the PR URL here and I will review the diff and build logs."