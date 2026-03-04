#!/usr/bin/env bash
# Core functionality for git worktree management

# Canonicalize a path by resolving symlinks and normalizing it
# This function handles both existing and non-existing paths
# For existing paths, it uses cd -P to resolve symlinks
# For non-existing paths, it normalizes the path components
canonicalize_path() {
    local path="$1"
    
    # Handle empty path
    if [[ -z "$path" ]]; then
        echo ""
        return 1
    fi
    
    # Convert to absolute path if relative
    if [[ "$path" != /* ]]; then
        path="$(pwd)/$path"
    fi
    
    # If path exists, use cd -P to resolve it
    if [[ -e "$path" ]]; then
        if [[ -d "$path" ]]; then
            (cd -P "$path" 2>/dev/null && pwd)
        else
            # For files, resolve the directory and append the filename
            local dir=$(dirname "$path")
            local file=$(basename "$path")
            local resolved_dir=$(cd -P "$dir" 2>/dev/null && pwd)
            if [[ -n "$resolved_dir" ]]; then
                echo "$resolved_dir/$file"
            else
                echo "$path"
            fi
        fi
    else
        # Path doesn't exist, manually normalize it
        # Remove redundant slashes and resolve . and .. components
        local normalized_path=""
        local IFS='/'
        local components=($path)
        local result_components=()
        
        for component in "${components[@]}"; do
            case "$component" in
                ""|".")
                    # Skip empty components and current directory references
                    continue
                    ;;
                "..")
                    # Go up one directory if possible
                    if [[ ${#result_components[@]} -gt 0 ]]; then
                        # Use array slicing for better portability
                        result_components=("${result_components[@]:0:$((${#result_components[@]}-1))}")
                    fi
                    ;;
                *)
                    # Add regular component
                    result_components+=("$component")
                    ;;
            esac
        done
        
        # Reconstruct the path
        normalized_path="/"
        for component in "${result_components[@]}"; do
            if [[ "$normalized_path" == "/" ]]; then
                normalized_path="/$component"
            else
                normalized_path="$normalized_path/$component"
            fi
        done
        
        echo "$normalized_path"
    fi
}

# Resolve and validate the base directory for worktrees
# This function ensures that the worktree directory is not inside the repository
# BUG FIX: Paths are canonicalized BEFORE pattern matching to handle .. notation correctly
resolve_base_dir() {
    local config_path="$1"
    local repo_path="$2"
    
    # Validate inputs
    if [[ -z "$config_path" ]]; then
        echo "Error: config_path is required" >&2
        return 1
    fi
    
    if [[ -z "$repo_path" ]]; then
        echo "Error: repo_path is required" >&2
        return 1
    fi
    
    # Canonicalize both paths BEFORE doing any comparison
    # This is the key fix: we normalize paths with .. notation first
    local canonical_config_path=$(canonicalize_path "$config_path")
    local canonical_repo_path=$(canonicalize_path "$repo_path")
    
    # Validate that canonicalization succeeded
    if [[ -z "$canonical_config_path" ]]; then
        echo "Error: failed to canonicalize config_path: $config_path" >&2
        return 1
    fi
    
    if [[ -z "$canonical_repo_path" ]]; then
        echo "Error: failed to canonicalize repo_path: $repo_path" >&2
        return 1
    fi
    
    # Now perform pattern matching on canonicalized paths
    # Check if the worktree path is inside the repository
    if [[ "$canonical_config_path" == "$canonical_repo_path"* ]]; then
        echo "Error: worktree directory cannot be inside the repository" >&2
        echo "  Repository: $canonical_repo_path" >&2
        echo "  Worktree dir: $canonical_config_path" >&2
        return 1
    fi
    
    # Return the canonicalized path
    echo "$canonical_config_path"
    return 0
}

# Get the repository root directory
get_repo_root() {
    git rev-parse --show-toplevel 2>/dev/null
}

# Export functions for use in other scripts
export -f canonicalize_path
export -f resolve_base_dir
export -f get_repo_root
