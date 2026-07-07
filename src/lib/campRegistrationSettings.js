import { supabase } from './supabaseClient';

const CAMP_SETTINGS_ID = 'main';

export async function getCampRegistrationSettings() {
  const { data, error } = await supabase
    .from('camp_settings')
    .select('registrations_open, registrations_message')
    .eq('id', CAMP_SETTINGS_ID)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      registrationsOpen: data?.registrations_open ?? true,
      registrationsMessage: data?.registrations_message ?? null,
    },
    error: null,
  };
}

export async function setCampRegistrationOpenState(registrationsOpen) {
  const { data, error } = await supabase
    .from('camp_settings')
    .update({ registrations_open: registrationsOpen })
    .eq('id', CAMP_SETTINGS_ID)
    .select('registrations_open, registrations_message')
    .single();

  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      registrationsOpen: data.registrations_open,
      registrationsMessage: data.registrations_message ?? null,
    },
    error: null,
  };
}
