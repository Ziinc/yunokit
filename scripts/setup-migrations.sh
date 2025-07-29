#!/bin/bash

setup_migrations() {
    local schemas=("$@")
    
    # Copy migration files from schema directories to main migrations
    for schema in "${schemas[@]}"; do
        cp -f "supabase/migrations/${schema}/"*.sql supabase/migrations/ 2>/dev/null || true
    done

    # Setup function migrations for schemas (skip 'app' schema)
    for schema in "${schemas[@]}"; do
        if [[ "$schema" != "app" ]]; then
            mkdir -p "supabase/functions/migrations/${schema}"
            cp -f "supabase/migrations/${schema}/"*.sql "supabase/functions/migrations/${schema}/" 2>/dev/null || true
            ls "supabase/migrations/${schema}/"*.sql 2>/dev/null | xargs -n1 basename | sort > "supabase/functions/migrations/${schema}/index.txt" 2>/dev/null || true
        fi
    done
}

setup_migrations "$@"