-- =============================================================================
-- Club Treboada - Add hero slide for summer camp (/campamento)
-- =============================================================================
-- Run once if you already seeded hero_slides without this row (does not truncate).
-- Image path must match src/data/campData.js → heroCampImageSrc.

insert into public.hero_slides
  (sort_order, slide_type, icons_json, image_url, alt_text, link_url, link_external, status)
select
  5,
  'image',
  null,
  '/images/camp/campamento-hero.jpeg',
  'Campamento de verán Treboada',
  '/campamento',
  false,
  'active'
where not exists (
  select 1 from public.hero_slides where link_url = '/campamento'
);
