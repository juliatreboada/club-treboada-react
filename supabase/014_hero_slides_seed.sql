-- =============================================================================
-- Club Treboada - Seed hero_slides from legacy heroSliderData.js
-- =============================================================================
-- Run after hero_slides.sql. Truncates existing rows.

truncate public.hero_slides cascade;

-- 1. Disciplines icons row
insert into public.hero_slides
  (sort_order, slide_type, icons_json, image_url, alt_text, link_url, link_external, status)
values
  (
    1,
    'icons',
    '[
      {"src": "/images/icons/rit.png", "alt": "Rítmica"},
      {"src": "/images/icons/acro.png", "alt": "Acrobática"},
      {"src": "/images/icons/tra.png", "alt": "Trampolín"}
    ]'::jsonb,
    null,
    null,
    null,
    false,
    'active'
  );

-- 2. Open Acrobática
insert into public.hero_slides
  (sort_order, slide_type, icons_json, image_url, alt_text, link_url, link_external, status)
values
  (
    2,
    'image',
    null,
    '/images/open-acro/IV-open-blanco.png',
    'Open Acrobática',
    '/open-acrobatica',
    false,
    'active'
  );

-- 3. Inscricións escolas (external link)
insert into public.hero_slides
  (sort_order, slide_type, icons_json, image_url, alt_text, link_url, link_external, status)
values
  (
    3,
    'image',
    null,
    '/images/school/abrimos-inscricios.webp',
    'Inscricións escolas',
    'https://www.escolasdeportivastreboada.com',
    true,
    'active'
  );

-- 4. Open Rítmica
insert into public.hero_slides
  (sort_order, slide_type, icons_json, image_url, alt_text, link_url, link_external, status)
values
  (
    4,
    'image',
    null,
    '/images/open-rit/slider-torneo-rit.jpg',
    'Open Rítmica',
    '/open-ritmica',
    false,
    'active'
  );

-- 5. Campamento (same image as mobile hero card — path must match campData.js heroCampImageSrc)
insert into public.hero_slides
  (sort_order, slide_type, icons_json, image_url, alt_text, link_url, link_external, status)
values
  (
    5,
    'image',
    null,
    '/images/camp/campamento-hero.jpeg',
    'Campamento de verán Treboada',
    '/campamento',
    false,
    'active'
  );
