-- Function to prevent multiple content items for single-type schemas

create or replace function yunocontent.prevent_duplicate_single_type_content()
returns trigger language plpgsql as $$
begin
  -- Check if the schema is of type 'single' and already has a non-deleted content item
  if exists (
    select 1 from yunocontent.schemas s
    join yunocontent.content_items ci on ci.schema_id = s.id
    where s.id = new.schema_id 
    and s.type = 'single'
    and ci.deleted_at is null
  ) then
    raise exception 'Cannot create multiple content items for single-type schema';
  end if;
  return new;
end;
$$;

-- Trigger to enforce the constraint on INSERT and UPDATE

create or replace trigger content_items_single_type_constraint
before insert or update on yunocontent.content_items for each row execute function yunocontent.prevent_duplicate_single_type_content();