-- =============================================================================
-- Club Treboada - create_camp_registration RPC
-- =============================================================================
-- Run this in the Supabase SQL editor AFTER camp_registrations.sql AND
-- camp_weeks_migration.sql (and 013 if adding is_club_member to an old DB).
--
-- Inserts a parent registration row and all of its kids atomically and
-- returns both back to the caller. Runs as SECURITY DEFINER so the anon
-- visitor can both write and read the resulting rows without needing a
-- broad SELECT policy on the underlying tables.
--
-- total_amount is computed here (not trusted from the client). Weekly prices
-- must match src/data/campData.js: pricePerKidPerWeek / priceMemberPerKidPerWeek.

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
  -- Must match campData.js (general / member per week, EUR)
  v_price_general numeric(10,2) := 90;
  v_price_member numeric(10,2) := 60;
  v_unit numeric(10,2);
begin
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

-- Anyone (anon + authenticated) can call this RPC. The function itself
-- enforces the business rules.
grant execute on function public.create_camp_registration(jsonb)
  to anon, authenticated;
