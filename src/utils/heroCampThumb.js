// src/utils/heroCampThumb.js
import campData from '../data/campData';

/**
 * Image for the mobile home "Campamento" card: same as the active hero slide
 * that links to /campamento (from Supabase or static heroSliderData).
 * Falls back to campData.heroCampImageSrc when that slide is missing from the list.
 * @param {Array<{ type?: string, external?: boolean, src?: string, link?: string, alt?: string }>} slides
 * @returns {{ src: string, alt: string } | null}
 */
export function getHeroCampThumbFromSlides(slides) {
  if (!Array.isArray(slides)) {
    return fallbackThumb();
  }
  const match = slides.find(
    (x) =>
      x?.type === 'image' &&
      !x?.external &&
      typeof x?.src === 'string' &&
      x.src.trim() !== '' &&
      typeof x.link === 'string' &&
      x.link.replace(/\/+$/, '') === '/campamento'
  );
  if (match?.src) {
    return {
      src: match.src,
      alt: match.alt || campData.heroCampImageAlt,
    };
  }
  return fallbackThumb();
}

function fallbackThumb() {
  const src = campData.heroCampImageSrc;
  if (typeof src === 'string' && src.trim() !== '') {
    return { src: src.trim(), alt: campData.heroCampImageAlt };
  }
  return null;
}
