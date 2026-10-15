-- Signed-in users can capture and archive their own ideas. Research fields
-- and extracted text are written by the server with the service role.

revoke insert, update on table public.ideas from authenticated;

grant insert (
  user_id,
  title,
  description,
  short_description,
  input_type
) on table public.ideas to authenticated;

grant update (media_path, archived_at) on table public.ideas to authenticated;
