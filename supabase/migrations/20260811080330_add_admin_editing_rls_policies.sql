create policy product_manual_overrides_service_role_policy
on public.product_manual_overrides
for all
to service_role
using (true)
with check (true);

create policy admin_audit_log_service_role_select_policy
on public.admin_audit_log
for select
to service_role
using (true);

create policy admin_audit_log_service_role_insert_policy
on public.admin_audit_log
for insert
to service_role
with check (true);
