CREATE UNIQUE INDEX supabase_connections_user_id_key ON public.supabase_connections USING btree (user_id);

alter table "public"."supabase_connections" add constraint "supabase_connections_user_id_key" UNIQUE using index "supabase_connections_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_supabase_connection()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.sb_mgmt_api(endpoint text, method text DEFAULT 'GET'::text, body json DEFAULT NULL::json)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  connection_record record;
  api_response json;
  http_status integer;
  api_url text := 'https://api.supabase.com/v1';
begin
  -- Get the most recent connection for the current user
  select * from public.supabase_connections 
  where user_id = auth.uid() and expires_at < extract(epoch from now())
  order by created_at desc 
  limit 1 
  into connection_record;

  -- Check if we have a connection
  if connection_record is null then
    return json_build_object(
      'result', false,
      'error', 'No valid Supabase connection found'
    );
  end if;

  -- Make request to Supabase Management API
  select 
    status,
    content::json
  from http((
    method,
    api_url || endpoint,
    ARRAY[
      ('Authorization', 'Bearer ' || connection_record.access_token),
      ('Content-Type', 'application/json')
    ],
    case when body is not null then body::text else null end,
    null
  )::http_request)
  into http_status, api_response;

  -- Return response
  -- Raise exception for non-2xx responses
  if http_status < 200 or http_status >= 300 then
    raise exception 'API request failed with status %: %', http_status, api_response;
  end if;

  return json_build_object(
    'error', null,
    'result', api_response
  );


exception when others then
  return json_build_object(
    'result', false,
    'error', SQLERRM
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.sb_mgmt_api(endpoint text, method text DEFAULT 'GET'::text, body json DEFAULT NULL::json, base_url text DEFAULT 'https://api.supabase.com/v1'::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
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
      ('Authorization', 'Bearer ' || connection_record.access_token),
      ('Content-Type', 'application/json')
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
end;
$function$
;


