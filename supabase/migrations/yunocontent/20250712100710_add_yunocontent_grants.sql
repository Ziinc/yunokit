GRANT USAGE ON SCHEMA yunocontent TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA yunocontent TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA yunocontent TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA yunocontent TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA yunocontent GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA yunocontent GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA yunocontent GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;