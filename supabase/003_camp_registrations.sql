-- =============================================================================
-- Club Treboada - Summer camp registrations
-- =============================================================================
-- Run this in the Supabase SQL editor AFTER schema.sql.
-- Creates the `registrations` and `registration_kids` tables, status enums
-- and the RLS policies used by the public registration form and the
-- admin/coach view.

-- -----------------------------------------------------------------------------
-- enums
-- -----------------------------------------------------------------------------

do $$ begin
  create type registration_status as enum ('pending', 'confirmed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- registrations
-- -----------------------------------------------------------------------------

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  ref_code text unique not null,                   -- e.g. CAMP-2026-AB12CD (also used as the bank transfer reference)
  parent_first_name text not null,
  parent_last_name text not null,
  parent_email text not null,
  parent_phone text not null,
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,                                       -- free text (allergies, conditions, etc.)
  status registration_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  total_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists registrations_created_at_idx on public.registrations (created_at desc);
create index if not exists registrations_status_idx on public.registrations (status);

-- -----------------------------------------------------------------------------
-- registration_kids
-- -----------------------------------------------------------------------------

create table if not exists public.registration_kids (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  weeks text[] not null default '{}'::text[],     -- one or both of 'week1' (20-24 July) and 'week2' (27-31 July)
  is_club_member boolean not null default false, -- member rate vs general (see campData / RPC prices)
  allergies text,
  notes text,
  created_at timestamptz not null default now(),
  constraint registration_kids_weeks_valid check (
    array_length(weeks, 1) >= 1
    and weeks <@ array['week1', 'week2']
  )
);

create index if not exists registration_kids_registration_id_idx on public.registration_kids (registration_id);

-- -----------------------------------------------------------------------------
-- RLS: registrations
-- -----------------------------------------------------------------------------

alter table public.registrations enable row level security;

-- Anyone (including anon visitors filling the form) can create a registration
drop policy if exists "registrations_insert_public" on public.registrations;
create policy "registrations_insert_public"
  on public.registrations
  for insert
  to anon, authenticated
  with check (true);

-- Only admin/coach can read all registrations
drop policy if exists "registrations_select_staff" on public.registrations;
create policy "registrations_select_staff"
  on public.registrations
  for select
  to authenticated
  using (public.user_role() in ('admin', 'coach'));

-- Only admin/coach can update status / payment_status
drop policy if exists "registrations_update_staff" on public.registrations;
create policy "registrations_update_staff"
  on public.registrations
  for update
  to authenticated
  using (public.user_role() in ('admin', 'coach'))
  with check (public.user_role() in ('admin', 'coach'));

-- Only admin can delete (in case we ever need it)
drop policy if exists "registrations_delete_admin" on public.registrations;
create policy "registrations_delete_admin"
  on public.registrations
  for delete
  to authenticated
  using (public.user_role() = 'admin');

-- -----------------------------------------------------------------------------
-- RLS: registration_kids
-- -----------------------------------------------------------------------------

alter table public.registration_kids enable row level security;

-- Anyone can create kids rows (the parent attaches them to the registration
-- they just created and whose id they received back from the insert).
drop policy if exists "registration_kids_insert_public" on public.registration_kids;
create policy "registration_kids_insert_public"
  on public.registration_kids
  for insert
  to anon, authenticated
  with check (true);

-- Only admin/coach can read kids
drop policy if exists "registration_kids_select_staff" on public.registration_kids;
create policy "registration_kids_select_staff"
  on public.registration_kids
  for select
  to authenticated
  using (public.user_role() in ('admin', 'coach'));
