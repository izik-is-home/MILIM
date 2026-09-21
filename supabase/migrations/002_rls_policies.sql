-- Enable Row Level Security
alter table public.vocabulary_items enable row level security;
alter table public.game_scores enable row level security;
alter table public.admin_users enable row level security;

-- vocabulary_items policies
create policy "Anyone can read active vocabulary items"
on public.vocabulary_items for select
using (is_active = true);

create policy "Admins can read all vocabulary items"
on public.vocabulary_items for select
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can insert vocabulary items"
on public.vocabulary_items for insert
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can update vocabulary items"
on public.vocabulary_items for update
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can delete vocabulary items"
on public.vocabulary_items for delete
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

-- game_scores policies
create policy "Anyone can read game scores"
on public.game_scores for select
using (true);

-- No direct insert policy for game_scores for anonymous users. 
-- Inserts should go through the secure RPC function.
-- (If you want to allow direct inserts for MVP, uncomment the next block)
/*
create policy "Anyone can insert game scores"
on public.game_scores for insert
with check (true);
*/

-- admin_users policies
create policy "Admins can read admin list"
on public.admin_users for select
using (exists (select 1 from public.admin_users where user_id = auth.uid()));
