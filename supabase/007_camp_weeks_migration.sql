-- =============================================================================
-- Club Treboada - Summer camp weeks migration
-- =============================================================================
-- Run this in the Supabase SQL editor ONCE, after camp_registrations.sql.
-- Removes the shirt_size column (no longer applicable: camp no longer
-- provides t-shirts) and adds the per-kid `weeks` selection (one or both of
-- 'week1' (20-24 July) and 'week2' (27-31 July)).

alter table public.registration_kids
  drop column if exists shirt_size;

alter table public.registration_kids
  add column if not exists weeks text[] not null default '{}'::text[];

-- Drop the constraint first so this migration is idempotent.
alter table public.registration_kids
  drop constraint if exists registration_kids_weeks_valid;

alter table public.registration_kids
  add constraint registration_kids_weeks_valid
  check (
    array_length(weeks, 1) >= 1
    and weeks <@ array['week1', 'week2']
  );
