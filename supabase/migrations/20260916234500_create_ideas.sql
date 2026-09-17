-- Ideas captured from the vault (text first; voice/image later).

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  short_description text not null default '',
  tags text[] not null default '{}'::text[],
  status text not null default 'analyzing'
    check (status in ('ready', 'analyzing')),
  input_type text not null
    check (input_type in ('text', 'voice', 'image')),
  readiness_score integer not null default 0,
  market_size text not null default '—',
  target_audience text not null default '—',
  top_competitor jsonb not null default '{"name":"—","strength":"—"}'::jsonb,
  key_trend text not null default '—',
  competitors jsonb not null default '[]'::jsonb,
  growth_metrics jsonb not null default '[]'::jsonb,
  action_plan text[] not null default '{}'::text[],
  media_path text,
  created_at timestamptz not null default now()
);

create index if not exists ideas_user_id_created_at_idx
  on public.ideas (user_id, created_at desc);

alter table public.ideas enable row level security;

drop policy if exists "ideas_select_own" on public.ideas;
create policy "ideas_select_own"
  on public.ideas
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "ideas_insert_own" on public.ideas;
create policy "ideas_insert_own"
  on public.ideas
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "ideas_update_own" on public.ideas;
create policy "ideas_update_own"
  on public.ideas
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "ideas_delete_own" on public.ideas;
create policy "ideas_delete_own"
  on public.ideas
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.ideas from anon, public;
grant select, insert, update, delete on table public.ideas to authenticated;
grant all on table public.ideas to service_role;
