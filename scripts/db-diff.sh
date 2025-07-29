#!/bin/bash

db_diff() {
    local schema="$1"
    local filename="$2"
    
    if [[ -z "$schema" || -z "$filename" ]]; then
        echo "Usage: db_diff <schema> <filename>"
        exit 1
    fi
    
    if [[ "$schema" == "app" ]]; then
        supabase db diff -f "$filename" -s public,extensions --local
    else
        supabase db diff -f "$filename" -s "$schema" --local
    fi
    
    latest_migration=$(ls -t supabase/migrations/*"$filename"*.sql 2>/dev/null | head -1)
    
    if [ -n "$latest_migration" ] && [ ! -f "supabase/migrations/$schema/$(basename "$latest_migration")" ]; then
        cp "$latest_migration" "supabase/migrations/$schema/"
    fi
}

db_diff "$@"