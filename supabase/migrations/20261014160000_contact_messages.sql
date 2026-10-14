-- Contact form messages. Anyone can submit. Only the service role can read them.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint contact_messages_name_len check (char_length(name) between 1 and 120),
  constraint contact_messages_email_len check (char_length(email) between 3 and 320),
  constraint contact_messages_email_format check (
    email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint contact_messages_message_len check (char_length(message) between 10 and 4000)
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_insert" on public.contact_messages;
create policy "contact_messages_insert"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (
    (
      user_id is null
      or (select auth.uid()) = user_id
    )
    and char_length(name) between 1 and 120
    and char_length(email) between 3 and 320
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and char_length(message) between 10 and 4000
  );

revoke all on table public.contact_messages from anon, authenticated, public;
grant insert on table public.contact_messages to anon, authenticated;
grant all on table public.contact_messages to service_role;
