set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_supabase_connection()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- Delete the supabase_connection record for the current authenticated user
  delete from public.supabase_connections 
  where user_id = auth.uid();
  
  -- The function will complete successfully even if no rows were deleted
  -- This prevents information leakage about whether a connection existed
end;
$function$
;


