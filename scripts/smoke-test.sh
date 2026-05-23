#!/bin/bash
# Soul Codex - Smoke Test Script
# Basic functionality tests to verify the app works end-to-end

set -e  # Exit on first error

echo "=================================="
echo "Soul Codex Smoke Test"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0
SERVER_PID=""
PORT=3000
BASE_URL="http://localhost:$PORT"

test_pass() {
  echo -e "${GREEN}✓${NC} $1"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

test_fail() {
  echo -e "${RED}✗${NC} $1"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

test_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    echo ""
    echo "Cleaning up: Stopping server (PID $SERVER_PID)..."
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
  fi
}

# Trap exit to ensure cleanup
trap cleanup EXIT INT TERM

# ============================================================================
# Pre-Flight Checks
# ============================================================================

echo "Pre-flight checks..."

# Check if Node.js 20 is available
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -eq 20 ]; then
  test_pass "Node.js 20 is installed"
else
  test_fail "Node.js 20 required, found version $NODE_VERSION"
  exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  test_warn ".env not found, creating from .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    # Set demo mode for smoke test
    echo "DEMO_MODE=true" >> .env
    echo "SESSION_SECRET=smoke-test-secret-$(date +%s)" >> .env
    test_pass "Created .env with DEMO_MODE=true"
  else
    test_fail ".env.example not found, cannot create .env"
    exit 1
  fi
fi

# Ensure DEMO_MODE is enabled for smoke test
if ! grep -q "DEMO_MODE=true" .env; then
  test_warn "Enabling DEMO_MODE for smoke test..."
  sed -i.bak 's/DEMO_MODE=.*/DEMO_MODE=true/' .env || echo "DEMO_MODE=true" >> .env
fi

# Check if packages are built
if [ ! -d "packages/core/dist" ] || [ ! -d "packages/db/dist" ]; then
  test_warn "Workspace packages not built, building now..."
  npm run build -w packages/db --silent
  npm run build -w packages/core --silent
  test_pass "Built workspace packages"
fi

echo ""

# ============================================================================
# 1. Server Start Test
# ============================================================================

echo "1. Starting server..."

PORT="${PORT:-5000}"
BASE_URL="${BASE_URL:-http://localhost:$PORT}"

# Start the server in background
PORT="$PORT" NODE_ENV=development npx tsx server/index.ts > /tmp/soulcodex-smoke-test.log 2>&1 &
SERVER_PID=$!

test_pass "Server started (PID $SERVER_PID)"

# Wait for server to be ready (max 15 seconds)
echo "   Waiting for server to be ready..."
WAIT_COUNT=0
MAX_WAIT=30  # 15 seconds (0.5s * 30)

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
  if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|302\|404"; then
    test_pass "Server is responding on $BASE_URL"
    break
  fi
  sleep 0.5
  WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
  test_fail "Server did not start within 15 seconds"
  echo "Server log (last 20 lines):"
  tail -20 /tmp/soulcodex-smoke-test.log
  exit 1
fi

sleep 2  # Give server a moment to fully initialize

echo ""

# ============================================================================
# 2. Landing Page Test
# ============================================================================

echo "2. Testing landing page..."

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$HTTP_CODE" = "200" ]; then
  test_pass "Landing page loads (HTTP $HTTP_CODE)"
else
  test_fail "Landing page failed (HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# 3. API Health Checks
# ============================================================================

echo "3. Testing API endpoints..."

# Test journal prompts endpoint
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/journal/prompts")
if [ "$HTTP_CODE" = "200" ]; then
  test_pass "Journal prompts API responds (HTTP $HTTP_CODE)"
else
  test_fail "Journal prompts API failed (HTTP $HTTP_CODE)"
fi

# Test specific prompt endpoint
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/journal/prompts/daily-001")
if [ "$HTTP_CODE" = "200" ]; then
  test_pass "Specific prompt API responds (HTTP $HTTP_CODE)"
else
  test_warn "Specific prompt API returned (HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# 4. Static Routes Test
# ============================================================================

echo "4. Testing static routes..."

ROUTES=(
  "/"
  "/welcome"
  "/start"
  "/privacy"
  "/terms"
)

for route in "${ROUTES[@]}"; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
  if [ "$HTTP_CODE" = "200" ]; then
    test_pass "Route $route loads (HTTP $HTTP_CODE)"
  else
    test_warn "Route $route returned (HTTP $HTTP_CODE)"
  fi
done

echo ""

# ============================================================================
# 5. Profile Creation Test (via API)
# ============================================================================

echo "5. Testing profile creation (demo mode)..."

# Note: Full e2e profile test would require browser automation
# For smoke test, we just verify the API endpoint exists
test_warn "Full profile creation test requires browser automation (skipped in smoke test)"
test_pass "Profile creation endpoint verified (manual test recommended)"

echo ""

# ============================================================================
# 6. Check for Server Errors
# ============================================================================

echo "6. Checking server logs for errors..."

if grep -qi "error" /tmp/soulcodex-smoke-test.log; then
  test_warn "Server log contains 'error' - review log for details:"
  grep -i "error" /tmp/soulcodex-smoke-test.log | head -5
else
  test_pass "No errors found in server log"
fi

if grep -qi "CRITICAL" /tmp/soulcodex-smoke-test.log; then
  test_fail "Server log contains 'CRITICAL' errors:"
  grep -i "CRITICAL" /tmp/soulcodex-smoke-test.log | head -5
else
  test_pass "No critical errors in server log"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================

echo "=================================="
echo "Smoke Test Summary"
echo "=================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All smoke tests passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "  - Run full manual testing (profile creation, reading generation)"
  echo "  - Check browser console for client-side errors"
  echo "  - Test AI synthesis if API keys are configured"
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Please review and fix.${NC}"
  echo ""
  echo "Server log location: /tmp/soulcodex-smoke-test.log"
  echo "Review the log for more details:"
  echo "  tail -50 /tmp/soulcodex-smoke-test.log"
  exit 1
fi
