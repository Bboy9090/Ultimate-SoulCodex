#!/bin/bash
# Soul Codex - Health Check Script
# Validates core configuration, storage paths, and critical routes

set -e  # Exit on first error

echo "=================================="
echo "Soul Codex Health Check"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

check_pass() {
  echo -e "${GREEN}✓${NC} $1"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
}

check_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# ============================================================================
# 1. Core Configuration Validation
# ============================================================================

echo "1. Checking core configuration..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
  check_pass "Node.js version is 20+ ($(node -v))"
else
  check_fail "Node.js version is $NODE_VERSION, expected 20+"
fi

# Check if package.json exists
if [ -f "package.json" ]; then
  check_pass "package.json exists"
else
  check_fail "package.json not found"
fi

# Check if .env file exists
if [ -f ".env" ]; then
  check_pass ".env file exists"
else
  check_warn ".env file not found (will check .env.example)"
  if [ -f ".env.example" ]; then
    check_pass ".env.example exists"
  else
    check_fail ".env.example not found"
  fi
fi

# Check SESSION_SECRET in .env
if [ -f ".env" ]; then
  if grep -q "SESSION_SECRET=" .env; then
    SESSION_SECRET=$(grep "SESSION_SECRET=" .env | cut -d'=' -f2-)
    if [ -n "$SESSION_SECRET" ] && [ "$SESSION_SECRET" != "your-secret-here" ] && [ "$SESSION_SECRET" != "changeme" ]; then
      check_pass "SESSION_SECRET is set and not default"
    else
      check_warn "SESSION_SECRET is set but appears to be default value"
    fi
  else
    check_fail "SESSION_SECRET not found in .env"
  fi
fi

# Check DEMO_MODE setting
if [ -f ".env" ]; then
  if grep -q "DEMO_MODE=" .env; then
    DEMO_MODE=$(grep "DEMO_MODE=" .env | cut -d'=' -f2-)
    if [ "$DEMO_MODE" = "true" ]; then
      check_warn "DEMO_MODE is enabled (in-memory storage, data not persisted)"
    else
      check_pass "DEMO_MODE is disabled"
    fi
  fi
fi

# Check DATABASE_URL (optional)
if [ -f ".env" ]; then
  if grep -q "DATABASE_URL=" .env; then
    DATABASE_URL=$(grep "DATABASE_URL=" .env | cut -d'=' -f2-)
    if [ -n "$DATABASE_URL" ]; then
      check_pass "DATABASE_URL is configured (database mode)"
    fi
  else
    check_warn "DATABASE_URL not set (demo mode or in-memory storage)"
  fi
fi

# Check AI API keys (optional)
AI_KEY_FOUND=false
if [ -f ".env" ]; then
  if grep -q "GEMINI_API_KEY=" .env; then
    GEMINI_KEY=$(grep "GEMINI_API_KEY=" .env | cut -d'=' -f2-)
    if [ -n "$GEMINI_KEY" ]; then
      check_pass "GEMINI_API_KEY is configured"
      AI_KEY_FOUND=true
    fi
  fi
  if grep -q "OPENAI_API_KEY=" .env; then
    OPENAI_KEY=$(grep "OPENAI_API_KEY=" .env | cut -d'=' -f2-)
    if [ -n "$OPENAI_KEY" ]; then
      check_pass "OPENAI_API_KEY is configured"
      AI_KEY_FOUND=true
    fi
  fi
fi

if [ "$AI_KEY_FOUND" = false ]; then
  check_warn "No AI API keys configured (AI synthesis will use deterministic fallback)"
fi

echo ""

# ============================================================================
# 2. Storage Path Validation
# ============================================================================

echo "2. Checking storage paths..."

# Check if client/src exists
if [ -d "client/src" ]; then
  check_pass "client/src directory exists"
else
  check_fail "client/src directory not found"
fi

# Check if server directory exists
if [ -d "server" ]; then
  check_pass "server directory exists"
else
  check_fail "server directory not found"
fi

# Check if packages directory exists
if [ -d "packages" ]; then
  check_pass "packages directory exists"
