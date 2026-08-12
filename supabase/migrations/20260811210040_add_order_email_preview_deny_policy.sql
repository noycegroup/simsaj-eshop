create policy "No public access to order email notifications"
on public.order_email_notifications for select
to anon, authenticated
using (false);
