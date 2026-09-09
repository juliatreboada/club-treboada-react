// src/lib/disciplineGroupsRepository.js
import { supabase } from './supabaseClient';

const BUCKET = 'discipline-images';
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp']);

// Ordered [label, column] pairs used to build the `details` list GroupCard renders.
const DETAIL_FIELDS = [
  ['Edad', 'age'],
  ['Días', 'days'],
  ['Horario', 'hours'],
  ['Pavillón', 'pavilion'],
  ['Precio Actividade', 'price_activity'],
  ['Precio Licencia', 'price_license'],
  ['Contacto', 'contact'],
  ['Notas', 'extra_notes'],
];

/**
 * Map a DB row to the shape consumed by `GroupCard`/`DisciplineTemplate`.
 * Keeps the legacy `{ id, name, images, details }` shape so existing JSX
 * needs minimal changes.
 */
export function dbRowToGroup(row) {
  if (!row) return null;
  const details = DETAIL_FIELDS
    .filter(([, column]) => row[column])
    .map(([label, column]) => ({ label, value: row[column] }));

  return {
    id: row.group_key,
    name: row.name,
    images: row.photo_url ? [row.photo_url] : [],
    details,
    // raw fields kept for consumers that want typed access (e.g. DisciplineSummary)
    age: row.age ?? null,
    contact: row.contact ?? null,
  };
}

function nullIfEmpty(v) {
  const s = typeof v === 'string' ? v.trim() : v;
  if (s === '' || s == null) return null;
  return s;
}

/** Groups visible on a public discipline page (`status = active`). */
export async function listActiveDisciplineGroups(disciplineId) {
  const { data, error } = await supabase
    .from('discipline_groups')
    .select('*')
    .eq('discipline_id', disciplineId)
    .eq('status', 'active')
    .order('sort_order', { ascending: true });

  return { data: data ?? null, error };
}

/**
 * All groups for staff UI (active, disabled, deleted). Requires admin/coach
 * session so RLS returns every row. Pass `disciplineId` to scope to one
 * discipline, or omit for a combined view across all three.
 */
export async function listDisciplineGroupsForAdmin(disciplineId) {
  let query = supabase.from('discipline_groups').select('*');
  if (disciplineId) {
    query = query.eq('discipline_id', disciplineId);
  }
  const { data, error } = await query.order('sort_order', { ascending: true });

  return { data: data ?? null, error };
}

export async function createGroup(payload) {
  const { data, error } = await supabase
    .from('discipline_groups')
    .insert({ ...payload, status: 'active' })
    .select('*')
    .single();

  return { data: data ?? null, error };
}

export async function updateGroup(id, payload) {
  const { data, error } = await supabase
    .from('discipline_groups')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  return { data: data ?? null, error };
}

/** Soft-delete: row stays in DB with `status = deleted` (staff-only). */
export async function softDeleteGroup(id) {
  return updateGroup(id, { status: 'deleted' });
}

export async function setGroupStatus(id, status) {
  if (!['active', 'disabled', 'deleted'].includes(status)) {
    return {
      data: null,
      error: new Error('Estado non válido.'),
    };
  }
  return updateGroup(id, { status });
}

/**
 * Persist a new ordering within one discipline. Sends one update per row
 * (kept simple and avoids an extra RPC). Never mix ids from different
 * disciplines in a single call — sort_order is only meaningful per discipline.
 */
export async function reorderGroups(orderedIds) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { error: null };
  }
  for (let i = 0; i < orderedIds.length; i += 1) {
    const { error } = await supabase
      .from('discipline_groups')
      .update({ sort_order: i + 1 })
      .eq('id', orderedIds[i]);
    if (error) {
      return { error };
    }
  }
  return { error: null };
}

/**
 * Upload a discipline group cover photo to Supabase Storage. Client-side
 * guards mirror the hero-images bucket.
 * @param {File} file
 * @returns {Promise<{ publicUrl: string | null, error: string | null }>}
 */
export async function uploadDisciplineImage(file) {
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
    console.error('[discipline-groups] upload failed', upErr);
    return { publicUrl: null, error: upErr.message || 'Erro ao subir a imaxe.' };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { publicUrl: publicUrl || null, error: null };
}

/**
 * Build an insert/update body from admin form state.
 */
export function buildGroupPayloadFromForm({
  disciplineId,
  groupKey,
  sortOrder,
  name,
  age,
  days,
  hours,
  pavilion,
  priceActivity,
  priceLicense,
  contact,
  extraNotes,
  photoUrl,
}) {
  return {
    discipline_id: disciplineId,
    group_key: nullIfEmpty(groupKey),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    name: (name || '').trim(),
    age: nullIfEmpty(age),
    days: nullIfEmpty(days),
    hours: nullIfEmpty(hours),
    pavilion: nullIfEmpty(pavilion),
    price_activity: nullIfEmpty(priceActivity),
    price_license: nullIfEmpty(priceLicense),
    contact: nullIfEmpty(contact),
    extra_notes: nullIfEmpty(extraNotes),
    photo_url: nullIfEmpty(photoUrl),
  };
}
