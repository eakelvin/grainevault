-- Track whether an idea has a Free snapshot or Pro brief, plus Pro-only fields.

alter table public.ideas
  add column if not exists research_depth text not null default 'free'
    check (research_depth in ('free', 'pro'));

alter table public.ideas
  add column if not exists risks text[] not null default '{}'::text[];

alter table public.ideas
  add column if not exists customer_segments text[] not null default '{}'::text[];

alter table public.ideas
  add column if not exists why_now text not null default '';

-- Practical read of an idea: first revenue, capital in, difficulty, and demands.
-- Written by research with the service role. Older ideas stay empty until researched again.

alter table public.ideas
  add column if not exists idea_fit jsonb not null default '{}'::jsonb;
