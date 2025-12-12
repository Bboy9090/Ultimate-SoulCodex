#!/usr/bin/env bash
set -euo pipefail

# apply_vite_server_fix_and_push.sh
# Usage:
#   1) Save this file in the repo root of:
#        Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now
#   2) Make executable: chmod +x apply_vite_server_fix_and_push.sh
#   3) Run: ./apply_vite_server_fix_and_push.sh
#
# What it does:
# - Backups existing vite.config.ts and server/index.ts (if they exist) to .bak files
# - Overwrites vite.config.ts with the corrected config (root -> repo root, ensures outDir dist/public)
# - Overwrites server/index.ts fallback to serve dist/public
# - Ensures branch `render/deploy-prep` exists (creates it from main if not present) and checks it out
# - Commits the changes with a clear message and pushes the branch
# - If gh CLI is available and authenticated, attempts to open a PR (it will update the existing PR for the branch)
#
# IMPORTANT: Run from repository root. You must have git push access. The script will NOT modify other files.

REPO_ROOT="$(pwd)"
BRANCH="render/deploy-prep"
COMMIT_MSG="Fix Vite root and serve dist/public; resolve build error"

echo "Repo root: $REPO_ROOT"
echo "Working branch: $BRANCH"

# Backup existing files if present
backup_if_exists() {
  local f="$1"
  if [ -f "$f" ]; then
    local b="${f}.bak.$(date +%s)"
    cp -a "$f" "$b"
    echo "Backed up $f -> $b"
  fi
}

backup_if_exists "vite.config.ts"
backup_if_exists "server/index.ts"

# Write new vite.config.ts
cat > vite.config.ts <<'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  // Use repo root as Vite root (index.html lives at repo root)
  root: path.resolve(import.meta.dirname, "."),
  build: {
    // Keep output in dist/public so server can serve it
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

echo "Wrote vite.config.ts"

# Ensure server dir exists
mkdir -p server

# Write updated server/index.ts
cat > server/index.ts <<'EOF'
// Safeguarded server entrypoint for Render deployment
// - Uses process.env.PORT
// - Adds /health endpoint
// - Logs startup info (without printing secrets)
// - Graceful handling for unhandledRejection / uncaughtException
import express from "express";

async function bootstrap() {
  // Try to import an existing express app from common entry points
  let app: express.Application | null = null;

  const tryImport = async (path: string) => {
    try {
      const mod = await import(path);
      // Common export shapes: default (app), app, createApp()
      if (mod.default && typeof mod.default === "function") return mod.default();
      if (mod.app && typeof mod.app === "function") return mod.app();
      if (typeof mod.createApp === "function") return mod.createApp();
      if (mod.default && typeof mod.default === "object") return mod.default;
      if (mod.app && typeof mod.app === "object") return mod.app;
    } catch (e) {
      return null;
    }
    return null;
  };

  // Try a few places where an app might be exported
  app = (await tryImport("./app")) || (await tryImport("./server")) || (await tryImport("./index")) || null;

  // Fallback: create a simple express app that serves the built frontend (dist/public) and provides /health
  if (!app) {
    app = express();
    // Serve static assets produced by vite build (outDir: dist/public)
    app.use(express.static("dist/public", { extensions: ["html"] }));

    // Route all to index.html for SPA behavior (except /health)
    app.get("*", (req, res, next) => {
      if (req.path === "/health") return next();
      res.sendFile("index.html", { root: "dist/public" }, (err) => {
        if (err) next();
      });
    });
  }

  // Add /health endpoint (idempotent)
  try {
    const hasHealth = (app as any).__hasHealthEndpoint;
    if (!hasHealth) {
      app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
      });
      (app as any).__hasHealthEndpoint = true;
    }
  } catch (e) {
    // ignore
  }

  // Helpful startup logs (do not print secrets)
  const NODE_ENV = process.env.NODE_ENV || "development";
  const PORT = process.env.PORT || "3000";
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  console.info("Starting app:", {
    NODE_ENV,
    PORT,
    hasDatabaseUrl,
  });

  // Graceful error handling
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
    // Optionally exit to allow process manager to restart
    // process.exit(1);
  });

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    // process.exit(1);
  });

  // Start server
  const portNum = Number(PORT) || 3000;
  app.listen(portNum, () => {
    console.info(`Server listening on port ${portNum}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to bootstrap server:", err);
  process.exit(1);
});
EOF

echo "Wrote server/index.ts"

# Ensure branch exists. If local branch exists, checkout. Otherwise create from origin/main or main.
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "Local branch $BRANCH exists. Checking out."
  git checkout "$BRANCH"
else
  # Try to create branch from origin/main -> fall back to main
  if git ls-remote --exit-code --heads origin main >/dev/null 2>&1; then
    echo "Creating branch $BRANCH from origin/main"
    git fetch origin main:refs/remotes/origin/main || true
    git checkout -b "$BRANCH" origin/main || git checkout -b "$BRANCH"
  else
    echo "origin/main not found; attempting to create branch from local main if exists"
    if git show-ref --verify --quiet refs/heads/main; then
      git checkout -b "$BRANCH" main
    else
      # fallback: create new branch from current HEAD
      git checkout -b "$BRANCH"
    fi
  fi
fi

# Stage changes
git add vite.config.ts server/index.ts

# If package.json changed previously by earlier script, we don't touch it here.
# Commit only if there are changes staged
if git diff --cached --quiet; then
  echo "No changes to commit (files identical to existing). Nothing to push."
else
  git commit -m "$COMMIT_MSG"
  git push --set-upstream origin "$BRANCH"
  echo "Pushed branch $BRANCH"
fi

# If gh CLI is available, attempt to create/update PR
if command -v gh >/dev/null 2>&1; then
  echo "gh CLI detected. Attempting to create or view PR..."
  # Try to view existing PR for this branch
  PR_URL="$(gh pr list --head "$(git rev-parse --abbrev-ref HEAD)" --json url -q '.[0].url' 2>/dev/null || true)"
  if [ -n "$PR_URL" ]; then
    echo "Existing PR for branch found: $PR_URL"
  else
    echo "No existing PR found for branch. Creating a PR..."
    gh pr create --base main --head "$BRANCH" --title "Fix Vite root and serve dist/public; resolve build error" --body "Fix Vite root and serve dist/public; resolves build error: 'Could not resolve entry module client/index.html'."
    PR_URL="$(gh pr view --json url -q .url 2>/dev/null || true)"
    if [ -n "$PR_URL" ]; then
      echo "PR created: $PR_URL"
    else
      echo "PR creation attempted but no URL returned. Check gh output above."
    fi
  fi
else
  echo "gh CLI not available. To create/update the PR manually, open:"
  echo "  https://github.com/${GITHUB_REPOSITORY:-Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now}/compare"
  echo "and create a PR from branch: $BRANCH -> main. Commit message used: $COMMIT_MSG"
fi

echo "Done. If you pushed successfully, the existing PR (if any) for branch $BRANCH will be updated automatically. Paste the PR URL here and I'll review the changes and help with the next steps."