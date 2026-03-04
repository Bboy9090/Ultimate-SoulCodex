# Git Worktree Management Tool

A bash-based tool for managing git worktrees with proper path validation and resolution.

## Overview

This tool provides a convenient interface for managing git worktrees while ensuring that worktree directories are not created inside the repository. It includes a critical bug fix that properly handles paths with parent directory notation (`..`).

## Bug Fix

### The Problem

The original bug occurred when using relative paths with `..` notation to configure worktree directories. Without proper canonicalization, bash pattern matching would evaluate path strings before they're normalized, causing paths like `../worktrees` to be incorrectly compared against the repository path.

For example:
- Repository path: `/home/user/repo`
- Configured path: `../worktrees` (from within the repo)
- Without fix: Pattern matching checks `/home/user/repo/../worktrees` against `/home/user/repo/*`
- Result: Incorrectly appears valid (false negative)

### The Solution

The fix ensures that all paths are **canonicalized** (normalized) **before** pattern matching is performed:

1. Convert relative paths to absolute paths
2. Resolve all symlinks using `cd -P`
3. Normalize path components (resolve `.` and `..`)
4. Only then perform pattern matching to check if the worktree path is inside the repository

With the fix:
- Repository path: `/home/user/repo` → `/home/user/repo`
- Configured path: `../worktrees` → `/home/user/worktrees`
- Pattern matching checks `/home/user/worktrees` against `/home/user/repo/*`
- Result: Correctly identified as separate directories

## Structure

```
.
├── git-worktree-manager.sh    # Main entry point
├── lib/
│   ├── core.sh                # Core functions (canonicalize_path, resolve_base_dir)
│   └── config.sh              # Configuration management
└── test-path-resolution.sh    # Test script demonstrating the bug fix
```

## Usage

### Configure Worktree Base Directory

```bash
# Set the base directory where worktrees will be created
./git-worktree-manager.sh config set ../worktrees

# Get the configured base directory
./git-worktree-manager.sh config get
```

### Validate a Path

```bash
# Validate that a path is suitable for worktrees (not inside the repository)
./git-worktree-manager.sh validate ../worktrees
./git-worktree-manager.sh validate /tmp/worktrees
```

### Manage Worktrees

```bash
# List existing worktrees
./git-worktree-manager.sh list

# Add a new worktree (placeholder - would call 'git worktree add')
./git-worktree-manager.sh add feature-branch

# Remove a worktree (placeholder - would call 'git worktree remove')
./git-worktree-manager.sh remove feature-branch
```

### Get Help

```bash
./git-worktree-manager.sh help
```

## Testing

Run the test script to see demonstrations of the bug fix:

```bash
./test-path-resolution.sh
```

This will run several test cases showing:
1. Path with `..` notation that resolves outside the repository (valid)
2. Absolute path outside repository (valid)
3. Path inside repository (invalid - correctly rejected)
4. Complex path manipulation with `..` (correctly handles tricky cases)
5. Detailed explanation of the bug and fix

## Key Functions

### `canonicalize_path(path)`

Normalizes a path by:
- Converting relative paths to absolute paths
- Resolving symlinks (for existing paths)
- Normalizing path components (removing `.` and `..`)

### `resolve_base_dir(config_path, repo_path)`

Validates that a configured worktree directory is not inside the repository:
1. Canonicalizes both paths
2. Performs pattern matching on canonicalized paths
3. Returns the canonicalized path if valid, or error if inside repository

## Configuration File

Configuration is stored in `~/.gitworktreerc`:

```bash
# Git worktree management configuration
WORKTREE_BASE_DIR="/path/to/worktrees"
```

## Requirements

- Bash 4.0 or later
- Git (for repository operations)
- Standard Unix tools (cd, pwd, dirname, basename)

## Implementation Details

The core innovation is in `lib/core.sh`, where `resolve_base_dir()` calls `canonicalize_path()` on both the configured path and repository path **before** performing any pattern matching:

```bash
# Canonicalize both paths BEFORE doing any comparison
# This is the key fix: we normalize paths with .. notation first
local canonical_config_path=$(canonicalize_path "$config_path")
local canonical_repo_path=$(canonicalize_path "$repo_path")

# Now perform pattern matching on canonicalized paths
if [[ "$canonical_config_path" == "$canonical_repo_path"* ]]; then
    echo "Error: worktree directory cannot be inside the repository" >&2
    return 1
fi
```

This ensures that paths are always compared in their fully resolved form, preventing the bug where `..` notation could lead to incorrect validation results.
