drop policy "Allow all for service_role" on "yunocontent"."schemas";

alter table "yunocontent"."content_items" add column "schema_id" bigint;

alter table "yunocontent"."schemas" add column "description" text;

alter table "yunocontent"."schemas" add column "name" text;

alter table "yunocontent"."schemas" alter column "id" drop default;

alter table "yunocontent"."schemas" alter column "id" add generated always as identity;

alter table "yunocontent"."schemas" alter column "id" set data type bigint using "id"::bigint;

alter table "yunocontent"."schemas" disable row level security;

alter table "yunocontent"."content_items" add constraint "content_items_schema_id_fkey" FOREIGN KEY (schema_id) REFERENCES yunocontent.schemas(id) ON DELETE RESTRICT not valid;

alter table "yunocontent"."content_items" validate constraint "content_items_schema_id_fkey";


