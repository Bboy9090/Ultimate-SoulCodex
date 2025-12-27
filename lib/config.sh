#!/usr/bin/env bash
# Configuration management for git worktree tool

# Default configuration file location
DEFAULT_CONFIG_FILE="${HOME}/.gitworktreerc"

# Load configuration from file
load_config() {
    local config_file="${1:-$DEFAULT_CONFIG_FILE}"
    
    if [[ -f "$config_file" ]]; then
        # Source the config file
        source "$config_file"
    fi
}

# Get the configured worktree base directory
get_worktree_base_dir() {
    local config_file="${1:-$DEFAULT_CONFIG_FILE}"
    
    load_config "$config_file"
    
    # Return the configured WORKTREE_BASE_DIR or a default
    echo "${WORKTREE_BASE_DIR:-}"
}

# Set the worktree base directory in config
set_worktree_base_dir() {
    local base_dir="$1"
    local config_file="${2:-$DEFAULT_CONFIG_FILE}"
    
    if [[ -z "$base_dir" ]]; then
        echo "Error: base_dir is required" >&2
        return 1
    fi
    
    # Create or update the config file
    if [[ -f "$config_file" ]]; then
        # Update existing config
        if grep -q "^WORKTREE_BASE_DIR=" "$config_file"; then
            # Replace existing setting
            sed -i.bak "s|^WORKTREE_BASE_DIR=.*|WORKTREE_BASE_DIR=\"$base_dir\"|" "$config_file"
            rm -f "${config_file}.bak"
        else
            # Append new setting
            echo "WORKTREE_BASE_DIR=\"$base_dir\"" >> "$config_file"
        fi
    else
        # Create new config file
        cat > "$config_file" <<EOF
# Git worktree management configuration
WORKTREE_BASE_DIR="$base_dir"
EOF
    fi
    
    echo "Configuration updated: WORKTREE_BASE_DIR=$base_dir"
}

# Validate configuration
validate_config() {
    local config_file="${1:-$DEFAULT_CONFIG_FILE}"
    
    load_config "$config_file"
    
    if [[ -z "${WORKTREE_BASE_DIR:-}" ]]; then
        echo "Error: WORKTREE_BASE_DIR not configured" >&2
        echo "Run: git-worktree config set <directory>" >&2
        return 1
    fi
    
    return 0
}

# Export functions for use in other scripts
export -f load_config
export -f get_worktree_base_dir
export -f set_worktree_base_dir
export -f validate_config
