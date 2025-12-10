#!/usr/bin/env bash
set -euo pipefail

# IMPORTANT:
# - Run this from the repository root of:
#   Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now
# - You must have git configured and push access to this repo.
# - To auto-create the PR the script uses the GitHub CLI (gh). If gh is not installed or not authenticated,
#   the script will push the branch and print instructions to create the PR manually.
# - The script will NOT change any files other than:
#     - server/index.ts (new)
#     - render.yaml (new)
#     - RENDER_DEPLOY.md (new)
#     - PR_BODY.md (new)
#     - package.json (engines.node added/merged)
# - Review the added files after running and before merging.

echo "Running in: $(pwd)"
echo "Creating server/index.ts, render.yaml, RENDER_DEPLOY.md, PR_BODY.md, updating package.json engines..."

mkdir -p server

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

  // Fallback: create a simple express app that serves the built frontend (dist) and provides /health
  if (!app) {
    app = express();
    // Serve static assets if dist exists
    app.use(express.static("dist", { extensions: ["html"] }));

    // Route all to index.html for SPA behavior (except /health)
    app.get("*", (req, res, next) => {
      if (req.path === "/health") return next();
      res.sendFile("index.html", { root: "dist" }, (err) => {
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

cat > render.yaml <<'EOF'
services:
  - type: web
    name: ultimate-soulcodex-web
    env: node
    repo: https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now
    branch: main
    plan: starter
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
databases:
  - name: ultimate-soulcodex-db
    engine: postgres
    plan: starter
EOF

cat > RENDER_DEPLOY.md <<'EOF'
# Deploying Ultimate SoulCodex to Render

This guide covers the steps to deploy the app to Render with a managed Postgres DB.

1) Connect repo to Render
- Sign in to Render and connect your GitHub account.
- Create a new Web Service -> Select repository `Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now` -> branch `main`.

2) Build & Start commands
- Build Command:
  npm ci && npm run build
- Start Command:
  npm start

Render will set the PORT env var automatically. The server entrypoint included respects process.env.PORT and provides a /health endpoint.

3) Provision Postgres (managed)
- In Render dashboard -> New -> Database -> Postgres -> choose plan.
- After creation, copy the DATABASE_URL and add it to your Web Service environment variables.

4) Environment variables to set in the Service -> Environment:
- DATABASE_URL (from the managed Postgres)
- OPENAI_API_KEY (if using OpenAI features)
- STRIPE_SECRET_KEY (if using Stripe)
- STRIPE_PUBLISHABLE_KEY (if using Stripe checkout)
- STRIPE_WEBHOOK_SECRET (if using webhooks)
- SESSION_SECRET (strong random string)
- SENDER_EMAIL (if sending emails)
- MAIL_HOST
- MAIL_PORT
- MAIL_USER
- MAIL_PASS
- Any other secrets referenced in your code (check files like openai.ts, subscription-service.ts, replitAuth.ts, entitlement-service.ts)

5) Run database migrations
- Recommended: run locally with your DATABASE_URL set to the Render DB:
  git clone https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now.git
  cd Ultimate-SoulCodex-Engine-of-the-Eternal-Now
  npm ci
  export DATABASE_URL="postgres://user:pass@host:port/db"
  npm run db:push
- Alternatively, use Render Shell to run migrations on the Render instance.

6) Stripe webhooks
- For local dev use: `stripe listen --forward-to https://<your-render-service>.onrender.com/webhooks/stripe`
- In Stripe Dashboard, add the production webhook URL and copy the signing secret to STRIPE_WEBHOOK_SECRET in Render.

7) Logs & troubleshooting
- Use Render dashboard logs to inspect build/runtime failures.
- Common issues:
  - Missing env vars -> build/runtime errors.
  - Sharp build failures -> run `npm rebuild sharp --unsafe-perm` locally and ensure Linux binaries are available.
  - Node engine mismatches -> add node engine to package.json to align with Render.

8) Keep the service always-on
- Render's free tier may sleep on inactivity. Pick an appropriate plan to keep the instance always-on for demos and live usage.

Notes
- Do NOT commit any secrets to the repo.
- The provided server entrypoint ensures the app binds to process.env.PORT and exposes /health for Render's health checks.
EOF

cat > PR_BODY.md <<'EOF'
What changed:
- Added a robust server entrypoint (server/index.ts) that:
  - listens on process.env.PORT || 3000
  - exposes /health returning { status: "ok" }
  - logs NODE_ENV, PORT, and whether DATABASE_URL is set (no secrets)
  - imports an exported Express app if present, otherwise serves static dist as a fallback
  - logs unhandledRejection and uncaughtException
- Added render.yaml to declare a Render web service and managed Postgres DB (no secrets included).
- Added RENDER_DEPLOY.md with step-by-step Render deployment instructions and environment variable checklist.
- Added Node engine pin ("node": "20.x") to package.json to align with Render defaults.

Why:
- These minimal changes make the repo deployable to Render with minimal manual configuration in the Render UI (set env vars and create DB). The server entrypoint is resilient and supports Render health checks.

Final deploy steps to perform in Render UI:
1. Connect the repo and create a Web Service (branch: main).
2. Provision a managed Postgres DB in Render; copy DATABASE_URL to the Web Service env.
3. Add secrets listed in RENDER_DEPLOY.md to the Web Service environment.
4. Run database migrations (npm run db:push) against the Render Postgres.
5. Configure Stripe webhook in Stripe Dashboard and set STRIPE_WEBHOOK_SECRET.
6. Monitor build/runtime logs and upgrade plan to keep the instance always-on if needed.
EOF

# Add engines.node = 20.x to package.json safely
if [ -f package.json ]; then
  node -e "const f=require('./package.json'); f.engines=f.engines||{}; f.engines.node='20.x'; require('fs').writeFileSync('package.json', JSON.stringify(f,null,2)); console.log('Added engines.node=20.x to package.json');"
else
  echo "package.json not found in $(pwd). Aborting."
  exit 1
fi

# Git branch/commit/push
BRANCH="render/deploy-prep"
git fetch origin || true
git checkout -b "$BRANCH"
git add server/index.ts render.yaml RENDER_DEPLOY.md PR_BODY.md package.json
git commit -m "Prepare repo for Render deployment: ensure PORT use, health check, render.yaml and deployment docs"
git push --set-upstream origin "$BRANCH"

echo "Files committed and pushed to branch: $BRANCH"

# Try to create PR if gh is available
if command -v gh >/dev/null 2>&1; then
  echo "Attempting to create PR via gh..."
  gh pr create --base main --head "$BRANCH" --title "Prepare repo for Render deployment: ensure PORT use, health check, render.yaml and deployment docs" --body-file PR_BODY.md && echo "PR created."
  PR_URL=$(gh pr view --json url -q .url 2>/dev/null || true)
  if [ -n "$PR_URL" ]; then
    echo "PR URL: $PR_URL"
  fi
else
  echo
  echo "gh CLI not found. To create the PR manually:"
  echo "  1) Open: https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now/compare"
  echo "  2) Select branch: $BRANCH -> base: main"
  echo "  3) Use PR title exactly: Prepare repo for Render deployment: ensure PORT use, health check, render.yaml and deployment docs"
  echo "  4) Paste the PR body from PR_BODY.md"
fi

echo "Done. Paste the PR URL here and I'll review the diff and help with Render logs."