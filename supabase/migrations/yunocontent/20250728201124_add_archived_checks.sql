-- Add triggers to enforce archived schema rules

create or replace function yunocontent.prevent_archived_schema_update()
returns trigger language plpgsql as $$
begin
  if old.archived_at is not null then
    raise exception 'Archived schema cannot be modified';
  end if;
  return new;
end;
$$;

create trigger schemas_no_update_when_archived
before update on yunocontent.schemas
for each row execute function yunocontent.prevent_archived_schema_update();

create or replace function yunocontent.prevent_archived_schema_content()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from yunocontent.schemas s
    where s.id = new.schema_id and s.archived_at is not null
  ) then
    raise exception 'Cannot create content for archived schema';
  end if;
  return new;
end;
$$;

create trigger content_items_no_archived_schema
before insert on yunocontent.content_items
for each row execute function yunocontent.prevent_archived_schema_content();
