-- =============================================================================
-- Club Treboada - Supabase base schema
-- =============================================================================
-- Run this in the Supabase SQL editor when you first set up the project.
-- It creates a `profiles` table linked to `auth.users` via `user_id`
-- (decoupled - profile has its own UUID), a trigger that auto-creates a
-- profile when a new auth user is created, and the RLS policies that
-- admins/coaches will rely on.
--
-- If you previously ran an older version of this file (where profiles.id
-- referenced auth.users.id directly), drop the old objects first:
--   drop trigger if exists on_auth_user_created on auth.users;
--   drop function if exists public.handle_new_user();
--   drop table if exists public.profiles;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email text,
  display_name text,
  avatar text,
  avatar_color text,
  role text not null default 'user' check (role in ('user', 'coach', 'admin')),
  created_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles (user_id);

-- Auto-create a profile row whenever a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- user_role() helper
-- -----------------------------------------------------------------------------
-- Returns the calling user's role. Runs as SECURITY DEFINER so it bypasses
-- RLS - critical to avoid infinite recursion when role-checking policies
-- need to read public.profiles.

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
-- profiles RLS
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;

-- Users can read their own profile
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins can read every profile
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.user_role() = 'admin');

-- Only admins can update roles
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

-- -----------------------------------------------------------------------------
-- update_my_profile RPC
-- -----------------------------------------------------------------------------
-- Lets any authenticated user update their own display_name + avatar +
-- avatar_color without being able to escalate their role.

create or replace function public.update_my_profile(
  p_display_name text,
  p_avatar text,
  p_avatar_color text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
     set display_name = nullif(trim(coalesce(p_display_name, '')), ''),
         avatar       = nullif(trim(coalesce(p_avatar, '')), ''),
         avatar_color = nullif(trim(coalesce(p_avatar_color, '')), '')
   where user_id = auth.uid()
  returning * into updated;

  if updated.id is null then
    raise exception 'Profile not found for current user';
  end if;

  return updated;
end;
$$;

grant execute on function public.update_my_profile(text, text, text)
  to authenticated;

-- -----------------------------------------------------------------------------
-- Manual bootstrap for the first admin
-- -----------------------------------------------------------------------------
-- After you create your first user from the Supabase Authentication panel,
-- run this query (replacing the email) to promote them to admin:
--
--   update public.profiles
--   set role = 'admin'
--   where email = 'your-admin-email@example.com';
