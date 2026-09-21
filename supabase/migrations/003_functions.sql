create or replace function public.submit_game_score(
  p_game_type text,
  p_pairs_count integer,
  p_duration_ms integer,
  p_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_display_name text;
begin
  v_display_name := regexp_replace(trim(p_display_name), '\s+', ' ', 'g');

  if p_game_type not in ('memory') then
    raise exception 'invalid game type';
  end if;

  if p_pairs_count not in (8, 16, 24) then
    raise exception 'invalid pairs count';
  end if;

  if p_duration_ms <= 0 then
    raise exception 'invalid duration';
  end if;

  if length(v_display_name) < 2 or length(v_display_name) > 30 then
    raise exception 'invalid display name length';
  end if;

  if v_display_name like '%<%' or v_display_name like '%>%' then
    raise exception 'invalid display name';
  end if;

  insert into public.game_scores (
    game_type,
    pairs_count,
    duration_ms,
    display_name,
    user_id
  )
  values (
    p_game_type,
    p_pairs_count,
    p_duration_ms,
    v_display_name,
    auth.uid()
  )
  returning id into v_id;

  return v_id;
end;
$$;
