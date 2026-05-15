-- =============================================================================
-- Club Treboada - hero_slides: status (active / disabled / deleted)
-- =============================================================================
-- Run once in Supabase SQL editor if you already created `hero_slides`
-- before the `status` column existed.

alter table public.hero_slides
  add column if not exists status text;

update public.hero_slides
set status = 'active'
where status is null;

alter table public.hero_slides
  alter column status set default 'active';

alter table public.hero_slides
  alter column status set not null;

alter table public.hero_slides
  drop constraint if exists hero_slides_status_check;

alter table public.hero_slides
  add constraint hero_slides_status_check
    check (status in ('active', 'disabled', 'deleted'));

-- Replace permissive SELECT with public vs staff policies.
drop policy if exists "hero_slides_select_public" on public.hero_slides;
drop policy if exists "hero_slides_select_anon_active" on public.hero_slides;
drop policy if exists "hero_slides_select_auth_active" on public.hero_slides;
drop policy if exists "hero_slides_select_staff_all" on public.hero_slides;

create policy "hero_slides_select_anon_active"
  on public.hero_slides
  for select
  to anon
  using (status = 'active');

create policy "hero_slides_select_auth_active"
  on public.hero_slides
  for select
  to authenticated
  using (status = 'active');

create policy "hero_slides_select_staff_all"
  on public.hero_slides
  for select
  to authenticated
  using (public.user_role() in ('admin', 'coach'));
