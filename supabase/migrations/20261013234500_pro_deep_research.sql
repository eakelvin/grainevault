-- Extra Pro brief fields: questions, areas, opportunities, assumptions, sources.
-- Astra investigation state and per-question findings for Pro research.

alter table public.ideas
  add column if not exists research_questions text[] not null default '{}'::text[];

alter table public.ideas
  add column if not exists research_areas text[] not null default '{}'::text[];

alter table public.ideas
  add column if not exists opportunities text[] not null default '{}'::text[];

alter table public.ideas
  add column if not exists assumptions text[] not null default '{}'::text[];

alter table public.ideas
  add column if not exists sources jsonb not null default '[]'::jsonb;


alter table public.ideas
  add column if not exists investigation_status text not null default 'none'
    check (investigation_status in ('none', 'investigating', 'complete', 'failed'));

alter table public.ideas
  add column if not exists question_findings jsonb not null default '[]'::jsonb;
