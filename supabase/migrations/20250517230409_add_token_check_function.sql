set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_token_needs_refresh()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;


