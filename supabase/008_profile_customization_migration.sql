-- =============================================================================
-- Club Treboada - Profile customisation (display_name + avatar)
-- =============================================================================
-- Run this in the Supabase SQL editor ONCE, after schema.sql.
--
-- Adds two new columns to `public.profiles`:
--   * display_name - free-text human-friendly name (optional)
--   * avatar       - identifier of the preset emoji avatar the user picked
--
-- Also exposes a SECURITY DEFINER RPC `update_my_profile(p_display_name, p_avatar)`
-- so logged-in users can update those two fields on their own profile WITHOUT
-- being able to escalate their role via a direct PATCH on the profiles table.

alter table public.profiles
  add column if not exists display_name text;

alter table public.profiles
  add column if not exists avatar text;

-- -----------------------------------------------------------------------------
-- update_my_profile RPC
-- -----------------------------------------------------------------------------

create or replace function public.update_my_profile(
  p_display_name text,
  p_avatar text
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
         avatar       = nullif(trim(coalesce(p_avatar, '')), '')
   where user_id = auth.uid()
  returning * into updated;

  if updated.id is null then
    raise exception 'Profile not found for current user';
  end if;

  return updated;
end;
$$;

grant execute on function public.update_my_profile(text, text)
  to authenticated;
