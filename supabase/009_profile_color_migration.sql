-- =============================================================================
-- Club Treboada - Avatar background colour
-- =============================================================================
-- Run this in the Supabase SQL editor ONCE, after
-- profile_customization_migration.sql. Idempotent.
--
-- Adds an `avatar_color` text column to `public.profiles` and updates the
-- `update_my_profile` RPC to accept the new field alongside display_name
-- and avatar.

alter table public.profiles
  add column if not exists avatar_color text;

-- The previous 2-arg version has a different signature, so we have to drop
-- it explicitly before creating the new 3-arg version.
drop function if exists public.update_my_profile(text, text);

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
