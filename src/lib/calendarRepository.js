// src/lib/calendarRepository.js
import { supabase } from './supabaseClient';

const BUCKET = 'calendar-images';
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp']);

/** Map DB row to FullCalendar event input + extendedProps (legacy shape). */
export function dbRowToFullCalendarEvent(row) {
  const extendedProps = {
    subtitle: row.subtitle ?? '',
    description: row.description ?? '',
    category: row.category ?? '',
    school: row.school ?? '',
    image: row.image_url ?? '',
    eventUrl: row.event_url ?? '',
    streaming: row.streaming_url ?? '',
    participate: row.participate ?? '',
    location: row.location ?? '',
  };
  const ev = {
    id: row.id,
    title: row.title,
    start: row.start_date,
    extendedProps,
  };
  if (row.end_date) {
    ev.end = row.end_date;
  }
  return ev;
}

function nullIfEmpty(v) {
  const s = typeof v === 'string' ? v.trim() : v;
  if (s === '' || s == null) return null;
  return s;
}

/**
 * @returns {Promise<{ data: object[] | null, error: Error | null }>}
 */
export async function listEvents() {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('start_date', { ascending: true });

  return { data: data ?? null, error };
}

/**
 * @param {object} payload — snake_case fields for insert
 */
export async function createEvent(payload) {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(payload)
    .select('*')
    .single();

  return { data: data ?? null, error };
}

export async function updateEvent(id, payload) {
  const { data, error } = await supabase
    .from('calendar_events')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  return { data: data ?? null, error };
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('calendar_events').delete().eq('id', id);
  return { error };
}

/**
 * Upload image to Supabase Storage. Client-side size/type checks.
 * @param {File} file
 * @returns {Promise<{ publicUrl: string | null, error: string | null }>}
 */
export async function uploadEventImage(file) {
  if (!file || !(file instanceof File)) {
    return { publicUrl: null, error: 'Ficheiro non válido.' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { publicUrl: null, error: 'A imaxe debe ser menor de 2 MB.' };
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return {
      publicUrl: null,
      error: 'Só se permiten JPG, PNG ou WEBP.',
    };
  }

  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    });

  if (upErr) {
    console.error('[calendar] upload failed', upErr);
    return { publicUrl: null, error: upErr.message || 'Erro ao subir a imaxe.' };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { publicUrl: publicUrl || null, error: null };
}

/** Build insert/update body from form state (camelCase extended props). */
export function buildEventPayloadFromForm({
  title,
  subtitle,
  description,
  startDate,
  endDate,
  category,
  school,
  location,
  imageUrl,
  eventUrl,
  streamingUrl,
  participate,
}) {
  return {
    title: (title || '').trim(),
    subtitle: nullIfEmpty(subtitle),
    description: nullIfEmpty(description),
    start_date: startDate,
    end_date: nullIfEmpty(endDate),
    category: nullIfEmpty(category),
    school: nullIfEmpty(school),
    location: nullIfEmpty(location),
    image_url: nullIfEmpty(imageUrl),
    event_url: nullIfEmpty(eventUrl),
    streaming_url: nullIfEmpty(streamingUrl),
    participate: nullIfEmpty(participate),
  };
}
