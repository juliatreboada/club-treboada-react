-- =============================================================================
-- Club Treboada - Hero camp slide: use JPEG asset (was .webp)
-- =============================================================================
-- Run if you already had /images/camp/campamento-hero.webp in hero_slides.

update public.hero_slides
set image_url = '/images/camp/campamento-hero.jpeg'
where link_url = '/campamento';
