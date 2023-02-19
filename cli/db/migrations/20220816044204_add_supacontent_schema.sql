create schema supacontent;

grant usage on schema supacontent to postgres, anon, authenticated, service_role, supabase_admin;
grant all privileges on all tables in schema supacontent to postgres, anon, authenticated, service_role, supabase_admin;
alter default privileges in schema supacontent grant all on tables to postgres, anon, authenticated, service_role, supabase_admin;
