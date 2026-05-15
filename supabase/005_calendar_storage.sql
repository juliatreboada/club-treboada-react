-- =============================================================================
-- Club Treboada - Storage bucket for calendar event images
-- =============================================================================
-- Run after calendar_events.sql. Creates public bucket `calendar-images` and
-- RLS on storage.objects so anyone can read; only admin/coach can write.

insert into storage.buckets (id, name, public)
values ('calendar-images', 'calendar-images', true)
on conflict (id) do update set public = excluded.public;

-- Policies on storage.objects
drop policy if exists "calendar_images_select_public" on storage.objects;
create policy "calendar_images_select_public"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'calendar-images');

drop policy if exists "calendar_images_insert_staff" on storage.objects;
create policy "calendar_images_insert_staff"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'calendar-images'
    and public.user_role() in ('admin', 'coach')
  );

drop policy if exists "calendar_images_update_staff" on storage.objects;
create policy "calendar_images_update_staff"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'calendar-images'
    and public.user_role() in ('admin', 'coach')
  )
  with check (
    bucket_id = 'calendar-images'
    and public.user_role() in ('admin', 'coach')
  );

drop policy if exists "calendar_images_delete_staff" on storage.objects;
create policy "calendar_images_delete_staff"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'calendar-images'
    and public.user_role() in ('admin', 'coach')
  );
