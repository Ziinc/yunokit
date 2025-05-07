alter table "public"."user_data" add column "user_id" uuid not null;

CREATE UNIQUE INDEX user_data_user_id_key ON public.user_data USING btree (user_id);

alter table "public"."user_data" add constraint "user_data_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_data" validate constraint "user_data_user_id_fkey";

alter table "public"."user_data" add constraint "user_data_user_id_key" UNIQUE using index "user_data_user_id_key";

create policy "Enable insert for users based on user_id"
on "public"."user_data"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to update their own data only"
on "public"."user_data"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."user_data"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



