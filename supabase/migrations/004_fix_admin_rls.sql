-- Drop the broken circular policy and replace it with a simple one
-- that allows each user to check their own row.
drop policy if exists "Admins can read admin list" on public.admin_users;

create policy "Users can check their own admin status"
on public.admin_users for select
using (user_id = auth.uid());
