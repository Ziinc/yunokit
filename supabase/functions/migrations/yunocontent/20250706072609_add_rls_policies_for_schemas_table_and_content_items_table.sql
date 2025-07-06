create policy "Allow all for service role"
on "yunocontent"."content_items"
as permissive
for all
to service_role
using (true);


create policy "Allow all for service_role"
on "yunocontent"."schemas"
as permissive
for all
to service_role
using (true);