else
  check_fail "packages directory not found"
fi

# Check if packages/core/dist exists (needs to be built)
if [ -d "packages/core/dist" ]; then
  check_pass "packages/core is built (dist exists)"
else
  check_warn "packages/core not built (run: npm run build -w packages/core)"
fi

# Check if packages/db/dist exists (needs to be built)
if [ -d "packages/db/dist" ]; then
  check_pass "packages/db is built (dist exists)"
else
  check_warn "packages/db not built (run: npm run build -w packages/db)"
fi

# Check if docs directory exists
if [ -d "docs" ]; then
  check_pass "docs directory exists"
else
  check_fail "docs directory not found"
fi

# Check critical doc files
if [ -f "docs/PRD.md" ]; then
  check_pass "docs/PRD.md exists"
else
  check_fail "docs/PRD.md not found"
fi

if [ -f "docs/ROADMAP.md" ]; then
  check_pass "docs/ROADMAP.md exists"
else
  check_fail "docs/ROADMAP.md not found"
fi

if [ -f "docs/RELEASE_CHECKLIST.md" ]; then
  check_pass "docs/RELEASE_CHECKLIST.md exists"
else
  check_fail "docs/RELEASE_CHECKLIST.md not found"
fi

if [ -f "docs/APP_CONTRACT.md" ]; then
  check_pass "docs/APP_CONTRACT.md exists"
else
  check_fail "docs/APP_CONTRACT.md not found"
fi

# Check app.metadata.json
if [ -f "app.metadata.json" ]; then
  check_pass "app.metadata.json exists"
else
  check_fail "app.metadata.json not found"
fi

echo ""

# ============================================================================
# 3. Critical Routes/Screens Validation
# ============================================================================

echo "3. Checking critical routes/screens..."

# Check if main client routes exist
if [ -f "client/src/App.tsx" ]; then
  check_pass "client/src/App.tsx exists"
else
  check_fail "client/src/App.tsx not found"
fi

# Check for critical page files
PAGES=(
  "client/src/pages/OnboardingPage.tsx"
  "client/src/pages/ProfilePage.tsx"
  "client/src/pages/TodayPage.tsx"
  "client/src/pages/CodexReadingPage.tsx"
)

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    check_pass "$(basename "$page") exists"
  else
    check_fail "$(basename "$page") not found"
  fi
done

ROUTES=(
  "/welcome"
  "/start"
  "/profile"
  "/today"
  "/codex"
  "/privacy"
  "/terms"
)

for route in "${ROUTES[@]}"; do
  if grep -Fq "<Route path=\"$route\"" client/src/App.tsx; then
    check_pass "Route $route is registered"
  else
    check_fail "Route $route is not registered in client/src/App.tsx"
  fi
done

# Check server entry point
if [ -f "server/index.ts" ]; then
  check_pass "server/index.ts exists"
else
  check_fail "server/index.ts not found"
fi

# Check routes.ts
if [ -f "routes.ts" ]; then
  check_pass "routes.ts exists"
else
  check_fail "routes.ts not found"
fi

if grep -Fq 'app.get("/api/journal/prompts"' routes.ts; then
  check_pass "/api/journal/prompts endpoint is wired"
else
  check_fail "/api/journal/prompts endpoint is not wired"
fi

echo ""

# ============================================================================
# 4. Build Artifacts Validation (if built)
# ============================================================================

echo "4. Checking build artifacts (optional)..."

if [ -d "dist" ]; then
  check_pass "dist directory exists (app has been built)"

  if [ -f "dist/index.js" ]; then
    check_pass "dist/index.js exists (server built)"
  else
    check_warn "dist/index.js not found (server not built)"
  fi

  if [ -d "dist/public" ]; then
    check_pass "dist/public exists (client built)"
  else
    check_warn "dist/public not found (client not built)"
  fi
else
  check_warn "dist directory not found (app not built, dev mode OK)"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================

echo "=================================="
echo "Health Check Summary"
echo "=================================="
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All critical checks passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some checks failed. Please review and fix.${NC}"
  exit 1
fi
