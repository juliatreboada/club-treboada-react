-- =============================================================================
-- Club Treboada - Storage bucket for discipline group cover photos
-- =============================================================================
-- Run after discipline_groups.sql. Creates public bucket `discipline-images`
-- and RLS on storage.objects so anyone can read; only admin/coach can write.

insert into storage.buckets (id, name, public)
values ('discipline-images', 'discipline-images', true)
on conflict (id) do update set public = excluded.public;

-- Policies on storage.objects
drop policy if exists "discipline_images_select_public" on storage.objects;
create policy "discipline_images_select_public"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'discipline-images');

drop policy if exists "discipline_images_insert_staff" on storage.objects;
create policy "discipline_images_insert_staff"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'discipline-images'
    and public.user_role() in ('admin', 'coach')
  );

drop policy if exists "discipline_images_update_staff" on storage.objects;
create policy "discipline_images_update_staff"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'discipline-images'
    and public.user_role() in ('admin', 'coach')
  )
  with check (
    bucket_id = 'discipline-images'
    and public.user_role() in ('admin', 'coach')
  );

drop policy if exists "discipline_images_delete_staff" on storage.objects;
create policy "discipline_images_delete_staff"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'discipline-images'
    and public.user_role() in ('admin', 'coach')
  );
