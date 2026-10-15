-- Bound model spend. Usage and in-flight locks are writable only by the
-- service role. Authenticated clients cannot clear a lock or reset a counter.

create table if not exists public.model_jobs (
  idea_id uuid not null references public.ideas (id) on delete cascade,
  action text not null check (action in ('research', 'extract')),
  started_at timestamptz not null default now(),
  primary key (idea_id, action)
);

create table if not exists public.model_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  idea_id uuid not null references public.ideas (id) on delete cascade,
  action text not null check (action in ('research', 'extract')),
  created_at timestamptz not null default now()
);

create index if not exists model_usage_user_action_created_idx
  on public.model_usage (user_id, action, created_at desc);

alter table public.model_jobs enable row level security;
alter table public.model_usage enable row level security;

revoke all on table public.model_jobs from anon, authenticated, public;
revoke all on table public.model_usage from anon, authenticated, public;
grant all on table public.model_jobs to service_role;
grant all on table public.model_usage to service_role;

create or replace function public.claim_model_call(
  p_user_id uuid,
  p_idea_id uuid,
  p_action text,
  p_hour_limit integer,
  p_day_limit integer,
  p_idea_day_limit integer,
  p_concurrency integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  hour_count integer;
  day_count integer;
  idea_count integer;
  running integer;
  claimed uuid;
begin
  if p_action not in ('research', 'extract')
    or p_hour_limit < 1 or p_hour_limit > 60
    or p_day_limit < 1 or p_day_limit > 100
    or p_idea_day_limit < 1 or p_idea_day_limit > 20
    or p_concurrency < 1 or p_concurrency > 3
  then
    raise exception 'BAD_LIMIT' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.ideas
    where id = p_idea_id
      and user_id = p_user_id
  ) then
    raise exception 'IDEA_NOT_FOUND' using errcode = 'P0002';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_user_id::text), hashtext(p_action));

  select count(*) into hour_count
  from public.model_usage
  where user_id = p_user_id
    and action = p_action
    and created_at > now() - interval '1 hour';

  if hour_count >= p_hour_limit then
    raise exception 'RATE_LIMIT_HOUR' using errcode = 'P0001';
  end if;

  select count(*) into day_count
  from public.model_usage
  where user_id = p_user_id
    and action = p_action
    and created_at > now() - interval '1 day';

  if day_count >= p_day_limit then
    raise exception 'RATE_LIMIT_DAY' using errcode = 'P0001';
  end if;

  select count(*) into idea_count
  from public.model_usage
  where idea_id = p_idea_id
    and action = p_action
    and created_at > now() - interval '1 day';

  if idea_count >= p_idea_day_limit then
    raise exception 'RATE_LIMIT_IDEA' using errcode = 'P0001';
  end if;

  select count(*) into running
  from public.model_jobs as job
  join public.ideas as idea on idea.id = job.idea_id
  where idea.user_id = p_user_id
    and job.action = p_action
    and job.idea_id <> p_idea_id
    and job.started_at >= now() - interval '6 minutes';

  if running >= p_concurrency then
    raise exception 'BUSY' using errcode = 'P0003';
  end if;

  begin
    insert into public.model_jobs (idea_id, action, started_at)
    values (p_idea_id, p_action, now())
    on conflict (idea_id, action) do update
      set started_at = excluded.started_at
      where public.model_jobs.started_at < now() - interval '6 minutes'
    returning idea_id into strict claimed;
  exception
    when no_data_found then
      raise exception 'IN_FLIGHT' using errcode = 'P0003';
  end;

  insert into public.model_usage (user_id, idea_id, action)
  values (p_user_id, p_idea_id, p_action);
end;
$$;

create or replace function public.release_model_call(
  p_idea_id uuid,
  p_action text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_action not in ('research', 'extract') then
    raise exception 'BAD_ACTION' using errcode = '22023';
  end if;

  delete from public.model_jobs
  where idea_id = p_idea_id
    and action = p_action;
end;
$$;

revoke all on function public.claim_model_call(uuid, uuid, text, integer, integer, integer, integer)
  from public, anon, authenticated;
revoke all on function public.release_model_call(uuid, text)
  from public, anon, authenticated;
grant execute on function public.claim_model_call(uuid, uuid, text, integer, integer, integer, integer)
  to service_role;
grant execute on function public.release_model_call(uuid, text)
  to service_role;

update public.ideas
set title = left(title, 200)
where char_length(title) > 200;

update public.ideas
set description = left(description, 8000)
where char_length(description) > 8000;

update public.ideas
set extracted_text = left(extracted_text, 12000)
where char_length(extracted_text) > 12000;

alter table public.ideas
  drop constraint if exists ideas_title_len;
alter table public.ideas
  add constraint ideas_title_len check (char_length(title) <= 200);

alter table public.ideas
  drop constraint if exists ideas_description_len;
alter table public.ideas
  add constraint ideas_description_len check (char_length(description) <= 8000);

alter table public.ideas
  drop constraint if exists ideas_extracted_text_len;
alter table public.ideas
  add constraint ideas_extracted_text_len check (char_length(extracted_text) <= 12000);
