-- =============================================================================
-- Club Treboada - Hero carousel slides
-- =============================================================================
-- Run in Supabase SQL editor after schema.sql (requires public.user_role()).
-- Idempotent where possible.

-- -----------------------------------------------------------------------------
-- Table
-- -----------------------------------------------------------------------------

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  slide_type text not null,
  -- For 'icons' slides: array of { src, alt } objects.
  icons_json jsonb,
  -- For 'image' slides:
  image_url text,
  alt_text text,
  link_url text,
  link_external boolean not null default false,
  -- active = visible on home carousel; disabled = hidden but kept in admin;
  -- deleted = soft-deleted (hidden from carousel, recoverable in admin).
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hero_slides_status_check
    check (status in ('active', 'disabled', 'deleted')),
  constraint hero_slides_type_check
    check (slide_type in ('icons', 'image')),
  constraint hero_slides_payload_check
    check (
      (slide_type = 'icons' and icons_json is not null)
      or (slide_type = 'image' and image_url is not null)
    )
);

create index if not exists hero_slides_sort_order_idx
  on public.hero_slides (sort_order);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------

create or replace function public.set_hero_slides_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists hero_slides_set_updated_at on public.hero_slides;
create trigger hero_slides_set_updated_at
  before update on public.hero_slides
  for each row execute function public.set_hero_slides_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.hero_slides enable row level security;

-- Public: only slides marked active appear on the home page.
drop policy if exists "hero_slides_select_public" on public.hero_slides;
drop policy if exists "hero_slides_select_anon_active" on public.hero_slides;
create policy "hero_slides_select_anon_active"
  on public.hero_slides
  for select
  to anon
  using (status = 'active');

-- Logged-in visitors see the same public carousel rows…
drop policy if exists "hero_slides_select_auth_active" on public.hero_slides;
create policy "hero_slides_select_auth_active"
  on public.hero_slides
  for select
  to authenticated
  using (status = 'active');

-- …while admin/coach can load every row for /admin/hero (OR with policy above).
drop policy if exists "hero_slides_select_staff_all" on public.hero_slides;
create policy "hero_slides_select_staff_all"
  on public.hero_slides
  for select
  to authenticated
  using (public.user_role() in ('admin', 'coach'));

drop policy if exists "hero_slides_insert_staff" on public.hero_slides;
create policy "hero_slides_insert_staff"
  on public.hero_slides
  for insert
  to authenticated
  with check (public.user_role() in ('admin', 'coach'));

drop policy if exists "hero_slides_update_staff" on public.hero_slides;
create policy "hero_slides_update_staff"
  on public.hero_slides
  for update
  to authenticated
  using (public.user_role() in ('admin', 'coach'))
  with check (public.user_role() in ('admin', 'coach'));

drop policy if exists "hero_slides_delete_staff" on public.hero_slides;
create policy "hero_slides_delete_staff"
  on public.hero_slides
  for delete
  to authenticated
  using (public.user_role() in ('admin', 'coach'));
