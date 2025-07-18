alter table "yunocontent"."content_items" add column "archived_at" timestamp with time zone;

create or replace view "yunocontent"."content_items_vw" as  SELECT 
    content_items.*,
        CASE
            WHEN (content_items.deleted_at IS NOT NULL) THEN 'deleted'::text
            WHEN (content_items.archived_at IS NOT NULL) THEN 'archived'::text
            WHEN (content_items.published_at IS NOT NULL) THEN 'published'::text
            ELSE 'draft'::text
        END AS status
   FROM yunocontent.content_items;