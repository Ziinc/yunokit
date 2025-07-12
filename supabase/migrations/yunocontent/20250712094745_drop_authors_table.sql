revoke delete on table "yunocontent"."authors" from "anon";

revoke insert on table "yunocontent"."authors" from "anon";

revoke references on table "yunocontent"."authors" from "anon";

revoke select on table "yunocontent"."authors" from "anon";

revoke trigger on table "yunocontent"."authors" from "anon";

revoke truncate on table "yunocontent"."authors" from "anon";

revoke update on table "yunocontent"."authors" from "anon";

revoke delete on table "yunocontent"."authors" from "authenticated";

revoke insert on table "yunocontent"."authors" from "authenticated";

revoke references on table "yunocontent"."authors" from "authenticated";

revoke select on table "yunocontent"."authors" from "authenticated";

revoke trigger on table "yunocontent"."authors" from "authenticated";

revoke truncate on table "yunocontent"."authors" from "authenticated";

revoke update on table "yunocontent"."authors" from "authenticated";

revoke delete on table "yunocontent"."authors" from "service_role";

revoke insert on table "yunocontent"."authors" from "service_role";

revoke references on table "yunocontent"."authors" from "service_role";

revoke select on table "yunocontent"."authors" from "service_role";

revoke trigger on table "yunocontent"."authors" from "service_role";

revoke truncate on table "yunocontent"."authors" from "service_role";

revoke update on table "yunocontent"."authors" from "service_role";

alter table "yunocontent"."authors" drop constraint "authors_user_id_fkey";

alter table "yunocontent"."content_items_authors" drop constraint "content_authors_author_id_fkey";

alter table "yunocontent"."authors" drop constraint "authors_pkey";

drop index if exists "yunocontent"."authors_pkey";

drop table "yunocontent"."authors";

alter table "yunocontent"."content_items_authors" drop column "author_id";

alter table "yunocontent"."content_items_authors" drop column "content_id";


