create table public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  meaning text not null,
  example_sentence text null,
  category text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_vocabulary_items_active
on public.vocabulary_items(is_active);

create index idx_vocabulary_items_word
on public.vocabulary_items(word);

create table public.game_scores (
  id uuid primary key default gen_random_uuid(),
  game_type text not null default 'memory',
  pairs_count integer not null check (pairs_count in (8, 16, 24)),
  duration_ms integer not null check (duration_ms > 0),
  display_name text not null,
  user_id uuid null,
  created_at timestamptz not null default now()
);

create index idx_game_scores_leaderboard
on public.game_scores(game_type, pairs_count, duration_ms, created_at);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
