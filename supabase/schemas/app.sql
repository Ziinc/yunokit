

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "extensions";


ALTER SCHEMA "extensions" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "extensions"."grant_pg_cron_access"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION "extensions"."grant_pg_cron_access"() OWNER TO "postgres";


COMMENT ON FUNCTION "extensions"."grant_pg_cron_access"() IS 'Grants access to pg_cron';



CREATE OR REPLACE FUNCTION "extensions"."grant_pg_graphql_access"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION "extensions"."grant_pg_graphql_access"() OWNER TO "supabase_admin";


COMMENT ON FUNCTION "extensions"."grant_pg_graphql_access"() IS 'Grants access to pg_graphql';



CREATE OR REPLACE FUNCTION "extensions"."grant_pg_net_access"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


ALTER FUNCTION "extensions"."grant_pg_net_access"() OWNER TO "postgres";


COMMENT ON FUNCTION "extensions"."grant_pg_net_access"() IS 'Grants access to pg_net';



CREATE OR REPLACE FUNCTION "extensions"."pgrst_ddl_watch"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION "extensions"."pgrst_ddl_watch"() OWNER TO "supabase_admin";


CREATE OR REPLACE FUNCTION "extensions"."pgrst_drop_watch"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION "extensions"."pgrst_drop_watch"() OWNER TO "supabase_admin";


CREATE OR REPLACE FUNCTION "extensions"."set_graphql_placeholder"() RETURNS "event_trigger"
    LANGUAGE "plpgsql"
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION "extensions"."set_graphql_placeholder"() OWNER TO "supabase_admin";


COMMENT ON FUNCTION "extensions"."set_graphql_placeholder"() IS 'Reintroduces placeholder function for graphql_public.graphql';



CREATE OR REPLACE FUNCTION "public"."check_supabase_connection"() RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  connection_record record;
  api_response json;
  http_status integer;
begin
  -- Get the most recent connection for the current user
  select * from public.supabase_connections 
  where user_id = auth.uid() 
  order by created_at desc 
  limit 1 
  into connection_record;

  -- Check if we have a connection
  if connection_record is null then
    return json_build_object(
      'result', false,
      'error', 'No Supabase connection found'
    );
  end if;

  -- Check if token is expired
  if connection_record.expires_at < extract(epoch from now()) then
    return json_build_object(
      'result', false,
      'error', 'Token expired'
    );
  end if;

  return json_build_object(
      'result', true,
      'error', null
  );

exception when others then
  return json_build_object(
    'result', false,
    'error', SQLERRM
  );
end;
$$;


ALTER FUNCTION "public"."check_supabase_connection"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_token_needs_refresh"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  connection_record record;
  token_refresh_threshold numeric := 300000; -- 5 minutes in seconds
begin
  -- Get the most recent connection for the current user
  select * from public.supabase_connections 
  where user_id = auth.uid() 
  limit 1 
  into connection_record;

  -- If no connection, it doesn't need refreshing (there's nothing to refresh)
  if connection_record is null then
    return false;
  end if;

  -- Check if token is expired or about to expire (within 5 minutes)
  if connection_record.expires_at is null or 
     connection_record.expires_at > (extract(epoch from now()) - token_refresh_threshold) then
    return true;
  end if;

  -- Token is still valid and not close to expiration
  return false;

exception when others then
  -- On any error, return false as we can't determine if refresh is needed
  return false;
end;
$$;


ALTER FUNCTION "public"."check_token_needs_refresh"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_supabase_connection"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  -- Delete the supabase_connection record for the current authenticated user
  delete from public.supabase_connections 
  where user_id = auth.uid();
  
  -- The function will complete successfully even if no rows were deleted
  -- This prevents information leakage about whether a connection existed
end;
$$;


ALTER FUNCTION "public"."delete_supabase_connection"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sb_mgmt_api"("endpoint" "text", "method" "text" DEFAULT 'GET'::"text", "body" "json" DEFAULT NULL::"json", "base_url" "text" DEFAULT 'https://api.supabase.com/v1'::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
  connection_record record;
  api_response json;
  http_status integer;
  full_url text;
begin
  -- Ensure endpoint starts with /
  endpoint := case 
    when left(endpoint, 1) = '/' then endpoint 
    else '/' || endpoint 
  end;
  
  full_url := rtrim(base_url, '/') || endpoint;

  -- Get valid connection for the current user
  select * from public.supabase_connections 
  where user_id = auth.uid() 
    and expires_at >= extract(epoch from now())
  order by created_at desc 
  limit 1 
  into connection_record;

  -- Check if we have a valid connection
  if connection_record is null then
    raise exception 'No valid Supabase connection found';
  end if;

  -- Make request to Supabase Management API
  select 
    status,
    content::json
  from http((
    method,
    full_url,
    ARRAY[
      http_header('Authorization', 'Bearer ' || connection_record.access_token),
      http_header('Content-Type', 'application/json')
    ],
    case when body is not null then body::text else null end,
    null
  )::http_request)
  into http_status, api_response;

  -- Raise exception for non-2xx responses
  if http_status < 200 or http_status >= 300 then
    raise exception 'API request failed with status %: %', http_status, api_response;
  end if;

  return json_build_object('result', api_response);

