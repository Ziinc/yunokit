alter table "yunocontent"."schemas" drop constraint "schemas_pkey";

drop index if exists "yunocontent"."schemas_pkey";

alter table "yunocontent"."schemas" drop column "id";


