create schema yunocontent;

grant usage on schema yunocontent to postgres, anon, authenticated, service_role, supabase_admin;
grant all privileges on all tables in schema yunocontent to postgres, anon, authenticated, service_role, supabase_admin;
alter default privileges in schema yunocontent grant all on tables to postgres, anon, authenticated, service_role, supabase_admin;