exception when others then
  return json_build_object('error', SQLERRM);
end;$$;


ALTER FUNCTION "public"."sb_mgmt_api"("endpoint" "text", "method" "text", "body" "json", "base_url" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."supabase_connections" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "refresh_token" "text",
    "access_token" "text",
    "expires_at" numeric
);


ALTER TABLE "public"."supabase_connections" OWNER TO "postgres";


ALTER TABLE "public"."supabase_connections" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."supabase_connections_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_data" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "default_workspace_id" bigint,
    "code_verifier" "text",
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_data" OWNER TO "postgres";


ALTER TABLE "public"."user_data" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_data_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."workspace_users" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "workspace_id" bigint NOT NULL
);


ALTER TABLE "public"."workspace_users" OWNER TO "postgres";


ALTER TABLE "public"."workspace_users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."workspace_users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."workspaces" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "project_ref" "text",
    "api_key" "text"
);


ALTER TABLE "public"."workspaces" OWNER TO "postgres";


ALTER TABLE "public"."workspaces" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."workspaces_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."supabase_connections"
    ADD CONSTRAINT "connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supabase_connections"
    ADD CONSTRAINT "supabase_connections_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_data"
    ADD CONSTRAINT "user_data_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_data"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspace_users"
    ADD CONSTRAINT "workspace_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supabase_connections"
    ADD CONSTRAINT "connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_data"
    ADD CONSTRAINT "user_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_data"
    ADD CONSTRAINT "user_preferences_default_workspace_id_fkey" FOREIGN KEY ("default_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workspace_users"
    ADD CONSTRAINT "workspace_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_users"
    ADD CONSTRAINT "workspace_users_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Enable delete for users based on user_id" ON "public"."workspaces" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."workspaces" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_data" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user id" ON "public"."workspaces" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to update their own data only" ON "public"."user_data" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."user_data" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "select own and invited" ON "public"."workspaces" FOR SELECT TO "authenticated" USING ((("id" IN ( SELECT "wu"."id"
   FROM "public"."workspace_users" "wu"
  WHERE (("wu"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("wu"."id" = "wu"."id")))) OR (( SELECT "auth"."uid"() AS "uid") = "user_id")));



ALTER TABLE "public"."supabase_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspace_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspaces" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "extensions" TO "anon";
GRANT USAGE ON SCHEMA "extensions" TO "authenticated";
GRANT USAGE ON SCHEMA "extensions" TO "service_role";
GRANT ALL ON SCHEMA "extensions" TO "dashboard_user";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "extensions"."grant_pg_cron_access"() FROM "postgres";
GRANT ALL ON FUNCTION "extensions"."grant_pg_cron_access"() TO "postgres" WITH GRANT OPTION;
GRANT ALL ON FUNCTION "extensions"."grant_pg_cron_access"() TO "dashboard_user";



GRANT ALL ON FUNCTION "extensions"."grant_pg_graphql_access"() TO "postgres" WITH GRANT OPTION;



REVOKE ALL ON FUNCTION "extensions"."grant_pg_net_access"() FROM "postgres";
GRANT ALL ON FUNCTION "extensions"."grant_pg_net_access"() TO "postgres" WITH GRANT OPTION;
GRANT ALL ON FUNCTION "extensions"."grant_pg_net_access"() TO "dashboard_user";



GRANT ALL ON FUNCTION "extensions"."pgrst_ddl_watch"() TO "postgres" WITH GRANT OPTION;



GRANT ALL ON FUNCTION "extensions"."pgrst_drop_watch"() TO "postgres" WITH GRANT OPTION;



GRANT ALL ON FUNCTION "extensions"."set_graphql_placeholder"() TO "postgres" WITH GRANT OPTION;



GRANT ALL ON FUNCTION "public"."check_supabase_connection"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_supabase_connection"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_supabase_connection"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_token_needs_refresh"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_token_needs_refresh"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_token_needs_refresh"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_supabase_connection"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_supabase_connection"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_supabase_connection"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sb_mgmt_api"("endpoint" "text", "method" "text", "body" "json", "base_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."sb_mgmt_api"("endpoint" "text", "method" "text", "body" "json", "base_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sb_mgmt_api"("endpoint" "text", "method" "text", "body" "json", "base_url" "text") TO "service_role";



GRANT ALL ON TABLE "public"."supabase_connections" TO "anon";
GRANT ALL ON TABLE "public"."supabase_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."supabase_connections" TO "service_role";



GRANT ALL ON SEQUENCE "public"."supabase_connections_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."supabase_connections_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."supabase_connections_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_data" TO "anon";
GRANT ALL ON TABLE "public"."user_data" TO "authenticated";
GRANT ALL ON TABLE "public"."user_data" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_data_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_data_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_data_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_users" TO "anon";
GRANT ALL ON TABLE "public"."workspace_users" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."workspace_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."workspace_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."workspace_users_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."workspaces" TO "anon";
GRANT ALL ON TABLE "public"."workspaces" TO "authenticated";
GRANT ALL ON TABLE "public"."workspaces" TO "service_role";



GRANT ALL ON SEQUENCE "public"."workspaces_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."workspaces_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."workspaces_id_seq" TO "service_role";












ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
