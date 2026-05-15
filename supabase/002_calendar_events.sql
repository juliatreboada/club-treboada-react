-- =============================================================================
-- Club Treboada - Public calendar events (competitions + school events)
-- =============================================================================
-- Run in Supabase SQL editor after schema.sql (requires public.user_role()).
-- Idempotent where possible.

-- -----------------------------------------------------------------------------
-- Table
-- -----------------------------------------------------------------------------

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  start_date date not null,
  end_date date,
  category text,
  school text,
  location text,
  image_url text,
  event_url text,
  streaming_url text,
  participate text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_category_check
    check (category is null or category in ('ritmica', 'acrobatica', 'trampolin'))
);

create index if not exists calendar_events_start_date_idx
  on public.calendar_events (start_date);

-- -----------------------------------------------------------------------------
-- updated_at
-- -----------------------------------------------------------------------------

create or replace function public.set_calendar_events_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists calendar_events_set_updated_at on public.calendar_events;
create trigger calendar_events_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_calendar_events_updated_at();

-- Optional: set created_by from the caller's profile when not provided
create or replace function public.calendar_events_set_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null and auth.uid() is not null then
    new.created_by := (
      select id from public.profiles where user_id = auth.uid() limit 1
    );
  end if;
  return new;
end;
$$;

drop trigger if exists calendar_events_set_created_by on public.calendar_events;
create trigger calendar_events_set_created_by
  before insert on public.calendar_events
  for each row execute function public.calendar_events_set_created_by();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.calendar_events enable row level security;

drop policy if exists "calendar_events_select_public" on public.calendar_events;
create policy "calendar_events_select_public"
  on public.calendar_events
  for select
  to anon, authenticated
  using (true);

drop policy if exists "calendar_events_insert_staff" on public.calendar_events;
create policy "calendar_events_insert_staff"
  on public.calendar_events
  for insert
  to authenticated
  with check (public.user_role() in ('admin', 'coach'));

drop policy if exists "calendar_events_update_staff" on public.calendar_events;
create policy "calendar_events_update_staff"
  on public.calendar_events
  for update
  to authenticated
  using (public.user_role() in ('admin', 'coach'))
  with check (public.user_role() in ('admin', 'coach'));

drop policy if exists "calendar_events_delete_staff" on public.calendar_events;
create policy "calendar_events_delete_staff"
  on public.calendar_events
  for delete
  to authenticated
  using (public.user_role() in ('admin', 'coach'));
