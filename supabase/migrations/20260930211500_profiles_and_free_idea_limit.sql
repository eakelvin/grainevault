-- Profiles for plan/billing, plus a hard cap of 3 active ideas on the free plan.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free'
    check (plan in ('free', 'pro')),
  billing_interval text
    check (billing_interval is null or billing_interval in ('month', 'year')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

revoke all on table public.profiles from anon, public;
grant select on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

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

drop trigger if exists ideas_enforce_free_limit on public.ideas;
create trigger ideas_enforce_free_limit
  before insert on public.ideas
  for each row execute function public.enforce_free_idea_limit();
