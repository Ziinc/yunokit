#!/bin/bash

check_version() {
    echo 'Checking if version has been bumped for migration changes...'
    
    if ! git rev-parse --verify main >/dev/null 2>&1; then
        echo 'Warning: main branch not found, skipping version check'
        exit 0
    fi
    
    migration_changes=$(git diff --name-only main...HEAD | grep -E '^supabase/migrations/(app|yunocontent)/.*\.sql$' || true)
    
    if [ -n "$migration_changes" ]; then
        echo 'Migration files changed:'
        echo "$migration_changes"
        
        current_version=$(node -p "require('./app/package.json').version")
        main_version=$(git show main:app/package.json | node -p "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).version" 2>/dev/null || echo "unknown")
        
        if [ "$current_version" = "$main_version" ]; then
            echo "ERROR: Migration files have been modified but version has not been bumped."
            echo "Current version: $current_version"
            echo "Please update the version in app/package.json"
            exit 1
        else
            echo "Version check passed: $main_version -> $current_version"
        fi
    else
        echo 'No migration files changed, version check not required'
    fi
}

check_version