#!/bin/bash

cleanup_migrations() {
    rm -f supabase/migrations/*.sql 2>/dev/null || true
    rm -f supabase/functions/migrations/yuno*/*.sql 2>/dev/null || true
    rm -f supabase/functions/migrations/yuno*/index.txt 2>/dev/null || true
}

cleanup_migrations