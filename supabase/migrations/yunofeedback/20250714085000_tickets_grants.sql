GRANT USAGE ON SCHEMA yunofeedback TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA yunofeedback TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA yunofeedback TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA yunofeedback TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA yunofeedback GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA yunofeedback GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA yunofeedback GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
