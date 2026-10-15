-- Serialize free-plan inserts per user so two captures at once cannot both
-- pass the count and create a fourth idea.

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

  -- Held until this insert commits, so the next insert counts this row.
  perform pg_advisory_xact_lock(
    hashtext('graine-vault.free-idea-limit'),
    hashtext(new.user_id::text)
  );

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

revoke all on function public.enforce_free_idea_limit() from public, anon, authenticated;
