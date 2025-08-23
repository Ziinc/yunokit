alter table "yunocommunity"."comments" add column "content_data" jsonb;

alter table "yunocommunity"."posts" add column "content_data" jsonb;

alter table "yunocommunity"."comments" add constraint "comments_content_item_id_check" CHECK ((content_item_id IS NULL)) not valid;

alter table "yunocommunity"."comments" validate constraint "comments_content_item_id_check";

alter table "yunocommunity"."posts" add constraint "posts_content_item_id_check" CHECK ((content_item_id IS NULL)) not valid;

alter table "yunocommunity"."posts" validate constraint "posts_content_item_id_check";


