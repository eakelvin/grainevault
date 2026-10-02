-- Soft-archive ideas so free-plan slots stay consumed after leaving the vault.

alter table public.ideas
  add column if not exists archived_at timestamptz;

create index if not exists ideas_user_id_archived_at_idx
  on public.ideas (user_id, archived_at);

-- Free limit already counts every row for the user; keep that behavior explicit.
create or replace function public.enforce_free_idea_limit()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  idea_count integer;
  user_plan text;
begin
  if (select auth.uid()) is distinct from new.user_id then
    raise exception 'Cannot capture an idea for another user.';
  end if;

  select p.plan into user_plan
  from public.profiles p
  where p.id = new.user_id;

  if coalesce(user_plan, 'free') = 'pro' then
    return new;
  end if;

  -- Active + archived ideas both count toward the free quota.
  select count(*) into idea_count
  from public.ideas
  where user_id = new.user_id;

  if idea_count >= 3 then
    raise exception 'FREE_IDEA_LIMIT'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;
