alter table "supacontent"."schemas" add column "type" text not null;

alter table "supacontent"."schemas" add constraint "schemas_type_check" CHECK ((type = ANY (ARRAY['single'::text, 'collection'::text]))) not valid;

alter table "supacontent"."schemas" validate constraint "schemas_type_check";


