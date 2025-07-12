alter table "yunocontent"."content_items" add column "schema_id" bigint;

alter table "yunocontent"."schemas" add column "id" bigint not null;

CREATE UNIQUE INDEX schemas_pkey ON yunocontent.schemas USING btree (id);

alter table "yunocontent"."schemas" add constraint "schemas_pkey" PRIMARY KEY using index "schemas_pkey";

alter table "yunocontent"."content_items" add constraint "content_items_schema_id_fkey" FOREIGN KEY (schema_id) REFERENCES yunocontent.schemas(id) ON DELETE RESTRICT not valid;

alter table "yunocontent"."content_items" validate constraint "content_items_schema_id_fkey";


