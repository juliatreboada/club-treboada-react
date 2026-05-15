// src/lib/heroSlidesRepository.js
import { supabase } from './supabaseClient';

const BUCKET = 'hero-images';
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp']);

/**
 * Map a DB row to the shape consumed by `HeroSection`. Keeps the legacy
 * field names (`type`, `src`, `alt`, `link`, `external`, `icons`) so the
 * existing JSX needs only minimal changes.
 */
export function dbRowToHeroSlide(row) {
  if (!row) return null;
  if (row.slide_type === 'icons') {
    return {
      id: row.id,
      type: 'icons',
      icons: Array.isArray(row.icons_json) ? row.icons_json : [],
    };
  }
  return {
    id: row.id,
    type: 'image',
    src: row.image_url ?? '',
    alt: row.alt_text ?? '',
    link: row.link_url ?? '',
    external: Boolean(row.link_external),
  };
}

function nullIfEmpty(v) {
  const s = typeof v === 'string' ? v.trim() : v;
  if (s === '' || s == null) return null;
  return s;
}

/** Slides visible on the public home carousel (`status = active`). */
export async function listActiveHeroSlides() {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('status', 'active')
    .order('sort_order', { ascending: true });

  return { data: data ?? null, error };
}

/**
 * All slides for staff UI (active, disabled, deleted). Requires admin/coach
 * session so RLS returns every row.
 * @returns {Promise<{ data: object[] | null, error: Error | null }>}
 */
export async function listHeroSlidesForAdmin() {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true });

  return { data: data ?? null, error };
}

export async function createSlide(payload) {
  const { data, error } = await supabase
    .from('hero_slides')
    .insert({ ...payload, status: 'active' })
    .select('*')
    .single();

  return { data: data ?? null, error };
}

export async function updateSlide(id, payload) {
  const { data, error } = await supabase
    .from('hero_slides')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  return { data: data ?? null, error };
}

/** Soft-delete: row stays in DB with `status = deleted` (staff-only). */
export async function softDeleteSlide(id) {
  return updateSlide(id, { status: 'deleted' });
}

export async function setSlideStatus(id, status) {
  if (!['active', 'disabled', 'deleted'].includes(status)) {
    return {
      data: null,
      error: new Error('Estado non válido.'),
    };
  }
  return updateSlide(id, { status });
}

/**
 * Persist a new ordering. Sends one update per row (kept simple and avoids
 * an extra RPC). The caller passes ids in the desired display order.
 */
export async function reorderSlides(orderedIds) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { error: null };
  }
  for (let i = 0; i < orderedIds.length; i += 1) {
    const { error } = await supabase
      .from('hero_slides')
      .update({ sort_order: i + 1 })
      .eq('id', orderedIds[i]);
    if (error) {
      return { error };
    }
  }
  return { error: null };
}

/**
 * Upload a hero image to Supabase Storage. Client-side guards mirror the
 * calendar bucket.
 * @param {File} file
 * @returns {Promise<{ publicUrl: string | null, error: string | null }>}
 */
export async function uploadHeroImage(file) {
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
    console.error('[hero] upload failed', upErr);
    return { publicUrl: null, error: upErr.message || 'Erro ao subir a imaxe.' };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { publicUrl: publicUrl || null, error: null };
}

/**
 * Build an insert/update body from admin form state. `slideType` decides
 * which payload fields are kept and which are nulled out.
 */
export function buildSlidePayloadFromForm({
  slideType,
  sortOrder,
  icons,
  imageUrl,
  altText,
  linkUrl,
  linkExternal,
}) {
  const base = {
    slide_type: slideType,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };

  if (slideType === 'icons') {
    const cleanIcons = (icons || [])
      .map((it) => ({
        src: (it?.src || '').trim(),
        alt: (it?.alt || '').trim(),
      }))
      .filter((it) => it.src);
    return {
      ...base,
      icons_json: cleanIcons,
      image_url: null,
      alt_text: null,
      link_url: null,
      link_external: false,
    };
  }

  return {
    ...base,
    icons_json: null,
    image_url: nullIfEmpty(imageUrl),
    alt_text: nullIfEmpty(altText),
    link_url: nullIfEmpty(linkUrl),
    link_external: Boolean(linkExternal),
  };
}
