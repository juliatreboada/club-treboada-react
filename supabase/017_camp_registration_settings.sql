-- =============================================================================
-- Club Treboada - Camp registration open/closed setting
-- =============================================================================
-- Adds a tiny public config table so admins can open/close registrations
-- without redeploying the site, and re-applies the RPC to enforce it.

create table if not exists public.camp_settings (
  id text primary key,
  registrations_open boolean not null default true,
  registrations_message text,
  updated_at timestamptz not null default now()
);

insert into public.camp_settings (id, registrations_open, registrations_message)
values ('main', true, null)
on conflict (id) do nothing;

create or replace function public.touch_camp_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists camp_settings_set_updated_at on public.camp_settings;
create trigger camp_settings_set_updated_at
  before update on public.camp_settings
  for each row
  execute function public.touch_camp_settings_updated_at();

alter table public.camp_settings enable row level security;

drop policy if exists "camp_settings_select_public" on public.camp_settings;
create policy "camp_settings_select_public"
  on public.camp_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "camp_settings_update_admin" on public.camp_settings;
create policy "camp_settings_update_admin"
  on public.camp_settings
  for update
  to authenticated
  using (public.user_role() = 'admin')
  with check (public.user_role() = 'admin');

create or replace function public.create_camp_registration(
  payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_registration public.registrations;
  new_kids jsonb;
  computed_total numeric(10,2) := 0;
  k jsonb;
  v_weeks int;
  v_is_member boolean;
  v_registrations_open boolean;
  v_price_general numeric(10,2) := 90;
  v_price_member numeric(10,2) := 60;
  v_unit numeric(10,2);
begin
  select coalesce(cs.registrations_open, true)
    into v_registrations_open
  from public.camp_settings cs
  where cs.id = 'main';

  if coalesce(v_registrations_open, true) is not true then
    raise exception 'Camp registrations are currently closed';
  end if;

  if payload is null
     or payload->'kids' is null
     or jsonb_typeof(payload->'kids') <> 'array'
     or jsonb_array_length(payload->'kids') = 0 then
    raise exception 'At least one kid is required';
  end if;

  for k in select * from jsonb_array_elements(payload->'kids')
  loop
    v_weeks := coalesce(jsonb_array_length(k->'weeks'), 0);
    v_is_member := coalesce((k->>'is_club_member')::boolean, false);
    v_unit := case when v_is_member then v_price_member else v_price_general end;
    computed_total := computed_total + (v_weeks * v_unit);
  end loop;

  insert into public.registrations (
    ref_code,
    parent_first_name,
    parent_last_name,
    parent_email,
    parent_phone,
    emergency_contact_name,
    emergency_contact_phone,
    notes,
    total_amount
  )
  values (
    payload->>'ref_code',
    payload->>'parent_first_name',
    payload->>'parent_last_name',
    payload->>'parent_email',
    payload->>'parent_phone',
    nullif(payload->>'emergency_contact_name', ''),
    nullif(payload->>'emergency_contact_phone', ''),
    nullif(payload->>'notes', ''),
    computed_total
  )
  returning * into new_registration;

  insert into public.registration_kids (
    registration_id,
    first_name,
    last_name,
    birth_date,
    weeks,
    is_club_member,
    allergies,
    notes
  )
  select
    new_registration.id,
    k->>'first_name',
    k->>'last_name',
    (k->>'birth_date')::date,
    array(select jsonb_array_elements_text(k->'weeks')),
    coalesce((k->>'is_club_member')::boolean, false),
    nullif(k->>'allergies', ''),
    nullif(k->>'notes', '')
  from jsonb_array_elements(payload->'kids') as k;

  select coalesce(jsonb_agg(to_jsonb(rk) order by rk.created_at), '[]'::jsonb)
    into new_kids
  from public.registration_kids rk
  where rk.registration_id = new_registration.id;

  return jsonb_build_object(
    'registration', to_jsonb(new_registration),
    'kids', new_kids
  );
end;
$$;

grant execute on function public.create_camp_registration(jsonb)
  to anon, authenticated;
