-- =============================================================================
-- Club Treboada - RLS recursion fix
-- =============================================================================
-- Run this in the Supabase SQL editor ONCE.
--
-- The previous RLS policies on `profiles`, `registrations` and
-- `registration_kids` all check the caller's role with a subquery against
-- `public.profiles`. Because those subqueries run under RLS themselves,
-- Postgres treats them as recursive policies and either raises
-- `infinite recursion detected in policy for relation "profiles"` or
-- silently returns no rows. Symptom in the app: the dashboard reports
-- role "User" even though the DB has role = 'admin'.
--
-- Fix: move the role lookup into a SECURITY DEFINER function so it bypasses
-- RLS, then rewrite all role-checking policies to call that function.

-- -----------------------------------------------------------------------------
-- Helper function: returns the calling user's role (or null when unknown).
-- -----------------------------------------------------------------------------

create or replace function public.user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role
  from public.profiles
  where user_id = auth.uid()
  limit 1;
$$;

grant execute on function public.user_role() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.user_role() = 'admin');

create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

-- -----------------------------------------------------------------------------
-- registrations
-- -----------------------------------------------------------------------------

drop policy if exists "registrations_select_staff" on public.registrations;
create policy "registrations_select_staff"
  on public.registrations
  for select
  to authenticated
  using (public.user_role() in ('admin', 'coach'));

drop policy if exists "registrations_update_staff" on public.registrations;
create policy "registrations_update_staff"
  on public.registrations
  for update
  to authenticated
  using (public.user_role() in ('admin', 'coach'))
  with check (public.user_role() in ('admin', 'coach'));

drop policy if exists "registrations_delete_admin" on public.registrations;
create policy "registrations_delete_admin"
  on public.registrations
  for delete
  to authenticated
  using (public.user_role() = 'admin');

-- -----------------------------------------------------------------------------
-- registration_kids
-- -----------------------------------------------------------------------------

drop policy if exists "registration_kids_select_staff" on public.registration_kids;
create policy "registration_kids_select_staff"
  on public.registration_kids
  for select
  to authenticated
  using (public.user_role() in ('admin', 'coach'));
