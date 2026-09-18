-- Private audio, image, and PDF uploads for captured ideas.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'idea-media',
  'idea-media',
  false,
  6291456,
  array[
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "idea_media_select_own" on storage.objects;
create policy "idea_media_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'idea-media'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "idea_media_insert_own" on storage.objects;
create policy "idea_media_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'idea-media'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "idea_media_update_own" on storage.objects;
create policy "idea_media_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'idea-media'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'idea-media'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "idea_media_delete_own" on storage.objects;
create policy "idea_media_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'idea-media'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
