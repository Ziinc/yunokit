GRANT USAGE ON SCHEMA yunocommunity TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA yunocommunity TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA yunocommunity TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA yunocommunity TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA yunocommunity GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA yunocommunity GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA yunocommunity GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;