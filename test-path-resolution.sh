#!/usr/bin/env bash
# Test script to demonstrate the bug fix for path resolution with .. notation

# Note: We don't use 'set -e' because we expect some tests to fail intentionally

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the core library
source "${SCRIPT_DIR}/lib/core.sh"

echo "================================================"
echo "Testing Git Worktree Path Resolution Bug Fix"
echo "================================================"
echo ""

# Get the repository root
REPO_ROOT=$(get_repo_root)
if [[ -z "$REPO_ROOT" ]]; then
    echo "Error: not in a git repository" >&2
    exit 1
fi

echo "Repository root: $REPO_ROOT"
echo ""

# Test Case 1: Path with .. notation that resolves outside the repository
echo "Test Case 1: Path with .. notation (should be valid)"
echo "-----------------------------------------------"
TEST_PATH_1="../worktrees"
echo "Input path: $TEST_PATH_1"

RESOLVED_1=$(resolve_base_dir "$TEST_PATH_1" "$REPO_ROOT")
if [[ $? -eq 0 ]]; then
    echo "✓ PASS: Path resolved successfully"
    echo "  Resolved to: $RESOLVED_1"
else
    echo "✗ FAIL: Path resolution failed (expected to succeed)"
fi
echo ""

# Test Case 2: Path without .. that is outside the repository
echo "Test Case 2: Absolute path outside repository (should be valid)"
echo "---------------------------------------------------------------"
TEST_PATH_2="/tmp/worktrees"
echo "Input path: $TEST_PATH_2"

RESOLVED_2=$(resolve_base_dir "$TEST_PATH_2" "$REPO_ROOT")
if [[ $? -eq 0 ]]; then
    echo "✓ PASS: Path resolved successfully"
    echo "  Resolved to: $RESOLVED_2"
else
    echo "✗ FAIL: Path resolution failed (expected to succeed)"
fi
echo ""

# Test Case 3: Path that is inside the repository (should fail)
echo "Test Case 3: Path inside repository (should be invalid)"
echo "-------------------------------------------------------"
TEST_PATH_3="$REPO_ROOT/worktrees"
echo "Input path: $TEST_PATH_3"

RESOLVED_3=$(resolve_base_dir "$TEST_PATH_3" "$REPO_ROOT" 2>&1)
if [[ $? -ne 0 ]]; then
    echo "✓ PASS: Path correctly rejected as invalid"
else
    echo "✗ FAIL: Path should have been rejected"
fi
echo ""

# Test Case 4: Complex path with .. that would be inside without canonicalization
echo "Test Case 4: Complex .. path manipulation"
echo "------------------------------------------"
# Create a path like /path/to/repo/../repo/worktrees which would be inside
# the repo if not canonicalized
TEST_PATH_4="$REPO_ROOT/../$(basename $REPO_ROOT)/worktrees"
echo "Input path: $TEST_PATH_4"
echo "  (This path uses .. but ultimately points inside the repository)"

RESOLVED_4=$(resolve_base_dir "$TEST_PATH_4" "$REPO_ROOT" 2>&1)
if [[ $? -ne 0 ]]; then
    echo "✓ PASS: Path correctly rejected as invalid"
else
    echo "✗ FAIL: Path should have been rejected"
fi
echo ""

# Test Case 5: Demonstrate the bug scenario
echo "Test Case 5: Demonstrating the fixed bug scenario"
echo "--------------------------------------------------"
echo "The bug occurred when using '../worktrees' from within the repository."
echo "Without canonicalization, pattern matching would check:"
echo "  'repo/../worktrees' against 'repo/*'"
echo "This would incorrectly fail to match (appearing valid)."
echo ""
echo "With canonicalization (the fix), we first resolve paths:"
echo "  'repo/../worktrees' -> '/parent/worktrees'"
echo "  'repo' -> '/parent/repo'"
echo "Then check: '/parent/worktrees' against '/parent/repo/*'"
echo "This correctly identifies they are separate (truly valid)."
echo ""

# Demonstrate canonicalize_path function
echo "Canonicalization Examples:"
echo "-------------------------"
echo "Original: ../worktrees"
echo "Canonicalized: $(canonicalize_path '../worktrees')"
echo ""
echo "Original: ./lib/../core.sh"
echo "Canonicalized: $(canonicalize_path './lib/../core.sh')"
echo ""
echo "Original: /tmp/../tmp/test"
echo "Canonicalized: $(canonicalize_path '/tmp/../tmp/test')"
echo ""

echo "================================================"
echo "All tests completed!"
echo "================================================"
echo ""
echo "Summary:"
echo "--------"
echo "The bug fix ensures that paths containing '..' notation are"
echo "canonicalized (normalized) BEFORE pattern matching is performed."
echo "This prevents incorrect identification of worktree directories"
echo "as being inside or outside the repository."
echo ""
echo "Key implementation detail in lib/core.sh:"
echo "  resolve_base_dir() calls canonicalize_path() on both the"
echo "  configured path and repository path BEFORE comparing them."
