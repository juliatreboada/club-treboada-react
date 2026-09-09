-- =============================================================================
-- Club Treboada - Editable discipline groups (Rítmica / Acrobática / Trampolín)
-- =============================================================================
-- Run in Supabase SQL editor after schema.sql (requires public.user_role()).
-- Idempotent where possible.

-- -----------------------------------------------------------------------------
-- Table
-- -----------------------------------------------------------------------------

create table if not exists public.discipline_groups (
  id uuid primary key default gen_random_uuid(),
  discipline_id text not null,
  -- mirrors the legacy static group id, used for the #group-{id} anchor
  group_key text not null,
  name text not null,
  age text,
  days text,
  hours text,
  pavilion text,
  price_activity text,
  price_license text,
  contact text,
  extra_notes text,
  photo_url text,
  sort_order integer not null default 0,
  -- active = visible on the public discipline page; disabled = hidden but
  -- kept in admin; deleted = soft-deleted (recoverable in admin).
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discipline_groups_discipline_check
    check (discipline_id in ('ritmica', 'acrobatica', 'trampolin')),
  constraint discipline_groups_status_check
    check (status in ('active', 'disabled', 'deleted')),
  constraint discipline_groups_key_unique
    unique (discipline_id, group_key)
);

create index if not exists discipline_groups_sort_idx
  on public.discipline_groups (discipline_id, sort_order);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------

create or replace function public.set_discipline_groups_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists discipline_groups_set_updated_at on public.discipline_groups;
create trigger discipline_groups_set_updated_at
  before update on public.discipline_groups
  for each row execute function public.set_discipline_groups_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.discipline_groups enable row level security;

-- Public: only groups marked active appear on the discipline pages.
drop policy if exists "discipline_groups_select_anon_active" on public.discipline_groups;
create policy "discipline_groups_select_anon_active"
  on public.discipline_groups
  for select
  to anon
  using (status = 'active');

-- Logged-in visitors see the same public rows…
drop policy if exists "discipline_groups_select_auth_active" on public.discipline_groups;
create policy "discipline_groups_select_auth_active"
  on public.discipline_groups
  for select
  to authenticated
  using (status = 'active');

-- …while admin/coach can load every row for /admin/grupos-disciplinas.
drop policy if exists "discipline_groups_select_staff_all" on public.discipline_groups;
create policy "discipline_groups_select_staff_all"
  on public.discipline_groups
  for select
  to authenticated
  using (public.user_role() in ('admin', 'coach'));

drop policy if exists "discipline_groups_insert_staff" on public.discipline_groups;
create policy "discipline_groups_insert_staff"
  on public.discipline_groups
  for insert
  to authenticated
  with check (public.user_role() in ('admin', 'coach'));

drop policy if exists "discipline_groups_update_staff" on public.discipline_groups;
create policy "discipline_groups_update_staff"
  on public.discipline_groups
  for update
  to authenticated
  using (public.user_role() in ('admin', 'coach'))
  with check (public.user_role() in ('admin', 'coach'));

drop policy if exists "discipline_groups_delete_staff" on public.discipline_groups;
create policy "discipline_groups_delete_staff"
  on public.discipline_groups
  for delete
  to authenticated
  using (public.user_role() in ('admin', 'coach'));
