#!/usr/bin/env bash
# Git worktree management tool
# This tool helps manage git worktrees with proper path resolution

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the library modules
source "${SCRIPT_DIR}/lib/core.sh"
source "${SCRIPT_DIR}/lib/config.sh"

# Print usage information
print_usage() {
    cat <<EOF
Git Worktree Management Tool

Usage:
    $0 config get                    - Get the configured worktree base directory
    $0 config set <directory>        - Set the worktree base directory
    $0 add <branch-name>             - Add a new worktree for the branch
    $0 list                          - List all worktrees
    $0 remove <branch-name>          - Remove a worktree
    $0 validate <path>               - Validate a worktree path (for testing)

Description:
    This tool manages git worktrees and ensures that worktree directories
    are not created inside the repository. It properly handles paths with
    parent directory notation (..) by canonicalizing paths before validation.

Examples:
    # Configure the worktree base directory
    $0 config set ../worktrees
    
    # Add a new worktree
    $0 add feature-branch
    
    # List all worktrees
    $0 list

EOF
}

# Command: config get
cmd_config_get() {
    local base_dir=$(get_worktree_base_dir)
    if [[ -n "$base_dir" ]]; then
        echo "WORKTREE_BASE_DIR=$base_dir"
    else
        echo "WORKTREE_BASE_DIR is not configured"
        return 1
    fi
}

# Command: config set
cmd_config_set() {
    local base_dir="$1"
    
    if [[ -z "$base_dir" ]]; then
        echo "Error: directory path is required" >&2
        print_usage
        return 1
    fi
    
    # Get the repository root
    local repo_root=$(get_repo_root)
    if [[ -z "$repo_root" ]]; then
        echo "Error: not in a git repository" >&2
        return 1
    fi
    
    # Validate that the base directory is not inside the repository
    local resolved_dir=$(resolve_base_dir "$base_dir" "$repo_root")
    if [[ $? -ne 0 ]]; then
        return 1
    fi
    
    # Save the configuration
    set_worktree_base_dir "$resolved_dir"
}

# Command: add
cmd_add() {
    local branch_name="$1"
    
    if [[ -z "$branch_name" ]]; then
        echo "Error: branch name is required" >&2
        print_usage
        return 1
    fi
    
    # Validate configuration
    if ! validate_config; then
        return 1
    fi
    
    # Get the worktree base directory
    local base_dir=$(get_worktree_base_dir)
    local worktree_path="$base_dir/$branch_name"
    
    echo "Creating worktree at: $worktree_path"
    echo "For branch: $branch_name"
    
    # Create the worktree (this is a placeholder - real implementation would call git worktree add)
    # git worktree add "$worktree_path" "$branch_name"
    echo "Note: This is a demonstration. In a real implementation, 'git worktree add' would be called here."
}

# Command: list
cmd_list() {
    echo "Listing worktrees:"
    git worktree list 2>/dev/null || echo "No worktrees found or not in a git repository"
}

# Command: remove
cmd_remove() {
    local branch_name="$1"
    
    if [[ -z "$branch_name" ]]; then
        echo "Error: branch name is required" >&2
        print_usage
        return 1
    fi
    
    # Validate configuration
    if ! validate_config; then
        return 1
    fi
    
    # Get the worktree base directory
    local base_dir=$(get_worktree_base_dir)
    local worktree_path="$base_dir/$branch_name"
    
    echo "Removing worktree at: $worktree_path"
    
    # Remove the worktree (this is a placeholder)
    # git worktree remove "$worktree_path"
    echo "Note: This is a demonstration. In a real implementation, 'git worktree remove' would be called here."
}

# Command: validate (for testing the path resolution)
cmd_validate() {
    local path="$1"
    
    if [[ -z "$path" ]]; then
        echo "Error: path is required" >&2
        print_usage
        return 1
    fi
    
    # Get the repository root
    local repo_root=$(get_repo_root)
    if [[ -z "$repo_root" ]]; then
        echo "Error: not in a git repository" >&2
        return 1
    fi
    
    echo "Validating path: $path"
    echo "Repository root: $repo_root"
    echo ""
    
    # Test the resolve_base_dir function
    if resolve_base_dir "$path" "$repo_root" > /dev/null 2>&1; then
        local resolved_dir=$(resolve_base_dir "$path" "$repo_root")
        echo "✓ Path is valid"
        echo "  Resolved to: $resolved_dir"
        return 0
    else
        echo "✗ Path is invalid"
        return 1
    fi
}

# Main command dispatcher
main() {
    if [[ $# -eq 0 ]]; then
        print_usage
        return 0
    fi
    
    local command="$1"
    shift
    
    case "$command" in
        config)
            local subcommand="${1:-}"
            shift || true
            case "$subcommand" in
                get)
                    cmd_config_get
                    ;;
                set)
                    cmd_config_set "$@"
                    ;;
                *)
                    echo "Error: unknown config subcommand: $subcommand" >&2
                    print_usage
                    return 1
                    ;;
            esac
            ;;
        add)
            cmd_add "$@"
            ;;
        list)
            cmd_list "$@"
            ;;
        remove)
            cmd_remove "$@"
            ;;
        validate)
            cmd_validate "$@"
            ;;
        help|--help|-h)
            print_usage
            ;;
        *)
            echo "Error: unknown command: $command" >&2
            print_usage
            return 1
            ;;
    esac
}

# Run the main function
main "$@"
