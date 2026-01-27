#!/usr/bin/env bash
set -euo pipefail

# Usage: run from repository root
# This script will:
# - backup files
# - overwrite vite.config.ts, index.ts, server/index.ts with the prepared fixes
# - checkout/fetch branch copilot/update-render-deployment-setup and commit & push
# - attempt to update/create PR via gh if available

BRANCH="copilot/update-render-deployment-setup"
COMMIT_MSG="Patch: fix Vite root/outDir, revert index.ts exports, improve server graceful shutdown"

echo "Running in: $(pwd)"
echo "Backing up existing files (if present)..."

backup() {
  if [ -f "$1" ]; then
    cp -a "$1" "$1.bak.$(date +%s)"
    echo "  backed up $1 -> $1.bak.*"
  fi
}

backup "vite.config.ts"
backup "index.ts"
backup "server/index.ts"

echo "Writing updated vite.config.ts..."
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

echo "Reverting index.ts to module exports..."
cat > index.ts <<'EOF'
export * from "./types";
export * from "./numerology";
export * from "./psych";
export * from "./confidence";
export * from "./fusion";
EOF

echo "Writing improved server/index.ts (graceful shutdown fixes)..."
mkdir -p server
cat > server/index.ts <<'EOF'
import express, { type Express } from "express";
import { registerRoutes } from "../routes";
import { setupVite, serveStatic, log } from "../vite";
import { type Server } from "http";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  const originalResJson = res.json;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    // @ts-ignore
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 160) logLine = logLine.slice(0, 159) + "…";
      log(logLine);
    }
  });

  next();
});

let serverInstance: Server | null = null;

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error [${status}]: ${message}\n${err.stack || ""}`, "error");
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = parseInt(process.env.PORT || "3000", 10);

  serverInstance = server.listen(
    {
      port: PORT,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      console.info(`
========================================
🚀 Server Starting Up
========================================
NODE_ENV: ${process.env.NODE_ENV || "development"}
PORT: ${PORT}
DATABASE_URL: ${process.env.DATABASE_URL ? "✓ Set" : "✗ Not set"}
========================================
Server listening on http://0.0.0.0:${PORT}
Health check: http://0.0.0.0:${PORT}/health
========================================
`);
      log(`Server ready on port ${PORT}`);
    }
  );
})();

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received: closing HTTP server gracefully");
  if (serverInstance) {
    const forceClose = setTimeout(() => {
      console.error("Forcing server close after timeout");
      process.exit(1);
    }, 10000);

    serverInstance.close(() => {
      clearTimeout(forceClose);
      console.info("HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on("SIGINT", () => {
  console.info("SIGINT signal received: closing HTTP server gracefully");
  if (serverInstance) {
    const forceClose = setTimeout(() => {
      console.error("Forcing server close after timeout");
      process.exit(1);
    }, 10000);

    serverInstance.close(() => {
      clearTimeout(forceClose);
      console.info("HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
EOF

echo "Preparing git branch ${BRANCH}..."
# fetch remote branch if exists
if git ls-remote --exit-code --heads origin "${BRANCH}" >/dev/null 2>&1; then
  git fetch origin "${BRANCH}":"${BRANCH}"
  git checkout "${BRANCH}"
else
  # create branch from origin/main if possible
  if git ls-remote --exit-code --heads origin main >/dev/null 2>&1; then
    git fetch origin main:refs/remotes/origin/main || true
    git checkout -b "${BRANCH}" origin/main || git checkout -b "${BRANCH}"
  else
    git checkout -b "${BRANCH}"
  fi
fi

git add vite.config.ts index.ts server/index.ts
if git diff --cached --quiet; then
  echo "No changes staged. Files already up to date."
else
  git commit -m "${COMMIT_MSG}"
  git push --set-upstream origin "${BRANCH}"
  echo "Pushed fixes to branch ${BRANCH}"
fi

# Try to update/create PR via gh
if command -v gh >/dev/null 2>&1; then
  echo "Attempting to create/update PR via gh..."
  PR_URL="$(gh pr list --head "${BRANCH}" --json url -q '.[0].url' 2>/dev/null || true)"
  if [ -n "${PR_URL}" ]; then
    echo "Found existing PR: ${PR_URL}"
  else
    gh pr create --base main --head "${BRANCH}" --title "Fix Vite root/outDir; revert index.ts; improve server graceful shutdown" --body "Apply fixes to make build succeed and keep single server entry. See CI for details."
    PR_URL="$(gh pr view --json url -q .url 2>/dev/null || true)"
    echo "Created PR: ${PR_URL}"
  fi
else
  echo "gh CLI not available. Please open a PR from branch ${BRANCH} -> main in the GitHub UI."
fi

echo "Done. Paste the PR URL or script output here and I'll re-check the PR and CI logs."