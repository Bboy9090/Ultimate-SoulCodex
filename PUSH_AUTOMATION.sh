#!/bin/bash
# Soul Codex Federation - Automated Git Push Script
# Run this on your machine when device reconnects

set -e

REPO_PATH="/home/claude/Ultimate-SoulCodex"
BRANCH="wave-3/corpus-synthesis"
TAG="prod-v1.0.0"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Soul Codex Federation - Automated Deployment Push            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if repo exists
if [ ! -d "$REPO_PATH/.git" ]; then
    echo "❌ ERROR: Git repository not found at $REPO_PATH"
    echo "Please update REPO_PATH in this script"
    exit 1
fi

cd "$REPO_PATH"

echo "📍 Repository: $REPO_PATH"
echo "📍 Branch: $BRANCH"
echo "📍 Tag: $TAG"
echo ""

# Verify branch exists
if ! git rev-parse --verify "$BRANCH" > /dev/null 2>&1; then
    echo "❌ ERROR: Branch '$BRANCH' not found"
    exit 1
fi

# Verify tag exists
if ! git rev-parse --verify "$TAG" > /dev/null 2>&1; then
    echo "❌ ERROR: Tag '$TAG' not found"
    exit 1
fi

echo "✓ Repository validation passed"
echo ""

# Show what will be pushed
echo "📊 Commits to push:"
git log origin/$BRANCH..$BRANCH --oneline 2>/dev/null || echo "   (No upstream to compare)"
echo ""

# Push branch
echo "▶ Pushing branch $BRANCH..."
if git push origin "$BRANCH"; then
    echo "✓ Branch pushed successfully"
else
    echo "❌ Failed to push branch"
    exit 1
fi

echo ""

# Push tag
echo "▶ Pushing tag $TAG..."
if git push origin "$TAG"; then
    echo "✓ Tag pushed successfully"
else
    echo "❌ Failed to push tag"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ ✓ DEPLOYMENT PUSH COMPLETE                                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Verify on GitHub: https://github.com/Bboy9090/Ultimate-SoulCodex"
echo "  2. Check branch: wave-3/corpus-synthesis"
echo "  3. Check tag: prod-v1.0.0"
echo "  4. Merge to main if ready"
echo "  5. Begin production deployment (see WAVE5_PRODUCTION_DEPLOYMENT.md)"
echo ""
